# ⚡ Dev Tools Portal

> An internal developer portal that gives your team quick access to all the tools needed to build, ship, and operate your SaaS application. Administrators can manage links via a full CRUD admin dashboard; users see a beautiful, filterable landing page.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vue 3, TypeScript, Vite, Apollo Client, Pinia, Vue Router |
| Backend | Node.js 20, TypeScript, Apollo Server 4, Express |
| Database | MongoDB 7 + Mongoose |
| Auth | JWT (admin credentials via environment variables) |
| Container | Docker (multi-stage), Docker Compose |
| CI/CD | GitHub Actions → GitHub Container Registry |

---

## Project Structure

```
dev-tools-portal/
├── apps/
│   ├── api/           # GraphQL API (Node.js + TypeScript + Apollo)
│   └── web/           # Frontend (Vue 3 + Vite)
├── docker/
│   ├── api.Dockerfile
│   ├── web.Dockerfile
│   └── nginx.conf
├── .github/
│   └── workflows/
│       └── ci.yml     # CI pipeline (lint → build → Docker push)
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Quick Start (Docker Compose)

This is the easiest way to run the full stack locally.

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose)

### Steps

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd dev-tools-portal

# 2. Copy and configure environment variables
copy .env.example .env
# Edit .env — at minimum set JWT_SECRET, ADMIN_USERNAME, ADMIN_PASSWORD

# 3. Start all services
docker compose up --build

# 4. Open the app
#    Landing page:  http://localhost:3000
#    Admin login:   http://localhost:3000/admin/login
#    GraphQL API:   http://localhost:8080/graphql
```

## Build OCI Images (API + Web)

Both applications already include multi-stage Dockerfiles, so you can package them as OCI-compatible images:

```bash
# API image
docker build -f docker/api.Dockerfile -t dev-tools-portal-api:latest .

# Web image
docker build -f docker/web.Dockerfile -t dev-tools-portal-web:latest .
```

Run them directly with Docker:

```bash
# Start MongoDB (required by API)
docker run -d --name dev-tools-mongo -p 27017:27017 mongo:7

# Run API
docker run --rm -p 8080:8080 \
  -e MONGODB_URI="mongodb://host.docker.internal:27017/dev-tools-portal" \
  -e JWT_SECRET="change-me" \
  -e ADMIN_USERNAME="admin" \
  -e ADMIN_PASSWORD="admin123" \
  -e CORS_ORIGIN="http://localhost:3000" \
  dev-tools-portal-api:latest

# Run Web
docker run --rm -p 3000:80 dev-tools-portal-web:latest
```

### Default Admin Credentials
Set in `.env` (see `.env.example`). Defaults for local dev:
- **Username**: `admin`
- **Password**: `admin123`

> ⚠️ Change these in production!

---

## Local Development (without Docker)

### Prerequisites
- Node.js ≥ 20
- Yarn ≥ 1.22
- MongoDB running locally (or use MongoDB Atlas)

```bash
# Install all dependencies
yarn install

# Start API dev server (hot-reload via tsx watch)
yarn dev:api

# Start Web dev server (Vite HMR)
yarn dev:web
```

Set `MONGODB_URI` in a local `.env` file inside `apps/api/` if you're not using the Docker MongoDB.

---

## API Documentation

See [`apps/api/README.md`](apps/api/README.md) for full GraphQL schema details.

### Key Endpoints

| Endpoint | Description |
|---|---|
| `POST /graphql` | GraphQL API |
| `GET /health` | Health check — returns `{ "status": "ok" }` |

### Example: Fetch all links

```graphql
query {
  links {
    id
    title
    url
    icon
    description
    category
  }
}
```

### Example: Admin login

```graphql
mutation {
  login(username: "admin", password: "admin123") {
    token
  }
}
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in values.

| Variable | Description | Default |
|---|---|---|
| `MONGODB_URI` | MongoDB connection string | `mongodb://mongo:27017/dev-tools-portal` |
| `JWT_SECRET` | Secret for signing JWTs | **(change this!)** |
| `ADMIN_USERNAME` | Admin login username | `admin` |
| `ADMIN_PASSWORD` | Admin login password | `admin123` |
| `PORT` | API port | `8080` |
| `CORS_ORIGIN` | Allowed CORS origins | `http://localhost:3000` |

---

## CI/CD Pipeline

GitHub Actions (`.github/workflows/ci.yml`):

1. **On every push/PR to `main`**: lint + TypeScript build + Vite build
2. **On merge to `main`**: build and push Docker images to GitHub Container Registry (GHCR)

Images are tagged with both `latest` and the commit SHA for traceability.

---

## Kubernetes Deployment

Docker images published to GHCR can be deployed to Kubernetes.

Ready-to-apply manifests are included in [`deploy/k8s`](deploy/k8s):

```bash
kubectl apply -f deploy/k8s/namespace.yaml
kubectl apply -f deploy/k8s/configmap.yaml
kubectl apply -f deploy/k8s/secrets.example.yaml
kubectl apply -f deploy/k8s/mongo.yaml
kubectl apply -f deploy/k8s/api.yaml
kubectl apply -f deploy/k8s/web.yaml
kubectl apply -f deploy/k8s/ingress.yaml
```

Then verify:

```bash
kubectl get pods,svc,ingress -n dev-tools-portal
```

> Update image references in `deploy/k8s/api.yaml` and `deploy/k8s/web.yaml` to match your registry/repository.

Minimal API deployment example:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: dev-tools-api
spec:
  replicas: 2
  selector:
    matchLabels: { app: dev-tools-api }
  template:
    metadata:
      labels: { app: dev-tools-api }
    spec:
      containers:
        - name: api
          image: ghcr.io/<your-org>/dev-tools-portal/api:latest
          ports:
            - containerPort: 8080
          env:
            - name: MONGODB_URI
              valueFrom:
                secretKeyRef: { name: dev-tools-secrets, key: mongodb-uri }
            - name: JWT_SECRET
              valueFrom:
                secretKeyRef: { name: dev-tools-secrets, key: jwt-secret }
```

---

## Security Notes

- JWTs expire after **8 hours** — users must re-login
- Admin credentials are stored as environment variables (never committed)
- All admin mutations require a valid JWT (`Authorization: Bearer <token>`)
- Docker images run as **non-root** (`USER node`)
- nginx serves the SPA with `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` headers

---

## License

MIT
