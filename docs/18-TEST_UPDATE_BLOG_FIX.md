# Test Plan: UpdateBlog ID Validation Fix

## 🔍 Vấn Đề Gốc
```
Error: Blog post ID is required and cannot be empty
```

## 🛠️ Các Fix Đã Áp Dụng

### 1. Backend Input Validation (`blog.input.ts`)
✅ Thêm class-validator decorators cho `UpdateBlogInput`:
```typescript
@Field(() => ID)
@IsString()
@IsNotEmpty({ message: 'Blog post ID is required' })
id: string;
```

### 2. Backend Resolver Validation (`blog.resolver.ts`)
✅ Thêm `@UsePipes` decorator ở class level
✅ Thêm `@UsePipes` decorator ở method level với `skipMissingProperties: false`
✅ Thêm debug logging để trace input data

### 3. Backend Service Validation (`blog.service.ts`)
✅ Validate `id` không empty và không empty string

### 4. Frontend Data Preparation (`edit/page.tsx`)
✅ Initialize form với `blogId` từ URL params
✅ Sync `id` trong useEffect với dependency `blogId`
✅ Validate `id` trước khi submit với fallback
✅ Debug logging trước khi gửi GraphQL request

## 📋 Test Checklist

### Backend Tests:

1. **Test Input Validation**
```bash
# Test với missing id
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { updateBlog(input: { title: \"Test\" }) { id } }"
  }'
# Expected: ValidationError về missing id
```

2. **Test Empty String ID**
```bash
# Test với id = ""
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { updateBlog(input: { id: \"\", title: \"Test\" }) { id } }"
  }'
# Expected: Error "Blog post ID is required and cannot be empty"
```

3. **Test Valid ID**
```bash
# Test với valid id
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { updateBlog(input: { id: \"valid-uuid-here\", title: \"Test\" }) { id } }"
  }'
# Expected: Success hoặc NotFound nếu id không tồn tại
```

### Frontend Tests:

1. **Check Console Logs**
- Mở DevTools Console
- Navigate to `/admin/blog/[id]/edit`
- Kiểm tra logs:
  ```
  ✅ Missing blog ID: { formDataId: ..., blogId: ..., params: ... }
  ✅ Updating blog with ID: xxx
  ✅ GraphQL variables being sent: { input: { id: "xxx", ... } }
  ```

2. **Check Network Tab**
- Mở DevTools Network tab
- Filter: XHR/Fetch
- Submit form
- Kiểm tra GraphQL request payload có `id` field

3. **Test Form Submit**
- Load existing blog: `/admin/blog/[existing-id]/edit`
- Make changes
- Click "Cập Nhật Bài Viết"
- Expected: Success toast + redirect

### Edge Cases:

1. **New Blog (no params)**
- Navigate to `/admin/blog//edit` (double slash)
- Expected: Error toast "Không tìm thấy ID bài viết"

2. **Invalid ID in URL**
- Navigate to `/admin/blog/invalid-id/edit`
- Expected: Error "Blog post with id invalid-id not found"

3. **Form Data Lost**
- Load blog
- Clear `formData.id` manually (via React DevTools)
- Submit
- Expected: Fallback to `blogId` from params

## 🎯 Success Criteria

✅ All validators applied at every layer
✅ Debug logs show exact input received
✅ No compilation errors
✅ `id` field always present in GraphQL request
✅ Clear error messages at each validation point
✅ Fallback mechanisms working

## 📊 Validation Layers

```
┌─────────────────────────────────────────┐
│ Frontend Form Validation                │
│ - Check formData.id || blogId           │
│ - Toast error if missing                │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ GraphQL Request (Apollo Client)         │
│ - Send { input: { id: "xxx", ... } }   │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ Backend ValidationPipe (Global)         │
│ - whitelist: true                       │
│ - transform: true                       │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ Resolver ValidationPipe (Method)        │
│ - skipMissingProperties: false          │
│ - Debug logs input                      │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ UpdateBlogInput class-validator         │
│ - @IsString()                           │
│ - @IsNotEmpty()                         │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ Resolver Custom Validation              │
│ - if (!id || id.trim() === '')         │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ Service Custom Validation               │
│ - if (!id || id.trim() === '')         │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ Prisma Query                            │
│ - findUnique({ where: { id } })        │
└─────────────────────────────────────────┘
```

## 🔧 Debug Commands

### Check Backend Logs
```bash
cd /mnt/chikiet/kataoffical/shoprausach
bun run dev:backend
# Look for:
# === UpdateBlog Resolver Debug ===
# Full input object: ...
```

### Check Frontend Console
```javascript
// In browser console
// After loading edit page:
console.log('Current blog ID:', window.location.pathname.split('/')[3]);
```

### Monitor GraphQL Requests
```bash
# In terminal, grep for UpdateBlog
cd /mnt/chikiet/kataoffical/shoprausach
tail -f logs/*.log | grep UpdateBlog
```

## 📝 Expected Behavior After Fix

### Scenario 1: Normal Update
1. User navigates to `/admin/blog/abc123/edit`
2. Frontend logs: `Updating blog with ID: abc123`
3. GraphQL request has `{ input: { id: "abc123", ... } }`
4. Backend logs: `Full input object: { id: "abc123", ... }`
5. Update succeeds
6. Success toast + redirect

### Scenario 2: Missing ID (Edge Case)
1. `formData.id` is empty
2. Frontend uses fallback: `blogId` from params
3. If both empty: Toast error + return early
4. No GraphQL request sent

### Scenario 3: Invalid ID
1. Frontend sends valid format ID
2. Backend validates ID format (pass)
3. Prisma query: Blog not found
4. Error toast: "Blog post with id xxx not found"

## 🎉 Fix Summary

**Files Modified:**
1. ✅ `/backend/src/graphql/inputs/blog.input.ts` - Added validators
2. ✅ `/backend/src/graphql/resolvers/blog.resolver.ts` - Added pipes + debug
3. ✅ `/backend/src/services/blog.service.ts` - Enhanced validation
4. ✅ `/frontend/src/app/admin/blog/[id]/edit/page.tsx` - Better ID handling

**Validation Points Added:** 6 layers
**Debug Logs Added:** Frontend + Backend
**Error Messages:** Clear and specific at each layer
