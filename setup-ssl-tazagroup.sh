#!/bin/bash

###############################################################################
# SSL Setup Script for appapi.tazagroup.vn
# Cấu hình SSL cho Tazagroup Backend API
###############################################################################

set -e

DOMAIN="appapi.tazagroup.vn"
NGINX_CONFIG="/chikiet/kataoffical/shoprausach/nginx/appapi.tazagroup.vn"
EMAIL="admin@tazagroup.vn"  # Thay đổi email của bạn
SERVER_IP="116.118.49.243"
BACKEND_PORT="13001"

echo "=================================================="
echo "🔒 SSL Setup for $DOMAIN"
echo "=================================================="
echo ""

# Bước 1: Kiểm tra DNS
echo "📋 Step 1: Kiểm tra DNS configuration..."
echo "Đảm bảo domain $DOMAIN đã trỏ về IP: $SERVER_IP"
echo ""
echo "Kiểm tra DNS:"
dig +short $DOMAIN || nslookup $DOMAIN
echo ""
read -p "DNS đã trỏ đúng chưa? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Vui lòng cấu hình DNS trước:"
    echo "   - Tạo A Record: $DOMAIN → $SERVER_IP"
    echo "   - Đợi DNS propagate (5-10 phút)"
    exit 1
fi

# Bước 2: Copy nginx config
echo ""
echo "📋 Step 2: Deploy nginx configuration..."
ssh root@$SERVER_IP "mkdir -p /etc/nginx/sites-available /etc/nginx/sites-enabled"
scp $NGINX_CONFIG root@$SERVER_IP:/etc/nginx/sites-available/$DOMAIN

# Create symlink
ssh root@$SERVER_IP "ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/$DOMAIN"

# Test nginx config
echo "Testing nginx configuration..."
ssh root@$SERVER_IP "nginx -t"

# Reload nginx
echo "Reloading nginx..."
ssh root@$SERVER_IP "systemctl reload nginx"
echo "✅ Nginx configured successfully!"

# Bước 3: Cài đặt Certbot (nếu chưa có)
echo ""
echo "📋 Step 3: Kiểm tra Certbot..."
if ! ssh root@$SERVER_IP "which certbot" > /dev/null 2>&1; then
    echo "Installing Certbot..."
    ssh root@$SERVER_IP "apt update && apt install -y certbot python3-certbot-nginx"
    echo "✅ Certbot installed!"
else
    echo "✅ Certbot already installed!"
fi

# Bước 4: Lấy SSL certificate
echo ""
echo "📋 Step 4: Obtaining SSL certificate..."
echo "Chọn phương thức:"
echo "  1) Cloudflare (Recommended - Free, Auto-renew)"
echo "  2) Let's Encrypt (Free, Auto-renew, cần port 80 mở)"
echo ""
read -p "Chọn phương thức (1 hoặc 2): " -n 1 -r
echo

if [[ $REPLY == "1" ]]; then
    echo ""
    echo "🌐 Cloudflare SSL Setup:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "1. Đăng nhập Cloudflare Dashboard"
    echo "2. Chọn domain tazagroup.vn"
    echo "3. Thêm A record: appapi → $SERVER_IP"
    echo "4. SSL/TLS → Overview → Chọn 'Full (strict)'"
    echo "5. SSL/TLS → Edge Certificates → Enable 'Always Use HTTPS'"
    echo "6. Đợi 5-10 phút để Cloudflare cấp certificate"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "✅ Sau khi hoàn tất, domain sẽ tự động có HTTPS!"
    echo "   Test: https://$DOMAIN/graphql"
    
elif [[ $REPLY == "2" ]]; then
    echo ""
    echo "🔐 Let's Encrypt SSL Setup..."
    
    # Tạo webroot directory
    ssh root@$SERVER_IP "mkdir -p /var/www/html"
    
    # Chạy Certbot
    echo "Obtaining certificate..."
    ssh root@$SERVER_IP "certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email $EMAIL --redirect"
    
    echo ""
    echo "✅ SSL certificate installed successfully!"
    echo "   Certificate location: /etc/letsencrypt/live/$DOMAIN/"
    echo "   Auto-renewal: Active (expires in 90 days)"
    
    # Setup auto-renewal
    echo ""
    echo "Setting up auto-renewal..."
    ssh root@$SERVER_IP "systemctl enable certbot.timer && systemctl start certbot.timer"
    echo "✅ Auto-renewal configured!"
    
else
    echo "❌ Invalid choice"
    exit 1
fi

# Bước 5: Update CORS in backend
echo ""
echo "📋 Step 5: Cập nhật CORS configuration..."
echo "Thêm domain vào CORS whitelist trong backend/src/main.ts:"
echo "  - https://$DOMAIN"
echo ""
read -p "Đã cập nhật CORS chưa? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "✅ CORS updated!"
    echo "Remember to rebuild and redeploy backend!"
fi

# Bước 6: Test
echo ""
echo "=================================================="
echo "✅ SSL Setup Complete!"
echo "=================================================="
echo ""
echo "🔗 Test URLs:"
echo "   HTTP:  http://$DOMAIN/graphql"
echo "   HTTPS: https://$DOMAIN/graphql"
echo ""
echo "📊 Verify SSL:"
echo "   https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN"
echo ""
echo "🔄 Next Steps:"
echo "   1. Test GraphQL endpoint: https://$DOMAIN/graphql"
echo "   2. Update frontend .env.tazagroup:"
echo "      NEXT_PUBLIC_GRAPHQL_ENDPOINT=https://$DOMAIN/graphql"
echo "   3. Rebuild frontend: ./build-frontend.sh"
echo "   4. Deploy: ./deploy.sh"
echo ""
