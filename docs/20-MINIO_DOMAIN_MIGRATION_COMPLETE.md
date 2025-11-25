# MinIO Domain Migration - Complete ✅

## 🎯 Tóm Tắt

Đã hoàn thành migration MinIO từ IP:port sang domain:
- **From:** `http://116.118.49.243:12007`
- **To:** `https://storage.rausachtrangia.com`

## ✅ Đã Hoàn Thành (100%)

### 1. Code & Configuration Updates
- ✅ Cập nhật 9+ file `.env` (root, backend, frontend)
- ✅ Enhanced MinIO services với smart port detection (ẩn :443)
- ✅ Sửa inconsistencies (bucket names, access keys)
- ✅ Verify no compilation errors

### 2. Infrastructure Documentation
- ✅ Tạo `SETUP_STORAGE_DOMAIN.md` (400+ lines)
- ✅ Nginx configuration với SSL, CORS, security headers
- ✅ Caddy configuration (alternative)
- ✅ Let's Encrypt SSL setup guide
- ✅ DNS configuration instructions
- ✅ Testing procedures
- ✅ Rollback plan

### 3. Migration Script
- ✅ Tạo `scripts/migrate-storage-domain.ts`
- ✅ Migrate blog posts (content, excerpt, featuredImage, images)
- ✅ Migrate products (images, thumbnailUrl, description)
- ✅ Migrate user avatars
- ✅ Support both HTTP and HTTPS old URLs

## 🚀 Các Bước Tiếp Theo (User Action Required)

### Bước 1: Cấu Hình Server Infrastructure ⚠️ QUAN TRỌNG

#### Option A: Nginx (Recommended)
```bash
# 1. Cài đặt Nginx (nếu chưa có)
sudo apt update
sudo apt install nginx

# 2. Tạo config file
sudo nano /etc/nginx/sites-available/storage.rausachtrangia.com

# 3. Copy config từ SETUP_STORAGE_DOMAIN.md vào file
# (Xem section "Nginx Configuration" trong file đó)

# 4. Enable site
sudo ln -s /etc/nginx/sites-available/storage.rausachtrangia.com /etc/nginx/sites-enabled/

# 5. Test config
sudo nginx -t

# 6. Reload Nginx
sudo systemctl reload nginx
```

#### Option B: Caddy (Easier SSL)
```bash
# 1. Cài đặt Caddy
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy

# 2. Tạo Caddyfile
sudo nano /etc/caddy/Caddyfile

# 3. Copy config từ SETUP_STORAGE_DOMAIN.md
# (Xem section "Caddy Configuration")

# 4. Reload Caddy
sudo systemctl reload caddy
```

### Bước 2: Cấu Hình DNS 🌐

Vào DNS provider (CloudFlare, GoDaddy, etc.) và thêm A record:

```
Type: A
Name: storage
Value: 116.118.49.243
TTL: 3600 (1 hour)
```

Hoặc CNAME nếu muốn:
```
Type: CNAME
Name: storage
Value: rausachtrangia.com
TTL: 3600
```

**Chờ DNS propagation:** 5-60 phút

**Test DNS:**
```bash
# Check DNS resolution
nslookup storage.rausachtrangia.com
dig storage.rausachtrangia.com

# Should return: 116.118.49.243
```

### Bước 3: Cài Đặt SSL Certificate 🔒

#### Với Nginx:
```bash
# 1. Cài đặt Certbot
sudo apt install certbot python3-certbot-nginx

# 2. Lấy certificate (tự động config Nginx)
sudo certbot --nginx -d storage.rausachtrangia.com

# 3. Test auto-renewal
sudo certbot renew --dry-run
```

#### Với Caddy:
Caddy tự động lấy SSL certificate! Không cần làm gì thêm.

### Bước 4: Restart Application Services 🔄

```bash
# Change to project directory
cd /mnt/chikiet/kataoffical/shoprausach

# Option A: Restart via PM2
pm2 restart all

# Option B: Full rebuild
./deploy.sh

# Check status
pm2 status
pm2 logs
```

### Bước 5: Run Database Migration 💾

Migrate existing URLs trong database:

```bash
cd /mnt/chikiet/kataoffical/shoprausach
bun run scripts/migrate-storage-domain.ts
```

**Output mong đợi:**
```
🔄 Starting migration: Update MinIO URLs to storage domain...

📝 Migrating Blog Posts...
  ✅ Updated blog: "Post Title 1"
  ✅ Updated blog: "Post Title 2"
  📊 Blog posts updated: 15/50

🛍️  Migrating Products...
  ✅ Updated product: "Product Name 1"
  📊 Products updated: 8/20

👤 Migrating User Avatars...
  ✅ Updated user: "admin"
  📊 Users updated: 3/10

================================================================
📈 Migration Summary:
================================================================
   Blog posts checked: 50
   Users checked: 10
   Total updated: 26
================================================================

✨ Migration completed successfully!
```

