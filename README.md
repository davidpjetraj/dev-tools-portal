# Dev Tools Portal

Internal portal for developer links, with:
- Vue 3 web app (`apps/web`)
- NestJS GraphQL API (`apps/api`)
- MongoDB for persistence

## Documentation

- Code architecture: [`docs/codebase.md`](docs/codebase.md)
- Deployment configuration: [`docs/deployment.md`](docs/deployment.md)
- Kubernetes quick guide: [`deploy/k8s/README.md`](deploy/k8s/README.md)

## Quick Start (Local Development)

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
- GraphQL: `http://localhost:3000/graphql` (Vite proxy to API)
- Health: `http://localhost:8080/v1/health`

Login credentials: email:"admin@gmail.com", password:'admin123'

## Quick Start (Docker Compose)

```bash
cp .env.development .env
docker compose up --build
```

Open:
- Web: `http://localhost:3000`
- GraphQL: `http://localhost:8080/graphql`
- Health: `http://localhost:8080/v1/health`

## Common Commands

- `yarn dev:api` - run API in watch mode
- `yarn dev:web` - run web app in Vite dev mode
- `yarn lint` - run API and web lint checks
- `yarn build` - build API and web
- `yarn render:build:api` - Render build command
- `yarn render:start:api` - Render start command

## Security Notes

- Do not commit real secrets in `.env`, Kubernetes Secrets, or workflow secrets.
- Rotate default admin and JWT credentials before any shared or production environment.

## License

MIT
