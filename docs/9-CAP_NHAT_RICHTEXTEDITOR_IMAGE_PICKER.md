# Cập Nhật RichTextEditor - Tính Năng Chọn Hình Ảnh

## Tổng Quan
Đã cập nhật component `RichTextEditor` để bổ sung tính năng chọn hình ảnh từ FileManager hoặc dán link hình ảnh trực tiếp.

## Thay Đổi Chính

### 1. File: `/frontend/src/components/editor/RichTextEditor.tsx`

**Import mới:**
- `FilePicker` - Component chọn file từ file manager
- `FileType` - Type định nghĩa loại file
- `File` - Type cho file object

**State mới:**
- `imagePickerOpen` - Quản lý trạng thái mở/đóng dialog chọn hình

**Chức năng mới:**

#### `handleImageSelect(fileOrUrl: File | string)`
- Xử lý khi người dùng chọn hình từ FilePicker
- Hỗ trợ cả URL string và File object
- Tự động insert hình vào editor tại vị trí con trỏ

#### `addImage()` - Được cải thiện
- Thay vì dùng `window.prompt`, giờ mở FilePicker dialog
- UX tốt hơn với giao diện chọn file trực quan

#### FilePicker Integration
- Tích hợp component `FilePicker` vào RichTextEditor
- Chỉ cho phép chọn file IMAGE (`FileType.IMAGE`)
- Hỗ trợ 2 chế độ:
  - **Browse Files**: Chọn từ file manager
  - **Enter URL**: Dán link hình ảnh

## Tính Năng

### ✅ Chọn Hình Từ File Manager
- Click nút "Image" (📷) trên toolbar
- Dialog hiển thị FileManager với grid/list view
- Tìm kiếm, lọc theo loại file
- Preview hình trước khi chọn
- Upload hình mới nếu cần

### ✅ Dán Link Hình Ảnh
- Click nút "Image" (📷) trên toolbar
- Chuyển sang tab "Enter URL"
- Paste URL hình ảnh
- Preview tự động
- Click "Select" để insert

### ✅ Responsive & Mobile-First
- Dialog responsive trên mọi màn hình
- Grid view tối ưu cho mobile
- Touch-friendly interface

## Quy Tắc Áp Dụng

✅ **Clean Architecture** - Component tách biệt, dễ maintain
✅ **Mobile First + Responsive** - Dialog và UI responsive
✅ **Shadcn UI** - Sử dụng Dialog, Button, Tabs chuẩn
✅ **Tiếng Việt** - Placeholder và label tiếng Việt
✅ **Reusable** - FilePicker có thể tái sử dụng cho component khác

## Cách Sử Dụng

```tsx
import { RichTextEditor } from '@/components/editor/RichTextEditor';

// Trong component
<RichTextEditor
  value={content}
  onChange={(value) => setContent(value)}
  placeholder="Viết nội dung..."
/>
```

Khi người dùng click nút Image:
1. Dialog FilePicker mở ra
2. Chọn tab "Browse Files" hoặc "Enter URL"
3. Chọn/nhập hình và click "Select"
4. Hình tự động insert vào editor

## Kết Quả

- ✅ UX tốt hơn: Không dùng prompt, có preview
- ✅ Tích hợp FileManager: Quản lý tập trung
- ✅ Linh hoạt: Hỗ trợ cả file manager và URL
- ✅ Consistent: Cùng style với hệ thống
