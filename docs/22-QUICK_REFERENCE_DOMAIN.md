# ⚡ Quick Reference - MinIO Domain Migration

## 📋 TL;DR

```bash
# 1. Setup infrastructure (Nginx/Caddy + SSL)
./setup-storage-domain.sh

# 2. Restart services
pm2 restart all

# 3. Migrate database
bun run scripts/migrate-storage-domain.ts

# 4. Test everything
./test-storage-domain.sh
```

---

## 🎯 What Changed

| Before | After |
|--------|-------|
| `http://116.118.49.243:12007/rausach-uploads/file.jpg` | `https://storage.rausachtrangia.com/rausach-uploads/file.jpg` |
| HTTP, port exposed, IP address | HTTPS, no port, clean domain |

---

## ✅ Files Modified

**Environment Files (9+):**
- `.env`, `.env.rausach`, `.env.prod.rausach`
- `backend/.env`, `backend/.env.rausach`
- `frontend/.env`, `frontend/.env.rausach`, `frontend/.env.production.local`

**Code Files (2):**
- `backend/src/services/minio.service.ts` - Smart port detection
- `backend/src/minio/minio.service.ts` - Smart port detection

**New Files (5):**
- `scripts/migrate-storage-domain.ts` - Database migration script
- `setup-storage-domain.sh` - Interactive setup script
- `test-storage-domain.sh` - Test script
- `SETUP_STORAGE_DOMAIN.md` - Comprehensive guide (400+ lines)
- `MINIO_DOMAIN_MIGRATION_COMPLETE.md` - Summary documentation

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Infrastructure (5 min)
```bash
# Run interactive setup
./setup-storage-domain.sh

# OR manually:
# - Configure DNS: storage.rausachtrangia.com → 116.118.49.243
# - Setup Nginx/Caddy (see SETUP_STORAGE_DOMAIN.md)
# - Get SSL certificate: sudo certbot --nginx -d storage.rausachtrangia.com
```

### Step 2: Restart Application (1 min)
```bash
pm2 restart all
# OR
./deploy.sh
```

### Step 3: Migrate & Test (2 min)
```bash
# Migrate existing URLs in database
bun run scripts/migrate-storage-domain.ts

# Test everything
./test-storage-domain.sh
```

---

## 🧪 Quick Tests

```bash
# DNS
nslookup storage.rausachtrangia.com
# Should return: 116.118.49.243

# HTTP redirect
curl -I http://storage.rausachtrangia.com
# Should return: 301 or 302

# HTTPS access
curl -I https://storage.rausachtrangia.com
# Should return: 200 or 403

# SSL certificate
openssl s_client -connect storage.rausachtrangia.com:443
# Should show valid certificate

# Full test suite
./test-storage-domain.sh
```

---

## 🎨 Smart Port Detection

**Code added to MinIO services:**
```typescript
const isDefaultPort = (protocol === 'https' && port === '443') || 
                      (protocol === 'http' && port === '80');
this.publicUrl = isDefaultPort 
  ? `${protocol}://${endpoint}` 
  : `${protocol}://${endpoint}:${port}`;
```

**Result:**
- ✅ `https://storage.rausachtrangia.com/...` (clean!)
- ❌ Not: `https://storage.rausachtrangia.com:443/...`

---

## 📝 Configuration Reference

### Backend .env
```bash
MINIO_ENDPOINT=storage.rausachtrangia.com
MINIO_PORT=443
MINIO_PUBLIC_ENDPOINT=storage.rausachtrangia.com
MINIO_PUBLIC_PORT=443
MINIO_USE_SSL=true
MINIO_FORCE_HTTPS=true
MINIO_BUCKET_NAME=rausach-uploads
```

### Frontend .env
```bash
NEXT_PUBLIC_MINIO_ENDPOINT=https://storage.rausachtrangia.com
NEXT_PUBLIC_MINIO_PORT=443
NEXT_PUBLIC_MINIO_USE_SSL=true
```

---

## 🔧 Troubleshooting

### DNS not resolving
```bash
# Check DNS
nslookup storage.rausachtrangia.com

# If not resolving: wait 5-60 min for propagation
# Or check DNS provider configuration
```

### SSL certificate error
```bash
# Check certificate
sudo certbot certificates

# Renew
sudo certbot renew

# Test Nginx config
sudo nginx -t
```

### 502 Bad Gateway
```bash
# Check MinIO is running
curl http://116.118.49.243:12007/minio/health/live

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Restart services
pm2 restart all
```

### Old URLs still showing
```bash
# Run migration
bun run scripts/migrate-storage-domain.ts

# Clear cache
redis-cli FLUSHALL

# Restart
pm2 restart all
```

---

## 📊 Migration Script Output

```
🔄 Starting migration: Update MinIO URLs to storage domain...

📝 Migrating Blog Posts...
  ✅ Updated blog: "Post Title 1"
  ✅ Updated blog: "Post Title 2"
  📊 Blog posts updated: 15/50

🛍️  Migrating Products...
  ✅ Updated product: "Product Name"
  📊 Products updated: 8/20

👤 Migrating User Avatars...
  ✅ Updated user: "admin"
  📊 Users updated: 3/10

================================================================
📈 Migration Summary:
================================================================
   Total updated: 26
================================================================

✨ Migration completed successfully!
```

---

## 🔄 Rollback (If Needed)

```bash
# 1. Revert .env files
git checkout .env .env.rausach backend/.env frontend/.env
# OR manually set:
# MINIO_ENDPOINT=116.118.49.243
# MINIO_PORT=12007
# MINIO_USE_SSL=false

# 2. Restart services
pm2 restart all

# 3. Disable Nginx site (optional)
sudo rm /etc/nginx/sites-enabled/storage.rausachtrangia.com
sudo systemctl reload nginx
```

---

## 📚 Documentation

- **Quick Start:** This file
- **Complete Guide:** `MINIO_DOMAIN_MIGRATION_COMPLETE.md` (comprehensive, 400+ lines)
- **Infrastructure:** `SETUP_STORAGE_DOMAIN.md` (Nginx/Caddy configs, SSL, monitoring)
- **Migration Script:** `scripts/migrate-storage-domain.ts` (database URL updates)

---

## ✨ Benefits

1. **Security:** HTTPS encryption with valid SSL
2. **SEO:** Clean domain URLs
3. **UX:** Professional appearance
4. **Flexibility:** Easy infrastructure changes
5. **Performance:** No mixed content warnings
6. **Compliance:** Modern web standards

---

## 📞 Support

**Check Status:**
```bash
pm2 status
pm2 logs backend
pm2 logs frontend
sudo systemctl status nginx  # or caddy
```

**Check Logs:**
```bash
# Application
pm2 logs

# Nginx
sudo tail -f /var/log/nginx/storage.rausachtrangia.com.access.log
sudo tail -f /var/log/nginx/error.log

# Caddy
sudo tail -f /var/log/caddy/storage.rausachtrangia.com.log
```

**Still Issues?**
See troubleshooting sections in:
- `MINIO_DOMAIN_MIGRATION_COMPLETE.md`
- `SETUP_STORAGE_DOMAIN.md`

---

**Status:** ✅ Code Complete - Ready for Infrastructure Setup

**Migration:** v1.0.0
