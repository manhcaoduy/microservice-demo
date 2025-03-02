provider "google" {
  project     = var.project_id
  region      = var.region
  credentials = file("${path.module}/credentials.json")
}

module "cloudbuild" {
  source = "./modules/cloudbuild"

  project_id = var.project_id
  bff_cloudbuild = {
    name = "bff-cloudbuild"
    github = {
      owner  = "manhcaoduy"
      name   = "microservice-demo"
      branch = "^main$"
    }
    included_files = ["app/**"]
    filename       = "terraform/cloudbuilds/bff-cloudbuild.yaml"
  }
}

module "postgres" {
  source = "./modules/postgres"

  vpc_id = module.vpc.vpc_ip
  region = var.region
  postgres = {
    database = {
      name     = "microservice-demo"
      user     = "admin"
      password = "admin"
    }
    name    = "postgres"
    version = "POSTGRES_14"
    tier    = "db-f1-micro"
  }
}

module "nginx" {
  source = "./modules/nginx"

  vpc_id = module.vpc.vpc_ip
  subnet_id = module.vpc.subnet_id
  static_ip = module.vpc.nginx_public_ip

  zone = var.zone
  nginx_server = {
    name            = "nginx-server"
    machine_type    = "e2-medium"
    boot_disk_image = "ubuntu-os-cloud/ubuntu-2204-lts"
    upstream_ip = {
      external = module.k8s-services.ingress_nginx_external_ip
    }
    ssh = {
      user                 = "manh"
      public_key_file_path = "~/.ssh/manhcaoduy.pub"
    }
  }
}

module "vpn" {
  source = "./modules/vpn"

  vpc_id = module.vpc.vpc_ip
  subnet_id = module.vpc.subnet_id
  subnet_ip_cidr_range = module.vpc.subnet_ip_cidr_range
  static_ip = module.vpc.vpn_server_ip
  postgres_private_ip_address_range = module.vpc.private_ip_address_range

  zone = var.zone
  vpn_server = {
    name            = "vpn-server"
    user            = "manh"
    machine_type    = "e2-medium"
    boot_disk_image = "ubuntu-os-cloud/ubuntu-2204-lts"
    ssh = {
      public_key_file_path  = "~/.ssh/manhcaoduy.pub"
      private_key_file_path = "~/.ssh/manhcaoduy"
    }
    openas = {
      username = "manh"
      password = "manh"
    }
  }
}

module "vpc" {
  source = "./modules/vpc"

  region = var.region
  vpc = {
    name = "main-vpc"
  }
  subnet = {
    name                       = "main-subnet"
    ip_cidr_range             = "10.0.0.0/16"
    pod_ranges_name           = "pod-ranges"
    pod_ranges_ip_cidr_range  = "192.168.0.0/18"
    service_ranges_name       = "service-ranges"
    service_ranges_ip_cidr_range = "192.168.64.0/18"
  }
}

module "gke" {
  source = "./modules/gke"

  vpc_id = module.vpc.vpc_ip
  subnet_id = module.vpc.subnet_id

  pod_ranges_name = module.vpc.pod_ranges_name
  service_ranges_name = module.vpc.service_ranges_name

  region = var.region
  gke = {
    name          = "main-gke"
    machine_type  = "e2-medium"
    disk_size_gb  = 20
  }
  gke_primary_node_pool = {
    name          = "main-gke-primary-node-pool"
    machine_type  = "e2-medium"
    disk_size_gb  = 20
  }
}

module "k8s-services" {
  source = "./modules/k8s-services"

  kubeconfig_path = "./kubeconfig"

  argocd = {
    name = "microservice-demo"
    repo = {
      ssh_url              = "git@github.com:manhcaoduy/microservice-demo.git"
      ssh_private_key_path = "~/.ssh/manhcaoduy"
      target_revision      = "main"
      path                 = "helm-charts"
    }
  }
}
