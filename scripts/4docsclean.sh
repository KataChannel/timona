#!/bin/bash

# Script to organize markdown files by moving them to docs/ directory with numbering
# Enhanced version with batch processing, categorization and recursive search
#
# Usage: 
#   ./docsclean.sh [options]
#
# Options:
#   --dry-run          Show what would be done without making changes
#   --archive          Archive old docs to docs/archive/
#   --category PREFIX  Only process files starting with PREFIX
#   --help             Show this help message
#
# Examples:
#   ./docsclean.sh                    # Normal operation (search all directories)
#   ./docsclean.sh --dry-run          # Preview changes
#   ./docsclean.sh --archive          # Archive old docs
#   ./docsclean.sh --category FIX     # Only process FIX-*.md files

set -e  # Exit on any error

# Parse command line arguments
DRY_RUN=false
ARCHIVE_OLD=false
CATEGORY=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --archive)
            ARCHIVE_OLD=true
            shift
            ;;
        --category)
            CATEGORY="$2"
            shift 2
            ;;
        --help)
            head -n 20 "$0" | tail -n +3
            exit 0
            ;;
        *)
            echo "❌ Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

echo "🧹 Starting docs cleanup and organization..."
if [ "$DRY_RUN" = true ]; then
    echo "🔍 DRY RUN MODE - No changes will be made"
fi
if [ "$ARCHIVE_OLD" = true ]; then
    echo "📦 Archive mode enabled"
fi
if [ -n "$CATEGORY" ]; then
    echo "🏷️  Category filter: $CATEGORY"
fi
echo ""

# Tạo thư mục docs nếu chưa tồn tại
if [ "$DRY_RUN" = false ]; then
    mkdir -p docs
    if [ "$ARCHIVE_OLD" = true ]; then
        mkdir -p docs/archive
    fi
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to show progress
show_progress() {
    local current=$1
    local total=$2
    local percentage=$((current * 100 / total))
    local bar_length=50
    local filled=$((percentage * bar_length / 100))
    
    printf "\r["
    printf "%${filled}s" | tr ' ' '='
    printf "%$((bar_length - filled))s" | tr ' ' ' '
    printf "] %3d%% (%d/%d)" "$percentage" "$current" "$total"
}

