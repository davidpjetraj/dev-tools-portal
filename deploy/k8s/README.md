# Kubernetes Deployment (docker-desktop, production-like)

This folder contains production-oriented Kubernetes manifests for:
- `api` (NestJS GraphQL API)
- `web` (Vue static site via nginx)
- `Ingress` + TLS for `david-pjetraj.shop`

`mongo.yaml` remains available for local-only experiments, but production should use a managed MongoDB service.

Container images are sourced from GitHub Container Registry (GHCR):
- `ghcr.io/davidpjetraj/dev-tools-portal/api`
- `ghcr.io/davidpjetraj/dev-tools-portal/web`

For this setup, keep GHCR packages public. If you make them private, add an `imagePullSecret` to the namespace and both deployments.

## Files
- `namespace.yaml` - namespace used by all resources
- `configmap.yaml` - non-sensitive runtime configuration
- `secrets.example.yaml` - template for sensitive values
- `cluster-issuer.yaml` - Let's Encrypt ClusterIssuer for cert-manager
- `api.yaml` - API deployment + service
- `web.yaml` - Web deployment + service
- `ingress.yaml` - ingress routes (`/` to web, `/graphql` and `/v1/health` to api)
- `mongo.yaml` - optional local MongoDB deployment (not for production)

## Prerequisites
1. Kubernetes context points to `docker-desktop`:
```bash
kubectl config current-context
```

2. Install ingress-nginx:
```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml
```

3. Install cert-manager:
```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/latest/download/cert-manager.yaml
```

4. Networking and DNS:
- Forward router TCP ports `80` and `443` to this machine.
- Allow inbound `80/443` in Windows firewall.
- Point `A` record for `david-pjetraj.shop` to your public static IP.

## Create Runtime Secret
Create production secret from real values (do not apply `secrets.example.yaml` directly):
```bash
kubectl create namespace dev-tools-portal --dry-run=client -o yaml | kubectl apply -f -
kubectl -n dev-tools-portal create secret generic dev-tools-secrets \
  --from-literal=MONGODB_URI='mongodb+srv://...' \
  --from-literal=JWT_SECRET='replace-with-strong-secret' \
  --from-literal=ADMIN_USERNAME='admin' \
  --from-literal=ADMIN_PASSWORD='replace-with-strong-password' \
  --dry-run=client -o yaml | kubectl apply -f -
```

## Apply Manifests
```bash
kubectl apply -f deploy/k8s/namespace.yaml
kubectl apply -f deploy/k8s/configmap.yaml
kubectl apply -f deploy/k8s/cluster-issuer.yaml
kubectl apply -f deploy/k8s/api.yaml
kubectl apply -f deploy/k8s/web.yaml
kubectl apply -f deploy/k8s/ingress.yaml
```

## Verify
```bash
kubectl get pods -n dev-tools-portal
kubectl get svc -n dev-tools-portal
kubectl get ingress -n dev-tools-portal
kubectl get certificate -n dev-tools-portal
```

Application checks:
```bash
curl -I https://david-pjetraj.shop
curl https://david-pjetraj.shop/v1/health
```
