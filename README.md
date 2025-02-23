# Intended Design

![Design](design.png)

# Development

Start a minikube cluster on your local machine 

Addon ingress into minikube

```
minikube addons enable ingress
```

```
skaffold dev
```

# Start the infrastructure

```
cd terraform
```

Comment out the `resource "kubernetes_manifest" "argocd_application"`

```
terraform plan && terraform apply -auto-approve
```

And the uncomment the previous resource type and start again

```
terraform plan && terraform apply -auto-approve
```

Get GKE cluster credentials

```
gcloud container clusters get-credentials {{CLUSTER_NAME}} --region {{REGION}} --project {{GCP_ID}}
```