output "vpn_server_ip" {
  value       = module.vpn.vpn_server_ip
}

output "nginx_public_ip" {
  value = module.nginx.nginx_public_ip
}

output "postgres_connection_url" {
  value       = module.postgres.postgres_connection_url
  sensitive   = true
}

output "argocd_nginx_private_ip" {
  value = module.k8s-services.ingress_nginx_argocd_ip
}

output "argocd_admin_password" {
  value     = module.k8s-services.argocd_admin_password
  sensitive = true
}
