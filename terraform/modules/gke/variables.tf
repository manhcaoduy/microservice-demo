variable "vpc_id" {
  type = string
}

variable "subnet_id" {
  type = string
}

variable "pod_ranges_name" {
  type = string
}

variable "service_ranges_name" {
  type = string
}

variable "region" {
  type = string
}

variable "gke" {
  type = object({
    name = string
    machine_type = string
    disk_size_gb = number
  })
}

variable "gke_primary_node_pool" {
  type = object({
    name = string
    machine_type = string
    disk_size_gb = number
  })
}