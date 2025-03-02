variable "region" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "postgres" {
  type = object({
    name = string
    version = string
    tier = string
    database = object({
      name = string
      user = string
      password = string
    })
  })
}