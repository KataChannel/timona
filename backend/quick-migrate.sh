#!/bin/bash

# ==============================================================================
# QUICK START: Migration từ Website Cũ
# ==============================================================================
# 
# Script này chuyển đổi:
# - 21 danh mục (danhmuc.json)
# - 780 sản phẩm (sanpham.json)
#
# Từ: backend/database-export/2025-11-05T08-24-56-131Z/
# Sang: Prisma database hiện tại
#
# ==============================================================================

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                    DATA MIGRATION TOOL                        ║"
echo "║              Chuyển đổi dữ liệu Website Cũ                    ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Run from backend directory${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Có 3 cách chạy migration:${NC}"
echo ""
echo "  1. Tự động (Khuyên dùng) - ./run-migration.sh"
echo "  2. Thủ công - bun run migrate:old-data"
echo "  3. Từng bước - Xem MIGRATION_README.md"
echo ""

read -p "Chọn cách chạy (1/2/3): " choice

case $choice in
    1)
        echo ""
        echo -e "${GREEN}→ Chạy migration tự động...${NC}"
        ./run-migration.sh
        ;;
    2)
        echo ""
        echo -e "${YELLOW}→ Chạy migration thủ công...${NC}"
        echo ""
        bun run migrate:old-data
        echo ""
        echo -e "${BLUE}→ Kiểm tra kết quả...${NC}"
        bun run verify:migration
        ;;
    3)
        echo ""
        echo -e "${BLUE}→ Mở hướng dẫn...${NC}"
        cat MIGRATION_README.md
        ;;
    *)
        echo ""
        echo -e "${RED}❌ Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}✅ Done!${NC}"
echo ""
echo "Next steps:"
echo "  - Review: bun run db:studio"
echo "  - Docs: cat MIGRATION_README.md"
echo ""
