#!/usr/bin/env bash
# bootstrap.sh — One-time setup for the HabitMap Oracle Cloud VM
# Run once after Terraform provisions the instance.
#
# Usage (from local machine):
#   ssh -i ~/.ssh/habitmap_key ubuntu@<VM_PUBLIC_IP> 'bash -s' < infra/scripts/bootstrap.sh

set -euo pipefail

echo "========================================="
echo " HabitMap VM Bootstrap"
echo "========================================="

# --- System updates & essentials ---
echo "[1/6] Updating system packages..."
sudo apt update && sudo DEBIAN_FRONTEND=noninteractive apt upgrade -y
sudo apt install -y curl git unzip apt-transport-https ca-certificates

# --- Disable swap (required for Kubernetes) ---
echo "[2/6] Disabling swap..."
sudo swapoff -a
sudo sed -i '/\sswap\s/d' /etc/fstab

# --- Install k3s ---
echo "[3/6] Installing k3s..."
curl -sfL https://get.k3s.io | sh -

# Wait for k3s to be ready
echo "Waiting for k3s to become ready..."
sudo k3s kubectl wait --for=condition=Ready node --all --timeout=120s

# --- Configure kubeconfig ---
echo "[4/6] Configuring kubeconfig..."
mkdir -p ~/.kube
sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
sudo chown "$(id -u):$(id -g)" ~/.kube/config
chmod 600 ~/.kube/config

# Add KUBECONFIG to .bashrc if not already present
if ! grep -q 'export KUBECONFIG' ~/.bashrc; then
  echo 'export KUBECONFIG=~/.kube/config' >> ~/.bashrc
fi
export KUBECONFIG=~/.kube/config

# --- Install Helm 3 ---
echo "[5/6] Installing Helm 3..."
curl -fsSL https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# --- Verify installation ---
echo "[6/6] Verifying installation..."
echo ""

echo "--- kubectl ---"
kubectl get nodes
echo ""

echo "--- helm ---"
helm version --short
echo ""

echo "--- k3s ---"
k3s --version
echo ""

echo "========================================="
echo " Bootstrap complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "  1. Apply namespaces:    kubectl apply -f infra/k8s/namespaces.yaml"
echo "  2. Create pull secret:  bash infra/scripts/create-pull-secret.sh"
echo "  3. Deploy data layer:   kubectl apply -f infra/k8s/data/"
echo "  4. Deploy services:     kubectl apply -f infra/k8s/habitmap/"
