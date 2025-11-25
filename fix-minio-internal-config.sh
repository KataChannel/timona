#!/bin/bash

# Script to add internal MinIO configuration to all .env files

echo "Updating all .env files with internal MinIO configuration..."

# Function to update a file
update_env_file() {
    local file="$1"
    
    if [ ! -f "$file" ]; then
        echo "⏭️  Skipping $file (not found)"
        return
    fi
    
    # Check if already has MINIO_INTERNAL_ENDPOINT
    if grep -q "MINIO_INTERNAL_ENDPOINT" "$file"; then
        echo "✅ $file already has internal config"
        return
    fi
    
    # Check if has MINIO_ENDPOINT
    if ! grep -q "MINIO_ENDPOINT" "$file"; then
        echo "⏭️  Skipping $file (no MinIO config)"
        return
    fi
    
    echo "📝 Updating $file..."
    
    # Create temp file with updated content
    awk '
    /^MINIO_ENDPOINT=/ {
        print "# Internal connection (direct to MinIO server)"
        print "MINIO_INTERNAL_ENDPOINT=116.118.49.243"
        print "MINIO_INTERNAL_PORT=12007"
        print "MINIO_INTERNAL_SSL=false"
        print ""
        print "# Public URL (for file access via domain/proxy)"
    }
    /^MINIO_USE_SSL=/ {
        # Get the port from previous lines
        if (port == "") port = "443"
        print "MINIO_PUBLIC_SSL=true"
        print "MINIO_USE_SSL=false"
        next
    }
    { print }
    ' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
    
    echo "✅ Updated $file"
}

# Update all relevant .env files
update_env_file ".env"
update_env_file ".env.rausach"
update_env_file ".env.prod.rausach"
update_env_file ".env.dev.rausach"
update_env_file ".env.tazagroup"
update_env_file ".env.prod.tazagroup"
update_env_file ".env.dev.tazagroup"
update_env_file "backend/.env"
update_env_file "backend/.env.rausach"
update_env_file "frontend/.env"
update_env_file "frontend/.env.local"
update_env_file "frontend/.env.rausach"
update_env_file "frontend/.env.production.local"
update_env_file "frontend/.env.tazagroup"

echo ""
echo "✨ Done! All .env files updated."
echo ""
echo "📋 Summary:"
echo "   - Internal connection: 116.118.49.243:12007 (HTTP)"
echo "   - Public URL: storage.rausachtrangia.com (HTTPS)"
echo ""
echo "🔄 Next: Restart backend services"
