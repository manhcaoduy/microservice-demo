# Private Service Access connection setup
# - private_ip_address: Reserves an IP range for VPC peering with Google services (e.g. Cloud SQL)
# - private_vpc_connection: Establishes VPC peering with Google services to enable private connectivity
resource "google_compute_global_address" "private_ip_address" {
  name          = "private-ip-address"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = var.vpc_id
}

resource "google_service_networking_connection" "private_vpc_connection" {
  network                 = var.vpc_id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_address.name]

  deletion_policy = "ABANDON"
}

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

  depends_on = [
    google_service_networking_connection.private_vpc_connection
  ]
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