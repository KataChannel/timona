/**
 * ============================================================================
 * COMMENTS SECTION COMPONENT - MVP 3
 * ============================================================================
 * 
 * Real-time comments with threaded replies
 * Features:
 * - Create, edit, delete comments
 * - Threaded replies support
 * - @Mention users (prepared)
 * - Real-time updates using Dynamic GraphQL
 * 
 * @author Senior Full-Stack Engineer
 * @version 3.0.0 - MVP 3
 */

'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  useTaskComments,
  useCreateComment,
  useUpdateComment,
  useDeleteComment,
} from '@/hooks/useComments.dynamic';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  MessageSquare,
  Send,
  Edit,
  Trash2,
  Reply,
  MoreVertical,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface CommentsSectionProps {
  taskId: string;
}

export default function CommentsSection({ taskId }: CommentsSectionProps) {
  const { toast } = useToast();
  const { data: comments, loading, refetch } = useTaskComments(taskId);
  const [createComment, { loading: creating }] = useCreateComment();

  const [newComment, setNewComment] = useState('');
  const [replyToId, setReplyToId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await createComment({
        variables: {
          input: {
            content: newComment,
            taskId,
            parentId: replyToId || undefined,
          },
        },
      });

      toast({
        title: 'Success',
        description: 'Comment added',
        type: 'success',
      });

      setNewComment('');
      setReplyToId(null);
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add comment',
        variant: 'destructive',
        type: 'error',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Comments List */}
      <ScrollArea className="h-[400px] pr-4">
        {comments.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No comments yet</p>
            <p className="text-sm">Be the first to comment!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment: any) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                taskId={taskId}
                onReply={(id) => setReplyToId(id)}
                onUpdate={refetch}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Reply Indicator */}
      {replyToId && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded">
          <Reply className="h-4 w-4" />
          <span>Replying to comment</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setReplyToId(null)}
            className="h-6 ml-auto"
          >
            Cancel
          </Button>
        </div>
      )}

      {/* New Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          rows={3}
          className="resize-none"
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={creating || !newComment.trim()}>
            <Send className="h-4 w-4 mr-2" />
            {replyToId ? 'Reply' : 'Comment'}
          </Button>
        </div>
      </form>
    </div>
  );
}

// ==================== COMMENT ITEM COMPONENT ====================

interface CommentItemProps {
  comment: any;
  taskId: string;
  onReply: (id: string) => void;
  onUpdate: () => void;
  depth?: number;
}

function CommentItem({
  comment,
  taskId,
  onReply,
  onUpdate,
  depth = 0,
}: CommentItemProps) {
  const { toast } = useToast();
  const [updateComment, { loading: updating }] = useUpdateComment();
  const [deleteComment, { loading: deleting }] = useDeleteComment();

  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);

  const handleEdit = async () => {
    if (!editedContent.trim()) return;

    try {
      await updateComment({
        variables: {
          id: comment.id,
          input: { content: editedContent },
        },
      });

      toast({
        title: 'Success',
        description: 'Comment updated',
        type: 'success',
      });

      setIsEditing(false);
      onUpdate();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update comment',
        variant: 'destructive',
        type: 'error',
      });
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this comment?')) return;

    try {
      await deleteComment({
        variables: { id: comment.id },
      });

      toast({
        title: 'Success',
        description: 'Comment deleted',
        type: 'success',
      });

      onUpdate();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete comment',
        variant: 'destructive',
        type: 'error',
      });
    }
  };

  return (
    <div className={`${depth > 0 ? 'ml-8 mt-2' : ''}`}>
      <div className="flex items-start gap-3 group">
        {/* Avatar */}
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={comment.user?.avatar} />
          <AvatarFallback className="text-xs">
            {comment.user?.firstName?.[0]}
            {comment.user?.lastName?.[0]}
          </AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">
              {comment.user?.firstName} {comment.user?.lastName}
            </span>
            <span className="text-xs text-muted-foreground">
              {format(new Date(comment.createdAt), 'MMM dd, HH:mm')}
            </span>
            {comment.updatedAt !== comment.createdAt && (
              <span className="text-xs text-muted-foreground">(edited)</span>
            )}
          </div>

          {/* Comment Body */}
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                rows={2}
                className="text-sm"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleEdit} disabled={updating}>
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setEditedContent(comment.content);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
          )}

          {/* Actions */}
          {!isEditing && (
            <div className="flex items-center gap-2 mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReply(comment.id)}
                className="h-6 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>

              {/* More Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Edit className="h-3 w-3 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-destructive"
                  >
                    <Trash2 className="h-3 w-3 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>

      {/* Threaded Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2 space-y-2">
          {comment.replies.map((reply: any) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              taskId={taskId}
              onReply={onReply}
              onUpdate={onUpdate}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