### Bước 6: Test End-to-End 🧪

#### Test 1: HTTP → HTTPS Redirect
```bash
curl -I http://storage.rausachtrangia.com
# Should return: 301 Moved Permanently
# Location: https://storage.rausachtrangia.com/
```

#### Test 2: SSL Certificate
```bash
curl -I https://storage.rausachtrangia.com
# Should return: 200 OK
# Without SSL errors

openssl s_client -connect storage.rausachtrangia.com:443
# Should show valid certificate
```

#### Test 3: MinIO Access
```bash
# Test bucket access
curl -I https://storage.rausachtrangia.com/rausach-uploads/
# Should return: 200 OK or 403 (depending on bucket policy)
```

#### Test 4: Upload Image via Admin Panel
1. Login to admin: `https://shop.rausachtrangia.com/admin`
2. Go to Blog → Create Post
3. Upload image via editor
4. Check generated URL in HTML Source Code:
   - ✅ Should be: `https://storage.rausachtrangia.com/rausach-uploads/...`
   - ❌ Not: `http://116.118.49.243:12007/...`
   - ❌ Not: `https://storage.rausachtrangia.com:443/...` (no port!)

#### Test 5: Browser Console
1. Open frontend: `https://shop.rausachtrangia.com`
2. Open browser DevTools (F12) → Console
3. Check for mixed content warnings:
   - ✅ No warnings
   - ❌ If warnings: check URLs in HTML, may need to re-run migration

## 📊 Chi Tiết Thay Đổi

### Environment Files Updated (9+)

#### Root Level:
- `.env` - Main production
- `.env.rausach` - Rausach development
- `.env.prod.rausach` - Rausach production

#### Backend:
- `backend/.env` - Backend main
- `backend/.env.rausach` - Backend Rausach

#### Frontend:
- `frontend/.env` - Frontend main
- `frontend/.env.rausach` - Frontend Rausach
- `frontend/.env.production.local` - Frontend production override

### Standard Configuration Applied:

**Backend .env:**
```bash
MINIO_ENDPOINT=storage.rausachtrangia.com
MINIO_PORT=443
MINIO_PUBLIC_ENDPOINT=storage.rausachtrangia.com
MINIO_PUBLIC_PORT=443
MINIO_ACCESS_KEY=minio-admin
MINIO_SECRET_KEY=minio-secret-2025
MINIO_USE_SSL=true
MINIO_FORCE_HTTPS=true
MINIO_BUCKET_NAME=rausach-uploads
```

**Frontend .env:**
```bash
NEXT_PUBLIC_MINIO_ENDPOINT=https://storage.rausachtrangia.com
NEXT_PUBLIC_MINIO_PORT=443
NEXT_PUBLIC_MINIO_USE_SSL=true
```

### Code Changes:

#### File: `backend/src/services/minio.service.ts`
**Smart Port Detection:**
```typescript
// Don't include port if using default (80 for HTTP, 443 for HTTPS)
const isDefaultPort = (protocol === 'https' && publicPort === '443') || 
                      (protocol === 'http' && publicPort === '80');
this.publicUrl = isDefaultPort 
  ? `${protocol}://${publicEndpoint}` 
  : `${protocol}://${publicEndpoint}:${publicPort}`;
```

**Result:**
- ✅ `https://storage.rausachtrangia.com/rausach-uploads/file.jpg`
- ❌ Not: `https://storage.rausachtrangia.com:443/rausach-uploads/file.jpg`

#### File: `backend/src/minio/minio.service.ts`
Same smart port detection applied to `getPublicUrl()` method.

## 🔍 Monitoring & Verification

### Check Nginx Logs:
```bash
# Access logs
sudo tail -f /var/log/nginx/storage.rausachtrangia.com.access.log

# Error logs
sudo tail -f /var/log/nginx/storage.rausachtrangia.com.error.log
```

### Check SSL Status:
```bash
# Certificate expiry
sudo certbot certificates

# SSL details
openssl s_client -connect storage.rausachtrangia.com:443 -servername storage.rausachtrangia.com
```

### Check Application Logs:
```bash
pm2 logs backend
pm2 logs frontend

# Look for MinIO URL logs:
# "MinIO Public URL: https://storage.rausachtrangia.com"
```

### Check MinIO Service:
```bash
# Internal access (on server)
curl http://116.118.49.243:12007/minio/health/live

# Public access (via domain)
curl https://storage.rausachtrangia.com/minio/health/live
```

