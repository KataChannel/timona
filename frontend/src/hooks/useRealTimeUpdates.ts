import { useEffect } from 'react';
import { useSubscription } from '@apollo/client';
import { NEW_POST_SUBSCRIPTION, NEW_COMMENT_SUBSCRIPTION } from '@/lib/graphql/queries';
import { toast } from 'sonner';

interface UseRealTimeUpdatesProps {
  onNewPost?: (post: any) => void;
  onNewComment?: (comment: any) => void;
  postId?: string;
  enableNewPosts?: boolean;
  enableNewComments?: boolean;
}

export function useRealTimeUpdates({
  onNewPost,
  onNewComment,
  postId,
  enableNewPosts = false, // Disable by default in development
  enableNewComments = false,
}: UseRealTimeUpdatesProps) {
  // Only enable subscriptions in production or when explicitly enabled
  const shouldEnableSubscriptions = process.env.NODE_ENV === 'production';
  
  // Subscribe to new posts
  const { data: newPostData, error: newPostError } = useSubscription(
    NEW_POST_SUBSCRIPTION,
    {
      skip: !enableNewPosts || !shouldEnableSubscriptions,
      onSubscriptionData: ({ subscriptionData }) => {
        if (subscriptionData?.data?.postCreated) {
          const post = subscriptionData.data.postCreated;
          toast.success(`New post published: ${post.title}`, {
            duration: 5000,
            icon: '📝',
          });
          onNewPost?.(post);
        }
      },
      onError: (error) => {
        console.warn('New post subscription error (expected in development):', error.message);
        // Don't show error toast in development
        if (process.env.NODE_ENV === 'production') {
          toast.error('Failed to connect to real-time updates');
        }
      },
    }
  );

  // Subscribe to new comments for a specific post
  const { data: newCommentData, error: newCommentError } = useSubscription(
    NEW_COMMENT_SUBSCRIPTION,
    {
      variables: { postId },
      skip: !enableNewComments || !postId || !shouldEnableSubscriptions,
      onSubscriptionData: ({ subscriptionData }) => {
        if (subscriptionData?.data?.newComment) {
          const comment = subscriptionData.data.newComment;
          toast.success(`New comment by ${comment.author.username}`, {
            duration: 3000,
            icon: '💬',
          });
          onNewComment?.(comment);
        }
      },
      onError: (error) => {
        console.warn('New comment subscription error (expected in development):', error.message);
        // Don't show error toast in development
        if (process.env.NODE_ENV === 'production') {
          toast.error('Failed to connect to comment updates');
        }
      },
    }
  );

  useEffect(() => {
    if (newPostError && process.env.NODE_ENV === 'production') {
      console.error('Post subscription error:', newPostError);
    }
  }, [newPostError]);

  useEffect(() => {
    if (newCommentError && process.env.NODE_ENV === 'production') {
      console.error('Comment subscription error:', newCommentError);
    }
  }, [newCommentError]);

  return {
    newPost: newPostData?.postCreated,
    newComment: newCommentData?.newComment,
    errors: {
      newPost: newPostError,
      newComment: newCommentError,
    },
  };
}
