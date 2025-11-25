# Cấu Hình Domain storage.rausachtrangia.com cho MinIO

## 📋 Tổng Quan

Domain **storage.rausachtrangia.com** được cấu hình để proxy requests đến MinIO server chạy trên port 12007.

### Cấu Trúc:
```
Client Request (HTTPS)
    ↓
storage.rausachtrangia.com:443
    ↓
Nginx/Caddy Reverse Proxy (SSL Termination)
    ↓
MinIO Server: 116.118.49.243:12007 (HTTP internal)
```

---

## 🔧 Cấu Hình Nginx

### File: `/etc/nginx/sites-available/storage.rausachtrangia.com`

```nginx
# MinIO Storage Domain Configuration
upstream minio_backend {
    server 116.118.49.243:12007;
    keepalive 32;
}

server {
    listen 80;
    server_name storage.rausachtrangia.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name storage.rausachtrangia.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/storage.rausachtrangia.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/storage.rausachtrangia.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # CORS Headers for MinIO
    add_header Access-Control-Allow-Origin "*" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization" always;
    add_header Access-Control-Expose-Headers "Content-Length,Content-Range" always;

    # Handle preflight requests
    if ($request_method = 'OPTIONS') {
        add_header Access-Control-Allow-Origin "*";
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization";
        add_header Content-Type "text/plain; charset=utf-8";
        add_header Content-Length 0;
        return 204;
    }

    # Client Body Size (for large uploads)
    client_max_body_size 100M;
    client_body_buffer_size 128k;

    # Timeouts
    proxy_connect_timeout 300;
    proxy_send_timeout 300;
    proxy_read_timeout 300;
    send_timeout 300;

    # Proxy Configuration
    location / {
        proxy_pass http://minio_backend;
        proxy_http_version 1.1;
        
        # Headers
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        
        # WebSocket support (for MinIO Console)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Disable buffering for faster uploads
        proxy_buffering off;
        proxy_request_buffering off;
        
        # Connection reuse
        proxy_set_header Connection "";
    }

    # MinIO Console (optional - if you want to access console)
    location /minio/ {
        proxy_pass http://minio_backend/minio/;
        proxy_http_version 1.1;
        
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Logs
    access_log /var/log/nginx/storage.rausachtrangia.com.access.log;
    error_log /var/log/nginx/storage.rausachtrangia.com.error.log;
}
```

### Kích Hoạt Cấu Hình:

```bash
# 1. Tạo symbolic link
sudo ln -s /etc/nginx/sites-available/storage.rausachtrangia.com /etc/nginx/sites-enabled/

# 2. Test cấu hình
sudo nginx -t

# 3. Reload Nginx
sudo systemctl reload nginx
```

---

## 🔐 Cấu Hình SSL với Let's Encrypt

### Cài Đặt Certbot:

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
```

### Tạo SSL Certificate:

```bash
# Tự động cấu hình Nginx + SSL
sudo certbot --nginx -d storage.rausachtrangia.com

# Hoặc chỉ tạo certificate (manual config)
sudo certbot certonly --nginx -d storage.rausachtrangia.com
```

### Auto-Renewal:

```bash
# Test renewal
sudo certbot renew --dry-run

# Certbot tự động tạo cron job
# Kiểm tra:
sudo systemctl status certbot.timer
```

---

## 🎯 Cấu Hình Caddy (Alternative)

### File: `/etc/caddy/Caddyfile`

```caddy
# MinIO Storage Domain
storage.rausachtrangia.com {
    # Automatic HTTPS with Let's Encrypt
    
    # CORS
    header {
        Access-Control-Allow-Origin *
        Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
        Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization"
        Access-Control-Expose-Headers "Content-Length,Content-Range"
        
        # Security
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "SAMEORIGIN"
        X-XSS-Protection "1; mode=block"
    }
    
    # Handle OPTIONS requests
    @options {
        method OPTIONS
    }
    respond @options 204
    
    # Reverse proxy to MinIO
    reverse_proxy 116.118.49.243:12007 {
        # Headers
        header_up Host {host}
        header_up X-Real-IP {remote}
        header_up X-Forwarded-For {remote}
        header_up X-Forwarded-Proto {scheme}
        
        # Timeouts
        transport http {
            dial_timeout 30s
            response_header_timeout 30s
        }
    }
    
    # Logs
    log {
        output file /var/log/caddy/storage.rausachtrangia.com.log
        format json
    }
}
```

### Reload Caddy:

```bash
sudo systemctl reload caddy
```

---

## 🔧 Cấu Hình DNS

### Thêm DNS Record:

```dns
Type: A
Name: storage
Value: 116.118.49.243
TTL: 3600
```

Hoặc nếu dùng CNAME:

```dns
Type: CNAME
Name: storage
Value: rausachtrangia.com
TTL: 3600
```

### Kiểm Tra DNS:

```bash
# Check DNS propagation
nslookup storage.rausachtrangia.com
dig storage.rausachtrangia.com

# Test với curl
curl -I https://storage.rausachtrangia.com/health
```

---

## ✅ Kiểm Tra Cấu Hình

### 1. Test HTTP → HTTPS Redirect:

```bash
curl -I http://storage.rausachtrangia.com
# Expected: 301 redirect to https://
```

### 2. Test SSL Certificate:

```bash
curl -I https://storage.rausachtrangia.com
# Expected: 200 OK with valid SSL
```

### 3. Test MinIO Bucket Access:

```bash
# Test file access
curl -I https://storage.rausachtrangia.com/rausach-uploads/test.jpg

