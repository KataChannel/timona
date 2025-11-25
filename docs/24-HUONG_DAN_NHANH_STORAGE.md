# 🎯 HƯỚNG DẪN CẤU HÌNH STORAGE DOMAIN - NHANH

## ✅ Đã Kiểm Tra Xong
- ✅ DNS đã cấu hình: storage.rausachtrangia.com → 116.118.49.243
- ✅ MinIO đang chạy tốt trên port 12007
- ✅ Code đã update xong (9+ files .env + 2 service files)

---

## 🚀 BẮT ĐẦU NGAY - COPY & PASTE CÁC LỆNH SAU

### Bước 1: Cài đặt Nginx
```bash
sudo apt update && sudo apt install -y nginx
```

### Bước 2: Tạo cấu hình Nginx
```bash
sudo cp /mnt/chikiet/kataoffical/shoprausach/nginx-storage.conf /etc/nginx/sites-available/storage.rausachtrangia.com
```

### Bước 3: Kích hoạt site
```bash
sudo ln -sf /etc/nginx/sites-available/storage.rausachtrangia.com /etc/nginx/sites-enabled/
```

### Bước 4: Test cấu hình
```bash
sudo nginx -t
```
**Phải thấy:** `syntax is ok` và `test is successful`

### Bước 5: Reload Nginx
```bash
sudo systemctl reload nginx
```

### Bước 6: Cài đặt Certbot (SSL)
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Bước 7: Lấy SSL Certificate
```bash
sudo certbot --nginx -d storage.rausachtrangia.com
```

**Sẽ hỏi:**
- Email: Nhập email của bạn
- Agree to Terms: Nhập `Y`
- Share email: Nhập `N` hoặc `Y` (tùy ý)

### Bước 8: Test HTTPS
```bash
curl -I https://storage.rausachtrangia.com
```
**Phải thấy:** `HTTP/2 200` hoặc `403`

---

## ✨ HOÀN TẤT CẤU HÌNH

Sau khi hoàn thành 8 bước trên, chạy:

```bash
cd /mnt/chikiet/kataoffical/shoprausach
./finalize-storage-setup.sh
```

Script này sẽ:
1. Test HTTPS
2. Restart PM2 services
3. Migrate database URLs
4. Run full test suite

---

## 🧪 TEST NHANH

```bash
# Test DNS
nslookup storage.rausachtrangia.com

# Test HTTP redirect
curl -I http://storage.rausachtrangia.com

# Test HTTPS
curl -I https://storage.rausachtrangia.com

# Test full
./test-storage-domain.sh
```

---

## 📊 KẾT QUẢ MONG ĐỢI

**Trước:**
```
http://116.118.49.243:12007/rausach-uploads/image.jpg
```

**Sau:**
```
https://storage.rausachtrangia.com/rausach-uploads/image.jpg
```

✅ Không có port :443
✅ HTTPS với SSL hợp lệ
✅ Domain thay vì IP

---

## 🔧 NẾU CÓ LỖI

### Nginx test fail
```bash
# Xem chi tiết lỗi
sudo nginx -t

# Xem log
sudo tail -f /var/log/nginx/error.log
```

### Certbot fail
```bash
# Kiểm tra port 80 có bị chiếm không
sudo netstat -tulpn | grep :80

# Kiểm tra DNS
nslookup storage.rausachtrangia.com
```

### SSL không hoạt động
```bash
# Xem certificate
sudo certbot certificates

# Renew
sudo certbot renew --dry-run
```

---

## 📞 HỖ TRỢ

Xem chi tiết:
- `START_HERE_DOMAIN_MIGRATION.md` - Tổng quan
- `SETUP_STORAGE_DOMAIN.md` - Chi tiết kỹ thuật
- `MINIO_DOMAIN_MIGRATION_COMPLETE.md` - Đầy đủ

---

**Bắt đầu ngay:** Copy lệnh ở "Bước 1" và chạy! 🚀
