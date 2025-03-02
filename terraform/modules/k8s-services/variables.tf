variable "kubeconfig_path" {
  type    = string
}

variable "argocd" {
  type = object({
    name = string
    repo = object({
      ssh_url = string
      ssh_private_key_path = string
      target_revision = string
      path = string
    })
  })
}