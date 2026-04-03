terraform {
  required_providers {
    oci = {
      source  = "oracle/oci"
      version = "~> 5.0"
    }
  }
}

# --- VCN ---

resource "oci_core_vcn" "habitmap" {
  compartment_id = var.compartment_ocid
  display_name   = "habitmap-vcn"
  cidr_blocks    = ["10.0.0.0/16"]
  dns_label      = "habitmap"
}

# --- Internet Gateway ---

resource "oci_core_internet_gateway" "habitmap" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.habitmap.id
  display_name   = "habitmap-igw"
  enabled        = true
}

# --- Route Table ---

resource "oci_core_route_table" "public" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.habitmap.id
  display_name   = "habitmap-public-rt"

  route_rules {
    destination       = "0.0.0.0/0"
    destination_type  = "CIDR_BLOCK"
    network_entity_id = oci_core_internet_gateway.habitmap.id
  }
}

# --- Security List ---

resource "oci_core_security_list" "public" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.habitmap.id
  display_name   = "habitmap-public-sl"

  # Egress: allow all outbound
  egress_security_rules {
    destination = "0.0.0.0/0"
    protocol    = "all"
    stateless   = false
  }

  # SSH
  ingress_security_rules {
    protocol  = "6" # TCP
    source    = "0.0.0.0/0"
    stateless = false
    tcp_options {
      min = 22
      max = 22
    }
  }

  # HTTP
  ingress_security_rules {
    protocol  = "6"
    source    = "0.0.0.0/0"
    stateless = false
    tcp_options {
      min = 80
      max = 80
    }
  }

  # HTTPS
  ingress_security_rules {
    protocol  = "6"
    source    = "0.0.0.0/0"
    stateless = false
    tcp_options {
      min = 443
      max = 443
    }
  }

  # k3s API
  ingress_security_rules {
    protocol  = "6"
    source    = "0.0.0.0/0"
    stateless = false
    tcp_options {
      min = 6443
      max = 6443
    }
  }

  # Flannel VXLAN (k3s CNI — required for pod-to-pod networking)
  ingress_security_rules {
    protocol  = "17" # UDP
    source    = "10.0.0.0/16"
    stateless = false
    udp_options {
      min = 8472
      max = 8472
    }
  }

  # HabitMap services (3000-3004)
  ingress_security_rules {
    protocol  = "6"
    source    = "0.0.0.0/0"
    stateless = false
    tcp_options {
      min = 3000
      max = 3004
    }
  }

}

# --- Public Subnet ---

resource "oci_core_subnet" "public" {
  compartment_id             = var.compartment_ocid
  vcn_id                     = oci_core_vcn.habitmap.id
  display_name               = "habitmap-public-subnet"
  cidr_block                 = "10.0.1.0/24"
  dns_label                  = "pub"
  route_table_id             = oci_core_route_table.public.id
  security_list_ids          = [oci_core_security_list.public.id]
  prohibit_public_ip_on_vnic = false
}
