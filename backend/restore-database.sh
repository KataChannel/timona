#!/bin/bash

# ============================================
# Database Restore Script
# ============================================
# This script restores database from JSON backup files

set -e

echo "🔄 Starting database restore..."
echo "================================"
echo ""
echo "⚠️  WARNING: This will replace all current data!"
echo "Press Ctrl+C to cancel, or Enter to continue..."
read

# Change to backend directory
cd "$(dirname "$0")"

# Run the restore script with bun
echo "📥 Running restore with bun..."
bun run prisma/restore.ts

echo ""
echo "✅ Restore completed!"
echo "================================"
