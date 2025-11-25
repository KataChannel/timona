#!/bin/bash

# ============================================================================
# Production Deployment Script
# Deploy Hybrid Multi-Domain Architecture to 116.118.49.243
# ============================================================================

set -e

# Auto-detect project path
if [ -d "/chikiet/kataoffical/shoprausach" ]; then
    PROJECT_PATH="/chikiet/kataoffical/shoprausach"
    echo "📂 Detected path: /chikiet/kataoffical/shoprausach"
elif [ -d "/mnt/chikiet/kataoffical/shoprausach" ]; then
    PROJECT_PATH="/mnt/chikiet/kataoffical/shoprausach"
    echo "📂 Detected path: /mnt/chikiet/kataoffical/shoprausach"
else
    echo "❌ Error: Cannot find project directory!"
    exit 1
fi

cd "$PROJECT_PATH"

SERVER="root@116.118.49.243"
REMOTE_DIR="/root/shoprausach"
COMPOSE_FILE="docker-compose.hybrid.yml"

echo "🚀 Hybrid Multi-Domain Deployment"
echo "=================================="
echo "Server: $SERVER"
echo "Mode: 2 Domains (Rausach + Tazagroup)"
echo ""

# Check prerequisites
if [ ! -f "$COMPOSE_FILE" ]; then
    echo "❌ Error: $COMPOSE_FILE not found!"
    exit 1
fi

if [ ! -f ".env.rausach" ] || [ ! -f ".env.tazagroup" ]; then
    echo "❌ Error: Environment files not found!"
    exit 1
fi

# Check for .env.production (secrets)
if [ -f ".env.production" ]; then
    echo "🔐 Found .env.production (secrets will be synced)"
    HAS_SECRETS=true
else
    echo "⚠️  No .env.production found (will use server's existing secrets)"
    echo "   To deploy with new secrets, run: ./create-env-production.sh"
    HAS_SECRETS=false
fi

# Step 0: Build backend locally
echo "🔨 Step 0: Building backend..."
if [ ! -d "$PROJECT_PATH/backend/dist" ]; then
    echo "  → Backend not built, building now..."
    cd "$PROJECT_PATH/backend"
    if [ ! -d "node_modules" ]; then
        echo "  → Installing backend dependencies..."
        bun install
    fi
    echo "  → Compiling TypeScript..."
    bun run build
    cd "$PROJECT_PATH"
    echo "  ✅ Backend built successfully"
else
    echo "  ✅ Backend already built (backend/dist exists)"
fi

echo ""
echo "📤 Step 1: Syncing files to server..."

# Create proper directory structure on server
ssh ${SERVER} "mkdir -p ${REMOTE_DIR}/backend ${REMOTE_DIR}/frontend ${REMOTE_DIR}/docker"

# Sync backend
rsync -avz --delete \
    --exclude 'node_modules' \
    --exclude '.git' \
    backend/dist \
    backend/prisma \
    backend/package.json \
    backend/Dockerfile \
    backend/entrypoint.sh \
    ${SERVER}:${REMOTE_DIR}/backend/

# Sync frontend - IMPORTANT: Must include node_modules from .next-*/standalone/
rsync -avz --delete \
    --exclude '.git' \
    frontend/.next-rausach \
    frontend/.next-tazagroup \
    frontend/public \
    frontend/package.json \
    frontend/Dockerfile.rausach \
    frontend/Dockerfile.tazagroup \
    ${SERVER}:${REMOTE_DIR}/frontend/

# Sync docker configs
rsync -avz docker/ ${SERVER}:${REMOTE_DIR}/docker/

# Sync compose and env files
rsync -avz \
    $COMPOSE_FILE \
    .env.rausach \
    .env.tazagroup \
    ${SERVER}:${REMOTE_DIR}/

