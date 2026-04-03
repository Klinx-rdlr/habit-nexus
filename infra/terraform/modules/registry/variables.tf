variable "compartment_ocid" {
  description = "OCI compartment OCID"
  type        = string
}

variable "region" {
  description = "OCI region (e.g., ap-singapore-1)"
  type        = string
}

variable "tenancy_namespace" {
  description = "OCI tenancy Object Storage namespace (used in OCIR URL)"
  type        = string
}
