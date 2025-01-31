resource "google_service_account" "cloudbuild_sa" {
  account_id   = "cloudbuild-sa"
  display_name = "Service Account for Cloud Build"
}

resource "google_project_iam_member" "cloudbuild_storage_admin" {
  project = var.project_id
  role    = "roles/storage.admin"
  member  = "serviceAccount:${google_service_account.cloudbuild_sa.email}"
}

resource "google_project_iam_member" "cloudbuild_builds_editor" {
  project = var.project_id
  role    = "roles/cloudbuild.builds.editor"
  member  = "serviceAccount:${google_service_account.cloudbuild_sa.email}"
}

resource "google_project_iam_member" "cloudbuild_sa_user" {
  project = var.project_id
  role    = "roles/iam.serviceAccountUser"
  member  = "serviceAccount:${google_service_account.cloudbuild_sa.email}"
}

resource "google_project_iam_member" "cloudbuild_sa_log_writer" {
  project = var.project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.cloudbuild_sa.email}"
}

resource "google_project_iam_member" "cloudbuild_sa_artifact_registry_uploader" {
  project = var.project_id
  role    = "roles/artifactregistry.writer"
  member  = "serviceAccount:${google_service_account.cloudbuild_sa.email}"
}

# Optional: Create a key for the service account
resource "google_service_account_key" "cloudbuild_key" {
  service_account_id = google_service_account.cloudbuild_sa.name
  public_key_type    = "TYPE_X509_PEM_FILE"
}

# Output the key if needed
# output "cloud_build_service_account_key" {
#   value     = google_service_account_key.cloudbuild_key.private_key
#   sensitive = true
# }

resource "google_cloudbuild_trigger" "bff_cloudbuild" {
  name = "bff-cloudbuild"
  location = "global"
  disabled = false

  github {
    owner = "manhcaoduy"
    name  = "microservice-demo"
    push {
      branch = "^main$"
      invert_regex = false
    }
  }

  filename = "terraform/cloudbuilds/bff-cloudbuild.yaml"

  substitutions = {
    _PROJECT_ID = var.project_id
  }

  approval_config {
    approval_required = true
  }

  service_account = "projects/${var.project_id}/serviceAccounts/${google_service_account.cloudbuild_sa.email}"
}
