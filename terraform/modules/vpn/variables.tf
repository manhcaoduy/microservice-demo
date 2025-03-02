variable "vpc_id" {
  type = string
}

variable "subnet_id" {
  type = string
}

variable "subnet_ip_cidr_range" {
  type = string
}

variable "static_ip" {
  type = string
}

variable "postgres_private_ip_address_range" {
  type = string
}

variable "region" {
  type = string
}

variable "zone" {
  type = string
}

variable "vpn_server" {
  type = object({
    name = string
    user = string
    machine_type = string
    boot_disk_image = string
    ssh = object({
      public_key_file_path = string
      private_key_file_path = string
    })
    openas = object({
      username = string
      password = string
    })
  })
}
