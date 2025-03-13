resource "google_dns_managed_zone" "postgres" {
  name        = "postgres-zone"
  dns_name    = var.postgres_domain
  description = "DNS zone for Postgres"
  
  private_visibility_config {
    networks {
      network_url = var.vpc_id
    }
  }
  visibility = "private"
}

resource "google_dns_record_set" "postgres" {
  name         = google_dns_managed_zone.postgres.dns_name
  managed_zone = google_dns_managed_zone.postgres.name
  type         = "A"
  ttl          = 300
  rrdatas      = [var.postgres_private_ip]
}

resource "google_dns_managed_zone" "redis" {
  name        = "redis-zone"
  dns_name    = var.redis_domain
  description = "DNS zone for Redis"
  
  private_visibility_config {
    networks {
      network_url = var.vpc_id
    }
  }
  visibility = "private"
}

resource "google_dns_record_set" "redis" {
  name         = google_dns_managed_zone.redis.dns_name
  managed_zone = google_dns_managed_zone.redis.name
  type         = "A"
  ttl          = 300
  rrdatas      = [var.redis_private_ip]
}