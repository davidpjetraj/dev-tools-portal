# Codebase Documentation

## Repository Layout

```text
.
|- apps/
|  |- api/            # NestJS GraphQL API
|  `- web/            # Vue 3 SPA
|- deploy/
|  `- k8s/            # Kubernetes manifests
|- docker/            # Dockerfiles + nginx config
|- .github/workflows/ # CI/CD pipelines
|- docker-compose.yml # Local multi-service stack
|- render.yaml        # Render API blueprint
`- vercel.json        # Vercel rewrites for frontend deployment
```

## Runtime Stack

- API: NestJS 10, Apollo GraphQL, Mongoose, JWT, Swagger, Terminus.
- Web: Vue 3, Vite, Vue Router, Pinia, Apollo Client.
- Data store: MongoDB.
- Storage: S3-compatible object storage via AWS SDK (optional for uploads).

## API Architecture (`apps/api`)

### Entry and bootstrap

- `src/main.ts`
  - Creates Nest app and applies global validation.
  - Enables CORS from `CORS_ORIGIN`.
  - Adds security middleware (`helmet`) and request IP extraction.
  - Exposes root status endpoint `/`.
  - Sets global prefix `v1`.
  - Protects Swagger with basic auth (`/v1/api`, `/v1/api-json`).

### Root module

- `src/app.module.ts`
  - Registers GraphQL module (`GqlConfigService`).
  - Registers throttling guard globally.
  - Loads feature modules:
    - `AuthModule`
    - `LinkModule`
    - `FilesModule`
    - `StorageModule`
    - `HealthModule`
    - `DatabaseModule`
    - `JwtModule`

### Configuration

- `src/config.ts`
  - Loads `.env` plus `.env.<NODE_ENV>`.
  - Validates configuration with `zod`.
  - Exposes typed `config` object used across the API.

### Feature modules

- Auth (`src/auth`)
  - GraphQL mutations: `signIn`, `refreshToken`, `logout`.
  - Seeds first admin user when database has no users.
  - Uses JWT access/refresh tokens and session records.

- Link (`src/link`)
  - GraphQL queries: `links`, `link`, `categories`.
  - GraphQL mutations (auth required): `createLink`, `updateLink`, `deleteLink`.
  - Stores links in MongoDB with category and order sorting.

- Files + Storage (`src/files`, `src/storage`)
  - REST uploads under `/v1/files/*`.
  - Validates file types and size limits.
  - Uploads objects to S3-compatible storage.

- Health (`src/health`)
  - `GET /v1/health` using Terminus + Mongo ping check.

### Auth and guards

- GraphQL auth decorator: `@Auth()`.
- REST auth decorator: `@AuthRest()`.
- JWT strategy checks `Authorization: Bearer <token>`.

## Web Architecture (`apps/web`)

### Entry and app wiring

- `src/main.ts`
  - Creates Vue app.
  - Registers Pinia and Vue Router.
  - Provides Apollo client globally.

### Routing and auth

- `src/router/index.ts`
  - Public routes: `/`, `/admin/login`.
  - Protected route: `/admin` (requires auth).
  - Global guard redirects unauthenticated users to login.

- `src/stores/auth.ts`
  - Stores JWT in local storage (`auth_token`).
  - Runs login GraphQL mutation.
  - Clears auth state and Apollo cache on logout.

### API communication

- `src/apollo/client.ts`
  - GraphQL endpoint is relative `/graphql`.
  - Adds `Authorization` header from local storage token.

- `src/graphql/queries.ts`, `src/graphql/mutations.ts`
  - All GraphQL operations used by the UI.

- `src/components/ImageUpload.vue`
  - Uploads files to `/v1/files/upload-files` (or custom endpoint).
  - Sends bearer token for authenticated upload endpoints.

### Main views

- `src/views/LandingPage.vue`: public tool links page with category filters.
- `src/views/AdminLogin.vue`: admin login form.
- `src/views/AdminDashboard.vue`: create/update/delete link management UI.

## Environment Variables

Primary API variables (from `apps/api/src/config.ts`):

- `NODE_ENV`
- `PORT`
- `CORS_ORIGIN` (comma-separated values supported)
- `MONGODB_URI`
- `JWT_SECRET`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ACCESS_TOKEN_EXPIRES_IN`
- `REFRESH_TOKEN_EXPIRES_IN`
- `SWAGGER_USER`
- `SWAGGER_PASSWORD`
- `APP_NAME`
- `STORAGE_ENDPOINT`
- `STORAGE_KEY`
- `STORAGE_SECRET`
- `PUBLIC_BUCKET`
- `CDN_ENDPOINT`
- `STORAGE_REGION`

## Development Scripts

From repository root:

- `yarn dev:api`
- `yarn dev:web`
- `yarn lint`
- `yarn build`
