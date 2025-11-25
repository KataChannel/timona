# Task Comments và Media Features

## Tổng quan

Đã cập nhật đầy đủ tính năng **Comments** và **Media** cho hệ thống Todo/Task management trong rausachcore. Bao gồm:

### ✅ Tính năng đã hoàn thành

#### 1. Task Comments System
- **Nested Comments**: Hỗ trợ comment con (replies)
- **CRUD Operations**: Tạo, sửa, xóa comment
- **Real-time UI**: Giao diện tương tác trực tiếp
- **Access Control**: Kiểm soát quyền truy cập dựa trên user

#### 2. Task Media System  
- **File Upload**: Tải lên nhiều loại file (image, video, document)
- **Media Viewer**: Xem trước file với modal viewer
- **File Management**: Xóa, tải xuống file
- **Access Control**: Chỉ cho phép chủ sở hữu xóa file

#### 3. UI Components
- **TaskComments**: Component quản lý comment đầy đủ
- **TaskMedia**: Component quản lý media/attachment
- **TaskModal**: Modal tổng hợp hiển thị chi tiết task với tabs
- **TaskCard**: Card task với tích hợp nút xem chi tiết

### 🏗️ Kiến trúc

```
frontend/src/
├── components/todos/
│   ├── TaskComments.tsx    # Hệ thống comment với nested replies
│   ├── TaskMedia.tsx       # Hệ thống media/attachment  
│   ├── TaskModal.tsx       # Modal chi tiết task với tabs
│   └── TaskCard.tsx        # Card task (đã cập nhật)
├── hooks/
│   └── useTaskFeatures.ts  # Custom hooks cho GraphQL operations
├── graphql/
│   └── taskQueries.ts      # GraphQL queries và mutations
└── types/
    └── todo.ts             # TypeScript interfaces (đã cập nhật)
```

### 🔌 Backend Integration

#### GraphQL Queries & Mutations đã sử dụng:

**Comments:**
- `GET_TASK_COMMENTS` - Lấy danh sách comment của task
- `CREATE_TASK_COMMENT` - Tạo comment mới
- `UPDATE_TASK_COMMENT` - Cập nhật comment
- `DELETE_TASK_COMMENT` - Xóa comment

**Media:**
- `GET_TASK_MEDIA` - Lấy danh sách media của task
- `UPLOAD_TASK_MEDIA` - Upload file mới
- `DELETE_TASK_MEDIA` - Xóa file

**Combined:**
- `GET_TASK_WITH_DETAILS` - Lấy task với đầy đủ comments và media

### 📝 Cách sử dụng

#### 1. Sử dụng TaskModal (Recommended)

```tsx
import TaskModal from '@/components/todos/TaskModal';

function MyComponent() {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const currentUser = { id: 'user1', username: 'john_doe' }; // Từ authentication

  return (
    <>
      <button onClick={() => setSelectedTaskId('task-123')}>
        Xem chi tiết task
      </button>
      
      {selectedTaskId && (
        <TaskModal
          taskId={selectedTaskId}
          isOpen={!!selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
          currentUser={currentUser}
          onUpdateTask={(updatedTask) => {
            // Handle task update
            console.log('Task updated:', updatedTask);
          }}
        />
      )}
    </>
  );
}
```

#### 2. Sử dụng Components riêng lẻ

```tsx
import TaskComments from '@/components/todos/TaskComments';
import TaskMediaComponent from '@/components/todos/TaskMedia';
import { useTaskComments, useCreateComment } from '@/hooks/useTaskFeatures';

function TaskDetailPage({ taskId }: { taskId: string }) {
  const { comments } = useTaskComments(taskId);
  const { createComment } = useCreateComment();
  
  const handleAddComment = async (content: string, parentId?: string) => {
    await createComment(taskId, content, parentId);
  };

  return (
    <div>
      <TaskComments
        taskId={taskId}
        comments={comments}
        currentUser={currentUser}
        onAddComment={handleAddComment}
        onUpdateComment={handleUpdateComment}
        onDeleteComment={handleDeleteComment}
      />
      
      <TaskMediaComponent
        taskId={taskId}
        media={media}
        currentUser={currentUser}
        onUploadMedia={handleUploadMedia}
        onDeleteMedia={handleDeleteMedia}
      />
    </div>
  );
}
```

#### 3. Sử dụng với TaskCard

```tsx
import TaskCard from '@/components/todos/TaskCard';

function TaskList({ tasks }: { tasks: Task[] }) {
  const currentUser = useCurrentUser(); // Từ authentication context

  return (
    <div className="space-y-4">
      {tasks.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          currentUser={currentUser}
          onTaskUpdate={(updatedTask) => {
            // Handle task update in list
          }}
        />
      ))}
    </div>
  );
}
```

### 🎨 UI Features

#### TaskComments Component:
- **Nested threading**: Comment và reply với indent
- **Inline editing**: Sửa comment trực tiếp
- **Real-time actions**: Thêm, sửa, xóa không reload page
- **User info display**: Avatar, tên, thời gian
- **Responsive design**: Tối ưu cho mobile

#### TaskMedia Component:
- **Grid layout**: Hiển thị file dạng grid
- **File preview**: Xem trước ảnh, preview icon cho video/document
- **Modal viewer**: Full-screen viewer cho media
- **Upload progress**: UI feedback khi upload
- **File info**: Tên file, dung lượng, loại file

#### TaskModal:
- **Tab interface**: Chi tiết, Comments, Media
- **Responsive modal**: Tối ưu cho nhiều kích thước màn hình
- **Loading states**: Skeleton loading khi fetch data
- **Error handling**: Hiển thị lỗi user-friendly

### 🔧 Customization

#### Styling:
- Sử dụng Tailwind CSS
- Responsive design
- Dark mode ready (có thể extend)

#### Icons:
- Heroicons (outline & solid)
- Consistent icon usage

#### Localization:
- Sử dụng date-fns với locale Vietnamese
- Text tiếng Việt throughout

### 🚀 Performance

- **Optimized queries**: Chỉ fetch data khi cần thiết
- **Cache-friendly**: GraphQL cache với Apollo Client
- **Lazy loading**: Components chỉ render khi cần
- **Efficient updates**: Optimistic updates cho UX

### 🔐 Security

- **Authentication required**: Tất cả operations cần auth
- **Permission checks**: Chỉ owner có thể xóa comment/media
- **Input validation**: Sanitize user input
- **File type restrictions**: Giới hạn loại file upload

### 📱 Mobile Support

- **Touch-friendly**: Buttons và interactions tối ưu cho touch
- **Responsive grid**: Media grid adapt theo screen size  
- **Mobile modal**: Full-screen modal trên mobile
- **Gesture support**: Swipe, pinch cho media viewer

### 🐛 Known Issues & TODOs

1. **File Upload**: Cần implement actual file upload service (hiện tại mock)
2. **Real-time updates**: Có thể thêm WebSocket/subscriptions cho live updates
3. **Image optimization**: Thêm image compression và thumbnails
4. **Accessibility**: Cần improve ARIA labels và keyboard navigation
5. **Offline support**: Thêm offline capability với service worker

### 🔄 Integration với Backend

Backend đã có đầy đủ:
- **TaskCommentService**: CRUD operations với nested comments
- **TaskMediaService**: File upload/delete với access control  
- **GraphQL Resolvers**: Đầy đủ queries và mutations
- **Prisma Schema**: TaskComment và TaskMedia models
- **Permission System**: Role-based access control

Frontend chỉ cần kết nối với existing API endpoints.
