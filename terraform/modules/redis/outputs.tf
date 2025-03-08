output "redis_host" {
  value = google_redis_instance.cache.host
}

output "redis_port" {
  value = google_redis_instance.cache.port
}

output "redis_password" {
  value = google_redis_instance.cache.auth_string
}
