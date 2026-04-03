terraform {
  required_providers {
    oci = {
      source  = "oracle/oci"
      version = "~> 5.0"
    }
  }
}

locals {
  services = [
    "gateway",
    "auth-service",
    "habit-service",
    "group-service",
    "notification-service",
    "frontend",
  ]
}

resource "oci_artifacts_container_repository" "services" {
  for_each = toset(local.services)

  compartment_id = var.compartment_ocid
  display_name   = "habitmap-${each.key}"
  is_public      = false
}
