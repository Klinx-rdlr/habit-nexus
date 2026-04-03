variable "tenancy_ocid" {
  description = "OCI tenancy OCID"
  type        = string
}

variable "compartment_ocid" {
  description = "OCI compartment OCID"
  type        = string
}

variable "region" {
  description = "OCI region"
  type        = string
  default     = "ap-singapore-1"
}

variable "availability_domain" {
  description = "Availability domain for the compute instance"
  type        = string
}

variable "ssh_public_key" {
  description = "SSH public key for VM access"
  type        = string
}

variable "tenancy_namespace" {
  description = "OCI tenancy Object Storage namespace (find via: oci os ns get)"
  type        = string
}
