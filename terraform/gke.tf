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
