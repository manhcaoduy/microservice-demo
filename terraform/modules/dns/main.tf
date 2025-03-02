resource "google_dns_managed_zone" "argocd" {
  name        = "argocd-zone"
  dns_name    = var.domain
  description = "DNS zone for ArgoCD"
  
  private_visibility_config {
    networks {
      network_url = var.vpc_id
    }
  }
  visibility = "private"
}

resource "google_dns_record_set" "argocd" {
  name         = google_dns_managed_zone.argocd.dns_name
  managed_zone = google_dns_managed_zone.argocd.name
  type         = "A"
  ttl          = 300
  rrdatas      = [var.argocd_nginx_private_ip]
}
