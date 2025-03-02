output "vpn_server_ip" {
  value       = module.vpc.vpn_server_ip
}

output "nginx_public_ip" {
  value = module.vpc.nginx_public_ip
}

output "postgres_connection_url" {
  value       = module.postgres.postgres_connection_url
  sensitive   = true
}

output "argocd_admin_password" {
  value     = module.k8s-services.argocd_admin_password
  sensitive = true
}
