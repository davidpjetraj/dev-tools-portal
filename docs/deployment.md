# Deployment Configuration Documentation

## Overview

This repository supports multiple deployment targets:

- Local development with workspace scripts.
- Local container stack via `docker-compose.yml`.
- Kubernetes deployment via `deploy/k8s`.
- Render deployment for API via `render.yaml`.
- Vercel deployment for frontend with API rewrites via `vercel.json`.

## Deployment Files

| File | Purpose |
|---|---|
| `docker-compose.yml` | Full local stack: MongoDB + API + web container. |
| `docker/api.Dockerfile` | Multi-stage image build for NestJS API. |
| `docker/web.Dockerfile` | Multi-stage image build for Vue app served by nginx. |
| `docker/nginx.conf` | SPA routing and static cache headers for web container. |
| `deploy/k8s/*.yaml` | Namespace, app Deployments/Services, Ingress, ConfigMap, certificate issuer. |
| `render.yaml` | Render blueprint for API service only. |
| `vercel.json` | Rewrites `/graphql` and `/v1/*` to Render API host. |
| `.github/workflows/ci.yml` | Lint/build plus image push to GHCR on `main`. |
| `.github/workflows/cd.yml` | Applies Kubernetes manifests and deploys SHA-tagged images. |

## Local Development (no containers)

```bash
cp .env.development .env
yarn install
yarn dev:api
yarn dev:web
```

Behavior:
- Web runs on `http://localhost:3000`.
- API runs on `http://localhost:8080`.
- Vite proxies `/graphql` from web to API.

## Docker Compose Deployment

`docker-compose.yml` defines:

- `mongo`:
  - Image `mongo:7`
  - Port `27017`
  - Volume `mongo_data`

- `api`:
  - Built from `docker/api.Dockerfile`
  - Port `8080`
  - Depends on Mongo health
  - Runtime config from env values

- `web`:
  - Built from `docker/web.Dockerfile`
  - Port `3000` mapped to nginx `80`
  - Depends on API

Run:

```bash
cp .env.development .env
docker compose up --build
```

## Kubernetes Deployment

Manifests are in `deploy/k8s`:

- `namespace.yaml`: creates namespace `dev-tools-portal`.
- `configmap.yaml`: non-secret runtime settings (`NODE_ENV`, `PORT`, `CORS_ORIGIN`).
- `api.yaml`: API Deployment/Service with probes and secret-based env vars.
- `web.yaml`: web Deployment/Service.
- `ingress.yaml`: host/path routing and TLS reference.
- `cluster-issuer.yaml`: cert-manager ClusterIssuer for Let's Encrypt.
- `secrets.example.yaml`: example shape for runtime secret.
- `mongo.yaml`: optional in-cluster Mongo deployment (not used by default flow).

Typical apply sequence:

```bash
kubectl apply -f deploy/k8s/namespace.yaml
kubectl apply -f deploy/k8s/configmap.yaml
kubectl apply -f deploy/k8s/cluster-issuer.yaml
kubectl apply -f deploy/k8s/api.yaml
kubectl apply -f deploy/k8s/web.yaml
kubectl apply -f deploy/k8s/ingress.yaml
```

Secret creation (example):

```bash
kubectl -n dev-tools-portal create secret generic dev-tools-secrets \
  --from-literal=MONGODB_URI='<value>' \
  --from-literal=JWT_SECRET='<value>' \
  --from-literal=ADMIN_USERNAME='<value>' \
  --from-literal=ADMIN_PASSWORD='<value>' \
  --dry-run=client -o yaml | kubectl apply -f -
```

## CI/CD Pipeline

### CI (`.github/workflows/ci.yml`)

- Runs on pushes/PRs to `main`.
- Installs dependencies, runs lint and build for API and web.
- On `main` push, builds and pushes container images to GHCR:
  - `ghcr.io/<repo>/api:latest` and `:<sha>`
  - `ghcr.io/<repo>/web:latest` and `:<sha>`

### CD (`.github/workflows/cd.yml`)

- Triggered after successful CI workflow run on `main`.
- Runs on self-hosted runner.
- Applies Kubernetes manifests.
- Creates/updates Kubernetes secret from GitHub Actions secrets.
- Pins Deployment images to the commit SHA from CI.
- Waits for rollout and executes smoke tests.
- Attempts rollback on failure.

## Render + Vercel Deployment Pattern

### Render (API)

- Defined in `render.yaml`.
- Build command: `yarn render:build:api`
- Start command: `yarn render:start:api`
- Health path: `/v1/health`

### Vercel (web)

- `vercel.json` rewrites:
  - `/graphql` -> Render API `/graphql`
  - `/v1/:path*` -> Render API `/v1/:path*`

This lets the web app keep relative API paths while API runs on a separate host.

## Secrets and Configuration Guidance

- Store runtime secrets in:
  - `.env` for local development only.
  - Kubernetes Secrets for cluster deployment.
  - Render/Vercel environment variables for hosted deployment.
  - GitHub repository secrets for CI/CD automation.
- Do not commit real credentials in tracked files.

## Legacy or Auxiliary Files

- `compose.yaml`, `compose.debug.yaml`, and root `Dockerfile` are present but differ from the active monorepo container path (`docker-compose.yml`, `docker/api.Dockerfile`, `docker/web.Dockerfile`).
- Prefer the documented active path unless intentionally maintaining those legacy files.
