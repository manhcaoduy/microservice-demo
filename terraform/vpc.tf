# VPC Network
resource "google_compute_network" "vpc" {
  name                    = "main-vpc"
  auto_create_subnetworks = false
  routing_mode           = "REGIONAL"
}

# Subnet for GKE and Cloud SQL
resource "google_compute_subnetwork" "subnet" {
  name          = "main-subnet"
  ip_cidr_range = "10.0.0.0/16"
  region        = var.region
  network       = google_compute_network.vpc.id

  # Secondary IP ranges for GKE pods and services
  secondary_ip_range {
    range_name    = "pod-ranges"
    ip_cidr_range = "192.168.0.0/18"
  }

  secondary_ip_range {
    range_name    = "service-ranges"
    ip_cidr_range = "192.168.64.0/18"
  }

  private_ip_google_access = true
}

# Cloud Router for NAT Gateway
resource "google_compute_router" "router" {
  name    = "cloud-router"
  region  = var.region
  network = google_compute_network.vpc.id
}

# NAT Gateway
resource "google_compute_router_nat" "nat" {
  name                               = "cloud-nat"
  router                            = google_compute_router.router.name
  region                            = var.region
  nat_ip_allocate_option           = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"
}

# Firewall rule for internal communication
resource "google_compute_firewall" "internal" {
  name    = "allow-internal"
  network = google_compute_network.vpc.id

  allow {
    protocol = "icmp"
  }

  allow {
    protocol = "tcp"
  }

  allow {
    protocol = "udp"
  }

  source_ranges = [
    google_compute_subnetwork.subnet.ip_cidr_range,
    google_compute_subnetwork.subnet.secondary_ip_range[0].ip_cidr_range,
    google_compute_subnetwork.subnet.secondary_ip_range[1].ip_cidr_range,
  ]
}

# Firewall rule to allow SSH access
resource "google_compute_firewall" "vpn_internal_firewall_rule" {
  name    = "vpn-internal-firewall-rule"
  network = google_compute_network.vpc.id

  allow {
    protocol = "tcp"
  }

  allow {
    protocol = "udp"
  }

  # This restricts access to your VPC CIDR ranges
  source_ranges = [
    google_compute_subnetwork.subnet.ip_cidr_range,
  ]
  target_tags   = ["vpn-server"]
}

resource "google_compute_firewall" "vpn_internet_firewall_rule" {
  name    = "vpn-internet-firewall-rule"
  network = google_compute_network.vpc.id

  allow {
    protocol = "tcp"
    ports = [
      "22", # Allow SSH (22)
      "943", # Allow Admin UI (943)
      "443", # Allow OpenVPN TCP (443)
    ]
  }

  allow {
    protocol = "udp"
    ports = ["1194"] # Allow OpenVPN UDP traffic
  }

  source_ranges = [
    "0.0.0.0/0"
  ]

  target_tags   = ["vpn-server"]
}

# Create a static IP for the VPN server
resource "google_compute_address" "vpn" {
  name   = "vpn-static-ip"
  region = var.region
}

# Private Service Access connection setup
# - private_ip_address: Reserves an IP range for VPC peering with Google services (e.g. Cloud SQL)
# - private_vpc_connection: Establishes VPC peering with Google services to enable private connectivity
resource "google_compute_global_address" "private_ip_address" {
  name          = "private-ip-address"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.vpc.id
}

resource "google_service_networking_connection" "private_vpc_connection" {
  network                 = google_compute_network.vpc.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_address.name]

  deletion_policy = "ABANDON"
}

output "vpc_ip" {
  value = google_compute_global_address.private_ip_address.address
}

output "subnet_ip_cidr_range" {
  value = google_compute_subnetwork.subnet.ip_cidr_range
}

output "private_ip_address_range" {
  value = "${google_compute_global_address.private_ip_address.address}/${google_compute_global_address.private_ip_address.prefix_length}"
}
