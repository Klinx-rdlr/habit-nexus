variable "compartment_ocid" {
  description = "OCI compartment OCID"
  type        = string
}

variable "availability_domain" {
  description = "Availability domain for the instance"
  type        = string
}

variable "subnet_id" {
  description = "Subnet OCID to place the instance in"
  type        = string
}

variable "ssh_public_key" {
  description = "SSH public key for instance access"
  type        = string
}
