'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeftIcon,
  CalendarDaysIcon,
  FlagIcon,
  TagIcon,
  UserIcon,
  ShareIcon,
  ChatBubbleLeftRightIcon,
  PaperClipIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useTaskById, useUpdateTask, useDeleteTask } from '@/hooks/useTodos';
import { Task, TaskStatus, TaskPriority } from '@/types/todo';
import { formatDate } from '@/lib/utils/date';
import { useAuth } from '@/contexts/AuthContext';

export default function TaskDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated } = useAuth();
  const taskId = params?.id as string;

  const { task, loading, error } = useTaskById(taskId);
  const { updateTask, loading: updating } = useUpdateTask();
  const { deleteTask, loading: deleting } = useDeleteTask();

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    status: TaskStatus.PENDING,
    priority: TaskPriority.MEDIUM,
    dueDate: '',
    category: '',
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (task) {
      setEditForm({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        category: task.category || '',
      });
    }
  }, [task]);

  const handleSave = async () => {
    if (!task) return;

    try {
      await updateTask({
        variables: {
          input: {
            id: task.id,
            title: editForm.title,
            description: editForm.description || null,
            status: editForm.status,
            priority: editForm.priority,
            dueDate: editForm.dueDate ? new Date(editForm.dueDate).toISOString() : null,
            category: editForm.category || null,
          },
        },
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDelete = async () => {
    if (!task || !confirm('Bạn có chắc chắn muốn xóa task này?')) return;

    try {
      await deleteTask({
        variables: { id: task.id },
      });
      router.push('/todos');
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!task) return;

    try {
      await updateTask({
        variables: {
          input: { 
            id: task.id,
            status: newStatus 
          },
        },
      });
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.HIGH:
        return 'text-red-600 bg-red-100';
      case TaskPriority.MEDIUM:
        return 'text-yellow-600 bg-yellow-100';
      case TaskPriority.LOW:
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return 'text-green-600 bg-green-100';
      case TaskStatus.IN_PROGRESS:
        return 'text-blue-600 bg-blue-100';
      case TaskStatus.PENDING:
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !task) {
    console.error('Error fetching task:', error);
    console.error('Error fetching task:', task);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Task không tìm thấy</h2>
          <p className="mt-2 text-gray-600">Task bạn tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <Link href="/todos" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Link
                href="/todos"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                >
                <ArrowLeftIcon className="w-5 h-5" />
                <span>Quay lại</span>
              </Link>
              <div className="h-6 border-l border-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-900">Chi tiết Task</h1>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                <PencilIcon className="w-4 h-4" />
                <span>{isEditing ? 'Hủy' : 'Chỉnh sửa'}</span>
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                <TrashIcon className="w-4 h-4" />
                <span>Xóa</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Task Title and Description */}
            <div className="bg-white rounded-lg shadow p-6">
              {isEditing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full text-2xl font-bold border-none outline-none focus:ring-2 focus:ring-blue-500 rounded p-2"
                    placeholder="Tiêu đề task"
                  />
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={6}
                    className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Mô tả chi tiết..."
                  />
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleSave}
                      disabled={updating}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      <CheckIcon className="w-4 h-4" />
                      <span>Lưu</span>
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      <XMarkIcon className="w-4 h-4" />
                      <span>Hủy</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">{task.title}</h1>
                  {task.description && (
                    <div className="prose prose-gray max-w-none">
                      <p className="text-gray-700 whitespace-pre-wrap">{task.description}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Comments Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
                Bình luận ({task.comments?.length || 0})
              </h3>
              
              {task.comments && task.comments.length > 0 ? (
                <div className="space-y-4">
                  {task.comments.map((comment: any) => (
                    <div key={comment.id} className="border-l-4 border-blue-200 pl-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <UserIcon className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-900">{comment.user.username}</span>
                        <span className="text-sm text-gray-500">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Chưa có bình luận nào.</p>
              )}
            </div>

            {/* Media Attachments */}
            {task.media && task.media.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <PaperClipIcon className="w-5 h-5 mr-2" />
                  Tệp đính kèm ({task.media.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {task.media.map((media: any) => (
                    <div key={media.id} className="border rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <PaperClipIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {media.filename}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {media.size ? `${Math.round(media.size / 1024)} KB` : ''}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status and Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Trạng thái</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Trạng thái hiện tại:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                    {task.status === TaskStatus.PENDING && 'Chờ xử lý'}
                    {task.status === TaskStatus.IN_PROGRESS && 'Đang thực hiện'}
                    {task.status === TaskStatus.COMPLETED && 'Hoàn thành'}
                  </span>
                </div>

                <div className="border-t pt-3">
                  <p className="text-sm font-medium text-gray-500 mb-2">Thay đổi trạng thái:</p>
                  <div className="space-y-2">
                    {Object.values(TaskStatus).map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        disabled={task.status === status || updating}
                        className={`
                          w-full text-left px-3 py-2 rounded-md text-sm transition-colors
                          ${task.status === status 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'hover:bg-gray-50 text-gray-700'
                          }
                        `}
                      >
                        {status === TaskStatus.PENDING && 'Chờ xử lý'}
                        {status === TaskStatus.IN_PROGRESS && 'Đang thực hiện'}
                        {status === TaskStatus.COMPLETED && 'Hoàn thành'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Task Properties */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <FlagIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Độ ưu tiên</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority === TaskPriority.HIGH && 'Cao'}
                      {task.priority === TaskPriority.MEDIUM && 'Trung bình'}
                      {task.priority === TaskPriority.LOW && 'Thấp'}
                    </span>
                  </div>
                </div>

                {task.category && (
                  <div className="flex items-center space-x-3">
                    <TagIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Danh mục</p>
                      <p className="text-sm text-gray-900">{task.category}</p>
                    </div>
                  </div>
                )}

                {task.dueDate && (
                  <div className="flex items-center space-x-3">
                    <CalendarDaysIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Hạn hoàn thành</p>
                      <p className="text-sm text-gray-900">{formatDate(task.dueDate)}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <UserIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Người tạo</p>
                    <p className="text-sm text-gray-900">{task.author.username}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <CalendarDaysIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Ngày tạo</p>
                    <p className="text-sm text-gray-900">{formatDate(task.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sharing */}
            {task.shares && task.shares.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <ShareIcon className="w-5 h-5 mr-2" />
                  Chia sẻ ({task.shares.length})
                </h3>
                
                <div className="space-y-3">
                  {task.shares.map((share: any) => (
                    <div key={share.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <UserIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-900">
                          {share.sharedWithUser?.username || 'Người dùng ẩn danh'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {share.permission === 'READ' ? 'Xem' : 'Chỉnh sửa'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
