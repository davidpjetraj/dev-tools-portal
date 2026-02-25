# Requirements Coverage

This document maps the requested assignment requirements to the implementation in this repository.

## 1) Summary / Product Scope

Requirement: build a containerized Node.js app with an internal Developer Tools landing page where links are managed by admins and persisted in NoSQL.

How this repo satisfies it:
- **Containerized Node.js architecture**:
  - Backend: Node.js + NestJS GraphQL API (`apps/api`)
  - Frontend: Vue SPA served by nginx (`apps/web`)
  - OCI images: `docker/api.Dockerfile`, `docker/web.Dockerfile`
- **Landing page for internal tools**:
  - User-facing list of links in `apps/web/src/views/LandingPage.vue`
- **Links are not hardcoded**:
  - CRUD persistence with MongoDB via Mongoose schema in `apps/api/src/link/schemas/link.schema.ts`
- **Extensible link metadata**:
  - Link fields include `title`, `url`, `icon`, `description`, `category`, `order`

## 2) User Requirements

### User can view and navigate links
- Public query operations expose links (`links`, `link`, `categories`) via GraphQL resolver.
- Landing page displays cards and routes users to configured URLs.

### Administrator can authenticate and manage links
- Admin login mutation: `login(username, password)` issues JWT.
- Guarded mutations require authentication:
  - `createLink`
  - `updateLink`
  - `deleteLink`
- Admin UI provides management workflows in `AdminLogin.vue` and `AdminDashboard.vue`.

## 3) Technical Requirements

### Data stored in NoSQL
- MongoDB is used as the persistence layer (`mongo:7` in `docker-compose.yml`).

### OCI container + Docker/Kubernetes deployment
- Docker Compose for local full-stack run (`docker-compose.yml`).
- Dedicated API/Web Dockerfiles in `docker/`.
- Kubernetes manifests in `deploy/k8s/` including namespace, services, deployments, ingress, configmap, and secrets template.

### Code and deployment configuration documented
- Root setup/deployment docs: `README.md`
- API docs: `apps/api/README.md`
- Web docs: `apps/web/README.md`
- Kubernetes docs: `deploy/k8s/README.md`
- Environment variable template: `.env.example`

### Bonus: CI pipeline
- GitHub Actions workflow in `.github/workflows/ci.yml`:
  - lint + build on push/PR to `main`
  - docker image build/push on push to `main`


### Public source repository
- The project is structured to be publishable as a public repository with setup/deployment docs and safe templates (`.env.example`, `secrets.example.yaml`) rather than committed runtime secrets.

## 4) Coding Values Alignment

- **Robust and secure**:
  - JWT authentication and guarded admin operations.
  - Input validation using class-validator on GraphQL inputs.
  - Production container hardening patterns in Dockerfiles/nginx config.
- **Easy to understand and documented**:
  - Monorepo with clear split (`apps/api`, `apps/web`, `deploy/k8s`, `docker`).
  - Multiple README files and this requirements mapping.
- **Clear, consistent architecture**:
  - Frontend and backend separated cleanly.
  - GraphQL schema-driven API with dedicated modules (auth, link, files, health, storage).
