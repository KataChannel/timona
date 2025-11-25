#!/bin/bash

# Quick Setup Script for MinIO Domain Migration
# This script helps you set up storage.rausachtrangia.com domain

set -e

echo "=================================================="
echo "  MinIO Domain Migration - Quick Setup"
echo "=================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}⚠️  Please do not run as root${NC}"
   exit 1
fi

echo "This script will help you:"
echo "  1. Configure Nginx/Caddy reverse proxy"
echo "  2. Set up SSL certificate"
echo "  3. Test domain access"
echo ""
echo -e "${YELLOW}⚠️  Prerequisites:${NC}"
echo "  - DNS record configured (storage.rausachtrangia.com → 116.118.49.243)"
echo "  - Port 80 and 443 open in firewall"
echo "  - MinIO running on 116.118.49.243:12007"
echo ""

read -p "Press Enter to continue or Ctrl+C to cancel..."

# Menu
echo ""
echo "Select web server:"
echo "  1) Nginx (Recommended)"
echo "  2) Caddy (Easier SSL)"
echo "  3) Skip (Already configured)"
read -p "Enter choice [1-3]: " choice

case $choice in
  1)
    echo ""
    echo -e "${BLUE}========== Nginx Setup ==========${NC}"
    
    # Check if Nginx installed
    if ! command -v nginx &> /dev/null; then
      echo -e "${YELLOW}Nginx not found. Installing...${NC}"
      sudo apt update
      sudo apt install -y nginx
    else
      echo -e "${GREEN}✓ Nginx already installed${NC}"
    fi
    
    # Create config
    echo ""
    echo "Creating Nginx configuration..."
    sudo tee /etc/nginx/sites-available/storage.rausachtrangia.com > /dev/null <<'EOF'
upstream minio_backend {
    server 116.118.49.243:12007;
    keepalive 32;
}

# HTTP → HTTPS redirect
server {
    listen 80;
    server_name storage.rausachtrangia.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name storage.rausachtrangia.com;

    # SSL certificates (will be configured by Certbot)
    # ssl_certificate /etc/letsencrypt/live/storage.rausachtrangia.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/storage.rausachtrangia.com/privkey.pem;

    # SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;

    # CORS headers
    add_header Access-Control-Allow-Origin "*" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With" always;

    # Client settings
    client_max_body_size 100M;
    client_body_timeout 300s;

    # Logging
    access_log /var/log/nginx/storage.rausachtrangia.com.access.log;
    error_log /var/log/nginx/storage.rausachtrangia.com.error.log;

    # Proxy to MinIO
    location / {
        proxy_pass http://minio_backend;
        
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "";
        
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
        
        proxy_buffering off;
        proxy_request_buffering off;
    }

    # Handle preflight requests
    if ($request_method = OPTIONS) {
        add_header Access-Control-Allow-Origin "*";
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With";
        add_header Content-Length 0;
        add_header Content-Type text/plain;
        return 204;
    }
}
EOF
    
    # Enable site
    echo "Enabling site..."
    sudo ln -sf /etc/nginx/sites-available/storage.rausachtrangia.com /etc/nginx/sites-enabled/
    
    # Test config
    echo "Testing Nginx configuration..."
    if sudo nginx -t; then
      echo -e "${GREEN}✓ Nginx configuration valid${NC}"
      sudo systemctl reload nginx
      echo -e "${GREEN}✓ Nginx reloaded${NC}"
    else
      echo -e "${RED}✗ Nginx configuration error${NC}"
      exit 1
    fi
    
    # Install Certbot
    echo ""
    echo "Setting up SSL certificate..."
    if ! command -v certbot &> /dev/null; then
      echo "Installing Certbot..."
      sudo apt install -y certbot python3-certbot-nginx
    else
      echo -e "${GREEN}✓ Certbot already installed${NC}"
    fi
    
    # Get certificate
    echo ""
    echo "Obtaining SSL certificate..."
    echo -e "${YELLOW}You will be asked to enter an email and agree to Terms of Service${NC}"
    read -p "Press Enter to continue..."
    
    sudo certbot --nginx -d storage.rausachtrangia.com
    
    echo ""
    echo -e "${GREEN}✓ Nginx setup complete!${NC}"
    ;;
    
  2)
    echo ""
    echo -e "${BLUE}========== Caddy Setup ==========${NC}"
    
    # Check if Caddy installed
    if ! command -v caddy &> /dev/null; then
      echo -e "${YELLOW}Caddy not found. Installing...${NC}"
      sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
      curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
      curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
      sudo apt update
      sudo apt install -y caddy
    else
      echo -e "${GREEN}✓ Caddy already installed${NC}"
    fi
    
    # Create Caddyfile
    echo "Creating Caddy configuration..."
    sudo tee /etc/caddy/Caddyfile > /dev/null <<'EOF'
