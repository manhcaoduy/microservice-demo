resource "google_container_cluster" "gke_cluster" {
  name     = var.gke.name
  location = var.region 

  remove_default_node_pool = true
  initial_node_count       = 1

  # Enable private cluster configuration
  private_cluster_config {
    enable_private_nodes    = true
    enable_private_endpoint = false // can be true if you want to restrict the VPC access to the cluster 
    master_ipv4_cidr_block  = "172.16.0.0/28" // control plane IP CIDR within cluster 
  }

  node_config {
    machine_type = var.gke.machine_type
    disk_size_gb = var.gke.disk_size_gb
  }

  addons_config {
    horizontal_pod_autoscaling {
      disabled = false
    }
    http_load_balancing {
      disabled = false
    }
  }

  timeouts {
    create = "30m"
    update = "40m"
  }

  deletion_protection = false

  lifecycle {
    ignore_changes = [
      # Ignore changes to node_config.resource_labels that are managed by GKE
      node_config[0].resource_labels["goog-gke-node-pool-provisioning-model"],
    ]
  }

  network    = var.vpc_id
  subnetwork = var.subnet_id

  networking_mode = "VPC_NATIVE"
  
  ip_allocation_policy {
    cluster_secondary_range_name  = var.pod_ranges_name
    services_secondary_range_name = var.service_ranges_name
  }
}

resource "google_container_node_pool" "primary_nodes" {
  name       = var.gke_primary_node_pool.name
  location   = var.region      
  cluster    = google_container_cluster.gke_cluster.name
  node_count = 1                   

  node_config {
    machine_type = var.gke_primary_node_pool.machine_type     
    disk_size_gb = var.gke_primary_node_pool.disk_size_gb
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]
  }

  lifecycle {
    ignore_changes = [
      # Ignore changes to node_config.resource_labels that are managed by GKE
      node_config[0].resource_labels["goog-gke-node-pool-provisioning-model"],
    ]
  }
}
