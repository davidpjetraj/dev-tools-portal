# API

GraphQL API for Dev Tools Portal.
Stack: NestJS, Apollo GraphQL, Express, MongoDB.

## Run Locally

From repository root:

```bash
yarn dev:api
```

Default API port: `8080`.

## Required Environment Variables

Set these in root `.env`:

- `NODE_ENV`
- `PORT`
- `MONGODB_URI`
- `JWT_SECRET`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `CORS_ORIGIN`

## Endpoints

- `POST /graphql` - GraphQL endpoint
- `GET /v1/health` - health check
- `GET /v1/api` - Swagger UI (basic auth)

## Auth Model

- `signIn` mutation returns access token and refresh token.
- Send access token as:

```text
Authorization: Bearer <token>
```

- Mutations that manage links require a valid token.

## Core Operations

Queries:
- `links`
- `link`
- `categories`

Mutations:
- `signIn` (login)
- `refreshToken`
- `createLink`
- `updateLink`
- `deleteLink`