# Expected: 200 OK or 404 (if file doesn't exist)
```

### 4. Test CORS:

```bash
curl -X OPTIONS https://storage.rausachtrangia.com \
  -H "Origin: https://shop.rausachtrangia.com" \
  -H "Access-Control-Request-Method: GET" \
  -I

# Expected: 
# Access-Control-Allow-Origin: *
# Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
```

### 5. Test Upload (with credentials):

```bash
# Using MinIO client (mc)
mc alias set minio-storage https://storage.rausachtrangia.com minio-admin minio-secret-2025
mc ls minio-storage/rausach-uploads
```

---

## 🚀 Các Thay Đổi Code Đã Áp Dụng

### 1. Backend .env files:
```bash
MINIO_ENDPOINT=storage.rausachtrangia.com
MINIO_PORT=443
MINIO_PUBLIC_ENDPOINT=storage.rausachtrangia.com
MINIO_PUBLIC_PORT=443
MINIO_USE_SSL=true
MINIO_FORCE_HTTPS=true
```

### 2. Frontend .env files:
```bash
NEXT_PUBLIC_MINIO_ENDPOINT=https://storage.rausachtrangia.com
NEXT_PUBLIC_MINIO_PORT=443
NEXT_PUBLIC_MINIO_USE_SSL=true
```

### 3. MinIO Service Updates:
- ✅ Auto-detect port 443 và không thêm vào URL
- ✅ Force HTTPS trong production
- ✅ Support MINIO_PUBLIC_ENDPOINT override
- ✅ Logging improvements

---

## 🔒 Security Best Practices

### 1. Firewall Rules:

```bash
# Allow HTTPS only from outside
sudo ufw allow 443/tcp
sudo ufw deny 12007/tcp

# MinIO port chỉ accessible từ localhost/internal network
# Edit /etc/minio/config.json:
{
  "address": "127.0.0.1:12007"
}
```

### 2. MinIO Access Control:

```bash
# Restrict bucket policy
mc anonymous set download minio-storage/rausach-uploads
# NOT: mc anonymous set public minio-storage/rausach-uploads
```

### 3. Rate Limiting (Nginx):

```nginx
# Thêm vào http block
limit_req_zone $binary_remote_addr zone=minio_limit:10m rate=10r/s;

# Thêm vào location block
limit_req zone=minio_limit burst=20 nodelay;
```

---

## 📊 Monitoring

### Check Nginx Logs:

```bash
# Real-time access logs
sudo tail -f /var/log/nginx/storage.rausachtrangia.com.access.log

# Real-time error logs
sudo tail -f /var/log/nginx/storage.rausachtrangia.com.error.log

# Count requests by status code
awk '{print $9}' /var/log/nginx/storage.rausachtrangia.com.access.log | sort | uniq -c
```

### Check SSL Status:

```bash
# SSL Labs test
https://www.ssllabs.com/ssltest/analyze.html?d=storage.rausachtrangia.com

# Certificate info
openssl s_client -connect storage.rausachtrangia.com:443 -servername storage.rausachtrangia.com < /dev/null
```

---

## 🔄 Rollback Plan

Nếu cần rollback về IP cũ:

### 1. Update .env files:

```bash
MINIO_ENDPOINT=116.118.49.243
MINIO_PORT=12007
MINIO_USE_SSL=false
```

### 2. Restart services:

```bash
# Backend
cd /mnt/chikiet/kataoffical/shoprausach/backend
pm2 restart all

# Frontend
cd /mnt/chikiet/kataoffical/shoprausach/frontend
pm2 restart all
```

---

## 📞 Troubleshooting

### Issue: SSL Certificate Error

```bash
# Check certificate
sudo certbot certificates

# Renew manually
sudo certbot renew --force-renewal -d storage.rausachtrangia.com
```

### Issue: 502 Bad Gateway

```bash
# Check MinIO is running
curl http://116.118.49.243:12007/health

# Check Nginx upstream
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

### Issue: CORS Errors

```bash
# Test CORS headers
curl -I -X OPTIONS https://storage.rausachtrangia.com \
  -H "Origin: https://shop.rausachtrangia.com"

# Verify Nginx CORS config
sudo nginx -T | grep -A 20 "storage.rausachtrangia.com"
```

---

## ✨ Kết Quả Mong Đợi

Sau khi cấu hình hoàn tất:

✅ **URLs**:
- ❌ Old: `http://116.118.49.243:12007/rausach-uploads/file.jpg`
- ✅ New: `https://storage.rausachtrangia.com/rausach-uploads/file.jpg`

✅ **Benefits**:
- 🔒 HTTPS Secure (SSL/TLS)
- 🚫 No Mixed Content Warnings
- 🌐 Clean Domain Name
- ⚡ CDN-ready (Cloudflare compatible)
- 🛡️ Better Security (hidden port)
- 📈 Better SEO (secure URLs)

---

**Ngày tạo:** 2025-11-21  
**Version:** 1.0  
**Status:** ✅ Ready for Production