storage.rausachtrangia.com {
    reverse_proxy 116.118.49.243:12007 {
        header_up Host {host}
        header_up X-Real-IP {remote}
        header_up X-Forwarded-For {remote}
        header_up X-Forwarded-Proto {scheme}
    }
    
    # CORS
    header Access-Control-Allow-Origin "*"
    header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"
    
    # Security headers
    header Strict-Transport-Security "max-age=31536000; includeSubDomains"
    header X-Content-Type-Options "nosniff"
    header X-Frame-Options "SAMEORIGIN"
    
    # Client settings
    request_body {
        max_size 100MB
    }
    
    # Logging
    log {
        output file /var/log/caddy/storage.rausachtrangia.com.log
    }
}
EOF
    
    # Reload Caddy
    echo "Reloading Caddy..."
    sudo systemctl reload caddy
    
    echo ""
    echo -e "${GREEN}✓ Caddy setup complete! SSL certificate will be obtained automatically.${NC}"
    ;;
    
  3)
    echo -e "${YELLOW}Skipping web server configuration${NC}"
    ;;
    
  *)
    echo -e "${RED}Invalid choice${NC}"
    exit 1
    ;;
esac

# Test DNS
echo ""
echo -e "${BLUE}========== Testing DNS ==========${NC}"
if command -v dig &> /dev/null; then
  echo "DNS resolution:"
  dig +short storage.rausachtrangia.com
  
  IP=$(dig +short storage.rausachtrangia.com | tail -n1)
  if [ "$IP" = "116.118.49.243" ]; then
    echo -e "${GREEN}✓ DNS correctly configured${NC}"
  else
    echo -e "${RED}✗ DNS not pointing to 116.118.49.243${NC}"
    echo "  Current IP: $IP"
    echo "  Expected: 116.118.49.243"
  fi
else
  echo -e "${YELLOW}dig not installed, skipping DNS test${NC}"
fi

# Test HTTPS
echo ""
echo -e "${BLUE}========== Testing HTTPS ==========${NC}"
echo "Testing SSL certificate..."
if curl -Is https://storage.rausachtrangia.com | head -n 1; then
  echo -e "${GREEN}✓ HTTPS working!${NC}"
else
  echo -e "${YELLOW}⚠️  HTTPS not yet accessible${NC}"
  echo "  This is normal if you just set up DNS"
  echo "  Wait a few minutes and try again"
fi

# Next steps
echo ""
echo "=================================================="
echo -e "${GREEN}  Setup Complete!${NC}"
echo "=================================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Restart application services:"
echo "   cd /mnt/chikiet/kataoffical/shoprausach"
echo "   pm2 restart all"
echo ""
echo "2. Run database migration:"
echo "   bun run scripts/migrate-storage-domain.ts"
echo ""
echo "3. Test upload:"
echo "   - Go to https://shop.rausachtrangia.com/admin"
echo "   - Create/edit blog post"
echo "   - Upload image"
echo "   - Check URL in HTML source (should be https://storage.rausachtrangia.com/...)"
echo ""
echo "4. Monitor logs:"
echo "   pm2 logs"

if [ "$choice" = "1" ]; then
  echo "   sudo tail -f /var/log/nginx/storage.rausachtrangia.com.access.log"
elif [ "$choice" = "2" ]; then
  echo "   sudo tail -f /var/log/caddy/storage.rausachtrangia.com.log"
fi

echo ""
echo "For detailed documentation, see:"
echo "  - MINIO_DOMAIN_MIGRATION_COMPLETE.md"
echo "  - SETUP_STORAGE_DOMAIN.md"
echo ""
echo -e "${GREEN}Done! 🎉${NC}"
