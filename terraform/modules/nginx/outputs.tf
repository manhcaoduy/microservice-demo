output "nginx_public_ip" {
  value = google_compute_address.nginx_static_ip.address
}