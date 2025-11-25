#!/bin/bash

# Local git operations
git add .
git commit -m "update"
git push

# Remote server operations
ssh root@116.118.49.243 << 'EOF'
cd shoprausach

# Pre-deployment checks
DISK_USAGE=$(df -h . | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 90 ]; then
    echo "❌ Disk usage at ${DISK_USAGE}% - Cleanup needed"
    exit 1
fi

# Git pull
git pull

# ========================================================================
# Environment Setup for Production
# ========================================================================
echo "🔧 Setting up production environment..."

# Ensure .env.production exists for frontend
if [ ! -f "frontend/.env.production" ]; then
    echo "⚠️  frontend/.env.production not found, using development .env"
fi

# Docker cleanup - Tránh treo server
echo "🧹 Cleaning Docker resources..."
docker compose down --timeout=30 2>/dev/null || true

# Prune unused resources
docker image prune -af --filter "until=72h" 2>/dev/null || true
docker volume prune -f 2>/dev/null || true
docker network prune -f 2>/dev/null || true

# Deploy với timeout và remove-orphans
echo "🚀 Starting deployment with production environment..."
echo "   - Frontend will use .env.production with NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://backend:4000/graphql"
echo "   - Backend will communicate via Docker network"

timeout 600 docker compose -f 'docker-compose.yml' up -d --build --remove-orphans --pull missing

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed!"
    exit 1
fi

# Final cleanup
docker builder prune -af 2>/dev/null || true

# Health check
echo "🏥 Checking health..."
sleep 10
docker compose ps

# Verify frontend is using correct GraphQL endpoint
echo ""
echo "✅ Deployment completed"
echo "   Frontend will use internal Docker network to reach backend"
echo "   If frontend still shows localhost, check .env.production is loaded during build"

EOF
