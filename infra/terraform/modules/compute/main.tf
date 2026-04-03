terraform {
  required_providers {
    oci = {
      source  = "oracle/oci"
      version = "~> 5.0"
    }
  }
}

# Fetch the latest Ubuntu 24.04 image for the target shape
data "oci_core_images" "ubuntu" {
  compartment_id           = var.compartment_ocid
  operating_system         = "Canonical Ubuntu"
  operating_system_version = "24.04"
  shape                    = "VM.Standard3.Flex"
  sort_by                  = "TIMECREATED"
  sort_order               = "DESC"
}

resource "oci_core_instance" "habitmap" {
  compartment_id      = var.compartment_ocid
  availability_domain = var.availability_domain
  display_name        = "habitmap-vm"
  shape               = "VM.Standard3.Flex"

  shape_config {
    ocpus         = 4
    memory_in_gbs = 16
  }

  source_details {
    source_type = "image"
    source_id   = data.oci_core_images.ubuntu.images[0].id
  }

  create_vnic_details {
    subnet_id        = var.subnet_id
    assign_public_ip = true
    display_name     = "habitmap-vnic"
  }

  metadata = {
    ssh_authorized_keys = var.ssh_public_key
  }
}
