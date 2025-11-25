#!/bin/bash

# ============================================
# Database Health Check Script
# ============================================
# Checks database structure, record counts, and backup status

set -e

echo "🏥 Rausach Database Health Check"
echo "=================================="
echo ""

cd "$(dirname "$0")"

# Run the health check TypeScript script
bun run compare-schema-db.ts

echo ""
echo "📦 Latest Backup Status:"
echo "------------------------"

LATEST_BACKUP=$(ls -td backups/rausach/*/ 2>/dev/null | head -1)

if [ -n "$LATEST_BACKUP" ]; then
    BACKUP_NAME=$(basename "$LATEST_BACKUP")
    FILE_COUNT=$(ls -1 "$LATEST_BACKUP"*.json 2>/dev/null | wc -l)
    BACKUP_SIZE=$(du -sh "$LATEST_BACKUP" 2>/dev/null | cut -f1)
    
    echo "✅ Latest backup: $BACKUP_NAME"
    echo "   Files: $FILE_COUNT"
    echo "   Size: $BACKUP_SIZE"
    
    if [ -f "${LATEST_BACKUP}BACKUP_SUMMARY.md" ]; then
        echo "   Summary: Available"
    fi
else
    echo "⚠️  No backups found"
fi

echo ""
echo "=================================="
echo "✅ Health check complete!"
