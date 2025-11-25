#!/bin/bash

# Script to apply Prisma migration for BLOG_CAROUSEL block type
echo "🔄 Applying Prisma migration for BLOG_CAROUSEL, SEARCH, and BOOKMARK block types..."

cd backend

# Generate migration
echo "📝 Generating migration..."
bunx prisma migrate dev --name add_blog_carousel_search_bookmark_block_types --create-only

echo ""
echo "✅ Migration created! Please review it before applying."
echo ""
echo "To apply the migration, run:"
echo "  cd backend && bunx prisma migrate dev"
echo ""
echo "Or apply with this script:"
echo "  cd backend && bunx prisma migrate deploy"
