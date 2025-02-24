
terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.17.0"  # Adjust to the latest stable version
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.20.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.9.0"
    }
  }
}