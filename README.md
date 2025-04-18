# Intended Design

![Design](design.png)

### Development

Start a minikube cluster on your local machine 

Addon ingress into minikube

```
minikube addons enable ingress
```

```
skaffold dev
```

### Start the infrastructure

Setup domain for the Infra in Cloudflare 

Turn on GCP API along the way

Move into terraform folder

```
cd terraform
```

```
terraform plan --out=tfplan \
  -target=module.vpn \
  -target=module.vpc \
  -target=module.gke \
  -target=module.cloudbuild && terraform apply "tfplan"
```

```
terraform plan --out=tfplan \
  -target=module.postgres \
  -target=module.redis && terraform apply "tfplan"
```

Get GKE cluster credentials

```
gcloud container clusters get-credentials {{CLUSTER_NAME}} --region {{REGION}} --project {{GCP_ID}}
```

```
terraform plan --out=tfplan -target=module.k8s-services.helm_release.argocd && terraform apply "tfplan"
```

```
terraform plan --out=tfplan -target=module.k8s-services -target=module.nginx && terraform apply "tfplan"
```

```
terraform plan --out=tfplan -target=module.dns && terraform apply "tfplan"
```

### VPN

Get the VPN server IP

```
terraform output vpn_server_ip
```

Get the VPN admin password

```
scp -i {open_vpn_private_key_path} {vpn_user}@{vpn_server_ip}:~/init.log ./
```

Get the opvn file

```
scp -i {open_vpn_private_key_path} {vpn_user}@{vpn_server_ip}:~/user.ovpn ./
```

### Postgres

Make sure you VPNed first

Get the Postgres connection Url

```
terraform output -raw postgres_connection_url
```

### Redis

Make sure you VPNed first

Get the Redis connection Url

```
terraform output -raw redis_url
```