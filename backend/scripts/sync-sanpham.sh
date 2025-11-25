#!/bin/bash

# ========================================
# SanPhamHoaDon Sync Helper Script
# ========================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="backend/scripts"
SCRIPT_NAME="updatesanpham.js"

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║    SanPhamHoaDon Sync Helper                  ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo ""

# Check if script exists
if [ ! -f "$SCRIPT_DIR/$SCRIPT_NAME" ]; then
    echo -e "${RED}❌ Error: Script not found at $SCRIPT_DIR/$SCRIPT_NAME${NC}"
    exit 1
fi

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Error: Node.js is not installed${NC}"
    exit 1
fi

# Show menu
echo -e "${GREEN}Select an option:${NC}"
echo ""
echo "  1) 🔍 Dry Run (Preview changes)"
echo "  2) ▶️  Run Full Sync"
echo "  3) 🧪 Test with 10 records"
echo "  4) 📊 Test with 100 records"
echo "  5) 📈 Test with 1000 records"
echo "  6) 🔄 Custom limit"
echo "  7) 📖 View README"
echo "  8) ❌ Exit"
echo ""

read -p "Enter your choice [1-8]: " choice

case $choice in
    1)
        echo -e "\n${YELLOW}🔍 Running DRY RUN (no changes will be made)...${NC}\n"
        node "$SCRIPT_DIR/$SCRIPT_NAME" --dry-run
        ;;
    2)
        echo -e "\n${YELLOW}⚠️  WARNING: This will sync ALL records!${NC}"
        read -p "Are you sure? (yes/no): " confirm
        if [ "$confirm" == "yes" ]; then
            echo -e "\n${GREEN}▶️  Running FULL SYNC...${NC}\n"
            node "$SCRIPT_DIR/$SCRIPT_NAME"
        else
            echo -e "${RED}Cancelled.${NC}"
            exit 0
        fi
        ;;
    3)
        echo -e "\n${GREEN}🧪 Running with 10 records...${NC}\n"
        node "$SCRIPT_DIR/$SCRIPT_NAME" --limit=10
        ;;
    4)
        echo -e "\n${GREEN}📊 Running with 100 records...${NC}\n"
        node "$SCRIPT_DIR/$SCRIPT_NAME" --limit=100
        ;;
    5)
        echo -e "\n${GREEN}📈 Running with 1000 records...${NC}\n"
        node "$SCRIPT_DIR/$SCRIPT_NAME" --limit=1000
        ;;
    6)
        read -p "Enter custom limit: " custom_limit
        if [[ "$custom_limit" =~ ^[0-9]+$ ]]; then
            echo -e "\n${GREEN}🔄 Running with $custom_limit records...${NC}\n"
            node "$SCRIPT_DIR/$SCRIPT_NAME" --limit=$custom_limit
        else
            echo -e "${RED}❌ Invalid number${NC}"
            exit 1
        fi
        ;;
    7)
        if [ -f "$SCRIPT_DIR/UPDATESANPHAM_README.md" ]; then
            less "$SCRIPT_DIR/UPDATESANPHAM_README.md"
        else
            echo -e "${RED}❌ README not found${NC}"
        fi
        ;;
    8)
        echo -e "${BLUE}👋 Goodbye!${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}❌ Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}✅ Done!${NC}"
