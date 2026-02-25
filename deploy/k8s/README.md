# Kubernetes Deployment

This folder contains baseline Kubernetes manifests for the **api** and **web** services, plus MongoDB for self-contained deployments.

## Files

- `namespace.yaml` – namespace used by all resources
- `configmap.yaml` – non-sensitive runtime configuration
- `secrets.example.yaml` – template for sensitive values
- `mongo.yaml` – MongoDB deployment + service
- `api.yaml` – API deployment + service
- `web.yaml` – Web deployment + service
- `ingress.yaml` – ingress routes (`/` to web, `/graphql` and `/health` to api)

## Apply

```bash
kubectl apply -f deploy/k8s/namespace.yaml
kubectl apply -f deploy/k8s/configmap.yaml
kubectl apply -f deploy/k8s/secrets.example.yaml
kubectl apply -f deploy/k8s/mongo.yaml
kubectl apply -f deploy/k8s/api.yaml
kubectl apply -f deploy/k8s/web.yaml
kubectl apply -f deploy/k8s/ingress.yaml
```

> Replace image names in `api.yaml` and `web.yaml` (`ghcr.io/your-org/...`) with your registry paths before deploying.

## Verify

```bash
kubectl get pods -n dev-tools-portal
kubectl get svc -n dev-tools-portal
kubectl get ingress -n dev-tools-portal
```
