provider "helm" {
  kubernetes {
    config_path = var.kubeconfig_path
  }
}

provider "kubernetes" {
  config_path = var.kubeconfig_path
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
    value = "ClusterIP"
  }

  # Configure SSH repository
  set {
    name  = "configs.repositories.${var.argocd.name}.url"
    value = var.argocd.repo.ssh_url
  }

  set {
    name  = "configs.repositories.${var.argocd.name}.sshPrivateKey"
    value = file(var.argocd.repo.ssh_private_key_path)
  }
}

# Create ArgoCD Application as a Kubernetes manifest
# Need to comment it when the cluster is not created
resource "kubernetes_manifest" "argocd_application" {
  depends_on = [
    helm_release.argocd,
  ]

  provider = kubernetes
  manifest = {
    apiVersion = "argoproj.io/v1alpha1"
    kind       = "Application"
    metadata = {
      name      = var.argocd.name
      namespace = "argocd"
    }
    spec = {
      project = "default"
      source = {
        repoURL        = var.argocd.repo.ssh_url
        targetRevision = var.argocd.repo.target_revision
        path          = var.argocd.repo.path
      }

      destination = {
        server    = "https://kubernetes.default.svc"
        namespace = "default"
      }

      syncPolicy = {
        automated = {
          prune    = true
          selfHeal = true
        }
      }
    }
  }
}

resource "helm_release" "ingress_nginx_external" {
  name       = "ingress-nginx-external"
  repository = "https://kubernetes.github.io/ingress-nginx"
  chart      = "ingress-nginx"
  namespace  = "ingress-nginx"
  create_namespace = true

  wait = true
  timeout = 600

  values = [<<-EOT
    controller:
      ingressClassResource:
        name: nginx-external
        controllerValue: "k8s.io/ingress-nginx-external"
        default: false
      service:
        type: LoadBalancer
        annotations:
          networking.gke.io/load-balancer-type: "Internal"
      
      resources:
        requests:
          cpu: 100m
          memory: 90Mi
      
      replicaCount: 2

      metrics:
        enabled: true
  EOT
  ]
}

resource "helm_release" "ingress_nginx_argocd" {
  name       = "ingress-nginx-argocd"
  repository = "https://kubernetes.github.io/ingress-nginx"
  chart      = "ingress-nginx"
  namespace  = "ingress-nginx"
  create_namespace = true

  wait = true
  timeout = 600

  values = [<<-EOT
    controller:
      ingressClassResource:
        name: nginx-argocd
        controllerValue: "k8s.io/ingress-nginx-argocd"
        default: false
      service:
        type: LoadBalancer
        annotations:
          networking.gke.io/load-balancer-type: "Internal"
      
      resources:
        requests:
          cpu: 100m
          memory: 90Mi
      
      replicaCount: 2

      metrics:
        enabled: true
  EOT
  ]
}
