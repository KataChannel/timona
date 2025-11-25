# Hệ Thống Phê Duyệt Tài Liệu Và Khóa Học - Tóm Tắt Thay Đổi

## Tổng Quan

Đã triển khai quy trình phê duyệt cho giảng viên tạo tài liệu nguồn và khóa học. Tất cả nội dung được tạo ở trạng thái **DRAFT** và giảng viên có thể gửi yêu cầu phê duyệt cho admin thông qua **push notification**.

---

## 1. Thay Đổi Database Schema

### **SourceDocument Model** (Tài liệu nguồn)
Thêm các trường mới:
- `approvalRequested` (Boolean): Đánh dấu yêu cầu phê duyệt
- `approvalRequestedAt` (DateTime): Thời gian gửi yêu cầu
- `approvalRequestedBy` (String): ID người gửi yêu cầu
- `approvedBy` (String): ID admin phê duyệt
- `approvedAt` (DateTime): Thời gian phê duyệt
- `rejectionReason` (Text): Lý do từ chối (nếu có)

### **Course Model** (Khóa học)
Thêm các trường tương tự:
- `approvalRequested` (Boolean)
- `approvalRequestedAt` (DateTime)
- `approvedBy` (String)
- `approvedAt` (DateTime)
- `rejectionReason` (Text)

**File thay đổi:** `backend/prisma/schema.prisma`

---

## 2. Backend - GraphQL API

### **Source Document Service**
Thêm 3 phương thức mới:

1. **`requestApproval(documentId, userId)`**
   - Giảng viên gửi yêu cầu phê duyệt
   - Gửi notification và push notification cho tất cả admin
   - Validate: chỉ tài liệu DRAFT mới được gửi

2. **`approveDocument(documentId, adminUserId)`**
   - Admin phê duyệt tài liệu
   - Chuyển status từ DRAFT → PUBLISHED
   - Lưu thông tin admin và thời gian phê duyệt

3. **`rejectDocument(documentId, adminUserId, reason)`**
   - Admin từ chối tài liệu
   - Reset trạng thái yêu cầu
   - Lưu lý do từ chối

**File thay đổi:** 
- `backend/src/lms/source-document/source-document.service.ts`
- `backend/src/lms/source-document/source-document.resolver.ts`
- `backend/src/lms/source-document/source-document.module.ts`
- `backend/src/lms/source-document/entities/source-document.entity.ts`

### **Course Service**
Thêm 3 phương thức tương tự:

1. **`requestApproval(courseId, userId)`**
   - Giảng viên gửi yêu cầu phê duyệt
   - Validate: khóa học phải có ít nhất 1 module và 1 lesson
   - Gửi notification và push notification cho admin

2. **`approveCourse(courseId, adminUserId)`**
   - Admin phê duyệt khóa học
   - Chuyển status từ DRAFT → PUBLISHED

3. **`rejectCourse(courseId, adminUserId, reason)`**
   - Admin từ chối khóa học với lý do

**File thay đổi:**
- `backend/src/lms/courses/courses.service.ts`
- `backend/src/lms/courses/courses.resolver.ts`
- `backend/src/lms/courses/courses.module.ts`
- `backend/src/lms/courses/entities/course.entity.ts`

### **GraphQL Mutations Mới**

**Tài liệu:**
- `requestDocumentApproval(documentId: ID!): SourceDocument`
- `approveDocument(documentId: ID!): SourceDocument`
- `rejectDocument(documentId: ID!, reason: String!): SourceDocument`

**Khóa học:**
- `requestCourseApproval(courseId: ID!): Course`
- `approveCourse(courseId: ID!): Course`
- `rejectCourse(courseId: ID!, reason: String!): Course`

---

## 3. Frontend - Giao Diện Người Dùng

### **Component: ApprovalRequestButton**
- Component tái sử dụng cho cả khóa học và tài liệu
- Hiển thị nút "Gửi yêu cầu phê duyệt" cho giảng viên
- Tự động disable khi đã gửi yêu cầu
- Toast thông báo thành công/lỗi

**File:** `frontend/src/components/lms/ApprovalRequestButton.tsx`

**Sử dụng:**
```tsx
<ApprovalRequestButton
  type="course" // hoặc "document"
  id={courseId}
  title={courseTitle}
  approvalRequested={course.approvalRequested}
  status={course.status}
  onSuccess={() => refetch()}
/>
```

### **Trang Admin: Quản Lý Phê Duyệt**
Trang dashboard cho admin quản lý các yêu cầu phê duyệt:

