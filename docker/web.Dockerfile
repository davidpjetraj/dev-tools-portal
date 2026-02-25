# ── Stage 1: Build ────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace manifests & lockfile for layer caching
COPY package.json yarn.lock ./
COPY apps/web/package.json ./apps/web/

# Install all workspace dependencies
RUN yarn install --frozen-lockfile

# Copy web source
COPY apps/web ./apps/web

# Build Vite production bundle
RUN yarn workspace @dev-tools-portal/web build

# ── Stage 2: Production (nginx) ───────────────────────────────────
FROM nginx:1.27-alpine AS production

# Copy built assets from builder
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

# Custom nginx config for SPA routing (all paths → index.html)
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
