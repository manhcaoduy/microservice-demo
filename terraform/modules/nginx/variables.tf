variable "vpc_id" {
  type = string
}

variable "subnet_id" {
  type = string
}

variable "static_ip" {
  type = string
}

variable "region" {
  type = string
}

variable "zone" {
  type = string
}

variable "nginx_server" {
  type = object({
    name = string
    machine_type = string
    boot_disk_image = string
    upstream_ip = object({
      external = string
    })
    ssh = object({
      user = string
      public_key_file_path = string
    })
  })
}