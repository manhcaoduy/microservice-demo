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

output "ingress_nginx_external_ip" {
  value = data.kubernetes_service.ingress_nginx_external.status.0.load_balancer.0.ingress.0.ip
}

output "ingress_nginx_argocd_ip" {
  value = data.kubernetes_service.ingress_nginx_argocd.status.0.load_balancer.0.ingress.0.ip
}

data "kubernetes_service" "ingress_nginx_external" {
  metadata {
    name = "ingress-nginx-external-controller"
    namespace = "ingress-nginx"
  }
  depends_on = [helm_release.ingress_nginx_external]
}

data "kubernetes_service" "ingress_nginx_argocd" {
  metadata {
    name = "ingress-nginx-argocd-controller" 
    namespace = "ingress-nginx"
  }
  depends_on = [helm_release.ingress_nginx_argocd]
}