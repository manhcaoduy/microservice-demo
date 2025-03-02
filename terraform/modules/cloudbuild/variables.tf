variable "project_id" {
  type = string
}

variable "bff_cloudbuild" {
  type = object({
    name = string
    github = object({
      owner = string
      name = string
      branch = string
    }) 
    included_files = list(string)
    filename = string
  })
}