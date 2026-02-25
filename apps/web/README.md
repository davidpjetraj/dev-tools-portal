Web — Developer Tools Portal
=================================

Vue 3 frontend served as a static SPA via nginx in production.

## Features

- **Landing page** — responsive card grid, grouped by category, with filter pills
- **Admin login** — JWT-based authentication
- **Admin dashboard** — full CRUD for links (create, edit, delete)

## Development

```bash
# From repo root
yarn dev:web
# Opens at http://localhost:3000
# /graphql requests are proxied to the API at http://localhost:8080
```

## Build

```bash
yarn build:web
# Output in apps/web/dist/
```