# Lấy số thứ tự cao nhất hiện có trong thư mục docs
max_number=0
if ls docs/*.{md,js,sh} 1> /dev/null 2>&1; then
    for file in docs/*.{md,js,sh}; do
        if [ -f "$file" ]; then
            # Trích xuất số từ tên file (format: số-tên.extension)
            filename=$(basename "$file")
            if [[ "$filename" =~ ^([0-9]+)- ]]; then
                number="${BASH_REMATCH[1]}"
                if [ "$number" -gt "$max_number" ]; then
                    max_number=$number
                fi
            fi
        fi
    done
fi

# Bắt đầu từ số tiếp theo
next_number=$((max_number + 1))
moved_count=0
skipped_count=0
archived_count=0
error_count=0

print_status "$BLUE" "📁 Next available number: $next_number"
echo ""

# Statistics arrays
declare -a moved_files
declare -a skipped_files
declare -a archived_files
declare -a error_files

# Tìm tất cả file: .md (trừ README.md), *test*, *verify*, *demo* (.js, .sh) từ TẤT CẢ thư mục
# Excluding: node_modules, .git, dist, build, .next, docs (destination)
shopt -s nullglob  # Prevent glob expansion if no matches

print_status "$BLUE" "🔍 Searching for files in all directories..."

# Use find to search recursively, excluding certain directories
all_md_files=()
test_js_files=()
verify_js_files=()
demo_js_files=()
test_sh_files=()
verify_sh_files=()
demo_sh_files=()

# Find all .md files (excluding node_modules, .git, docs, etc.)
while IFS= read -r -d '' file; do
    all_md_files+=("$file")
done < <(find . -type f -name "*.md" \
    -not -path "*/node_modules/*" \
    -not -path "*/.git/*" \
    -not -path "*/dist/*" \
    -not -path "*/build/*" \
    -not -path "*/.next/*" \
    -not -path "*/docs/*" \
    -not -path "*/coverage/*" \
    -not -path "*/.cache/*" \
    -print0)

# Find all *test*.js files
while IFS= read -r -d '' file; do
    test_js_files+=("$file")
done < <(find . -type f -name "*test*.js" \
    -not -path "*/node_modules/*" \
    -not -path "*/.git/*" \
    -not -path "*/dist/*" \
    -not -path "*/build/*" \
    -not -path "*/.next/*" \
    -not -path "*/docs/*" \
    -not -path "*/coverage/*" \
    -print0)

# Find all *verify*.js files
while IFS= read -r -d '' file; do
    verify_js_files+=("$file")
done < <(find . -type f -name "*verify*.js" \
    -not -path "*/node_modules/*" \
    -not -path "*/.git/*" \
    -not -path "*/dist/*" \
    -not -path "*/build/*" \
    -not -path "*/.next/*" \
    -not -path "*/docs/*" \
    -print0)

# Find all *demo*.js files
while IFS= read -r -d '' file; do
    demo_js_files+=("$file")
done < <(find . -type f -name "*demo*.js" \
    -not -path "*/node_modules/*" \
    -not -path "*/.git/*" \
    -not -path "*/dist/*" \
    -not -path "*/build/*" \
    -not -path "*/.next/*" \
    -not -path "*/docs/*" \
    -print0)

# Find all *test*.sh files
while IFS= read -r -d '' file; do
    test_sh_files+=("$file")
done < <(find . -type f -name "*test*.sh" \
    -not -path "*/node_modules/*" \
    -not -path "*/.git/*" \
    -not -path "*/dist/*" \
    -not -path "*/build/*" \
    -not -path "*/.next/*" \
    -not -path "*/docs/*" \
    -print0)

# Find all *verify*.sh files
while IFS= read -r -d '' file; do
    verify_sh_files+=("$file")
done < <(find . -type f -name "*verify*.sh" \
    -not -path "*/node_modules/*" \
    -not -path "*/.git/*" \
    -not -path "*/dist/*" \
    -not -path "*/build/*" \
    -not -path "*/.next/*" \
    -not -path "*/docs/*" \
    -print0)

# Find all *demo*.sh files
while IFS= read -r -d '' file; do
    demo_sh_files+=("$file")
done < <(find . -type f -name "*demo*.sh" \
    -not -path "*/node_modules/*" \
    -not -path "*/.git/*" \
    -not -path "*/dist/*" \
    -not -path "*/build/*" \
    -not -path "*/.next/*" \
    -not -path "*/docs/*" \
    -print0)

shopt -u nullglob

# Combine all file types
all_target_files=("${all_md_files[@]}" "${test_js_files[@]}" "${verify_js_files[@]}" "${demo_js_files[@]}" "${test_sh_files[@]}" "${verify_sh_files[@]}" "${demo_sh_files[@]}")

# Filter out README.md (case-insensitive) and process all files
md_files=()
for file in "${all_target_files[@]}"; do
    filename=$(basename "$file")
    # Skip README.md in any case variation
    if [[ "${filename,,}" == "readme.md" ]]; then
        continue
    fi
    md_files+=("$file")
done

# Apply category filter if specified
if [ -n "$CATEGORY" ]; then
    filtered_files=()
    for file in "${md_files[@]}"; do
        if [[ "$file" =~ ^${CATEGORY} ]]; then
            filtered_files+=("$file")
        fi
    done
    md_files=("${filtered_files[@]}")
    print_status "$YELLOW" "🏷️  Filtered to ${#md_files[@]} files matching category: $CATEGORY"
fi

# Show file type statistics for transparency
total_found=${#all_target_files[@]}
excluded_count=$((total_found - ${#md_files[@]}))
if [ $excluded_count -gt 0 ]; then
    print_status "$YELLOW" "📄 Excluded $excluded_count README.md files from processing"
fi
if [ ${#test_js_files[@]} -gt 0 ] || [ ${#verify_js_files[@]} -gt 0 ] || [ ${#demo_js_files[@]} -gt 0 ] || [ ${#test_sh_files[@]} -gt 0 ] || [ ${#verify_sh_files[@]} -gt 0 ] || [ ${#demo_sh_files[@]} -gt 0 ]; then
    script_count=$((${#test_js_files[@]} + ${#verify_js_files[@]} + ${#demo_js_files[@]} + ${#test_sh_files[@]} + ${#verify_sh_files[@]} + ${#demo_sh_files[@]}))
    print_status "$BLUE" "🔧 Found $script_count test/verify/demo script files (.js/.sh)"
fi

if [ ${#md_files[@]} -eq 0 ]; then
    print_status "$YELLOW" "📄 No target files (.md, *test*, *verify*, *demo*) found in project directories"
    exit 0
fi

total_files=${#md_files[@]}
md_count=0
script_count=0
for file in "${md_files[@]}"; do
    if [[ "$file" == *.md ]]; then
        md_count=$((md_count + 1))
    else
        script_count=$((script_count + 1))
    fi
done
print_status "$GREEN" "📊 Found $total_files files to process: $md_count .md files, $script_count test/verify/demo scripts"
echo ""

# Sắp xếp file theo thời gian sửa đổi (mtime)
declare -A file_times
for file in "${md_files[@]}"; do
    # Skip if file doesn't exist (shouldn't happen after filtering)
    if [ ! -f "$file" ]; then
        continue
    fi
    
    # Get modification time
    file_times["$file"]=$(stat -c %Y "$file" 2>/dev/null || echo "0")
done

# Sort files by modification time
sorted_files=()
while IFS= read -r file_entry; do
    # Split time and filename
    file_name="${file_entry#*:}"
    if [ -n "$file_name" ]; then
        sorted_files+=("$file_name")
    fi
done < <(for file in "${!file_times[@]}"; do
    printf '%s:%s\n' "${file_times[$file]}" "$file"
done | sort -n | cut -d: -f2-)

# Process each file
current_file=0
for file in "${sorted_files[@]}"; do
    current_file=$((current_file + 1))
    
    # Show progress bar
    if [ "$DRY_RUN" = false ]; then
        show_progress "$current_file" "$total_files"
    fi
    
    if [ ! -f "$file" ]; then
        continue
    fi
    
    filename=$(basename "$file")
    
    # Skip README.md (case insensitive)
    if [[ "${filename,,}" == "readme.md" ]]; then
        skipped_files+=("$filename (README)")
        skipped_count=$((skipped_count + 1))
        continue
    fi
    
    # Process based on file state
    if [[ ! "$filename" =~ ^[0-9]+-.*\.(md|js|sh)$ ]]; then
        # File without number - add number and move
        new_filename="${next_number}-${filename}"
        
        # Check if target already exists
        if [ -f "docs/$new_filename" ]; then
            if [ "$ARCHIVE_OLD" = true ]; then
                # Archive the existing file
                if [ "$DRY_RUN" = false ]; then
                    mv "docs/$new_filename" "docs/archive/$new_filename"
                fi
                archived_files+=("$new_filename")
                archived_count=$((archived_count + 1))
            else
                skipped_files+=("$filename (target exists: $new_filename)")
                skipped_count=$((skipped_count + 1))
                continue
            fi
        fi
        
        # Move file with directory information in output
        source_path=$(dirname "$file")
        if [ "$DRY_RUN" = false ]; then
            if mv "$file" "docs/$new_filename" 2>/dev/null; then
                moved_files+=("$source_path/$filename → docs/$new_filename")
                moved_count=$((moved_count + 1))
                next_number=$((next_number + 1))
            else
                error_files+=("$filename (move failed)")
                error_count=$((error_count + 1))
            fi
        else
            echo "  [DRY RUN] Would move: $source_path/$filename → docs/$new_filename"
            moved_count=$((moved_count + 1))
            next_number=$((next_number + 1))
        fi
    else
        # File already has number - check if needs to move
        source_path=$(dirname "$file")
        if [ -f "docs/$filename" ]; then
            # Duplicate - handle based on mode
            if [ "$ARCHIVE_OLD" = true ] && [ "$DRY_RUN" = false ]; then
                mv "docs/$filename" "docs/archive/$filename"
                archived_files+=("$filename (duplicate)")
                archived_count=$((archived_count + 1))
                
                mv "$file" "docs/$filename"
                moved_files+=("$source_path/$filename → docs/$filename (replaced)")
                moved_count=$((moved_count + 1))
            else
                if [ "$DRY_RUN" = false ]; then
                    rm "$file"
                fi
                skipped_files+=("$source_path/$filename (duplicate removed)")
                skipped_count=$((skipped_count + 1))
            fi
        else
            # Just move it
            if [ "$DRY_RUN" = false ]; then
                if mv "$file" "docs/$filename" 2>/dev/null; then
                    moved_files+=("$source_path/$filename → docs/$filename")
                    moved_count=$((moved_count + 1))
                else
                    error_files+=("$filename (move failed)")
                    error_count=$((error_count + 1))
                fi
            else
                echo "  [DRY RUN] Would move: $source_path/$filename → docs/$filename"
                moved_count=$((moved_count + 1))
            fi
        fi
    fi
done

# Clear progress bar line
if [ "$DRY_RUN" = false ]; then
    echo -e "\n"
fi

# Print summary report
echo "════════════════════════════════════════════════════════"
print_status "$GREEN" "✅ Operation Complete!"
echo "════════════════════════════════════════════════════════"
echo ""

# Summary statistics
print_status "$BLUE" "📊 Summary:"
echo "  • Processed: $total_files files"
echo "  • Moved:     $moved_count files"
echo "  • Skipped:   $skipped_count files"
if [ "$ARCHIVE_OLD" = true ]; then
    echo "  • Archived:  $archived_count files"
fi
if [ $error_count -gt 0 ]; then
    print_status "$RED" "  • Errors:    $error_count files"
fi
echo ""

# Total files in docs
if [ "$DRY_RUN" = false ]; then
    total_docs=$(ls -1 docs/*.{md,js,sh} 2>/dev/null | wc -l)
    print_status "$GREEN" "📁 Total files in docs/: $total_docs"
    
    if [ "$ARCHIVE_OLD" = true ]; then
        total_archived=$(ls -1 docs/archive/*.md 2>/dev/null | wc -l)
        if [ $total_archived -gt 0 ]; then
            print_status "$YELLOW" "📦 Total files in archive/: $total_archived"
        fi
    fi
fi
echo ""

# Detailed lists (if not too many)
if [ ${#moved_files[@]} -gt 0 ] && [ ${#moved_files[@]} -le 20 ]; then
    print_status "$GREEN" "📝 Moved files:"
    for item in "${moved_files[@]}"; do
        echo "  ✓ $item"
    done
    echo ""
elif [ ${#moved_files[@]} -gt 20 ]; then
    print_status "$GREEN" "📝 Moved files (first 10):"
    for i in {0..9}; do
        if [ $i -lt ${#moved_files[@]} ]; then
            echo "  ✓ ${moved_files[$i]}"
        fi
    done
    echo "  ... and $((${#moved_files[@]} - 10)) more"
    echo ""
fi

if [ ${#skipped_files[@]} -gt 0 ] && [ ${#skipped_files[@]} -le 10 ]; then
    print_status "$YELLOW" "⏭️  Skipped files:"
    for item in "${skipped_files[@]}"; do
        echo "  ⊘ $item"
    done
    echo ""
fi

if [ ${#archived_files[@]} -gt 0 ] && [ ${#archived_files[@]} -le 10 ]; then
    print_status "$YELLOW" "📦 Archived files:"
    for item in "${archived_files[@]}"; do
        echo "  📦 $item"
    done
    echo ""
fi

if [ ${#error_files[@]} -gt 0 ]; then
    print_status "$RED" "❌ Errors:"
    for item in "${error_files[@]}"; do
        echo "  ✗ $item"
    done
    echo ""
fi

# List final state (first 15 files)
if [ "$DRY_RUN" = false ] && ls docs/*.{md,js,sh} 1> /dev/null 2>&1; then
    print_status "$BLUE" "📁 Current docs/ contents:"
    ls -1 docs/*.{md,js,sh} | head -15 | while read -r file; do
        basename "$file"
    done | nl -w2 -s'. '
    
    remaining=$(($(ls -1 docs/*.{md,js,sh} | wc -l) - 15))
    if [ $remaining -gt 0 ]; then
        echo "   ... and $remaining more files"
    fi
fi

echo ""
print_status "$GREEN" "════════════════════════════════════════════════════════"
