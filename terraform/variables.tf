variable "project_id" {
  type        = string
  description = "GCP Project"
}

variable "region" {
  type    = string
  default = "asia-northeast1"
}

variable "zone" {
  type    = string
  default = "asia-northeast1-a"
}

variable "cluster_name" {
  type    = string
  default = "my-gke-cluster"
}

variable "pods_range_name" {
  type    = string
  default = "manhcao-pods-range"
}

variable "services_range_name" {
  type    = string
  default = "manhcao-services-range"
}