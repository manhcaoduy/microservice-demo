
variable "vpc_id" {
  type = string
  description = "The ID of the VPC"
}

variable "domain" {
  type = string
  description = "The domain name for ArgoCD"
}

variable "argocd_nginx_private_ip" {
  type = string
  description = "Private IP address of the ArgoCD nginx ingress controller"
}