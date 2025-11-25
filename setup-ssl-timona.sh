#!/bin/bash

# ============================================================================
# Timona SSL Setup Script
# Setup SSL certificates for Timona domains
# ============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Domain configuration
FRONTEND_DOMAIN="timona.com"
API_DOMAIN="api.timona.com"
STORAGE_DOMAIN="storage.timona.com"
EMAIL="admin@timona.com"

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         Timona SSL Certificate Setup                  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root (sudo)${NC}"
    exit 1
fi

# Function to setup SSL for a domain
setup_ssl() {
    local domain=$1
    local port=$2
    local service_name=$3
    
    echo -e "${YELLOW}Setting up SSL for ${domain}...${NC}"
    
    # Create nginx config
    cat > /etc/nginx/sites-available/${domain} <<EOF
# HTTP → HTTPS redirect
server {
    listen 80;
    server_name ${domain};
    return 301 https://\$server_name\$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name ${domain};

    # SSL certificates (will be configured by Certbot)
    ssl_certificate /etc/letsencrypt/live/${domain}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${domain}/privkey.pem;

    # SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;

    # Logging
    access_log /var/log/nginx/${domain}.access.log;
    error_log /var/log/nginx/${domain}.error.log;

    # Proxy to backend
    location / {
        proxy_pass http://116.118.49.243:${port};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

    # Enable site
    ln -sf /etc/nginx/sites-available/${domain} /etc/nginx/sites-enabled/
    
    echo -e "${GREEN}✓ Nginx config created for ${domain}${NC}"
}

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"

# Install certbot if not installed
if ! command -v certbot &> /dev/null; then
    echo -e "${YELLOW}Installing certbot...${NC}"
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
fi

# Setup SSL for each domain
echo ""
echo -e "${BLUE}Setting up domains...${NC}"
echo ""

# Frontend
setup_ssl "${FRONTEND_DOMAIN}" "15000" "Frontend"

# API
setup_ssl "${API_DOMAIN}" "15001" "Backend API"

# Storage
setup_ssl "${STORAGE_DOMAIN}" "15007" "MinIO Storage"

# Test nginx config
echo ""
echo -e "${BLUE}Testing nginx configuration...${NC}"
nginx -t

# Reload nginx
echo -e "${BLUE}Reloading nginx...${NC}"
systemctl reload nginx

# Obtain SSL certificates
echo ""
echo -e "${BLUE}Obtaining SSL certificates...${NC}"
echo -e "${YELLOW}Note: Make sure DNS records are properly configured!${NC}"
echo ""

certbot --nginx \
    -d ${FRONTEND_DOMAIN} \
    -d ${API_DOMAIN} \
    -d ${STORAGE_DOMAIN} \
    --email ${EMAIL} \
    --agree-tos \
    --non-interactive \
    --redirect

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║            SSL Setup Complete!                         ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Domains configured:${NC}"
echo -e "  • ${FRONTEND_DOMAIN} → Port 15000 (Frontend)"
echo -e "  • ${API_DOMAIN} → Port 15001 (Backend API)"
echo -e "  • ${STORAGE_DOMAIN} → Port 15007 (MinIO Storage)"
echo ""
echo -e "${BLUE}Access URLs:${NC}"
echo -e "  • https://${FRONTEND_DOMAIN}"
echo -e "  • https://${API_DOMAIN}/graphql"
echo -e "  • https://${STORAGE_DOMAIN}"
echo ""
echo -e "${YELLOW}Auto-renewal is enabled. Certificates will renew automatically.${NC}"
