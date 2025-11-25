#!/bin/bash

# ============================================================================
# Timona Cleanup Script
# Remove old build artifacts and temporary files
# ============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         Timona Project Cleanup                         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to show size before deletion
show_size() {
    local path=$1
    if [ -d "$path" ] || [ -f "$path" ]; then
        du -sh "$path" 2>/dev/null || echo "0"
    else
        echo "Not found"
    fi
}

# Cleanup frontend build artifacts
echo -e "${YELLOW}Cleaning frontend build artifacts...${NC}"
cd frontend 2>/dev/null || true

echo -e "  • .next directory: $(show_size .next)"
rm -rf .next

echo -e "  • .next-rausach: $(show_size .next-rausach)"
rm -rf .next-rausach

echo -e "  • .next-tazagroup: $(show_size .next-tazagroup)"
rm -rf .next-tazagroup

echo -e "  • node_modules: $(show_size node_modules)"
# Uncomment to remove: rm -rf node_modules

cd ..

# Cleanup backend build artifacts
echo ""
echo -e "${YELLOW}Cleaning backend build artifacts...${NC}"
cd backend 2>/dev/null || true

echo -e "  • dist directory: $(show_size dist)"
rm -rf dist

echo -e "  • node_modules: $(show_size node_modules)"
# Uncomment to remove: rm -rf node_modules

cd ..

# Cleanup root
echo ""
echo -e "${YELLOW}Cleaning root directory...${NC}"

echo -e "  • node_modules: $(show_size node_modules)"
# Uncomment to remove: rm -rf node_modules

echo -e "  • bun.lockb: $(show_size bun.lockb)"
# Uncomment to remove: rm -f bun.lockb

# Cleanup Docker
echo ""
echo -e "${YELLOW}Docker cleanup options:${NC}"
echo -e "  Run these manually if needed:"
echo -e "  • docker system prune -af     # Remove all unused data"
echo -e "  • docker volume prune -f      # Remove unused volumes"
echo -e "  • docker builder prune -af    # Remove build cache"

# Show disk usage
echo ""
echo -e "${BLUE}Current disk usage:${NC}"
df -h . | tail -1

echo ""
echo -e "${GREEN}✓ Cleanup complete!${NC}"
echo ""
echo -e "${YELLOW}To reinstall dependencies:${NC}"
echo -e "  bun install"
echo -e "  cd frontend && bun install"
echo -e "  cd backend && bun install"
