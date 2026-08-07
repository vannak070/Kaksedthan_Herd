# =======================================================
# Production Multi-Stage Dockerfile for Livestock Management System
# =======================================================

# Stage 1: Base & Dependencies
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat curl

# Stage 2: Dependencies
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# Stage 3: Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_OPTIONS "--max-old-space-size=4096"
RUN npm run build

# Stage 4: Production Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create non-root system user for security best practices
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy static assets and built standalone application
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/.env.example ./.env

RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000
EXPOSE 5001

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5001/health || curl -f http://localhost:3000/ || exit 1

CMD ["npm", "run", "start:all"]
