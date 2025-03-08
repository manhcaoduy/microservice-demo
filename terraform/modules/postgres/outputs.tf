output "postgres_ip" {
  value = google_sql_database_instance.postgres.private_ip_address
}

output "postgres_connection_url" {
  description = "PostgreSQL connection URL"
  value       = "postgresql://${google_sql_user.users.name}:${google_sql_user.users.password}@${google_sql_database_instance.postgres.private_ip_address}:5432/${google_sql_database.database.name}"
  sensitive   = true
}