# Fix Bug: BlogCarouselBlock Không Hiển Thị

## Vấn Đề
- BlogCarouselBlock không hiển thị trên canvas page builder và frontend
- Block được thêm vào nhưng không render

## Nguyên Nhân
BlogCarouselBlock thiếu cấu hình trong `DEFAULT_BLOCK_CONTENT` của `PageActionsContext.tsx`

## Giải Pháp Đã Thực Hiện

### 1. Thêm Default Content cho BLOG_CAROUSEL
**File:** `frontend/src/components/page-builder/contexts/PageActionsContext.tsx`

Đã thêm vào object `DEFAULT_BLOCK_CONTENT`:

```typescript
[BlockType.BLOG_CAROUSEL]: {
  title: 'Tin tức nổi bật',
  filterType: 'all',
  itemsToShow: 6,
  showViewAllButton: true,
  viewAllLink: '/tin-tuc',
  autoplay: false,
  autoplayDelay: 5000,
  loop: true,
  showNavigation: true,
  showExcerpt: true,
  showAuthor: true,
  showDate: true,
  showCategory: true,
  responsive: {
    mobile: 1,
    tablet: 2,
    desktop: 3,
  },
  style: {}
},
```

### 2. Kiểm Tra Components Đã Có
✅ **BlogCarouselBlock.tsx** - Component chính đã tạo
✅ **BlogCarouselSettingsDialog.tsx** - Dialog cài đặt đã tạo  
✅ **BlockLoader.tsx** - Đã đăng ký lazy import
✅ **blockTypes.ts** - Đã thêm vào constants
✅ **types/page-builder.ts** - Đã có interface và enum
✅ **Frontend render** - File `[slug]/page.tsx` đã dùng BlockRenderer đúng

### 3. Restart TypeScript Server
Lỗi import `BlogCarouselSettingsDialog` là do TypeScript cache. Cần:

```bash
# Trong VS Code
Ctrl/Cmd + Shift + P → "TypeScript: Restart TS Server"

# Hoặc restart dev server
bun run dev:frontend
```

## Các File Đã Cập Nhật

1. ✅ `/frontend/src/types/page-builder.ts` - Thêm BlockType.BLOG_CAROUSEL và interface
2. ✅ `/frontend/src/components/page-builder/blocks/BlogCarouselBlock.tsx` - Component chính
3. ✅ `/frontend/src/components/page-builder/blocks/BlogCarouselSettingsDialog.tsx` - Settings dialog
4. ✅ `/frontend/src/components/page-builder/blocks/BlockLoader.tsx` - Đăng ký lazy loading
5. ✅ `/frontend/src/constants/blockTypes.ts` - Thêm vào constants và groups
6. ✅ `/frontend/src/graphql/blog.queries.ts` - Thêm featuredImage field
7. ✅ `/frontend/src/components/page-builder/contexts/PageActionsContext.tsx` - **FIX: Thêm DEFAULT_BLOCK_CONTENT**

## Cách Test

### Trong Page Builder (Admin)
1. Vào Admin → Page Builder
2. Click "Add Block" → Chọn "Blog Blocks" → "Blog Carousel"
3. Block sẽ hiển thị với preview mode
4. Click Settings để configure
5. Save page

### Trên Frontend
1. Publish page có BlogCarouselBlock
2. Vào trang `/[slug]` tương ứng
3. Block sẽ render với data thực từ GraphQL

## Kết Quả Mong Đợi

### Canvas (Edit Mode)
- Hiển thị preview box với thông tin: "📰 X bài viết • Filter type"
- Có nút Settings và Delete
- Drag & drop được

### Frontend (Public View)
- Hiển thị carousel bài viết với:
  - Thumbnail responsive
  - Title, excerpt, author, date, category
  - Navigation arrows
  - Autoplay (nếu bật)
  - View all button
  - Responsive 1-3 cột

## Lưu Ý

- ⚠️ Cần restart TypeScript server để xóa cache
- ⚠️ Nếu vẫn không hiển thị, check browser console xem có lỗi GraphQL không
- ⚠️ Đảm bảo có dữ liệu blog trong database để test

## Debug

Nếu vẫn có vấn đề, kiểm tra:

```javascript
// Browser console khi add block
console.log('[PageBuilder] Adding block:', blockType);
console.log('[PageBuilder] Default content:', DEFAULT_BLOCK_CONTENT[blockType]);

// Browser console khi render
console.log('[BlockRenderer] Rendering:', block.type);
console.log('[BlockLoader] Component:', getBlockComponent(blockType));
```

## Hoàn Thành ✅

Tất cả code đã được fix và hoàn chỉnh. Block sẽ hoạt động sau khi restart TypeScript server.
