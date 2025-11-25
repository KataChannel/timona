#!/bin/bash

# ============================================
# Create .env.production file interactively
# ============================================

set -e

echo "🔐 Create .env.production File"
echo "==============================="
echo ""
echo "This script will help you create a .env.production file"
echo "with your production secrets (NOT committed to Git)"
echo ""

# Check if file exists
if [ -f ".env.production" ]; then
    echo "⚠️  .env.production already exists!"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 0
    fi
fi

# Function to prompt for input
prompt_input() {
    local var_name=$1
    local description=$2
    local default_value=$3
    local is_required=$4
    
    echo ""
    echo "📝 $description"
    if [ -n "$default_value" ]; then
        read -p "Enter $var_name [$default_value]: " value
        value=${value:-$default_value}
    else
        read -p "Enter $var_name: " value
    fi
    
    if [ "$is_required" = "true" ] && [ -z "$value" ]; then
        echo "❌ This field is required!"
        prompt_input "$var_name" "$description" "$default_value" "$is_required"
        return
    fi
    
    eval "$var_name='$value'"
}

# Collect inputs
echo ""
echo "🤖 Support Chat AI Configuration"
echo "================================="

prompt_input "GEMINI_KEY" \
    "Google Gemini API Key (Get from: https://aistudio.google.com/app/apikey)" \
    "" \
    "true"

prompt_input "OPENAI_KEY" \
    "OpenAI API Key (Optional, press Enter to skip)" \
    "" \
    "false"

echo ""
echo "📱 Optional: Zalo Integration"
echo "=============================="

prompt_input "ZALO_APP_ID" \
    "Zalo App ID (Optional, press Enter to skip)" \
    "" \
    "false"

prompt_input "ZALO_APP_SECRET" \
    "Zalo App Secret (Optional, press Enter to skip)" \
    "" \
    "false"

echo ""
echo "📘 Optional: Facebook Integration"
echo "=================================="

prompt_input "FB_APP_ID" \
    "Facebook App ID (Optional, press Enter to skip)" \
    "" \
    "false"

prompt_input "FB_APP_SECRET" \
    "Facebook App Secret (Optional, press Enter to skip)" \
    "" \
    "false"

# Create .env.production file
echo ""
echo "📄 Creating .env.production file..."

cat > .env.production << EOF
# ============================================
# Production Environment Variables
# ============================================
# ⚠️  DO NOT COMMIT THIS FILE TO GIT!
# Created: $(date)

# ============================================
# Support Chat System
# ============================================

# Google Gemini API (Required for AI chat)
GOOGLE_GEMINI_API_KEY=$GEMINI_KEY

# OpenAI API (Optional - alternative to Gemini)
${OPENAI_KEY:+OPENAI_API_KEY=$OPENAI_KEY}

# ============================================
# Zalo OA Integration (Optional)
# ============================================

${ZALO_APP_ID:+ZALO_APP_ID=$ZALO_APP_ID}
${ZALO_APP_SECRET:+ZALO_APP_SECRET=$ZALO_APP_SECRET}

# ============================================
# Facebook Messenger Integration (Optional)
# ============================================

${FB_APP_ID:+FACEBOOK_APP_ID=$FB_APP_ID}
${FB_APP_SECRET:+FACEBOOK_APP_SECRET=$FB_APP_SECRET}

# ============================================
# Add more secrets as needed
# ============================================
EOF

# Set file permissions (only owner can read/write)
chmod 600 .env.production

echo ""
echo "✅ .env.production created successfully!"
echo ""
echo "📋 File location: $(pwd)/.env.production"
echo "🔒 File permissions: 600 (owner read/write only)"
echo ""
echo "📌 Important:"
echo "  1. This file is in .gitignore and will NOT be committed"
echo "  2. Keep this file secure on your production server"
echo "  3. Never share this file or commit it to Git"
echo ""
echo "🚀 Next steps:"
echo "  1. Review the file: cat .env.production"
echo "  2. Deploy: ./deploy-with-secrets.sh"
echo ""
