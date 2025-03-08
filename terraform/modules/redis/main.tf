resource "google_redis_instance" "cache" {
  name           = var.redis.name
  tier           = var.redis.tier
  memory_size_gb = var.redis.memory_size_gb

  region = var.region

  authorized_network = var.vpc_id
  
  connect_mode      = "PRIVATE_SERVICE_ACCESS"

  redis_version = var.redis.redis_version
  
  display_name = var.redis.display_name

  auth_enabled = true

  maintenance_policy {
    weekly_maintenance_window {
      day = "TUESDAY"
      start_time {
        hours   = 0
        minutes = 30
        seconds = 0
        nanos   = 0
      }
    }
  }
}
