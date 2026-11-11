# ==============================================================================
# Multi-Stage Dockerfile for Apuni Sarkar (VaaniSetu)
# Deployable to Railway, Render, Koyeb, Cloud Run, AWS ECS, or Fly.io
# ==============================================================================

FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# Install dependencies
FROM base AS deps
COPY package*.json ./
RUN npm ci

# Build the client SPA
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build:client

# Production Runner
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=5000

# Create persistent storage directories
RUN mkdir -p /app/server/data/audio_cache

COPY package*.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server

EXPOSE 5000

CMD ["npx", "tsx", "server/src/index.ts"]
