#!/bin/bash

# rausachcore Database Restore Performance Benchmark
# This script helps you compare old vs optimized restore performance

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_ROOT="./kata_json"
RESULTS_FILE="${SCRIPT_DIR}/restore-benchmark-results.txt"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}rausachcore Database Restore Benchmark${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check if backup exists
if [ ! -d "$BACKUP_ROOT" ]; then
    echo -e "${RED}❌ Backup directory not found: $BACKUP_ROOT${NC}"
    echo -e "${YELLOW}⚠️  Create a backup first:${NC}"
    echo -e "   bun run db:backup"
    exit 1
fi

# Find latest backup
LATEST_BACKUP=$(ls -td $BACKUP_ROOT/*/ 2>/dev/null | head -1 | xargs basename)
if [ -z "$LATEST_BACKUP" ]; then
    echo -e "${RED}❌ No backup found in $BACKUP_ROOT${NC}"
    exit 1
fi

BACKUP_SIZE=$(du -sh "$BACKUP_ROOT/$LATEST_BACKUP" | cut -f1)
RECORD_COUNT=$(find "$BACKUP_ROOT/$LATEST_BACKUP" -name "*.json" -exec wc -l {} + | awk '{sum+=$1} END {print sum}')

echo -e "${GREEN}✅ Backup found: $LATEST_BACKUP${NC}"
echo -e "${GREEN}   Size: $BACKUP_SIZE${NC}"
echo -e "${GREEN}   Files: $(ls $BACKUP_ROOT/$LATEST_BACKUP/*.json | wc -l)${NC}"
echo -e "${GREEN}   Approx records: $RECORD_COUNT${NC}\n"

# Menu
echo -e "${YELLOW}Choose an option:${NC}"
echo "1) Run ORIGINAL restore script"
echo "2) Run OPTIMIZED restore script"
echo "3) Compare performance (run both)"
echo "4) View previous benchmark results"
echo "5) Exit"
echo ""
read -p "Enter choice (1-5): " choice

case $choice in
    1)
        echo -e "\n${BLUE}🚀 Running ORIGINAL restore script...${NC}\n"
        START_TIME=$(date +%s%N)
        bun run restore.ts || npm run db:restore
        END_TIME=$(date +%s%N)
        DURATION_MS=$(( (END_TIME - START_TIME) / 1000000 ))
        DURATION_S=$(echo "scale=2; $DURATION_MS / 1000" | bc)
        echo -e "\n${GREEN}✅ Original restore completed in: ${DURATION_S}s${NC}"
        
        # Save result
        echo "ORIGINAL Restore - Duration: ${DURATION_S}s - $(date)" >> "$RESULTS_FILE"
        ;;
        
    2)
        echo -e "\n${BLUE}🚀 Running OPTIMIZED restore script...${NC}\n"
        START_TIME=$(date +%s%N)
        bun run restore-optimized.ts || npm run db:restore-optimized
        END_TIME=$(date +%s%N)
        DURATION_MS=$(( (END_TIME - START_TIME) / 1000000 ))
        DURATION_S=$(echo "scale=2; $DURATION_MS / 1000" | bc)
        echo -e "\n${GREEN}✅ Optimized restore completed in: ${DURATION_S}s${NC}"
        
        # Save result
        echo "OPTIMIZED Restore - Duration: ${DURATION_S}s - $(date)" >> "$RESULTS_FILE"
        ;;
        
    3)
        echo -e "\n${BLUE}=== BENCHMARK: ORIGINAL vs OPTIMIZED ===${NC}\n"
        
        # Run original
        echo -e "${YELLOW}[1/2] Running ORIGINAL restore...${NC}\n"
        START_ORIG=$(date +%s%N)
        bun run restore.ts 2>&1 | tail -20 || npm run db:restore 2>&1 | tail -20
        END_ORIG=$(date +%s%N)
        DURATION_ORIG_MS=$(( (END_ORIG - START_ORIG) / 1000000 ))
        DURATION_ORIG_S=$(echo "scale=2; $DURATION_ORIG_MS / 1000" | bc)
        
        echo -e "\n${YELLOW}[2/2] Running OPTIMIZED restore...${NC}\n"
        START_OPT=$(date +%s%N)
        bun run restore-optimized.ts 2>&1 | tail -20 || npm run db:restore-optimized 2>&1 | tail -20
        END_OPT=$(date +%s%N)
        DURATION_OPT_MS=$(( (END_OPT - START_OPT) / 1000000 ))
        DURATION_OPT_S=$(echo "scale=2; $DURATION_OPT_MS / 1000" | bc)
        
        # Calculate improvement
        IMPROVEMENT=$(echo "scale=1; (($DURATION_ORIG_MS - $DURATION_OPT_MS) / $DURATION_ORIG_MS) * 100" | bc)
        SPEEDUP=$(echo "scale=2; $DURATION_ORIG_MS / $DURATION_OPT_MS" | bc)
        
        # Show comparison
        echo -e "\n${BLUE}========================================${NC}"
        echo -e "${BLUE}BENCHMARK RESULTS${NC}"
        echo -e "${BLUE}========================================${NC}"
        echo -e "${YELLOW}Original Restore:${NC}   ${DURATION_ORIG_S}s"
        echo -e "${GREEN}Optimized Restore:${NC}  ${DURATION_OPT_S}s"
        echo -e "\n${BLUE}Improvement:${NC}        ${IMPROVEMENT}% faster"
        echo -e "${BLUE}Speedup Factor:${NC}     ${SPEEDUP}x faster"
        echo -e "${BLUE}Time Saved:${NC}        $(echo "scale=2; $DURATION_ORIG_S - $DURATION_OPT_S" | bc)s"
        echo -e "${BLUE}========================================${NC}\n"
        
        # Save results
        {
            echo "=== BENCHMARK: ORIGINAL vs OPTIMIZED ==="
            echo "Date: $(date)"
            echo "Backup: $LATEST_BACKUP"
            echo "Backup Size: $BACKUP_SIZE"
            echo ""
            echo "Original Restore:   ${DURATION_ORIG_S}s"
            echo "Optimized Restore:  ${DURATION_OPT_S}s"
            echo "Improvement:        ${IMPROVEMENT}% faster"
            echo "Speedup Factor:     ${SPEEDUP}x faster"
            echo "Time Saved:         $(echo "scale=2; $DURATION_ORIG_S - $DURATION_OPT_S" | bc)s"
            echo ""
        } >> "$RESULTS_FILE"
        
        echo -e "${GREEN}📊 Results saved to: $RESULTS_FILE${NC}"
        ;;
        
    4)
        if [ ! -f "$RESULTS_FILE" ]; then
            echo -e "${YELLOW}No benchmark results found yet.${NC}"
            echo -e "Run option 3 to generate benchmark results."
        else
            echo -e "${BLUE}Previous Benchmark Results:${NC}\n"
            cat "$RESULTS_FILE"
        fi
        ;;
        
    5)
        echo -e "${YELLOW}Exiting...${NC}"
        exit 0
        ;;
        
    *)
        echo -e "${RED}❌ Invalid choice${NC}"
        exit 1
        ;;
esac

echo -e "\n${BLUE}Note: Results also saved to: $RESULTS_FILE${NC}\n"
