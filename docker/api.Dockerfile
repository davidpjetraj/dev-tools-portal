# ── Stage 1: Build ────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace manifests & lockfile for better layer caching
COPY package.json yarn.lock ./
COPY apps/api/package.json ./apps/api/

# Install all workspace dependencies
RUN yarn install --frozen-lockfile

# Copy API source
COPY apps/api ./apps/api

# Compile TypeScript
RUN yarn workspace @dev-tools-portal/api build

# ── Stage 2: Production ───────────────────────────────────────────
FROM node:20-alpine AS production

ENV NODE_ENV=production
WORKDIR /app

# Copy workspace manifests & lockfile
COPY package.json yarn.lock ./
COPY apps/api/package.json ./apps/api/

# Install only production dependencies
RUN yarn install --frozen-lockfile --production

# Copy compiled output from builder stage
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# Create src directory and ensure node user has write permissions
RUN mkdir -p /app/src && chown -R node:node /app

EXPOSE 8080

# Run as non-root user for security
USER node

CMD ["node", "apps/api/dist/main.js"]
