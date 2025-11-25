#!/bin/bash
# Build script for dual-domain frontend deployment
# This builds frontend twice with different environment variables

set -e

echo "🏗️  Building Frontend for Dual-Domain Deployment"
echo "=================================================="

# Auto-detect project path
if [ -d "/chikiet/kataoffical/shoprausach/frontend" ]; then
    PROJECT_PATH="/chikiet/kataoffical/shoprausach"
    echo "📂 Detected path: /chikiet/kataoffical/shoprausach"
elif [ -d "/mnt/chikiet/kataoffical/shoprausach/frontend" ]; then
    PROJECT_PATH="/mnt/chikiet/kataoffical/shoprausach"
    echo "📂 Detected path: /mnt/chikiet/kataoffical/shoprausach"
else
    echo "❌ Error: Cannot find project directory!"
    exit 1
fi

cd "$PROJECT_PATH/frontend"

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .next

# Build 1: Rausach Domain (port 12001)
echo ""
echo "📦 Building for RAUSACH domain (backend: 12001)..."
if [ ! -f ".env.rausach" ]; then
    echo "❌ Error: .env.rausach not found!"
    exit 1
fi
cp .env.rausach .env.production.local

echo "🔨 Running Next.js build (this may take a few minutes)..."
echo "⚠️  If build fails with SIGBUS error, try:"
echo "   1. Reinstall dependencies: bun install"
echo "   2. Clear all caches: rm -rf .next node_modules/.cache"
echo ""

# Try with Node directly to avoid bun issues with Next.js 16
if command -v node &> /dev/null; then
    NODE_ENV=production node node_modules/.bin/next build || true
    # Check if build succeeded by verifying .next directory exists
    if [ ! -d ".next" ]; then
        echo "❌ Error: Rausach build failed - no .next directory created!"
        echo "💡 Try running: cd frontend && bun install && rm -rf .next"
        exit 1
    fi
else
    bun run build || true
    if [ ! -d ".next" ]; then
        echo "❌ Error: Rausach build failed - no .next directory created!"
        exit 1
    fi
fi
echo "✅ Rausach build completed"

# Backup Rausach build
echo "💾 Backing up Rausach build..."
rm -rf .next-rausach
cp -r .next .next-rausach

# Build 2: Tazagroup Domain (port 13001)
echo ""
echo "📦 Building for TAZAGROUP domain (backend: 13001)..."
rm -rf .next
if [ ! -f ".env.tazagroup" ]; then
    echo "❌ Error: .env.tazagroup not found!"
    exit 1
fi
cp .env.tazagroup .env.production.local
echo "🔨 Running Next.js build (this may take a few minutes)..."

# Try with Node directly to avoid bun issues with Next.js 16
if command -v node &> /dev/null; then
    NODE_ENV=production node node_modules/.bin/next build || true
    # Check if build succeeded by verifying .next directory exists
    if [ ! -d ".next" ]; then
        echo "❌ Error: Tazagroup build failed - no .next directory created!"
        echo "💡 Try running: cd frontend && bun install && rm -rf .next"
        exit 1
    fi
else
    bun run build || true
    if [ ! -d ".next" ]; then
        echo "❌ Error: Tazagroup build failed - no .next directory created!"
        exit 1
    fi
fi
echo "✅ Tazagroup build completed"

# Backup Tazagroup build
echo "💾 Backing up Tazagroup build..."
rm -rf .next-tazagroup
cp -r .next .next-tazagroup

# Restore default .next (Tazagroup) for docker-compose
echo "🔄 Restoring default build (Tazagroup)..."
# Already in .next, no need to copy

echo ""
echo "✅ Dual-domain build completed!"
echo ""
echo "📁 Build artifacts:"
echo "   .next-rausach/    → Rausach build (12001)"
echo "   .next-tazagroup/  → Tazagroup build (13001)"
echo "   .next/            → Default (Tazagroup)"
echo ""
echo "🐳 Now run: ./deploy.sh"
