# ============================================================================
# OPTIMIZED Frontend Dockerfile - Copy pre-built files only
# Build locally: cd frontend && bun run build
# Then: docker compose build frontend --no-cache
#
# Benefits:
#   • ~80% smaller image (only runtime files, no dependencies)
#   • ~5x faster build time (no installation in Docker)
#   • Production ready with minimal dependencies
# ============================================================================

FROM node:22-alpine AS runtime

# Install minimal runtime dependencies
RUN apk add --no-cache curl dumb-init && \
    rm -rf /var/cache/apk/* && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs --ingroup nodejs

WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy pre-built application files from local build
# These files must be built locally before Docker build:
#   $ cd frontend && bun run build
#
# Expected local paths:
#   - frontend/.next/standalone/     (compiled app)
#   - frontend/.next/static/         (static assets)
#   - frontend/public/               (public files)
#   - frontend/node_modules/         (dependencies)

# IMPORTANT: .next/standalone IS the complete app that was built
# It contains: frontend/ subfolder + node_modules + package.json at root
# We copy everything from .next/standalone root directly to container root

# Copy entire .next/standalone as /app root (already contains everything)
# .next/standalone includes: frontend/ + node_modules/ + package.json + server.js
# No need to copy node_modules separately - standalone build has optimized production deps
COPY --chown=nextjs:nodejs frontend/.next/standalone/ ./

# Copy static files to the correct location (frontend/.next/static/)
# Server runs from /app/frontend/, so it looks for static files at /app/frontend/.next/static/
COPY --chown=nextjs:nodejs frontend/.next/static/ ./frontend/.next/static/

# Copy public assets (frontend/public)
COPY --chown=nextjs:nodejs frontend/public/ ./frontend/public/

# Switch to non-root user for security
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Start the application
# .next/standalone was built with server.js at: frontend/server.js
# After COPY to root, it's at: /app/frontend/server.js
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "frontend/server.js"]
