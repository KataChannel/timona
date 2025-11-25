import { useState, useEffect } from 'react';
import { useQuery, useSubscription } from '@apollo/client';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { 
  MessageCircle, 
  Heart, 
  Share2,
  Eye,
  Sparkles 
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  GET_POSTS, 
  NEW_POST_SUBSCRIPTION,
  GENERATE_SUMMARY 
} from '@/lib/graphql/queries';

interface Post {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  status: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    username: string;
    avatar?: string;
  };
  _count: {
    comments: number;
  };
}

interface PostListProps {
  showAISummaries?: boolean;
  limit?: number;
  status?: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
}

export function PostList({ 
  showAISummaries = false, 
  limit = 10, 
  status = 'PUBLISHED' 
}: PostListProps) {
  const [offset, setOffset] = useState(0);
  const [posts, setPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [summaries, setSummaries] = useState<Record<string, any>>({});

  const { 
    data, 
    loading, 
    error, 
    fetchMore, 
    refetch 
  } = useQuery(GET_POSTS, {
    variables: { 
      pagination: {
        page: Math.floor(offset / limit) + 1,
        limit: limit,
      },
      filters: status ? { status } : undefined,
    },
    notifyOnNetworkStatusChange: true,
    errorPolicy: 'all',
  });

  // Subscribe to new posts
  const { data: newPostData } = useSubscription(NEW_POST_SUBSCRIPTION, {
    onData: ({ data }) => {
      if (data?.data?.newPost) {
        toast.success(`New post: ${data.data.newPost.title}`);
        refetch(); // Refresh the posts list
      }
    },
  });

  useEffect(() => {
    if (data?.getPosts?.items) {
      if (offset === 0) {
        setPosts(data.getPosts.items);
      } else {
        setPosts(prev => [...prev, ...data.getPosts.items]);
      }
    }
  }, [data, offset]);

  const loadMore = async () => {
    if (loading) return;
    
    try {
      await fetchMore({
        variables: {
          pagination: {
            page: Math.floor(posts.length / limit) + 1,
            limit,
          },
          filters: status ? { status } : undefined,
        },
      });
      setOffset(posts.length);
    } catch (error) {
      toast.error('Failed to load more posts');
      console.error('Load more error:', error);
    }
  };

  const toggleLike = (postId: string) => {
    setLikedPosts(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(postId)) {
        newLiked.delete(postId);
        toast.success('Removed from favorites');
      } else {
        newLiked.add(postId);
        toast.success('Added to favorites');
      }
      return newLiked;
    });
  };

  const generateSummary = async (post: Post) => {
    if (summaries[post.id]) {
      setSummaries(prev => {
        const newSummaries = { ...prev };
        delete newSummaries[post.id];
        return newSummaries;
      });
      return;
    }

    try {
      // This would typically be a GraphQL query
      // For demo purposes, we'll simulate an AI summary
      const mockSummary = {
        summary: `This post about "${post.title}" covers key insights and practical applications. The author provides valuable perspectives on modern development practices.`,
        keywords: ['technology', 'development', 'best practices'],
        sentiment: 'positive',
        readingTime: Math.floor(Math.random() * 10) + 2,
      };

      setSummaries(prev => ({
        ...prev,
        [post.id]: mockSummary,
      }));

      toast.success('AI summary generated!');
    } catch (error) {
      toast.error('Failed to generate summary');
      console.error('Summary generation error:', error);
    }
  };

  const sharePost = async (post: Post) => {
    const url = `${window.location.origin}/posts/${post.slug}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: url,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-red-800 mb-2">
              Failed to load posts
            </h3>
            <p className="text-red-600 mb-4">
              {error.message || 'Something went wrong while fetching posts.'}
            </p>
            <button
              onClick={() => refetch()}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8" data-testid="posts-list">
      {/* Header */}
      <div className="py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Latest Posts</h1>
        <p className="text-gray-600">
          Discover the latest insights and stories from our community
        </p>
      </div>
      {/* Loading State */}
      {loading && posts.length === 0 && (
        <div className="space-y-6" data-testid="posts-loading">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-24"></div>
                  <div className="h-3 bg-gray-300 rounded w-16"></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                </div>
              </div>
              <div className="flex items-center space-x-4 mt-4">
                <div className="h-4 bg-gray-300 rounded w-16"></div>
                <div className="h-4 bg-gray-300 rounded w-12"></div>
                <div className="h-4 bg-gray-300 rounded w-14"></div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Posts Grid */}
      {posts.length > 0 && (
        <div className="space-y-6">
          {posts.map((post) => (
            <article
              key={post.id}
              data-testid="post-item"
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                {/* Author Info */}
                <div className="flex items-center space-x-3 mb-4">
                  <div className="relative">
                    {post.author.avatar ? (
                      <Image
                        src={post.author.avatar}
                        alt={post.author.username}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {post.author.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{post.author.username}</p>
                    <p className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>

                {/* Post Content */}
                <div className="mb-4">
                  <Link href={`/posts/${post.slug}`} >
                    <h2 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors cursor-pointer">
                      {post.title}
                    </h2>
                  </Link>
                  <p className="text-gray-600 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>

                {/* AI Summary */}
                {showAISummaries && summaries[post.id] && (
                  <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                      <span className="text-sm font-medium text-purple-800">AI Summary</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      {summaries[post.id].summary}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>📖 {summaries[post.id].readingTime} min read</span>
                      <span>😊 {summaries[post.id].sentiment}</span>
                      <span>🏷️ {summaries[post.id].keywords.join(', ')}</span>
                    </div>
                  </div>
                )}

                {/* Post Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-6">
                    {/* Like Button */}
                    <button
                      onClick={() => toggleLike(post.id)}
                      data-testid="like-button"
                      className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors"
                    >
                      {likedPosts.has(post.id) ? (
                        <Heart fill="currentColor" className="h-5 w-5 text-red-500" />
                      ) : (
                        <Heart className="h-5 w-5" />
                      )}
                      <span className="text-sm" data-testid="like-count">Like</span>
                    </button>

                    {/* Comments */}
                    <Link href={`/posts/${post.slug}#comments`} >
                      <div className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors cursor-pointer">
                        <MessageCircle className="h-5 w-5" />
                        <span className="text-sm" data-testid="comment-count">{post?._count?.comments}</span>
                      </div>
                    </Link>

                    {/* Share */}
                    <button
                      onClick={() => sharePost(post)}
                      data-testid="share-button"
                      className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors"
                    >
                      <Share2 className="h-5 w-5" />
                      <span className="text-sm">Share</span>
                    </button>
                  </div>

                  {/* AI Summary Toggle */}
                  {showAISummaries && (
                    <button
                      onClick={() => generateSummary(post)}
                      data-testid="ai-summary"
                      className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs transition-colors ${
                        summaries[post.id]
                          ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>{summaries[post.id] ? 'Hide Summary' : 'AI Summary'}</span>
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      {/* Load More Button */}
      {posts.length > 0 && data?.posts?.length === limit && (
        <div className="text-center py-8">
          <button
            onClick={loadMore}
            disabled={loading}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105'
            }`}
          >
            {loading ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Loading...
              </div>
            ) : (
              'Load More Posts'
            )}
          </button>
        </div>
      )}
      {/* Empty State */}
      {!loading && posts.length === 0 && (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="bg-gray-50 rounded-lg p-8">
              <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No posts found
              </h3>
              <p className="text-gray-600 mb-4">
                There are no posts to display at the moment.
              </p>
              <Link href="/create-post" >
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                  Create First Post
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
