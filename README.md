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

Move into terraform folder

```
cd terraform
```

Setup your variables in `terraform.tfvars`

Comment out the whole file `gke_after_credentials.tf`

```
terraform plan && terraform apply -auto-approve
```

Get GKE cluster credentials

```
gcloud container clusters get-credentials {{CLUSTER_NAME}} --region {{REGION}} --project {{GCP_ID}}
```

And the uncomment the previous file and start again

```
terraform plan && terraform apply -auto-approve
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