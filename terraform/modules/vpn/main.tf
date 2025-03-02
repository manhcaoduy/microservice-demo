# Create the VPN server instance
resource "google_compute_instance" "vpn_server" {
  name         = var.vpn_server.name
  machine_type = var.vpn_server.machine_type
  zone         = var.zone

  boot_disk {
    initialize_params {
      image = var.vpn_server.boot_disk_image
    }
  }

  network_interface {
    network = var.vpc_id
    subnetwork = var.subnet_id
    access_config {
      nat_ip = var.static_ip
    }
  }

  metadata = {
    ssh-keys = join("\n", [
      "${var.vpn_server.user}:${file(var.vpn_server.ssh.public_key_file_path)}",
    ])
  }

  tags = ["vpn-server"]

  metadata_startup_script = <<-EOF
    #!/bin/bash
    apt-get update
    apt-get upgrade
    apt install tzdata
    timedatectl set-timezone Asia/Ho_Chi_Minh

    bash <(curl -fsS https://packages.openvpn.net/as/install.sh) --yes && echo "$(tail -n 8 /usr/local/openvpn_as/init.log)" > /home/${var.vpn_server.user}/init.log

    /usr/local/openvpn_as/scripts/sacli --user ${var.vpn_server.openas.username} --new_pass "${var.vpn_server.openas.password}" SetLocalPassword
    /usr/local/openvpn_as/scripts/sacli --user ${var.vpn_server.openas.username} --key "prop_deny" --value "false" UserPropPut
    /usr/local/openvpn_as/scripts/sacli --user ${var.vpn_server.openas.username} --key "prop_autologin" --value "true" UserPropPut
    /usr/local/openvpn_as/scripts/sacli --user ${var.vpn_server.openas.username} --key "pvt_client_cert" --value "true" UserPropPut
    /usr/local/openvpn_as/scripts/sacli --user ${var.vpn_server.openas.username} --key "pvt_pwd_auth" --value "false" UserPropPut

    /usr/local/openvpn_as/scripts/sacli --key "host.name" --value "${var.static_ip}" ConfigPut

    /usr/local/openvpn_as/scripts/sacli --key "vpn.client.routing.reroute_dns" --value "false" ConfigPut
    /usr/local/openvpn_as/scripts/sacli --key "vpn.client.routing.reroute_gw" --value "false" ConfigPut
    /usr/local/openvpn_as/scripts/sacli --key "vpn.server.routing.private_network.0" --value "${var.subnet_ip_cidr_range}" ConfigPut
    /usr/local/openvpn_as/scripts/sacli --key "vpn.server.routing.private_network.1" --value "${var.postgres_private_ip_address_range}" ConfigPut

    /usr/local/openvpn_as/scripts/sacli start

    /usr/local/openvpn_as/scripts/sacli --user ${var.vpn_server.openas.username} GetAutologin > /home/${var.vpn_server.user}/user.ovpn
  EOF

  service_account {
    scopes = ["cloud-platform"]
  }

  # Provisioner to wait for startup script completion
  provisioner "remote-exec" {
    connection {
      type        = "ssh"
      user        = var.vpn_server.user
      private_key = file(var.vpn_server.ssh.private_key_file_path)
      host        = var.static_ip
    }

    inline = [
      "while [ ! -f /home/${var.vpn_server.user}/init.log ]; do echo 'Waiting for startup script to complete...'; sleep 30; done",
      "echo 'Startup script has completed!'"
    ]
  }
}

resource "google_compute_firewall" "vpn_internet_firewall_rule" {
  name    = "vpn-internet-firewall-rule"
  network = var.vpc_id

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