# 🎉 MinIO Domain Migration - Hoàn Thành!

> **Trạng thái:** ✅ Đã cập nhật code và cấu hình hoàn toàn  
> **Cần làm tiếp:** Cấu hình server infrastructure (Nginx/Caddy, DNS, SSL)

---

## 📌 Tóm Tắt Nhanh

Đã migrate MinIO từ **IP:port** sang **domain với HTTPS**:

```diff
- http://116.118.49.243:12007/rausach-uploads/file.jpg
+ https://storage.rausachtrangia.com/rausach-uploads/file.jpg
```

**Lợi ích:**
- ✅ Bảo mật HTTPS với SSL certificate
- ✅ URL sạch đẹp (không hiển thị port :443)
- ✅ Dễ maintain, thay đổi infrastructure
- ✅ SEO tốt hơn
- ✅ Không còn mixed content warning

---

## 🚀 3 Bước Để Chạy

### Bước 1: Setup Infrastructure (5 phút)
```bash
./setup-storage-domain.sh
```
Script này sẽ tự động:
- Cài đặt và config Nginx/Caddy
- Lấy SSL certificate từ Let's Encrypt
- Test cấu hình

**Hoặc làm thủ công:**
1. Config DNS: `storage.rausachtrangia.com → 116.118.49.243`
2. Setup Nginx (xem `SETUP_STORAGE_DOMAIN.md`)
3. Lấy SSL: `sudo certbot --nginx -d storage.rausachtrangia.com`

### Bước 2: Restart Services (1 phút)
```bash
pm2 restart all
```

### Bước 3: Migrate & Test (2 phút)
```bash
# Migrate URLs trong database
bun run scripts/migrate-storage-domain.ts

# Test toàn bộ
./test-storage-domain.sh
```

---

## 📁 Files Đã Tạo

### 1. Scripts (3 files)
- ✅ `setup-storage-domain.sh` - Interactive setup script (Nginx/Caddy/SSL)
- ✅ `test-storage-domain.sh` - Test script (7 tests)
- ✅ `scripts/migrate-storage-domain.ts` - Database migration

### 2. Documentation (3 files)
- ✅ `QUICK_REFERENCE_DOMAIN.md` - Quick reference (1 page)
- ✅ `MINIO_DOMAIN_MIGRATION_COMPLETE.md` - Complete guide (detailed)
- ✅ `SETUP_STORAGE_DOMAIN.md` - Infrastructure setup (400+ lines)

### 3. Code Changes
- ✅ 9+ `.env` files updated với domain config
- ✅ `backend/src/services/minio.service.ts` - Smart port detection
- ✅ `backend/src/minio/minio.service.ts` - Smart port detection

---

## 🎯 Quick Commands

```bash
# Setup toàn bộ (interactive)
./setup-storage-domain.sh

# Restart services
pm2 restart all

# Migrate database
bun run scripts/migrate-storage-domain.ts

# Test
./test-storage-domain.sh

# Check logs
pm2 logs backend
pm2 logs frontend
sudo tail -f /var/log/nginx/storage.rausachtrangia.com.access.log
```

---

## 📚 Đọc Thêm

### Quick Start (Ngắn gọn)
👉 `QUICK_REFERENCE_DOMAIN.md` - 1 trang, đủ thông tin cần thiết

### Complete Guide (Chi tiết)
👉 `MINIO_DOMAIN_MIGRATION_COMPLETE.md` - Đầy đủ, step-by-step, troubleshooting

### Infrastructure Setup (Kỹ thuật)
👉 `SETUP_STORAGE_DOMAIN.md` - Nginx/Caddy config, SSL, security, monitoring

---

## ✅ Checklist

**Code & Config (Hoàn thành):**
- [x] Cập nhật 9+ file .env với domain config
- [x] Implement smart port detection (ẩn :443)
- [x] Fix inconsistencies (bucket names, access keys)
- [x] Tạo migration script cho database
- [x] Tạo setup và test scripts
- [x] Verify no compilation errors

**Infrastructure (Cần làm):**
- [ ] Config DNS record: `storage.rausachtrangia.com → 116.118.49.243`
- [ ] Setup Nginx hoặc Caddy reverse proxy
- [ ] Lấy SSL certificate (Let's Encrypt)
- [ ] Test domain access
- [ ] Restart backend/frontend services
- [ ] Run database migration
- [ ] Test upload qua admin panel

---

## 🔧 Troubleshooting Quick Tips

### DNS không resolve
```bash
nslookup storage.rausachtrangia.com
# Chưa resolve? Chờ 5-60 phút cho DNS propagation
```

### SSL certificate lỗi
```bash
sudo certbot certificates  # Check status
sudo certbot renew        # Renew nếu cần
```

### 502 Bad Gateway
```bash
curl http://116.118.49.243:12007/minio/health/live  # Check MinIO
sudo tail -f /var/log/nginx/error.log              # Check Nginx
pm2 restart all                                     # Restart app
```

### URLs cũ vẫn hiển thị
```bash
bun run scripts/migrate-storage-domain.ts  # Migrate database
pm2 restart all                           # Restart app
```

---

## 🎨 Technical Details

### Smart Port Detection
Code đã thêm vào MinIO services để ẩn port 443:

```typescript
const isDefaultPort = (protocol === 'https' && port === '443') || 
                      (protocol === 'http' && port === '80');
this.publicUrl = isDefaultPort 
  ? `${protocol}://${endpoint}` 
  : `${protocol}://${endpoint}:${port}`;
```

### URL Examples
```typescript
// Old: http://116.118.49.243:12007/rausach-uploads/image.jpg
// New: https://storage.rausachtrangia.com/rausach-uploads/image.jpg

// Port :443 được ẩn tự động!
```

### Architecture
```
Client → storage.rausachtrangia.com:443 (HTTPS)
       → Nginx/Caddy (SSL termination)
       → 116.118.49.243:12007 (MinIO internal)
```

---

## 📞 Need Help?

1. **Quick issues:** Check `QUICK_REFERENCE_DOMAIN.md`
2. **Setup help:** See `SETUP_STORAGE_DOMAIN.md`
3. **Full guide:** Read `MINIO_DOMAIN_MIGRATION_COMPLETE.md`
4. **Check logs:**
   ```bash
   pm2 logs
   sudo tail -f /var/log/nginx/*.log
   ```

---

## 🎯 Next Action

**Bắt đầu ngay:**
```bash
./setup-storage-domain.sh
```

Hoặc đọc setup guide trước:
```bash
cat QUICK_REFERENCE_DOMAIN.md
# Hoặc
cat SETUP_STORAGE_DOMAIN.md
```

---

**Version:** 1.0.0  
**Status:** ✅ Code Complete - Ready for Infrastructure Setup  
**Last Updated:** 2025-01-21
