output "repository_urls" {
  description = "Map of service name to full OCIR image URL (without tag)"
  value = {
    for svc, repo in oci_artifacts_container_repository.services :
    svc => "${var.region}.ocir.io/${var.tenancy_namespace}/${repo.display_name}"
  }
}

output "repository_ocids" {
  description = "Map of service name to repository OCID"
  value = {
    for svc, repo in oci_artifacts_container_repository.services :
    svc => repo.id
  }
}
