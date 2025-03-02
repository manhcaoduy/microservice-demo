output "vpn_server_ip" {
  description = "Public IP address of the VPN server"
  value       = google_compute_address.vpn.address
}