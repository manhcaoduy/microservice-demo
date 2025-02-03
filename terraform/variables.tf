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

variable "github_ssh_url" {
  type    = string
}

variable "github_ssh_private_key" {
  type    = string
}

variable "argocd_application_name" {
  type    = string
}

