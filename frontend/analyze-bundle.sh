#!/bin/bash

# Bundle Analysis Script
# Analyzes Next.js production bundle size and generates report

set -e

echo "🔍 Analyzing Next.js Production Bundle..."
echo ""

# Check if @next/bundle-analyzer is installed
if ! bun list @next/bundle-analyzer >/dev/null 2>&1; then
  echo "📦 Installing @next/bundle-analyzer..."
  bun add --save-dev @next/bundle-analyzer
fi

# Create temporary next.config.js with bundle analyzer
NEXT_CONFIG="next.config.js"
BACKUP="${NEXT_CONFIG}.backup"

# Backup current config
cp "$NEXT_CONFIG" "$BACKUP"

# Create config with analyzer
cat > "${NEXT_CONFIG}" << 'EOF'
/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const baseConfig = require('./next.config.js.backup')

module.exports = withBundleAnalyzer(baseConfig)
EOF

echo "🏗️  Building production bundle..."
ANALYZE=true bun run build

# Restore original config
mv "$BACKUP" "$NEXT_CONFIG"

echo ""
echo "✅ Bundle analysis complete!"
echo "📊 Check .next/analyze/client.html and .next/analyze/server.html for detailed breakdown"
