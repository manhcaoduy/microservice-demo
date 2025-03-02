variable "region" {
  type = string
}

variable "vpc" {
  type = object({
    name = string
  })
}

variable "subnet" {
  type = object({
    name = string
    ip_cidr_range = string
    pod_ranges_name = string
    pod_ranges_ip_cidr_range = string
    service_ranges_name = string
    service_ranges_ip_cidr_range = string
  })
}