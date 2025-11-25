#!/bin/bash

##############################################
# Update ten2 Helper Script
# Interactive menu for running updateten2.js
##############################################

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT="$SCRIPT_DIR/updateten2.js"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Header
clear
echo -e "${CYAN}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                                                       ║${NC}"
echo -e "${CYAN}║         Update ten2 - Product Normalization          ║${NC}"
echo -e "${CYAN}║            Fuzzy Matching with pg_trgm               ║${NC}"
echo -e "${CYAN}║                                                       ║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════════════╝${NC}"
echo ""

# Check if updateten2.js exists
if [ ! -f "$SCRIPT" ]; then
    echo -e "${RED}❌ Error: updateten2.js not found at $SCRIPT${NC}"
    exit 1
fi

# Menu function
show_menu() {
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}Select an option:${NC}"
    echo ""
    echo -e "  ${YELLOW}1)${NC} 🔍 Dry Run - Preview (10 products)"
    echo -e "  ${YELLOW}2)${NC} 🔍 Dry Run - Preview (100 products)"
    echo -e "  ${YELLOW}3)${NC} ✍️  Update - Small test (10 products)"
    echo -e "  ${YELLOW}4)${NC} ✍️  Update - Medium test (100 products)"
    echo -e "  ${YELLOW}5)${NC} ✍️  Update - Large test (1000 products)"
    echo -e "  ${YELLOW}6)${NC} ✅ Update - ALL products"
    echo -e "  ${YELLOW}7)${NC} 🔄 Force Update - Re-normalize ALL"
    echo -e "  ${YELLOW}8)${NC} ⚙️  Custom - Enter your own options"
    echo -e "  ${YELLOW}9)${NC} 📊 Check current status (SQL query)"
    echo -e "  ${YELLOW}10)${NC} 📚 View README"
    echo -e "  ${YELLOW}0)${NC} 🚪 Exit"
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo -n "Enter choice: "
}

# Status check function
check_status() {
    echo -e "\n${CYAN}📊 Current Status:${NC}\n"
    
    # Use environment variable or default connection
    DB_URL=${DATABASE_URL:-"postgresql://postgres:postgres@localhost:15432/rausachcore"}
    
    echo "Total products with ten:"
    node -e "
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    (async () => {
      const total = await prisma.ext_sanphamhoadon.count({ where: { ten: { not: null } } });
      const normalized = await prisma.ext_sanphamhoadon.count({ where: { ten2: { not: null } } });
      const pending = total - normalized;
      console.log('  Total: ' + total);
      console.log('  Normalized (ten2 set): ' + normalized);
      console.log('  Pending: ' + pending);
      console.log('');
      console.log('Top 10 product groups:');
      const groups = await prisma.ext_sanphamhoadon.groupBy({
        by: ['ten2'],
        where: { ten2: { not: null } },
        _count: { id: true },
      });
      const sorted = groups.sort((a, b) => b._count.id - a._count.id).slice(0, 10);
      sorted.forEach((g, i) => {
        console.log('  ' + (i+1) + '. \"' + g.ten2 + '\" (' + g._count.id + ' products)');
      });
      await prisma.\$disconnect();
    })();
    "
    
    echo ""
    read -p "Press Enter to continue..."
}

# Main loop
while true; do
    show_menu
    read choice
    
    case $choice in
        1)
            echo -e "\n${CYAN}🔍 Running Dry Run (10 products)...${NC}\n"
            node "$SCRIPT" --dry-run --limit=10
            ;;
        2)
            echo -e "\n${CYAN}🔍 Running Dry Run (100 products)...${NC}\n"
            node "$SCRIPT" --dry-run --limit=100
            ;;
        3)
            echo -e "\n${YELLOW}⚠️  This will update 10 products${NC}"
            read -p "Continue? (y/n): " confirm
            if [ "$confirm" = "y" ]; then
                echo -e "\n${CYAN}✍️  Updating 10 products...${NC}\n"
                node "$SCRIPT" --limit=10
            else
                echo "Cancelled."
            fi
            ;;
        4)
            echo -e "\n${YELLOW}⚠️  This will update 100 products${NC}"
            read -p "Continue? (y/n): " confirm
            if [ "$confirm" = "y" ]; then
                echo -e "\n${CYAN}✍️  Updating 100 products...${NC}\n"
                node "$SCRIPT" --limit=100
            else
                echo "Cancelled."
            fi
            ;;
        5)
            echo -e "\n${YELLOW}⚠️  This will update 1000 products${NC}"
            read -p "Continue? (y/n): " confirm
            if [ "$confirm" = "y" ]; then
                echo -e "\n${CYAN}✍️  Updating 1000 products...${NC}\n"
                node "$SCRIPT" --limit=1000
            else
                echo "Cancelled."
            fi
            ;;
        6)
            echo -e "\n${RED}⚠️  WARNING: This will update ALL products!${NC}"
            read -p "Are you sure? (type 'yes' to confirm): " confirm
            if [ "$confirm" = "yes" ]; then
                echo -e "\n${CYAN}✍️  Updating ALL products...${NC}\n"
                node "$SCRIPT"
            else
                echo "Cancelled."
            fi
            ;;
        7)
            echo -e "\n${RED}⚠️  WARNING: This will RE-NORMALIZE ALL products (force mode)!${NC}"
            read -p "Are you sure? (type 'yes' to confirm): " confirm
            if [ "$confirm" = "yes" ]; then
                echo -e "\n${CYAN}🔄 Force updating ALL products...${NC}\n"
                node "$SCRIPT" --force
            else
                echo "Cancelled."
            fi
            ;;
        8)
            echo -e "\n${CYAN}⚙️  Custom Options${NC}"
            echo -e "Available flags: --dry-run, --limit=N, --threshold=0.6, --force"
            echo -e "Example: --dry-run --limit=50 --threshold=0.7"
            echo ""
            read -p "Enter options: " options
            echo -e "\n${CYAN}Running with options: $options${NC}\n"
            node "$SCRIPT" $options
            ;;
        9)
            check_status
            continue
            ;;
        10)
            echo -e "\n${CYAN}📚 README${NC}\n"
            if [ -f "$SCRIPT_DIR/../PRODUCT_FUZZY_MATCHING_QUICK_REF.md" ]; then
                cat "$SCRIPT_DIR/../PRODUCT_FUZZY_MATCHING_QUICK_REF.md" | less
            else
                echo "README not found"
            fi
            continue
            ;;
        0)
            echo -e "\n${GREEN}👋 Goodbye!${NC}\n"
            exit 0
            ;;
        *)
            echo -e "\n${RED}❌ Invalid option${NC}\n"
            sleep 2
            ;;
    esac
    
    echo ""
    read -p "Press Enter to continue..."
    clear
    
    # Show header again
    echo -e "${CYAN}╔═══════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                                                       ║${NC}"
    echo -e "${CYAN}║         Update ten2 - Product Normalization          ║${NC}"
    echo -e "${CYAN}║            Fuzzy Matching with pg_trgm               ║${NC}"
    echo -e "${CYAN}║                                                       ║${NC}"
    echo -e "${CYAN}╚═══════════════════════════════════════════════════╝${NC}"
    echo ""
done
