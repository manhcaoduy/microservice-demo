variable "region" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "redis" {
  type = object({
    name = string
    tier = string
    memory_size_gb = number
    redis_version = string
    display_name = string 
    password = string
  })
}