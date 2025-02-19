resource "google_sql_database_instance" "postgres" {
  name             = "postgres"
  database_version = "POSTGRES_14"
  region           = var.region

  settings {
    tier              = "db-f1-micro"
    availability_type = "ZONAL"
    edition           = "ENTERPRISE"
    
    ip_configuration {
      ipv4_enabled    = false
      private_network = google_compute_network.vpc.id
      enable_private_path_for_google_cloud_services = true
    }
  }

  deletion_protection = false

  depends_on = [google_service_networking_connection.private_vpc_connection]
}

resource "google_sql_database" "database" {
  name     = var.database_name
  instance = google_sql_database_instance.postgres.name
}

resource "google_sql_user" "users" {
  name     = var.database_user
  instance = google_sql_database_instance.postgres.name
  password = var.database_password
  type = "BUILT_IN"
}

output "database_url" {
  description = "PostgreSQL connection URL"
  value       = "postgresql://${google_sql_user.users.name}:${google_sql_user.users.password}@${google_sql_database_instance.postgres.private_ip_address}:5432/${google_sql_database.database.name}"
  sensitive   = true
}