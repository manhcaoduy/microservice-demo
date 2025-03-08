resource "google_sql_database_instance" "postgres" {  
  name             = var.postgres.name
  database_version = var.postgres.version
  region           = var.region

  settings {
    tier              = var.postgres.tier
    availability_type = "ZONAL"
    edition           = "ENTERPRISE"
    
    ip_configuration {
      ipv4_enabled    = false
      private_network = var.vpc_id
      enable_private_path_for_google_cloud_services = true
    }
  }

  deletion_protection = false
}

resource "google_sql_database" "database" {
  name     = var.postgres.database.name
  instance = google_sql_database_instance.postgres.name
}

resource "google_sql_user" "users" {
  name     = var.postgres.database.user
  instance = google_sql_database_instance.postgres.name
  password = var.postgres.database.password
  type = "BUILT_IN"
}