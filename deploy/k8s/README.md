# Kubernetes Deployment

This folder deploys the app to Kubernetes with:
- API (`api` service)
- Web (`web` service)
- Ingress + TLS for `david-pjetraj.shop`

Images are pulled from GHCR:
- `ghcr.io/davidpjetraj/dev-tools-portal/api`
- `ghcr.io/davidpjetraj/dev-tools-portal/web`

Use public GHCR packages for this setup.
If packages are private, you must create and use `imagePullSecrets`.

## Prerequisites

1. Kubernetes context is correct:

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

4. DNS and network:
- Point `david-pjetraj.shop` A record to your public IP.
- Forward router ports `80` and `443` to this host.
- Allow inbound `80` and `443` in firewall.

## Create Runtime Secret

Do not apply `secrets.example.yaml` directly in production.
Create the real secret once and re-apply when values change.

```bash
kubectl create namespace dev-tools-portal --dry-run=client -o yaml | kubectl apply -f -

kubectl -n dev-tools-portal create secret generic dev-tools-secrets \
  --from-literal=MONGODB_URI='mongodb+srv://<user>:<pass>@<host>/dev-tools-portal?retryWrites=true&w=majority&tls=true' \
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

## Verify Rollout

```bash
kubectl get pods -n dev-tools-portal
kubectl get svc -n dev-tools-portal
kubectl get ingress -n dev-tools-portal
kubectl get certificate -n dev-tools-portal
```

## Smoke Tests

```bash
curl -I https://david-pjetraj.shop
curl https://david-pjetraj.shop/v1/health
curl -H "Content-Type: application/json" \
  -d '{"query":"query { __typename }"}' \
  https://david-pjetraj.shop/graphql
```

## Common Issues

- `no matches for kind "ClusterIssuer"`:
  - cert-manager CRDs are not installed yet.
- `ImagePullBackOff`:
  - GHCR image path/tag is wrong, or package is private.
- 405 on `POST /graphql`:
  - Ingress is routing `/graphql` to web instead of API.
- Certificate stays pending:
  - DNS does not point to the ingress IP, or ports 80/443 are not reachable.
