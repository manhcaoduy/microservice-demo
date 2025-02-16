resource "google_container_cluster" "gke_cluster" {
  name     = "my-gke-cluster"
  location = var.region 

  remove_default_node_pool = true
  initial_node_count       = 1

  node_config {
    machine_type = "e2-medium"
    disk_size_gb = 10
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
}

resource "google_container_node_pool" "primary_nodes" {
  name       = "my-node-pool"
  location   = var.region      
  cluster    = google_container_cluster.gke_cluster.name
  node_count = 1                   

  node_config {
    machine_type = "e2-medium"     
    disk_size_gb = 10
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

data "google_client_config" "default" {}

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

# Install ArgoCD using Helm
resource "helm_release" "argocd" {
  name       = "argocd"
  repository = "https://argoproj.github.io/argo-helm"
  chart      = "argo-cd"
  namespace  = "argocd"
  version    = "5.51.6"
  create_namespace = true

    # Wait for CRDs to be installed
  wait             = true
  wait_for_jobs    = true
  timeout          = 600 # 10 minutes

  set {
    name  = "server.service.type"
    value = "LoadBalancer"
  }

  # Configure SSH repository
  set {
    name  = "configs.repositories.${var.argocd_application_name}.url"
    value = var.github_ssh_url
  }

  set {
    name  = "configs.repositories.${var.argocd_application_name}.sshPrivateKey"
    value = file(var.github_ssh_private_key)
  }
}

# Create ArgoCD Application as a Kubernetes manifest
resource "kubernetes_manifest" "argocd_application" {
  depends_on = [
    helm_release.argocd,
  ]

  provider = kubernetes
  manifest = {
    apiVersion = "argoproj.io/v1alpha1"
    kind       = "Application"
    metadata = {
      name      = var.argocd_application_name
      namespace = "argocd"
    }
    spec = {
      project = "default"
      source = {
        repoURL        = var.github_ssh_url
        targetRevision = "HEAD"
        path          = "helm-charts"
      }
      destination = {
        server    = "https://kubernetes.default.svc"
        namespace = "default"
      }
    }
  }
}