# ==============================================================================
# Production-Optimized Multi-Stage Dockerfile for Apuni Sarkar (VaaniSetu)
# - Minimal Alpine Linux base image
# - Layer-cached dependencies installation
# - Ahead-of-Time (AOT) Vite & TypeScript compilation
# - Lean runtime (dev dependencies stripped, ~120MB vs ~600MB)
# - Hardened security: Non-root unprivileged process execution (appuser:nodejs)
# - Native Docker healthcheck against /api/health
# ==============================================================================

# Stage 1: Base Alpine Environment
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# Stage 2: Dependencies Layer (Cached unless package*.json changes)
FROM base AS deps
COPY package*.json ./
RUN npm ci

# Stage 3: Ahead-of-Time (AOT) Compilation
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# 1. Compile React Vite SPA to /app/dist
# 2. Compile Server TypeScript to /app/server/dist
# 3. Synchronize catalog and data JSON files
RUN npm run build:client && \
    npm run build:server

# Stage 4: Production Dependencies Only (Stripping build tools & devDeps)
FROM base AS prod-deps
COPY package*.json ./
RUN npm ci --omit=dev

# Stage 5: Final Production Container (Ultra-Lightweight & Secure)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Security Hardening: Create unprivileged system user & group
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser && \
    mkdir -p /app/server/data/audio_cache && \
    chown -R appuser:nodejs /app

# Copy production artifacts with strict non-root ownership
COPY --from=prod-deps --chown=appuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:nodejs /app/package.json ./package.json
COPY --from=builder --chown=appuser:nodejs /app/dist ./dist
COPY --from=builder --chown=appuser:nodejs /app/server/dist ./server/dist
COPY --from=builder --chown=appuser:nodejs /app/server/src/data ./server/src/data
COPY --from=builder --chown=appuser:nodejs /app/server/dist/data ./server/data

# Drop root privileges
USER appuser

EXPOSE 5000

# Healthcheck to ensure orchestrators only route traffic to healthy instances
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# Start pre-compiled pure JavaScript server (instant startup, zero runtime TS compilation overhead)
CMD ["node", "server/dist/index.js"]
