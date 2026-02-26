# Dev Tools Portal

A small portal for internal developer links.
It has a Vue frontend, a NestJS GraphQL API, and MongoDB.

## Quick Start (Docker Compose)

Use this if you want to run the stack quickly.

```bash
git clone <your-repo-url>
cd dev-tools-portal

cp .env.development .env
docker compose up --build
```

Open:
- Web: `http://localhost:3000`
- GraphQL: `http://localhost:8080/graphql`
- Health: `http://localhost:8080/v1/health`

Note:
- The web app uses relative `/graphql` in production-style setups.
- For easiest local UI + API flow, use the Local Development mode below.

## Local Development (without Docker)

```bash
cp .env.development .env
yarn install

# terminal 1
yarn dev:api

# terminal 2
yarn dev:web
```

Open:
- Web: `http://localhost:3000`
- Admin login: `http://localhost:3000/admin/login`
- GraphQL: `http://localhost:3000/graphql` (proxied by Vite)
- Health: `http://localhost:8080/v1/health`

## Key URLs

Local:
- `http://localhost:3000/`
- `http://localhost:3000/admin/login`
- `http://localhost:8080/graphql`
- `http://localhost:8080/v1/health`

Production-style target:
- `https://www.david-pjetraj.shop//`
- `https://www.david-pjetraj.shop//graphql`
- `https://www.david-pjetraj.shop//v1/health`

## Environment Variables

Set values in `.env`.

| Variable | Purpose |
|---|---|
| `NODE_ENV` | App mode (`development` or `production`) |
| `PORT` | API port (default `8080`) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | JWT signing key |
| `ADMIN_USERNAME` | Admin username |
| `ADMIN_PASSWORD` | Admin password |
| `CORS_ORIGIN` | Allowed web origin(s) |

Security:
- Do not commit real secrets.
- Rotate all default credentials before real deployment.

## Build and Publish

CI workflow: `.github/workflows/ci.yml`
- Runs lint + build on PRs and pushes.
- On `main`, builds and pushes images to GHCR:
  - `ghcr.io/davidpjetraj/dev-tools-portal/api`
  - `ghcr.io/davidpjetraj/dev-tools-portal/web`

CD workflow: `.github/workflows/cd.yml`
- Runs on self-hosted runner.
- Applies manifests and deploys commit SHA image tags.

## Kubernetes Deployment

See `deploy/k8s/README.md` for full instructions.

## Render Deployment (API)

This repo includes a Render Blueprint at `render.yaml`.

If you deploy with the blueprint, Render will use:
- Build: `yarn render:build:api`
- Start: `yarn render:start:api`

If you configure a web service manually:
- Root Directory: repository root (`.`)
- Build Command: `yarn render:build:api`
- Start Command: `yarn render:start:api`

If your Render Root Directory is `apps/api` instead:
- Build Command: `yarn render:build`
- Start Command: `yarn render:start`

## Troubleshooting

- 405 on `/graphql`:
  - The request is hitting web nginx instead of API routing.
  - Check ingress rules and `/graphql` path mapping.
- API not reachable from web in local mode:
  - Use `yarn dev:web` so Vite proxy forwards `/graphql` to `:8080`.
- `ImagePullBackOff` in Kubernetes:
  - Confirm GHCR package exists and is public.
- Certificate not issued:
  - Confirm cert-manager is installed and DNS points to your public IP.
- `ClusterIssuer` kind not found:
  - Install cert-manager CRDs before applying `cluster-issuer.yaml`.

## License

MIT
