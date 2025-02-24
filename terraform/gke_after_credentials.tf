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

resource "helm_release" "ingress_nginx_external" {
  name       = "ingress-nginx-internal"
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

data "kubernetes_secret" "argocd_admin_password" {
  metadata {
    name      = "argocd-initial-admin-secret"
    namespace = "argocd"
  }
}

output "argocd_admin_password" {
  value     = data.kubernetes_secret.argocd_admin_password.data.password
  sensitive = true
}