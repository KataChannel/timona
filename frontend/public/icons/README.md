# ⚠️ QUAN TRỌNG: Cần thêm icon files

Hệ thống push notification cần các icon files sau:

```
frontend/public/icons/
├── icon-192x192.png    # Icon chính (192x192px)
├── icon-512x512.png    # Icon lớn (512x512px)
└── badge-72x72.png     # Badge nhỏ (72x72px)
```

## Cách tạo icons:

### **Option 1: Sử dụng logo có sẵn**
Nếu có logo, resize thành 3 kích thước trên và lưu vào `frontend/public/icons/`

### **Option 2: Tạo placeholder đơn giản**
Tạo 3 file PNG đơn giản với:
- Background: Màu brand (ví dụ: #3B82F6)
- Nội dung: Logo hoặc icon bell 🔔
- Kích thước: 192x192, 512x512, 72x72

### **Option 3: Online tool**
1. Vào https://favicon.io/favicon-generator/
2. Tạo icon với text/emoji
3. Download và rename files

### **Option 4: Copy từ assets**
```bash
# Nếu có assets/logo.png
cd frontend/public
convert assets/logo.png -resize 192x192 icons/icon-192x192.png
convert assets/logo.png -resize 512x512 icons/icon-512x512.png
convert assets/logo.png -resize 72x72 icons/badge-72x72.png
```

## Sau khi thêm icons:

Hệ thống push notification sẽ tự động sử dụng các icons này cho:
- Native OS notifications
- PWA install icon
- Notification badge

---

**Note:** Hiện tại push notification vẫn hoạt động, nhưng sẽ dùng default browser icon nếu files không tồn tại.
