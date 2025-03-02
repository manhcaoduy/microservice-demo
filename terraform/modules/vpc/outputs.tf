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
