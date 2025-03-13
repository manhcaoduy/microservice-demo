
variable "vpc_id" {
  type = string
  description = "The ID of the VPC"
}

variable "postgres_domain" {
  type = string
  description = "The domain name for Postgres"
}

variable "postgres_private_ip" {
  type = string
  description = "Private IP address of the Postgres"
}

variable "redis_domain" {
  type = string
  description = "The domain name for Redis"
}

variable "redis_private_ip" {
  type = string
  description = "Private IP address of the Redis"
}
