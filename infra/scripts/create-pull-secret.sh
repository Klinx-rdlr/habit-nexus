#!/bin/bash
set -euo pipefail

# Creates an OCIR pull secret in the habitmap namespace.
#
# Required environment variables:
#   OCI_REGISTRY_USER  — <tenancy-namespace>/<username> (e.g. axhzwrk3nkfg/rhoderick@email.com)
#   OCI_REGISTRY_TOKEN — OCI auth token generated from the Console
#   OCI_REGION         — OCIR region key (e.g. ap-singapore-1)

: "${OCI_REGISTRY_USER:?Set OCI_REGISTRY_USER to <tenancy-namespace>/<username>}"
: "${OCI_REGISTRY_TOKEN:?Set OCI_REGISTRY_TOKEN to your OCI auth token}"
: "${OCI_REGION:?Set OCI_REGION to the OCIR region (e.g. ap-singapore-1)}"

REGISTRY="${OCI_REGION}.ocir.io"
SECRET_NAME="ocir-secret"
NAMESPACE="habitmap"

# Delete existing secret if present (idempotent)
kubectl delete secret "${SECRET_NAME}" \
  --namespace="${NAMESPACE}" \
  --ignore-not-found

kubectl create secret docker-registry "${SECRET_NAME}" \
  --namespace="${NAMESPACE}" \
  --docker-server="${REGISTRY}" \
  --docker-username="${OCI_REGISTRY_USER}" \
  --docker-password="${OCI_REGISTRY_TOKEN}" \
  --docker-email="noreply@habitmap.dev"

echo "Secret '${SECRET_NAME}' created in namespace '${NAMESPACE}' for registry '${REGISTRY}'."
