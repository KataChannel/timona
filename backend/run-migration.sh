#!/bin/bash

# Quick Migration Script
# Runs the complete migration process with verification

echo "🚀 Starting Migration Process..."
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Please run this script from the backend directory${NC}"
    exit 1
fi

# Check if data files exist
DATA_DIR="database-export/2025-11-05T08-24-56-131Z"
if [ ! -f "$DATA_DIR/danhmuc.json" ] || [ ! -f "$DATA_DIR/sanpham.json" ]; then
    echo -e "${RED}❌ Error: Data files not found in $DATA_DIR${NC}"
    echo "   Looking for:"
    echo "   - danhmuc.json"
    echo "   - sanpham.json"
    exit 1
fi

echo -e "${GREEN}✅ Data files found${NC}"
echo ""

# Show data statistics
CATEGORIES=$(cat "$DATA_DIR/danhmuc.json" | jq 'length')
PRODUCTS=$(cat "$DATA_DIR/sanpham.json" | jq 'length')

echo "📊 Data to migrate:"
echo "   Categories: $CATEGORIES"
echo "   Products: $PRODUCTS"
echo ""

# Ask for confirmation
read -p "Do you want to proceed with migration? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Migration cancelled."
    exit 0
fi

echo ""
echo -e "${YELLOW}⚙️  Step 1: Running migration...${NC}"
echo "=================================="
bun run migrate:old-data

if [ $? -ne 0 ]; then
    echo ""
    echo -e "${RED}❌ Migration failed!${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}⚙️  Step 2: Verifying migration...${NC}"
echo "=================================="
bun run verify:migration

if [ $? -ne 0 ]; then
    echo ""
    echo -e "${RED}❌ Verification failed!${NC}"
    exit 1
fi

echo ""
echo "=================================="
echo -e "${GREEN}✅ Migration completed successfully!${NC}"
echo "=================================="
echo ""
echo "Next steps:"
echo "  1. Review data in Prisma Studio: bun run db:studio"
echo "  2. Check your GraphQL API"
echo "  3. Test frontend display"
echo ""
