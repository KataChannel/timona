'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Star, ThumbsUp, MessageSquare, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const GET_PRODUCT_REVIEWS = gql`
  query GetProductReviews($productId: ID!, $rating: Int, $limit: Int, $page: Int) {
    productReviews(productId: $productId, rating: $rating, limit: $limit, page: $page) {
      items {
        id
        productId
        rating
        title
        comment
        images
        isVerifiedPurchase
        isApproved
        helpfulCount
        createdAt
        updatedAt
        user {
          id
          email
          fullName
          avatar
        }
        product {
          id
          name
          slug
        }
      }
      total
      page
      pageSize
      totalPages
      hasMore
    }
  }
`;

const CREATE_REVIEW = gql`
  mutation CreateReview($input: CreateReviewInput!) {
    createReview(input: $input) {
      id
      productId
      rating
      title
      comment
      images
      isVerifiedPurchase
      isApproved
      helpfulCount
      createdAt
      updatedAt
    }
  }
`;

const MARK_HELPFUL = gql`
  mutation MarkReviewHelpful($input: ReviewHelpfulInput!) {
    markReviewHelpful(input: $input) {
      success
      message
    }
  }
`;

interface Review {
  id: string;
  productId: string;
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email?: string;
    fullName?: string;
    avatar?: string;
  };
  product?: {
    id: string;
    name: string;
    slug: string;
  };
}

interface RatingStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Array<{
    rating: number;
    count: number;
    percentage: number;
  }>;
}

interface ProductReviewsProps {
  productId: string;
  canReview?: boolean;
}

export function ProductReviews({ productId, canReview = false }: ProductReviewsProps) {
  const { toast } = useToast();
  const [ratingFilter, setRatingFilter] = useState<string>('ALL');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { data, loading, refetch } = useQuery<{
    productReviews: {
      items: Review[];
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
      hasMore: boolean;
    };
  }>(GET_PRODUCT_REVIEWS, {
    variables: {
      productId,
      rating: ratingFilter === 'ALL' ? undefined : parseInt(ratingFilter),
      limit: 10,
      page: currentPage,
    },
  });

  const [createReview, { loading: submitting }] = useMutation(CREATE_REVIEW, {
    onCompleted: () => {
      toast({
        title: 'Đánh giá thành công',
        description: 'Cảm ơn bạn đã đánh giá sản phẩm',
        type: 'success',
      });
      setShowReviewForm(false);
      setNewRating(5);
      setNewComment('');
      refetch();
    },
    onError: () => {
      toast({
        title: 'Lỗi',
        description: 'Không thể gửi đánh giá. Vui lòng thử lại.',
        type: 'error',
        variant: 'destructive',
      });
    },
  });

  const [markHelpful] = useMutation(MARK_HELPFUL, {
    onCompleted: () => {
      refetch();
    },
  });

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    await createReview({
      variables: {
        input: {
          productId,
          rating: newRating,
          comment: newComment,
        },
      },
    });
  };

  const handleMarkHelpful = async (reviewId: string) => {
    await markHelpful({ 
      variables: { 
        input: {
          reviewId,
          helpful: true
        }
      } 
    });
  };

  const reviews = data?.productReviews?.items || [];
  const totalReviews = data?.productReviews?.total || 0;
  const totalPages = data?.productReviews?.totalPages || 1;
  const hasMore = data?.productReviews?.hasMore || false;

  // Calculate average rating from reviews
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Rating Overview */}
      {totalReviews > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Đánh giá sản phẩm</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Average Rating */}
              <div className="text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div>
                    <div className="text-5xl font-bold text-gray-900">
                      {averageRating.toFixed(1)}
                    </div>
                    <div className="flex items-center justify-center md:justify-start gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn(
                            'h-5 w-5',
                            star <= Math.round(averageRating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'fill-gray-200 text-gray-200'
                          )}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {totalReviews} đánh giá
                    </p>
                  </div>
                </div>
              </div>

              {/* Rating Distribution */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = reviews.filter((r) => r.rating === rating).length;
                  const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

                  return (
                    <div key={rating} className="flex items-center gap-2">
                      <div className="flex items-center gap-1 w-16">
                        <span className="text-sm font-medium">{rating}</span>
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      </div>
                      <Progress value={percentage} className="flex-1 h-2" />
                      <span className="text-sm text-gray-600 w-12 text-right">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Review Form */}
      {canReview && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Viết đánh giá</CardTitle>
              {!showReviewForm && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReviewForm(true)}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Đánh giá
                </Button>
              )}
            </div>
          </CardHeader>
          {showReviewForm && (
            <CardContent>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                {/* Star Rating */}
                <div>
                  <Label>Đánh giá của bạn</Label>
                  <div className="flex gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className="focus:outline-none focus:ring-2 focus:ring-primary rounded"
                      >
                        <Star
                          className={cn(
                            'h-8 w-8 transition-colors',
                            star <= newRating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'fill-gray-200 text-gray-200 hover:fill-yellow-200 hover:text-yellow-200'
                          )}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <Label htmlFor="comment">Nhận xét (tùy chọn)</Label>
                  <Textarea
                    id="comment"
                    placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={4}
                    className="mt-2"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowReviewForm(false);
                      setNewRating(5);
                      setNewComment('');
                    }}
                  >
                    Hủy
                  </Button>
                </div>
              </form>
            </CardContent>
          )}
        </Card>
      )}

      {/* Reviews Filter */}
      <div className="flex items-center gap-3">
        <Filter className="h-4 w-4 text-gray-500" />
        <Select value={ratingFilter} onValueChange={setRatingFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Lọc theo sao" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả đánh giá</SelectItem>
            <SelectItem value="5">5 sao</SelectItem>
            <SelectItem value="4">4 sao</SelectItem>
            <SelectItem value="3">3 sao</SelectItem>
            <SelectItem value="2">2 sao</SelectItem>
            <SelectItem value="1">1 sao</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500">Đang tải...</p>
            </CardContent>
          </Card>
        ) : reviews.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">
                {ratingFilter === 'ALL'
                  ? 'Chưa có đánh giá nào'
                  : 'Không có đánh giá phù hợp'}
              </p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review: Review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  {/* Avatar */}
                  <Avatar className="flex-shrink-0">
                    {review.user?.avatar && <AvatarImage src={review.user.avatar} />}
                    <AvatarFallback>
                      {review.user?.fullName?.charAt(0).toUpperCase() || review.user?.email?.charAt(0).toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* User & Rating */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                      <div>
                        <p className="font-medium text-gray-900">
                          {review.user?.fullName || review.user?.email || 'Khách hàng'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={cn(
                                  'h-4 w-4',
                                  star <= review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'fill-gray-200 text-gray-200'
                                )}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(review.createdAt), {
                              addSuffix: true,
                              locale: vi,
                            })}
                          </span>
                          {review.isVerifiedPurchase && (
                            <span className="text-xs text-green-600 font-medium">
                              ✓ Đã mua hàng
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Title */}
                    {review.title && (
                      <h4 className="text-base font-semibold text-gray-900 mt-3">
                        {review.title}
                      </h4>
                    )}

                    {/* Comment */}
                    {review.comment && (
                      <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">
                        {review.comment}
                      </p>
                    )}

                    {/* Review Images */}
                    {review.images && review.images.length > 0 && (
                      <div className="flex gap-2 mt-3 overflow-x-auto">
                        {review.images.map((image, idx) => (
                          <img
                            key={idx}
                            src={image}
                            alt={`Review ${idx + 1}`}
                            className="h-20 w-20 object-cover rounded border"
                          />
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-4 mt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-gray-600 hover:text-primary"
                        onClick={() => handleMarkHelpful(review.id)}
                      >
                        <ThumbsUp className="h-4 w-4 mr-1.5" />
                        <span className="text-xs">
                          Hữu ích ({review.helpfulCount})
                        </span>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Trước
          </Button>
          <div className="px-4 py-2 text-sm font-medium">
            Trang {currentPage} / {totalPages}
          </div>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={!hasMore}
          >
            Sau
          </Button>
        </div>
      )}
    </div>
  );
}
