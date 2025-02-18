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
