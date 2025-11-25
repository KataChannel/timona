#!/bin/bash

# ============================================
# Database Backup Script
# ============================================
# This script backs up all database tables to JSON files

set -e

echo "🚀 Starting database backup..."
echo "================================"

# Change to backend directory
cd "$(dirname "$0")"

# Run the backup script with bun
echo "📦 Running backup with bun..."
bun run prisma/backup.ts

echo ""
echo "✅ Backup completed successfully!"
echo "================================"
echo ""
echo "📁 Backup files are stored in: ./kata_json/"
echo "💡 To restore, run: ./restore-database.sh"
