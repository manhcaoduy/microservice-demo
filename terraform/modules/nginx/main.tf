# Create nginx instance
resource "google_compute_instance" "nginx" {
  name         = var.nginx_server.name
  machine_type = var.nginx_server.machine_type
  zone         = var.zone

  boot_disk {
    initialize_params {
      image = var.nginx_server.boot_disk_image
    }
  }

  network_interface {
    network    = var.vpc_id
    subnetwork = var.subnet_id

    access_config {
      nat_ip = var.static_ip
    }
  }

  metadata = {
    ssh-keys = "${var.nginx_server.ssh.user}:${file(var.nginx_server.ssh.public_key_file_path)}"
  }

  tags = ["nginx-server"]

  metadata_startup_script = <<-EOF
    #!/bin/bash
    apt-get update
    apt-get install -y nginx
    
    # Create Cloudflare IP allow list
    cat > /etc/nginx/allow-cloudflare-only.conf <<'EOL'
    # IPv4
    allow 173.245.48.0/20;
    allow 103.21.244.0/22;
    allow 103.22.200.0/22;
    allow 103.31.4.0/22;
    allow 141.101.64.0/18;
    allow 108.162.192.0/18;
    allow 190.93.240.0/20;
    allow 188.114.96.0/20;
    allow 197.234.240.0/22;
    allow 198.41.128.0/17;
    allow 162.158.0.0/15;
    allow 104.16.0.0/13;
    allow 104.24.0.0/14;
    allow 172.64.0.0/13;
    allow 131.0.72.0/22;

    # IPv6
    allow 2400:cb00::/32;
    allow 2606:4700::/32;
    allow 2803:f800::/32;
    allow 2405:b500::/32;
    allow 2405:8100::/32;
    allow 2a06:98c0::/29;
    allow 2c0f:f248::/32;

    deny all;
    EOL
    
    # Configure nginx as reverse proxy to k8s ingress
    cat > /etc/nginx/sites-available/default <<'EOL'
    upstream upstream_app_pool {
      zone backends 64k;
      server ${var.nginx_server.upstream_ip.external};
    }

    # upstream upstream_v2_ingress {
    #   zone backends 64k;
    #   server 10.158.2.20;
    # }

    limit_req_zone $binary_remote_addr zone=one:10m rate=50r/s;
    limit_conn_zone $binary_remote_addr zone=two:10m;

    log_format combined_realip_cf '$http_cf_connecting_ip,$time_iso8601,$status';

    server {
      listen 80 default_server;
      server_name _;

      error_log /var/log/nginx/lb-error.log notice;
      access_log /var/log/nginx/lb-short.log combined_realip_cf;

      client_body_timeout 10s;
      client_header_timeout 10s;

      include /etc/nginx/allow-cloudflare-only.conf;

      # location /service {
      #   add_header Access-Control-Expose-Headers "cf-ray, cf-cache-status";
      #   if ($request_method = OPTIONS) {
      #     add_header Content-Length 0;
      #     add_header Content-Type application/json;
      #     add_header Access-Control-Allow-Origin "*";
      #     add_header Access-Control-Allow-Headers "*";
      #     return 200;
      #   }

      #   proxy_pass              http://upstream_v2_ingress;
      #   proxy_http_version      1.1;
      #   proxy_set_header        Host $host;
      #   proxy_set_header        X-Real-IP $remote_addr;
      #   proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
      #   proxy_set_header        X-Forwarded-Proto $scheme;

      #   limit_req zone=one burst=50 delay=5;
      #   limit_conn two 20;
      # }
      
      # location /socket.io {
      #   proxy_pass http://upstream_app_pool/socket.io/;
      #   proxy_http_version 1.1;
      #   proxy_set_header Upgrade $http_upgrade;
      #   proxy_set_header Connection "upgrade";
      #   proxy_read_timeout 86400;
      # }

      location / {
        add_header Access-Control-Expose-Headers "cf-ray, cf-cache-status";
        if ($request_method = OPTIONS) {
          add_header Content-Length 0;
          add_header Content-Type application/json;
          add_header Access-Control-Allow-Origin "*";
          add_header Access-Control-Allow-Headers "*";
          return 200;
        }

        proxy_pass              http://upstream_app_pool/;
        proxy_http_version      1.1;
        proxy_set_header        Host $host;
        proxy_set_header        X-Real-IP $remote_addr;
        proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header        X-Forwarded-Proto $scheme;

        # Rate limiting configuration:
        # - zone=one: Uses shared memory zone named "one" to track request rates across workers
        # - burst=50: Allows queueing/bursting of up to 50 excess requests
        # - delay=5: When rate limit is exceeded, requests are delayed by 5ms instead of rejected,
        #           helping to smooth out traffic spikes while maintaining service
        limit_req zone=one burst=50 delay=5;

        # Rate limiting configuration:
        # - zone=two: Uses shared memory zone named "two" to track connection rates across workers
        # - conn=20: Limits the number of concurrent connections to 20
        limit_conn two 20;
      }
    }
    EOL

    systemctl restart nginx
  EOF
}


resource "google_compute_firewall" "nginx_firewall_rule" {
  name    = "nginx-firewall-rule"
  network = var.vpc_id

  allow {
    protocol = "tcp"
    ports = [
      "22", # Allow SSH (22)
      "80", # Allow HTTP (80)
      "443", # Allow HTTPS (443)
    ]
  }

  source_ranges = [
    "0.0.0.0/0"
  ]

  target_tags   = ["nginx-server"]
}

# Create static IP for nginx instance
resource "google_compute_address" "nginx_static_ip" {
  name         = "nginx-static-ip"
  region       = var.region
}