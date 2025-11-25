'use client';

import React, { useState } from 'react';
import { MessageCircle, Pin, Trash2, Reply, ChevronDown, ChevronUp } from 'lucide-react';
import { useMutation } from '@apollo/client';
import { CREATE_REPLY, DELETE_DISCUSSION, TOGGLE_DISCUSSION_PIN } from '@/graphql/lms/discussions.graphql';

interface DiscussionThreadProps {
  discussion: {
    id: string;
    title: string;
    content: string;
    isPinned: boolean;
    user: {
      username: string;
      firstName?: string;
      lastName?: string;
      avatar?: string;
    };
    replies: any[];
    createdAt: string;
  };
  refetch: () => void;
  canModerate?: boolean;
  isOwner?: boolean;
}

export default function DiscussionThread({ 
  discussion, 
  refetch,
  canModerate,
  isOwner
}: DiscussionThreadProps) {
  const [replyText, setReplyText] = useState('');
  const [showReplies, setShowReplies] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const [createReply] = useMutation(CREATE_REPLY);
  const [deleteDiscussion] = useMutation(DELETE_DISCUSSION);
  const [togglePin] = useMutation(TOGGLE_DISCUSSION_PIN);

  const handleSubmitReply = async () => {
    if (!replyText.trim()) return;

    try {
      await createReply({
        variables: {
          input: {
            discussionId: discussion.id,
            content: replyText,
            parentId: replyingTo,
          },
        },
      });
      setReplyText('');
      setReplyingTo(null);
      refetch();
    } catch (error) {
      console.error('Error creating reply:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa thảo luận này?')) return;

    try {
      await deleteDiscussion({
        variables: { id: discussion.id },
      });
      refetch();
    } catch (error) {
      console.error('Error deleting discussion:', error);
    }
  };

  const handleTogglePin = async () => {
    try {
      await togglePin({
        variables: { id: discussion.id },
      });
      refetch();
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  };

  const getUserDisplayName = (user: any) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username;
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-4 border border-gray-100">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex gap-3 flex-1">
          <img 
            src={discussion.user.avatar || '/default-avatar.png'} 
            alt={discussion.user.username}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-lg text-gray-900">{discussion.title}</h3>
              {discussion.isPinned && (
                <span className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                  <Pin className="w-3 h-3" />
                  Đã ghim
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">
              by {getUserDisplayName(discussion.user)} • {new Date(discussion.createdAt).toLocaleDateString('vi-VN')}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {canModerate && (
            <button
              onClick={handleTogglePin}
              className="p-2 hover:bg-amber-50 rounded-lg text-amber-600 transition-colors"
              title={discussion.isPinned ? 'Bỏ ghim' : 'Ghim'}
            >
              <Pin className="w-5 h-5" />
            </button>
          )}
          {(canModerate || isOwner) && (
            <button
              onClick={handleDelete}
              className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
              title="Xóa"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="prose max-w-none mb-4 pl-15">
        <p className="text-gray-700 whitespace-pre-wrap">{discussion.content}</p>
      </div>

      {/* Replies Section */}
      <div className="border-t border-gray-200 pt-4 mt-4">
        <button
          onClick={() => setShowReplies(!showReplies)}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 mb-3"
        >
          <MessageCircle className="w-4 h-4" />
          {discussion.replies.length} {discussion.replies.length === 1 ? 'phản hồi' : 'phản hồi'}
          {showReplies ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showReplies && (
          <>
            {/* Existing Replies */}
            {discussion.replies.length > 0 && (
              <div className="space-y-3 mb-4">
                {discussion.replies.map((reply: any) => (
                  <div key={reply.id} className="flex gap-3 pl-4 border-l-2 border-gray-200">
                    <img
                      src={reply.user.avatar || '/default-avatar.png'}
                      alt={reply.user.username}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {getUserDisplayName(reply.user)}
                        </p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{reply.content}</p>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span>{new Date(reply.createdAt).toLocaleDateString('vi-VN')}</span>
                        <button
                          onClick={() => setReplyingTo(reply.id)}
                          className="flex items-center gap-1 hover:text-blue-600"
                        >
                          <Reply className="w-3 h-3" />
                          Reply
                        </button>
                      </div>

                      {/* Nested Replies */}
                      {reply.children?.length > 0 && (
                        <div className="mt-3 space-y-2 pl-4 border-l-2 border-gray-100">
                          {reply.children.map((child: any) => (
                            <div key={child.id} className="flex gap-2">
                              <img
                                src={child.user.avatar || '/default-avatar.png'}
                                alt={child.user.username}
                                className="w-6 h-6 rounded-full object-cover"
                              />
                              <div className="flex-1 bg-gray-50 rounded-lg p-2">
                                <p className="text-xs font-medium text-gray-900 mb-1">
                                  {getUserDisplayName(child.user)}
                                </p>
                                <p className="text-xs text-gray-700">{child.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Reply Form */}
            <div className="flex gap-3">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={replyingTo ? 'Viết phản hồi...' : 'Viết bình luận...'}
                className="flex-1 border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
              />
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleSubmitReply}
                  disabled={!replyText.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  Phản hồi
                </button>
                {replyingTo && (
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                  >
                    Hủy
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
