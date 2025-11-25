# 🚀 VTTECH API Server - Hướng dẫn sử dụng

## 📋 Mô tả

Server Node.js proxy để gọi API VTTECH một cách an toàn, tránh CORS issues và quản lý credentials tốt hơn.

## 📦 Cài đặt

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Chạy server

**Development (với hot reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Server sẽ khởi động tại: `http://localhost:3001`

## 🔗 API Endpoints

### 1. Health Check
```
GET /api/health
```

**Response:**
```json
{
  "status": "OK",
  "message": "VTTECH Server is running"
}
```

---

## 🔗 API Endpoints

### 1. Health Check
```
GET /api/health
```

**Response:**
```json
{
  "status": "OK",
  "message": "VTTECH Server is running"
}
```

---

### 2. Xác Thực Thông Tin Đăng Nhập
```
POST /api/verify-credentials
Content-Type: application/json

Body:
{
  "cookie": "your_cookie_here",
  "xsrfToken": "your_token_here"
}
```

**Response (Thành công):**
```json
{
  "success": true,
  "valid": true,
  "message": "Credentials are valid",
  "status": 200,
  "timestamp": "2025-10-25T12:00:00.000Z"
}
```

---

### 3. Tải Dữ Liệu Nhân Viên
```
POST /api/employees
Content-Type: application/json

Body:
{
  "cookie": "your_cookie_here",
  "xsrfToken": "your_token_here"
}
```

---

### 4. Tải Dữ Liệu Nhóm Nhân Viên
```
POST /api/employee-groups
Content-Type: application/json

Body:
{
  "cookie": "your_cookie_here",
  "xsrfToken": "your_token_here"
}
```

---

### 5. Tải Loại Người Dùng
```
POST /api/user-types
Content-Type: application/json

Body:
{
  "cookie": "your_cookie_here",
  "xsrfToken": "your_token_here"
}
```

---

### 6. Tải Dữ Liệu Người Dùng
```
POST /api/users
Content-Type: application/json

Body:
{
  "cookie": "your_cookie_here",
  "xsrfToken": "your_token_here"
}
```

---

### 7. Tải Menu Quyền
```
POST /api/permissions-menu
Content-Type: application/json

Body:
{
  "cookie": "your_cookie_here",
  "xsrfToken": "your_token_here"
}
```

---

### 8. Tải Hàm Quyền
```
POST /api/permission-functions
Content-Type: application/json

Body:
{
  "cookie": "your_cookie_here",
  "xsrfToken": "your_token_here"
}
```

---

### 9. Tải Quyền Menu Theo Nhóm
```
POST /api/menu-allow-group
Content-Type: application/json

Body:
{
  "cookie": "your_cookie_here",
  "xsrfToken": "your_token_here"
}
```

---

### 10. Tải Dữ Liệu Khách Hàng (Legacy)
```
POST /api/customers
Content-Type: application/json

Body:
{
  "cookie": "your_cookie_here",
  "xsrfToken": "your_token_here"
}
```

---

## 🌐 HTML Clients

### 1. Giao Diện Quản Lý Nhân Viên Pro
File `nhanvienvttech-pro.html` có thể truy cập tại:
```
http://localhost:3001/nhanvienvttech-pro.html
```

**Features:**
- ✅ Giao diện chuyên nghiệp (Dark Mode)
- ✅ 7 Module quản lý (Nhân viên, Nhóm NV, Loại User, Người dùng, Quyền, Hàm, Menu)
- ✅ Tải dữ liệu nhanh từ tất cả endpoint
- ✅ Hiển thị dữ liệu dạng bảng với phân trang
- ✅ Xuất dữ liệu ra JSON
- ✅ Lưu Cookie & Token vào localStorage
- ✅ Xử lý lỗi tốt với thông báo rõ ràng

### 2. Giao Diện Khác Hàng (Legacy)
File `nhanvienvttech.html` có thể truy cập tại:
```
http://localhost:3001/nhanvienvttech.html
```

**Features:**
- ✅ Lưu Cookie & Xsrf-Token vào localStorage
- ✅ Xác thực credentials
- ✅ Tải dữ liệu khách hàng

---

## 🚀 Hướng Dẫn Sử Dụng

### 1. Lấy Cookie & Xsrf-Token

**Bước 1:** Mở trang VTTECH tại https://tmtaza.vttechsolution.com/

**Bước 2:** Đăng nhập vào hệ thống

**Bước 3:** Mở Developer Tools (F12)

**Bước 4:** Tìm Cookie:
- Tab "Application" → "Cookies" → "tmtaza.vttechsolution.com"
- Copy toàn bộ Cookie value (thường bắt đầu với `ASP.NET_SessionId=...`)

**Bước 5:** Tìm Xsrf-Token:
- Tab "Network"
- Làm refresh trang hoặc gửi một request
- Chọn request POST bất kỳ
- Kiếm trong "Request Headers" → Xsrf-Token

### 2. Sử Dụng Giao Diện

1. Mở `nhanvienvttech-pro.html` hoặc `nhanvienvttech.html`
2. Dán Cookie vào ô "Cookie"
3. Dán Xsrf-Token vào ô "Xsrf-Token"
4. Chọn Tab muốn xem
5. Nhấn "Tải dữ liệu"
6. Dữ liệu sẽ hiển thị dạng bảng
7. Có thể download JSON bằng nút "Tải JSON"

---

## 🛠️ Testing API

### Sử dụng cURL:

```bash
# Health check
curl -X GET http://localhost:3001/api/health

# Xác thực
curl -X POST http://localhost:3001/api/verify-credentials \
  -H "Content-Type: application/json" \
  -d '{
    "cookie": "YOUR_COOKIE",
    "xsrfToken": "YOUR_TOKEN"
  }'

# Tải nhân viên
curl -X POST http://localhost:3001/api/employees \
  -H "Content-Type: application/json" \
  -d '{
    "cookie": "YOUR_COOKIE",
    "xsrfToken": "YOUR_TOKEN"
  }'
```

---

## 📊 Cấu Trúc Dữ Liệu

Tất cả endpoint trả về format chung:

```json
{
  "success": true/false,
  "data": [...],
  "status": 200,
  "timestamp": "2025-10-25T12:00:00.000Z"
}
```

---

## ⚙️ Cấu Hình

### Port
Default: `3001` (có thể thay đổi bằng biến môi trường `PORT`)

```bash
PORT=3002 npm start
```

### Environment Variables (`.env`)
```
PORT=3001
NODE_ENV=development
```

---

## 🔒 Bảo Mật

- ✅ CORS đã được kích hoạt
- ✅ Timeout 30 giây cho requests
- ✅ Xử lý lỗi toàn diện
- ✅ Cookie & Token lưu local (không server)

**Lưu ý:** Luôn cập nhật Cookie & Token vì chúng có thể hết hạn

---

## 📝 Logging

Server tự động log tất cả requests:
```
Fetching employees...
Verifying credentials...
Fetching employee groups...
```

---

## 🐛 Troubleshooting

| Vấn đề | Giải pháp |
|--------|----------|
| 405 Method Not Allowed | Kiểm tra Cookie/Token, request phải là POST |
| 401 Unauthorized | Cookie/Token hết hạn, lấy lại từ VTTECH |
| Connection refused | Server chưa khởi động, chạy `npm start` |
| CORS error | Đảm bảo request từ đúng domain |
| Timeout | Request quá lâu, kiểm tra kết nối internet |

---

## 📦 Dependencies

```json
{
  "express": "^4.18.2",
  "axios": "^1.6.0",
  "cors": "^2.8.5",
  "body-parser": "^1.20.2",
  "dotenv": "^16.3.1"
}
```

---

## 📄 License

Công cụ quản lý nhân sự VTTECH - Bản quyền riêng

---

## 👨‍💻 Support

Nếu có vấn đề, kiểm tra:
1. Cookie & Token có còn hạn không
2. Network connection
3. Server logs (console)
4. Browser console (F12)
- ✅ Tải dữ liệu khách hàng
- ✅ Hiển thị kết quả dưới dạng JSON
- ✅ Xử lý lỗi thân thiện với người dùng

---

## 🔐 Lấy Cookie & Xsrf-Token

1. **Mở VTTECH website**: https://tmtaza.vttechsolution.com
2. **Mở DevTools**: Nhấn `F12`
3. **Lấy Cookie**:
   - Vào tab `Application` → `Cookies`
   - Chọn domain `tmtaza.vttechsolution.com`
   - Copy toàn bộ giá trị cookie

4. **Lấy Xsrf-Token**:
   - Vào tab `Network`
   - Làm hành động nào đó (tìm kiếm, load dữ liệu, v.v.)
   - Tìm POST request
   - Vào tab `Headers` → `Request Headers`
   - Tìm `Xsrf-Token` header
   - Copy giá trị

---

## 🛠️ Configuration

Edit file `.env` để thay đổi cấu hình:

```env
PORT=3001                              # Port của server
NODE_ENV=development                   # Environment
VTTECH_API_URL=https://tmtaza...      # URL của VTTECH API
REQUEST_TIMEOUT=30000                  # Timeout (ms)
```

---

## 📊 Curl Examples

### Test health check:
```bash
curl http://localhost:3001/api/health
```

### Test fetch customers:
```bash
curl -X POST http://localhost:3001/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "cookie": "YOUR_COOKIE",
    "xsrfToken": "YOUR_XSRF_TOKEN"
  }'
```

### Test verify credentials:
```bash
curl -X POST http://localhost:3001/api/verify-credentials \
  -H "Content-Type: application/json" \
  -d '{
    "cookie": "YOUR_COOKIE",
    "xsrfToken": "YOUR_XSRF_TOKEN"
  }'
```

---

## 🐛 Troubleshooting

### Server không khởi động
- Kiểm tra port 3001 có bị chiếm không: `lsof -i :3001`
- Thay đổi PORT trong `.env`

### Connection refused
- Đảm bảo server đang chạy
- Kiểm tra firewall/antivirus

### Invalid credentials error
- Cookie/Xsrf-Token có thể hết hạn
- Đăng nhập lại VTTECH
- Lấy cookie mới

### CORS errors
- Server đã bật CORS mặc định
- Kiểm tra `CORS_ORIGIN` trong `.env`

---

## 📚 Dependencies

- **express**: Web framework
- **axios**: HTTP client
- **cors**: CORS middleware
- **body-parser**: Parse request body
- **dotenv**: Environment variables

---

## 🚀 Deploy

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3001
CMD ["npm", "start"]
```

### Build & Run
```bash
docker build -t vttech-server .
docker run -p 3001:3001 vttech-server
```

---

## 📝 License

MIT

---

## 👨‍💻 Support

Nếu có vấn đề, vui lòng kiểm tra:
1. Console log của server
2. DevTools Network tab
3. Browser console cho client errors


enpoint
nhân viên : https://tmtaza.vttechsolution.com/Employee/EmployeeList/?handler=LoadataEmployee
nhóm nhân viên : https://tmtaza.vttechsolution.com/Employee/EmployeeList/?handler=LoadataEmployeeGroup
user : https://tmtaza.vttechsolution.com/Employee/UserList/?handler=LoadataUserType
https://tmtaza.vttechsolution.com/Employee/UserList/?handler=LoaddataUser
phân quyền  :  https://tmtaza.vttechsolution.com/api/Permission/Permission_LoadListMenu
https://tmtaza.vttechsolution.com/Permission/PermissionGeneral/?handler=LoadFunction
https://tmtaza.vttechsolution.com/Permission/MenuAllowGroup/?handler=LoadData