**Tính năng:**
- 2 tabs: Khóa học và Tài liệu
- Hiển thị số lượng pending ở mỗi tab
- Xem chi tiết từng item
- Nút "Phê duyệt" và "Từ chối"
- Dialog nhập lý do khi từ chối
- Hiển thị thời gian yêu cầu và tác giả

**File:** `frontend/src/app/admin/lms/approvals/page.tsx`

**Đường dẫn:** `/admin/lms/approvals`

### **GraphQL Queries Frontend**
Thêm mutations vào file GraphQL:

**File thay đổi:**
- `frontend/src/graphql/lms/courses.graphql.ts`
- `frontend/src/graphql/lms/source-documents.ts`

---

## 4. Notification System Integration

### **Push Notifications**
Khi giảng viên gửi yêu cầu phê duyệt:
1. Tạo notification trong database
2. Gửi real-time notification qua WebSocket
3. Gửi push notification đến tất cả admin

**Nội dung notification:**
- **Title:** "Yêu cầu phê duyệt [khóa học/tài liệu]"
- **Message:** "[Tên giảng viên] đã gửi yêu cầu phê duyệt [tên]"
- **URL:** Link đến trang approval management
- **Data:** Bao gồm ID và thông tin liên quan

---

## 5. Quy Trình Hoạt Động

### **Giảng viên:**
1. Tạo tài liệu/khóa học → Trạng thái **DRAFT**
2. Hoàn thiện nội dung
3. Nhấn nút "Gửi yêu cầu phê duyệt"
4. Nhận thông báo thành công
5. Chờ admin xét duyệt

### **Admin:**
1. Nhận push notification khi có yêu cầu mới
2. Truy cập `/admin/lms/approvals`
3. Xem danh sách yêu cầu pending
4. Kiểm tra chi tiết nội dung
5. **Phê duyệt:** Chuyển sang PUBLISHED
6. **Từ chối:** Nhập lý do và reset yêu cầu

---

## 6. Validation Rules

### **Tài liệu:**
- Chỉ tài liệu DRAFT mới gửi được yêu cầu
- Không cho phép gửi yêu cầu trùng lặp

### **Khóa học:**
- Phải có ít nhất 1 module
- Phải có ít nhất 1 lesson
- Chỉ khóa học DRAFT mới gửi được yêu cầu

---

## 7. Security & Permissions

- **Giảng viên:** Chỉ gửi yêu cầu cho nội dung của mình
- **Admin:** Toàn quyền phê duyệt/từ chối
- Tất cả mutations đều bảo vệ bởi `@UseGuards(JwtAuthGuard)`

---

## 8. Files Cần Migration

### **Database Migration:**
```bash
cd backend
bunx prisma migrate dev --name add-approval-workflow
bunx prisma generate
```

### **Restart Services:**
```bash
bun run dev:backend
bun run dev:frontend
```

---

## 9. Testing Checklist

- [ ] Giảng viên tạo tài liệu DRAFT
- [ ] Giảng viên gửi yêu cầu phê duyệt tài liệu
- [ ] Admin nhận push notification
- [ ] Admin xem danh sách yêu cầu pending
- [ ] Admin phê duyệt tài liệu → PUBLISHED
- [ ] Admin từ chối tài liệu với lý do
- [ ] Giảng viên tạo khóa học DRAFT
- [ ] Giảng viên gửi yêu cầu phê duyệt khóa học
- [ ] Admin phê duyệt khóa học → PUBLISHED
- [ ] Kiểm tra notification bell counter

---

## 10. UI/UX Improvements

### **Badge Status:**
- 🔴 **DRAFT** - Màu đỏ
- 🟡 **Chờ phê duyệt** - Màu vàng (approvalRequested)
- 🟢 **PUBLISHED** - Màu xanh

### **Icons:**
- 📤 **Send** - Gửi yêu cầu
- ✅ **CheckCircle** - Phê duyệt
- ❌ **XCircle** - Từ chối
- 👁️ **Eye** - Xem chi tiết
- ⏰ **Clock** - Thời gian pending

---

## Kết Luận

Hệ thống phê duyệt đã được triển khai đầy đủ với:
- ✅ Backend API hoàn chỉnh
- ✅ Frontend UI responsive
- ✅ Push notification tích hợp
- ✅ Validation và security
- ✅ Admin management dashboard

Giảng viên có thể tạo nội dung tự do ở trạng thái DRAFT, sau đó gửi yêu cầu phê duyệt cho admin một cách dễ dàng thông qua giao diện trực quan và nhận thông báo push realtime.
