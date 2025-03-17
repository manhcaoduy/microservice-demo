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

resource "google_cloudbuild_trigger" "bff_cloudbuild" {
  name = var.bff_cloudbuild.name
  location = "global"
  disabled = false

  github {
    owner = var.bff_cloudbuild.github.owner
    name  = var.bff_cloudbuild.github.name
    push {
      branch = var.bff_cloudbuild.github.branch
      invert_regex = false
    }
  }

  included_files = var.bff_cloudbuild.included_files

  filename = var.bff_cloudbuild.filename

  substitutions = {
    _PROJECT_ID = var.project_id
  }

  approval_config {
    approval_required = true
  }

  service_account = "projects/${var.project_id}/serviceAccounts/${google_service_account.cloudbuild_sa.email}"
}

resource "google_cloudbuild_trigger" "socketer_cloudbuild" {
  name = var.socketer_cloudbuild.name
  location = "global"
  disabled = false

  github {
    owner = var.socketer_cloudbuild.github.owner
    name  = var.socketer_cloudbuild.github.name
    push {
      branch = var.socketer_cloudbuild.github.branch
      invert_regex = false
    }
  }

  included_files = var.socketer_cloudbuild.included_files

  filename = var.socketer_cloudbuild.filename

  substitutions = {
    _PROJECT_ID = var.project_id
  }

  approval_config {
    approval_required = true
  }

  service_account = "projects/${var.project_id}/serviceAccounts/${google_service_account.cloudbuild_sa.email}"
}

resource "google_cloudbuild_trigger" "user_cloudbuild" {
  name = var.user_cloudbuild.name
  location = "global"
  disabled = false

  github {
    owner = var.user_cloudbuild.github.owner
    name  = var.user_cloudbuild.github.name
    push {
      branch = var.user_cloudbuild.github.branch
      invert_regex = false
    }
  }

  included_files = var.user_cloudbuild.included_files

  filename = var.user_cloudbuild.filename

  substitutions = {
    _PROJECT_ID = var.project_id
  }

  approval_config {
    approval_required = true
  }

  service_account = "projects/${var.project_id}/serviceAccounts/${google_service_account.cloudbuild_sa.email}"
}
