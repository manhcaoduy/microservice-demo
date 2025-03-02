output "vpc_ip" {
  value = google_compute_network.vpc.id
}

output "subnet_id" {
  value = google_compute_subnetwork.subnet.id
}

output "subnet_ip_cidr_range" {
  value = google_compute_subnetwork.subnet.ip_cidr_range
}

output "pod_ranges_name" {
  value = google_compute_subnetwork.subnet.secondary_ip_range[0].range_name
}

output "service_ranges_name" {
  value = google_compute_subnetwork.subnet.secondary_ip_range[1].range_name
}

output "private_ip_address_range" {
  value = "${google_compute_global_address.private_ip_address.address}/${google_compute_global_address.private_ip_address.prefix_length}"
}

output "vpn_server_ip" {
  description = "Public IP address of the VPN server"
  value       = google_compute_address.vpn.address
}

output "nginx_public_ip" {
  value = google_compute_address.nginx_static_ip.address
}