resource "google_container_cluster" "gke_cluster" {
  name     = "my-gke-cluster-1"
  location = var.region 

  remove_default_node_pool = true
  initial_node_count       = 1

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
}

resource "google_container_node_pool" "primary_nodes" {
  name       = "my-node-pool"
  location   = var.region      
  cluster    = google_container_cluster.gke_cluster.name
  node_count = 1                   

  node_config {
    machine_type = "e2-micro"     
    disk_size_gb = 10
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]
  }
}

data "google_client_config" "default" {}

resource "local_file" "kubeconfig" {
  content = <<-EOT
apiVersion: v1
clusters:
- cluster:
    certificate-authority-data: ${google_container_cluster.gke_cluster.master_auth[0].cluster_ca_certificate}
    server: https://${google_container_cluster.gke_cluster.endpoint}
  name: ${google_container_cluster.gke_cluster.name}
contexts:
- context:
    cluster: ${google_container_cluster.gke_cluster.name}
    user: ${google_container_cluster.gke_cluster.name}
  name: ${google_container_cluster.gke_cluster.name}
current-context: ${google_container_cluster.gke_cluster.name}
kind: Config
preferences: {}
users:
- name: ${google_container_cluster.gke_cluster.name}
  user:
    token: ${data.google_client_config.default.access_token}
EOT
  filename = "${path.module}/kubeconfig"
}

provider "helm" {
  kubernetes {
    host                   = "https://${google_container_cluster.gke_cluster.endpoint}"
    token                  = data.google_client_config.default.access_token
    cluster_ca_certificate = base64decode(google_container_cluster.gke_cluster.master_auth[0].cluster_ca_certificate)
  }
}

provider "kubernetes" {
  host                   = "https://${google_container_cluster.gke_cluster.endpoint}"
  token                  = data.google_client_config.default.access_token
  cluster_ca_certificate = base64decode(google_container_cluster.gke_cluster.master_auth[0].cluster_ca_certificate)
}


# Create ArgoCD namespace
resource "kubernetes_namespace" "argocd" {
  metadata {
    name = "argocd"
  }

  depends_on = [
    google_container_cluster.gke_cluster,
  ]
}

# Install ArgoCD using Helm
resource "helm_release" "argocd" {
  name       = "argocd"
  repository = "https://argoproj.github.io/argo-helm"
  chart      = "argo-cd"
  namespace  = kubernetes_namespace.argocd.metadata[0].name
  version    = "5.51.6"

  set {
    name  = "server.service.type"
    value = "LoadBalancer"
  }

  depends_on = [
    kubernetes_namespace.argocd
  ]
}