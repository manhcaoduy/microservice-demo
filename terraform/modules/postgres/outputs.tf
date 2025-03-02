output "private_ip_address_range" {
  value = "${google_compute_global_address.private_ip_address.address}/${google_compute_global_address.private_ip_address.prefix_length}"
}

output "postgres_connection_url" {
  description = "PostgreSQL connection URL"
  value       = "postgresql://${google_sql_user.users.name}:${google_sql_user.users.password}@${google_sql_database_instance.postgres.private_ip_address}:5432/${google_sql_database.database.name}"
  sensitive   = true
}