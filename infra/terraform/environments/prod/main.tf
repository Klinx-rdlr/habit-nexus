terraform {
  required_version = ">= 1.5.0"

  required_providers {
    oci = {
      source  = "oracle/oci"
      version = "~> 5.0"
    }
  }
}

provider "oci" {
  tenancy_ocid = var.tenancy_ocid
  region       = var.region
}

# --- Networking ---

module "networking" {
  source = "../../modules/networking"

  compartment_ocid = var.compartment_ocid
}

# --- Compute ---

module "compute" {
  source = "../../modules/compute"

  compartment_ocid    = var.compartment_ocid
  availability_domain = var.availability_domain
  subnet_id           = module.networking.subnet_id
  ssh_public_key      = var.ssh_public_key
}

# --- Container Registry ---

module "registry" {
  source = "../../modules/registry"

  compartment_ocid  = var.compartment_ocid
  region            = var.region
  tenancy_namespace = var.tenancy_namespace
}

# --- Outputs ---

output "vm_public_ip" {
  description = "Public IP of the HabitMap VM"
  value       = module.compute.public_ip
}

output "instance_id" {
  description = "OCID of the compute instance"
  value       = module.compute.instance_id
}

output "vcn_id" {
  description = "OCID of the VCN"
  value       = module.networking.vcn_id
}

output "repository_urls" {
  description = "OCIR repository paths per service"
  value       = module.registry.repository_urls
}
