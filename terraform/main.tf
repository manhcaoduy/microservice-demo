provider "google" {
  project = var.project_id
  region  = var.region
}

module "gke" {
  source                     = "terraform-google-modules/kubernetes-engine/google//modules/private-cluster"
  project_id                 = var.project_id
  name                       = var.cluster_name
  regional                   = false
  zones                      = [var.zone]
  network                    = google_compute_network.vpc_network.name
  subnetwork                 = google_compute_subnetwork.subnet.name
  ip_range_pods              = var.pods_range_name
  ip_range_services          = var.services_range_name
  remove_default_node_pool   = true
  initial_node_count         = 1
  deletion_protection        = false
}

module "gke_auth" {
  source = "terraform-google-modules/kubernetes-engine/google//modules/auth"
  depends_on   = [module.gke]
  project_id   = var.project_id
  location     = module.gke.location
  cluster_name = module.gke.name
}

resource "local_file" "kubeconfig" {
  content  = module.gke_auth.kubeconfig_raw
  filename = "kubeconfig-${var.cluster_name}"
}

resource "google_compute_network" "vpc_network" {
  name                    = "vpc-network"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "subnet" {
  name          = "gke-subnet"
  ip_cidr_range = "10.0.0.0/16"
  region        = var.region
  network       = google_compute_network.vpc_network.name
  secondary_ip_range {
    range_name    = var.pods_range_name  # This should match your var.pods_range_name
    ip_cidr_range = "10.1.0.0/16"  # Example range for pods
  }

  secondary_ip_range {
    range_name    = var.services_range_name # This should match your var.services_range_name
    ip_cidr_range = "10.2.0.0/24"  # Example range for services
  }
}

resource "google_cloudbuild_trigger" "github_trigger" {
  name = "build-bff"
  location = "global"  # Cloud Build triggers are global

  github {
    owner = "your-github-username"
    name  = "your-repo-name"
    push {
      branch = "^main$"  # Trigger on pushes to the 'main' branch
    }
  }

  filename = "cloudbuild.yaml"

  # Additional substitutions if needed
  substitutions = {
    _REGION = "us-central1"
  }

  # Here we define what happens during the build
  build {
    steps = [
      {
        name = "gcr.io/cloud-builders/docker"
        args = ["build", "-t", "gcr.io/$PROJECT_ID/your-app-name:$COMMIT_SHA", "."]
      },
      {
        name = "gcr.io/cloud-builders/docker"
        args = ["push", "gcr.io/$PROJECT_ID/your-app-name:$COMMIT_SHA"]
      }
    ]
  }
}