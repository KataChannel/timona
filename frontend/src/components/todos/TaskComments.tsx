import React, { useState, useRef, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  ChatBubbleLeftIcon,
  PaperAirplaneIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  ArrowUturnLeftIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { TaskComment, User } from '../../types/todo';
import { toast } from 'sonner';

interface TaskCommentsProps {
  taskId: string;
  comments: TaskComment[];
  currentUser?: User;
  onAddComment: (content: string, parentId?: string) => Promise<void>;
  onUpdateComment: (commentId: string, content: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  loading?: boolean;
}

interface CommentItemProps {
  comment: TaskComment;
  currentUser?: User;
  onReply: (parentId: string) => void;
  onEdit: (comment: TaskComment) => void;
  onDelete: (commentId: string) => void;
  depth?: number;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  currentUser,
  onReply,
  onEdit,
  onDelete,
  depth = 0,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const isOwner = currentUser?.id === comment.author.id;
  const maxDepth = 3; // Maximum nesting level

  return (
    <div className={`${depth > 0 ? 'ml-8 mt-3' : 'mt-4'} relative`}>
      {/* Comment Thread Line */}
      {depth > 0 && (
        <div className="absolute -left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
      )}
      
      <div className="flex space-x-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
                    {comment.author.avatar ? (
            <img
              src={comment.author.avatar}
              alt={comment.author.username}
              className="h-8 w-8 rounded-full"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-600">
              {comment.author.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-gray-50 rounded-lg px-3 py-2">
            {/* Header */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-sm text-gray-900">
                  {comment.author.firstName && comment.author.lastName
                    ? `${comment.author.firstName} ${comment.author.lastName}`
                    : comment.author.username
                  }
                </span>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(comment.createdAt), {
                    addSuffix: true,
                    locale: vi,
                  })}
                </span>
                {comment.createdAt !== comment.updatedAt && (
                  <span className="text-xs text-gray-400">(đã chỉnh sửa)</span>
                )}
              </div>

              {/* Menu */}
              {isOwner && (
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <EllipsisVerticalIcon className="w-4 h-4 text-gray-500" />
                  </button>

                  {showMenu && (
                    <div className="absolute right-0 top-6 z-10 bg-white rounded-md shadow-lg border py-1 min-w-[120px]">
                      <button
                        onClick={() => {
                          onEdit(comment);
                          setShowMenu(false);
                        }}
                        className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <PencilIcon className="w-4 h-4" />
                        <span>Chỉnh sửa</span>
                      </button>
                      <button
                        onClick={() => {
                          onDelete(comment.id);
                          setShowMenu(false);
                        }}
                        className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <TrashIcon className="w-4 h-4" />
                        <span>Xóa</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Content */}
            <p className="text-sm text-gray-800 whitespace-pre-wrap">
              {comment.content}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4 mt-2">
            {depth < maxDepth && (
              <button
                onClick={() => onReply(comment.id)}
                className="flex items-center space-x-1 text-xs text-gray-500 hover:text-blue-600 transition-colors"
              >
                <ArrowUturnLeftIcon className="w-3 h-3" />
                <span>Trả lời</span>
              </button>
            )}
            
            {comment.replies && comment.replies.length > 0 && (
              <span className="text-xs text-gray-500">
                {comment.replies.length} phản hồi
              </span>
            )}
          </div>

          {/* Replies */}
          {comment.replies && comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUser={currentUser}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              depth={depth + 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const TaskComments: React.FC<TaskCommentsProps> = ({
  taskId,
  comments,
  currentUser,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  loading = false,
}) => {
  const [newComment, setNewComment] = useState('');
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<TaskComment | null>(null);
  const [editContent, setEditContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [newComment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      await onAddComment(newComment.trim(), replyToId || undefined);
      setNewComment('');
      setReplyToId(null);
      toast.success('Đã thêm bình luận');
    } catch (error) {
      toast.error('Không thể thêm bình luận');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (comment: TaskComment) => {
    setEditingComment(comment);
    setEditContent(comment.content);
  };

  const handleSaveEdit = async () => {
    if (!editingComment || !editContent.trim() || submitting) return;

    setSubmitting(true);
    try {
      await onUpdateComment(editingComment.id, editContent.trim());
      setEditingComment(null);
      setEditContent('');
      toast.success('Đã cập nhật bình luận');
    } catch (error) {
      toast.error('Không thể cập nhật bình luận');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bình luận này?')) return;

    try {
      await onDeleteComment(commentId);
      toast.success('Đã xóa bình luận');
    } catch (error) {
      toast.error('Không thể xóa bình luận');
    }
  };

  const handleReply = (parentId: string) => {
    setReplyToId(parentId);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-2 border-b border-gray-200 pb-3">
        <ChatBubbleLeftIcon className="w-5 h-5 text-gray-500" />
        <h3 className="font-medium text-gray-900">
          Bình luận ({comments.length})
        </h3>
      </div>

      {/* Edit Modal */}
      {editingComment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Chỉnh sửa bình luận
            </h3>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={4}
              placeholder="Nhập bình luận..."
              autoFocus
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => {
                  setEditingComment(null);
                  setEditContent('');
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={!editContent.trim() || submitting}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {replyToId && (
          <div className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-md">
            <span className="text-sm text-blue-700">
              Đang trả lời bình luận
            </span>
            <button
              type="button"
              onClick={() => setReplyToId(null)}
              className="text-blue-700 hover:text-blue-800"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex space-x-3">
          {/* Current User Avatar */}
          <div className="flex-shrink-0">
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.username}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">
                  {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            )}
          </div>

          {/* Comment Input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[80px] max-h-[200px]"
              placeholder={replyToId ? 'Viết phản hồi...' : 'Viết bình luận...'}
              rows={2}
            />
            
            {/* Send Button */}
            <button
              type="submit"
              disabled={!newComment.trim() || submitting}
              className="absolute bottom-2 right-2 p-2 text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-1">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ChatBubbleLeftIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Chưa có bình luận nào</p>
            <p className="text-sm">Hãy là người đầu tiên bình luận!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUser={currentUser}
              onReply={handleReply}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default TaskComments;
