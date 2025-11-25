#!/bin/bash

# ============================================
# Database Backup Status Check
# ============================================
# Shows information about available backups

BACKUP_DIR="./kata_json"

echo "📊 Database Backup Status"
echo "================================"
echo ""

# Check if backup directory exists
if [ ! -d "$BACKUP_DIR" ]; then
  echo "❌ No backups found (directory doesn't exist)"
  echo "💡 Run './backup-database.sh' to create a backup"
  exit 1
fi

# Count backup folders
BACKUP_COUNT=$(find "$BACKUP_DIR" -maxdepth 1 -type d ! -path "$BACKUP_DIR" | wc -l)

if [ "$BACKUP_COUNT" -eq 0 ]; then
  echo "❌ No backup folders found"
  echo "💡 Run './backup-database.sh' to create a backup"
  exit 1
fi

echo "✅ Found $BACKUP_COUNT backup(s)"
echo ""

# List all backups with details
echo "📁 Available Backups:"
echo "-----------------------------------"

for backup_folder in "$BACKUP_DIR"/*/; do
  if [ -d "$backup_folder" ]; then
    folder_name=$(basename "$backup_folder")
    file_count=$(find "$backup_folder" -name "*.json" | wc -l)
    folder_size=$(du -sh "$backup_folder" 2>/dev/null | cut -f1)
    
    # Try to parse date from folder name (format: YYYYMMDD_HHMMSS)
    if [[ $folder_name =~ ^([0-9]{8})_([0-9]{6})$ ]]; then
      date_part="${BASH_REMATCH[1]}"
      time_part="${BASH_REMATCH[2]}"
      formatted_date="${date_part:0:4}-${date_part:4:2}-${date_part:6:2}"
      formatted_time="${time_part:0:2}:${time_part:2:2}:${time_part:4:2}"
      display_date="$formatted_date $formatted_time"
    else
      display_date="$folder_name"
    fi
    
    echo "  📅 $display_date"
    echo "     Tables: $file_count | Size: $folder_size"
    echo ""
  fi
done

# Show latest backup details
echo "-----------------------------------"
latest_backup=$(ls -t "$BACKUP_DIR" | head -1)
echo "🕒 Latest backup: $latest_backup"

if [ -d "$BACKUP_DIR/$latest_backup" ]; then
  echo ""
  echo "📋 Tables in latest backup:"
  echo "-----------------------------------"
  
  # List all JSON files sorted by size
  find "$BACKUP_DIR/$latest_backup" -name "*.json" -exec du -h {} \; | sort -rh | head -20 | while read size file; do
    table_name=$(basename "$file" .json)
    # Count records in JSON file
    record_count=$(grep -o '"id"' "$file" 2>/dev/null | wc -l || echo "?")
    printf "  %-35s %8s records | %7s\n" "$table_name" "$record_count" "$size"
  done
  
  total_tables=$(find "$BACKUP_DIR/$latest_backup" -name "*.json" | wc -l)
  if [ "$total_tables" -gt 20 ]; then
    echo "  ... and $(($total_tables - 20)) more tables"
  fi
fi

echo ""
echo "================================"
echo "💡 Commands:"
echo "  Backup:  ./backup-database.sh"
echo "  Restore: ./restore-database.sh"
