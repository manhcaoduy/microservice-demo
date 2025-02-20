# Create the VPN server instance
resource "google_compute_instance" "vpn_server" {
  name         = "vpn-server"
  machine_type = "e2-micro"
  zone         = var.zone

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2204-lts"
    }
  }

  network_interface {
    network = google_compute_network.vpc.id
    subnetwork = google_compute_subnetwork.subnet.id
    access_config {
      nat_ip = google_compute_address.vpn.address
    }
  }

  metadata = {
    ssh-keys = join("\n", [
      "manh:${file(var.vpn_manh_ssh_public_key_file_path)}",
    ])
  }

  tags = ["vpn-server"]

  metadata_startup_script = <<-EOF
    #!/bin/bash
    apt-get update
    apt-get upgrade
    apt install tzdata
    timedatectl set-timezone Asia/Ho_Chi_Minh

    bash <(curl -fsS https://packages.openvpn.net/as/install.sh) --yes

    echo "Startup script completed" > /startup-complete
  EOF

  service_account {
    scopes = ["cloud-platform"]
  }

  # Provisioner to wait for startup script completion
  provisioner "remote-exec" {
    connection {
      type        = "ssh"
      user        = "manh"
      private_key = file(var.vpn_manh_ssh_private_key_file_path)
      host        = google_compute_address.vpn.address
    }

    inline = [
      "while [ ! -f /startup-complete ]; do echo 'Waiting for startup script to complete...'; sleep 10; done",
      "echo 'Startup script has completed!'"
    ]
  }

  depends_on = [google_service_networking_connection.private_vpc_connection]
}

# Output the VPN server IP and instructions
output "vpn_server_ip" {
  value = google_compute_address.vpn.address
}
