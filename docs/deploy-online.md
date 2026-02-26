# Deploy Online (Production)

This guide shows how to deploy the portal publicly using either:
1. **Docker Compose on a VPS** (fastest), or
2. **Kubernetes** (scalable).

## Option A — Docker Compose on a VPS

### 1) Provision server
- Ubuntu 22.04+ VM (2 vCPU / 4 GB RAM recommended)
- Open inbound ports: `80`, `443`
- Install Docker + Compose plugin

```bash
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-plugin
sudo usermod -aG docker $USER
```

Re-login after adding your user to the `docker` group.

### 2) Clone and configure

```bash
git clone <your-public-repo-url>
cd dev-tools-portal
cp .env.example .env
```

Edit `.env` for production:
- Set strong `JWT_SECRET`
- Set non-default `ADMIN_USERNAME` / `ADMIN_PASSWORD`
- Set `CORS_ORIGIN` to your real HTTPS domain

### 3) Start services

```bash
docker compose up -d --build
```

Check health:

```bash
docker compose ps
curl http://localhost:8080/health
```

### 4) Add HTTPS + domain
Use a reverse proxy (e.g. Caddy, Traefik, or nginx + certbot) in front of the `web` container.

Recommended routing:
- `https://your-domain.com/` -> `web:80`
- `https://your-domain.com/graphql` -> `api:8080/graphql`
- `https://your-domain.com/health` -> `api:8080/health`

> Important: after TLS/domain setup, make sure `CORS_ORIGIN` matches your final public URL.

---

## Option B — Kubernetes

Use manifests in `deploy/k8s/`.

### 1) Build/push images

```bash
docker build -f docker/api.Dockerfile -t ghcr.io/<org>/dev-tools-portal/api:latest .
docker build -f docker/web.Dockerfile -t ghcr.io/<org>/dev-tools-portal/web:latest .
docker push ghcr.io/<org>/dev-tools-portal/api:latest
docker push ghcr.io/<org>/dev-tools-portal/web:latest
```

### 2) Configure manifests
- Update image names/tags in `deploy/k8s/api.yaml` and `deploy/k8s/web.yaml`
- Create real secrets (do not use `secrets.example.yaml` values in production)

### 3) Apply resources

```bash
kubectl apply -f deploy/k8s/namespace.yaml
kubectl apply -f deploy/k8s/configmap.yaml
kubectl apply -f deploy/k8s/mongo.yaml
kubectl apply -f deploy/k8s/api.yaml
kubectl apply -f deploy/k8s/web.yaml
kubectl apply -f deploy/k8s/ingress.yaml
```

### 4) Verify

```bash
kubectl get pods,svc,ingress -n dev-tools-portal
kubectl logs deploy/dev-tools-api -n dev-tools-portal
```

---

## Production checklist
- [ ] No real secrets committed to git
- [ ] JWT/admin credentials changed from defaults
- [ ] HTTPS enabled
- [ ] Backups for MongoDB configured
- [ ] Health checks monitored (`/health`)
