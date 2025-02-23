# Create the VPN server instance
resource "google_compute_instance" "vpn_server" {
  name         = "vpn-server"
  machine_type = "e2-medium"
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
      "${var.vpn_server_user}:${file(var.vpn_server_ssh_public_key_file_path)}",
    ])
  }

  tags = ["vpn-server"]

  metadata_startup_script = <<-EOF
    #!/bin/bash
    apt-get update
    apt-get upgrade
    apt install tzdata
    timedatectl set-timezone Asia/Ho_Chi_Minh

    bash <(curl -fsS https://packages.openvpn.net/as/install.sh) --yes && echo "$(tail -n 8 /usr/local/openvpn_as/init.log)" > /home/${var.vpn_server_user}/init.log

    /usr/local/openvpn_as/scripts/sacli --user ${var.openas_username} --new_pass "${var.openas_password}" SetLocalPassword
    /usr/local/openvpn_as/scripts/sacli --user ${var.openas_username} --key "prop_deny" --value "false" UserPropPut
    /usr/local/openvpn_as/scripts/sacli --user ${var.openas_username} --key "prop_autologin" --value "true" UserPropPut
    /usr/local/openvpn_as/scripts/sacli --user ${var.openas_username} --key "pvt_client_cert" --value "true" UserPropPut
    /usr/local/openvpn_as/scripts/sacli --user ${var.openas_username} --key "pvt_pwd_auth" --value "false" UserPropPut

    /usr/local/openvpn_as/scripts/sacli --key "host.name" --value "${google_compute_address.vpn.address}" ConfigPut

    /usr/local/openvpn_as/scripts/sacli --key "vpn.client.routing.reroute_dns" --value "false" ConfigPut
    /usr/local/openvpn_as/scripts/sacli --key "vpn.client.routing.reroute_gw" --value "false" ConfigPut
    /usr/local/openvpn_as/scripts/sacli --key "vpn.server.routing.private_network.0" --value "${google_compute_subnetwork.subnet.ip_cidr_range}" ConfigPut
    /usr/local/openvpn_as/scripts/sacli --key "vpn.server.routing.private_network.1" --value "${google_compute_global_address.private_ip_address.address}/${google_compute_global_address.private_ip_address.prefix_length}" ConfigPut

    /usr/local/openvpn_as/scripts/sacli start

    /usr/local/openvpn_as/scripts/sacli --user ${var.openas_username} GetAutologin > /home/${var.vpn_server_user}/user.ovpn
  EOF

  service_account {
    scopes = ["cloud-platform"]
  }

  # Provisioner to wait for startup script completion
  provisioner "remote-exec" {
    connection {
      type        = "ssh"
      user        = var.vpn_server_user
      private_key = file(var.vpn_server_ssh_private_key_file_path)
      host        = google_compute_address.vpn.address
    }

    inline = [
      "while [ ! -f /home/${var.vpn_server_user}/init.log ]; do echo 'Waiting for startup script to complete...'; sleep 30; done",
      "echo 'Startup script has completed!'"
    ]
  }

  depends_on = [google_service_networking_connection.private_vpc_connection]
}

# Output the VPN server IP and instructions
output "vpn_server_ip" {
  value = google_compute_address.vpn.address
}
