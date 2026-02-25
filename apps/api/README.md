API — Developer Tools Portal
=================================

GraphQL API serving the Dev Tools Portal. Built with **Node.js**, **TypeScript**, **Apollo Server 4**, **Express**, and **MongoDB** (Mongoose).

## Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /graphql` | Main GraphQL endpoint |
| `GET /health` | Health-check (returns `{ status: "ok" }`) |

## Environment Variables

See [`.env.example`](../../.env.example) at the repository root.

## Development

```bash
# from repo root
npm run dev:api
```

## Available GraphQL Operations

### Queries
- `links(category: String)` — get all links (optional filter)
- `link(id: ID!)` — get single link
- `categories` — list all distinct categories

### Mutations (public)
- `login(username, password)` — returns JWT token

### Mutations (auth required — pass `Authorization: Bearer <token>`)
- `createLink(input)` — create link
- `updateLink(id, input)` — update link
- `deleteLink(id)` — delete link
