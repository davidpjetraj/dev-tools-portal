# Web

Frontend for Dev Tools Portal.
Stack: Vue 3, Vite, Apollo Client, Pinia, Vue Router.

## Run Locally

From repository root:

```bash
yarn dev:web
```

Default web URL: `http://localhost:3000`

## Build

From repository root:

```bash
yarn build:web
```

Build output: `apps/web/dist`

## API Connection

- In production-style routing, the app calls relative path `/graphql`.
- In local development, Vite proxy forwards `/graphql` to `http://localhost:8080`.

## Routes

- `/` - landing page
- `/admin/login` - admin login
- `/admin` - admin dashboard (auth required)

## Troubleshooting

- API calls fail in local dev:
  - Make sure API is running on `http://localhost:8080`.
- 405 on `/graphql`:
  - Request is hitting static nginx instead of API route.
  - Check proxy or ingress routing.
- Admin route redirects to login:
  - Token is missing or expired.
