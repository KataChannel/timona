#!/bin/sh

# Entrypoint script for NestJS backend with Prisma migrations
# Uses Bun.js for faster execution

set -e

echo "🚀 Starting backend entrypoint..."

# Wait for Redis to be ready
echo "⏳ Waiting for Redis to be ready..."
REDIS_HOST=${DOCKER_REDIS_HOST:-redis}
REDIS_PORT=${DOCKER_REDIS_PORT:-6379}
REDIS_READY=0

for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15; do
  echo "Redis connection attempt $i/15..."
  if nc -z "$REDIS_HOST" "$REDIS_PORT" 2>/dev/null; then
    echo "✅ Redis is ready!"
    REDIS_READY=1
    break
  fi
  sleep 2
done

if [ "$REDIS_READY" -eq 0 ]; then
  echo "⚠️  Redis not responding, but continuing (will retry on demand)..."
fi

# Wait for Minio to be ready
echo "⏳ Waiting for Minio to be ready..."
MINIO_HOST=${DOCKER_MINIO_ENDPOINT:-minio}
MINIO_PORT=${DOCKER_MINIO_PORT:-9000}
MINIO_READY=0

for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15; do
  echo "Minio connection attempt $i/15..."
  if nc -z "$MINIO_HOST" "$MINIO_PORT" 2>/dev/null; then
    echo "✅ Minio is ready!"
    MINIO_READY=1
    break
  fi
  sleep 2
done

if [ "$MINIO_READY" -eq 0 ]; then
  echo "⚠️  Minio not responding, but continuing (will retry on demand)..."
fi

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
DB_HOST=$(echo $DATABASE_URL | sed 's/.*@\(.*\):.*/\1/')
DB_PORT=$(echo $DATABASE_URL | sed 's/.*:\([0-9]*\)\/.*/\1/')

for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15; do
  echo "Database connection attempt $i/15..."
  if nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null; then
    echo "✅ Database is ready!"
    break
  fi
  sleep 2
done

# Run Prisma migrations only if ENABLE_MIGRATIONS=true
if [ "$ENABLE_MIGRATIONS" = "true" ]; then
  echo "🔄 Running Prisma migrations..."
  ./node_modules/.bin/prisma migrate deploy 2>/dev/null || echo "⚠️  Migrations already applied or contain errors, continuing..."
else
  echo "ℹ️  Skipping migrations (set ENABLE_MIGRATIONS=true to enable)"
fi

# NOTE: Prisma client is already generated during Docker build
# Generating at runtime causes OOM with 256MB memory limit
# If you need to regenerate, do it manually or increase memory limits

echo "✅ Backend setup complete!"

# Execute the main command
exec "$@"