## 🎯 Success Criteria

- ✅ Domain `storage.rausachtrangia.com` resolves to `116.118.49.243`
- ✅ HTTPS works with valid SSL certificate
- ✅ HTTP redirects to HTTPS
- ✅ MinIO accessible via domain
- ✅ File uploads generate clean URLs (no `:443`)
- ✅ Images display on frontend without mixed content warnings
- ✅ CORS headers present in responses
- ✅ No compilation or runtime errors
- ✅ Database URLs migrated (if ran script)

## 🔄 Rollback Plan

Nếu có vấn đề, rollback về IP:port:

```bash
# 1. Revert .env files
cd /mnt/chikiet/kataoffical/shoprausach

# Root
cat > .env.backup <<'EOF'
MINIO_ENDPOINT=116.118.49.243
MINIO_PORT=12007
MINIO_PUBLIC_ENDPOINT=116.118.49.243
MINIO_PUBLIC_PORT=12007
MINIO_USE_SSL=false
MINIO_FORCE_HTTPS=false
EOF

# Apply to all .env files
# (or use git: git checkout .env .env.rausach backend/.env frontend/.env)

# 2. Restart services
pm2 restart all

# 3. Disable Nginx site (optional)
sudo rm /etc/nginx/sites-enabled/storage.rausachtrangia.com
sudo systemctl reload nginx

# 4. Test with old URLs
curl http://116.118.49.243:12007/minio/health/live
```

## 📚 Tài Liệu Tham Khảo

- **Infrastructure Setup:** `SETUP_STORAGE_DOMAIN.md` (400+ lines, comprehensive guide)
- **Migration Script:** `scripts/migrate-storage-domain.ts`
- **Original Requests:** RichTextEditor updates, Blog validation fixes, Mixed content fixes

## 🎨 Benefits of Domain Migration

1. **Security:** HTTPS encryption, valid SSL certificates
2. **SEO:** Clean domain URLs better for search engines
3. **UX:** Professional appearance (`storage.rausachtrangia.com` vs `116.118.49.243:12007`)
4. **Flexibility:** Easy to change backend infrastructure without breaking URLs
5. **Compliance:** HTTPS required for modern web standards
6. **Performance:** No mixed content warnings, faster page loads
7. **Maintainability:** Centralized configuration, easier to manage

## ⚠️ Important Notes

1. **MinIO Internal:** MinIO vẫn chạy trên `116.118.49.243:12007` (internal)
2. **Proxy Layer:** Nginx/Caddy proxy từ domain → MinIO
3. **SSL Termination:** SSL ở proxy level, MinIO communication là HTTP (internal network)
4. **Port 443:** Không hiển thị trong URLs (smart detection)
5. **Firewall:** MinIO port 12007 chỉ accept từ localhost/internal (security)

## 🚨 Troubleshooting

### Issue: Domain không resolve
```bash
# Check DNS
nslookup storage.rausachtrangia.com
# If không resolve → chưa config DNS hoặc chờ propagation
```

### Issue: SSL Certificate Error
```bash
# Check certificate
sudo certbot certificates

# Renew if needed
sudo certbot renew

# Check Nginx config
sudo nginx -t
```

### Issue: 502 Bad Gateway
```bash
# Check MinIO service
curl http://116.118.49.243:12007/minio/health/live

# Check Nginx upstream
sudo tail -f /var/log/nginx/error.log

# Restart MinIO if needed
docker restart minio  # or PM2 if running via PM2
```

### Issue: CORS Errors
```bash
# Check CORS headers in response
curl -I -H "Origin: https://shop.rausachtrangia.com" \
  https://storage.rausachtrangia.com/rausach-uploads/test.jpg

# Should see:
# Access-Control-Allow-Origin: *
# Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
```

### Issue: Old URLs Still Showing
```bash
# Run migration script
bun run scripts/migrate-storage-domain.ts

# Clear cache (if using Redis)
redis-cli FLUSHALL

# Restart application
pm2 restart all
```

## 📞 Support

Nếu gặp vấn đề:
1. Check logs: `pm2 logs`, `sudo tail -f /var/log/nginx/*.log`
2. Verify DNS: `nslookup storage.rausachtrangia.com`
3. Test SSL: `openssl s_client -connect storage.rausachtrangia.com:443`
4. Check MinIO: `curl http://116.118.49.243:12007/minio/health/live`
5. Review `SETUP_STORAGE_DOMAIN.md` troubleshooting section

---

**Migration Status:** ✅ CODE COMPLETE - Ready for Infrastructure Setup

**Last Updated:** 2025-01-XX
**Version:** 1.0.0
