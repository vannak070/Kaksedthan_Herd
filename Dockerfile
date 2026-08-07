# =======================================================
# Ultra-Fast Production Dockerfile for Livestock Management System
# =======================================================
FROM node:20-alpine
WORKDIR /app

RUN apk add --no-cache libc6-compat curl

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code & build Next.js app
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm run build

EXPOSE 3000
EXPOSE 5001

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5001/health || curl -f http://localhost:3000/ || exit 1

CMD ["npm", "start"]
