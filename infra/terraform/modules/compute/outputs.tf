output "instance_id" {
  description = "OCID of the compute instance"
  value       = oci_core_instance.habitmap.id
}

output "public_ip" {
  description = "Public IP address of the instance"
  value       = oci_core_instance.habitmap.public_ip
}