# Sync .env.production if exists (secrets)
if [ "$HAS_SECRETS" = true ]; then
    echo "🔐 Syncing secrets (.env.production)..."
    rsync -avz .env.production ${SERVER}:${REMOTE_DIR}/
    
    # Set secure permissions on server
    ssh ${SERVER} "chmod 600 ${REMOTE_DIR}/.env.production"
    echo "  ✅ Secrets synced and secured (chmod 600)"
fi

echo ""
echo "🔨 Step 2: Building and deploying containers..."

ssh ${SERVER} << 'ENDSSH'
    cd /root/shoprausach
    
    # Load secrets if .env.production exists
    if [ -f ".env.production" ]; then
        echo "🔐 Loading secrets from .env.production..."
        set -a
        source .env.production
        set +a
        echo "  ✅ Secrets loaded"
    fi
    
    # Stop existing containers
    echo "  → Stopping existing containers..."
    docker compose -f docker-compose.hybrid.yml down 2>/dev/null || true
    
    # Build images
    echo "  → Building Docker images..."
    docker compose -f docker-compose.hybrid.yml build --no-cache
    
    # Start services
    echo "  → Starting services..."
    docker compose -f docker-compose.hybrid.yml up -d
    
    # Wait for services
    echo "  → Waiting for services to be ready..."
    sleep 30
    
    # Verify secrets in container
    if [ -f ".env.production" ]; then
        echo ""
        echo "🔍 Verifying secrets in containers..."
        if docker exec shopbackend env | grep -q "GOOGLE_GEMINI_API_KEY"; then
            echo "  ✅ GOOGLE_GEMINI_API_KEY loaded in shopbackend"
        else
            echo "  ⚠️  GOOGLE_GEMINI_API_KEY not found in shopbackend"
        fi
    fi
    
    # Show status
    echo ""
    echo "📊 Container Status:"
    docker compose -f docker-compose.hybrid.yml ps
    
    echo ""
    echo "💾 Resource Usage:"
    free -h | grep -E "Mem:|Swap:"
    df -h / | grep -E "/dev"
ENDSSH

echo ""
echo "🏥 Step 3: Health checks..."
sleep 5

echo "  → Testing Rausach Frontend (12000)..."
if curl -sf -o /dev/null http://116.118.49.243:12000; then
    echo "    ✅ Rausach Frontend OK"
else
    echo "    ❌ Rausach Frontend FAIL"
fi

echo "  → Testing Rausach Backend (12001)..."
if curl -sf http://116.118.49.243:12001/graphql -H "Content-Type: application/json" -d '{"query":"{__typename}"}' | grep -q "Query"; then
    echo "    ✅ Rausach Backend OK"
else
    echo "    ❌ Rausach Backend FAIL"
fi

echo "  → Testing Tazagroup Frontend (13000)..."
if curl -sf -o /dev/null http://116.118.49.243:13000; then
    echo "    ✅ Tazagroup Frontend OK"
else
    echo "    ❌ Tazagroup Frontend FAIL"
fi

echo "  → Testing Tazagroup Backend (13001)..."
if curl -sf http://116.118.49.243:13001/graphql -H "Content-Type: application/json" -d '{"query":"{__typename}"}' | grep -q "Query"; then
    echo "    ✅ Tazagroup Backend OK"
else
    echo "    ❌ Tazagroup Backend FAIL"
fi

echo ""
echo "✅ Deployment completed!"
echo ""
echo "🌐 Access URLs:"
echo "   Rausach Frontend:    http://116.118.49.243:12000"
echo "   Rausach Backend:     http://116.118.49.243:12001/graphql"
echo "   Tazagroup Frontend:  http://116.118.49.243:13000"
echo "   Tazagroup Backend:   http://116.118.49.243:13001/graphql"
echo ""
echo "📊 Monitoring:"
echo "   ssh root@116.118.49.243 'docker compose -f docker-compose.hybrid.yml ps'"
echo "   ssh root@116.118.49.243 'docker compose -f docker-compose.hybrid.yml logs -f shopbackend'"
echo ""
