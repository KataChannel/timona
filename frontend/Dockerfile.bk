# Optimized Dockerfile for Next.js Frontend
# This expects pre-built artifacts from local build
# Build locally: bun run build
# Then: docker compose build frontend --no-cache

FROM oven/bun:1-alpine AS production
WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy pre-built artifacts from local build
# Expected local paths (should exist before building):
# - frontend/.next/        (Next.js build output - REQUIRED)
# - frontend/node_modules/ (dependencies - REQUIRED)
# - frontend/public/       (static files)
# - frontend/package.json  (package definition)

COPY frontend/.next ./.next
COPY frontend/node_modules ./node_modules
COPY frontend/public ./public
COPY frontend/package.json ./package.json

# Change ownership of files to nextjs user
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

CMD ["bun", "start"]
