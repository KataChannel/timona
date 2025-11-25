#!/bin/bash
# Script to create placeholder icons for PWA push notifications
# Icons should be replaced with actual logo later

cd "$(dirname "$0")"

# Check if convert (ImageMagick) is available
if ! command -v convert &> /dev/null; then
    echo "⚠️  ImageMagick not found. Please install: sudo apt install imagemagick"
    echo "⚠️  Or manually add icon files to frontend/public/icons/"
    echo ""
    echo "Required files:"
    echo "  - frontend/public/icons/icon-192x192.png"
    echo "  - frontend/public/icons/icon-512x512.png"
    echo "  - frontend/public/icons/badge-72x72.png"
    exit 1
fi

# Create simple blue bell icon as placeholder
echo "🎨 Creating placeholder icons..."

# 192x192 icon
convert -size 192x192 xc:white \
    -gravity center \
    -fill '#3B82F6' \
    -draw "circle 96,96 96,20" \
    -fill white \
    -font Arial-Bold -pointsize 120 \
    -draw "text 0,30 '🔔'" \
    icons/icon-192x192.png

# 512x512 icon
convert -size 512x512 xc:white \
    -gravity center \
    -fill '#3B82F6' \
    -draw "circle 256,256 256,50" \
    -fill white \
    -font Arial-Bold -pointsize 320 \
    -draw "text 0,80 '🔔'" \
    icons/icon-512x512.png

# 72x72 badge
convert -size 72x72 xc:white \
    -gravity center \
    -fill '#EF4444' \
    -draw "circle 36,36 36,5" \
    icons/badge-72x72.png

echo "✅ Icons created successfully!"
echo ""
echo "📝 Note: These are placeholder icons."
echo "   Replace with your actual logo for production."
