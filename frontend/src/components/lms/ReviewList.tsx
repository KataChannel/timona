// ✅ MIGRATED TO DYNAMIC GRAPHQL + SHADCN/UI - 2025-11-01
// Original backup: ReviewList.tsx.backup

'use client';

import { useState } from 'react';
import { useFindMany, useUpdateOne, useDeleteOne } from '@/hooks/useDynamicGraphQL';
import { Star, ThumbsUp, Edit, Trash2, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface ReviewListProps {
  courseId: string;
  currentUserId?: string;
  onEditReview?: (review: any) => void;
}

export default function ReviewList({
  courseId,
  currentUserId,
  onEditReview,
}: ReviewListProps) {
  const [sortBy, setSortBy] = useState<'recent' | 'helpful' | 'rating'>('recent');
  const [filterByRating, setFilterByRating] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // ✅ Migrated to Dynamic GraphQL
  const { data: reviewsData, loading, error, refetch } = useFindMany('review', {
    where: {
      courseId,
      ...(filterByRating && { rating: filterByRating }),
    },
    orderBy: sortBy === 'recent' 
      ? { createdAt: 'desc' } 
      : sortBy === 'helpful'
      ? { helpfulCount: 'desc' }
      : { rating: 'desc' },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  // ✅ Migrated: Update review for marking helpful
  const [markHelpful] = useUpdateOne('review');

  // ✅ Migrated: Delete review
  const [deleteReviewMutation] = useDeleteOne('review');

  const handleMarkHelpful = async (reviewId: string) => {
    try {
      await markHelpful({
        where: { id: reviewId },
        data: { helpfulCount: { increment: 1 } },
      });
      refetch();
    } catch (err) {
      console.error('Failed to mark review as helpful:', err);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      await deleteReviewMutation({ where: { id: reviewId } });
      refetch();
    } catch (err: any) {
      alert(err.message || 'Failed to delete review');
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading && !reviewsData) {
    return (
      <div className="space-y-3 md:space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="space-y-3 animate-pulse">
                <div className="h-4 bg-muted rounded w-1/4" />
                <div className="h-20 bg-muted rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-destructive bg-destructive/10">
        <AlertCircle className="h-4 w-4 text-destructive" />
        <AlertDescription className="text-destructive">
          Không thể tải đánh giá: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  const reviews = reviewsData || [];
  const total = reviews?.length || 0;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Filters and Sorting - Mobile First */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 md:gap-4">
        <div>
          {filterByRating && (
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-muted text-xs md:text-sm"
              onClick={() => setFilterByRating(null)}
            >
              {filterByRating} sao ×
            </Badge>
          )}
        </div>
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
          <SelectTrigger className="w-full sm:w-auto md:text-base">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Mới nhất</SelectItem>
            <SelectItem value="helpful">Hữu ích nhất</SelectItem>
            <SelectItem value="rating">Đánh giá cao nhất</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reviews List - Mobile First */}
      {reviews.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <p className="text-muted-foreground text-sm md:text-base">
              {filterByRating
                ? `Chưa có đánh giá ${filterByRating} sao`
                : 'Chưa có đánh giá nào. Hãy là người đầu tiên viết đánh giá!'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {reviews.map((review: any) => {
            const isOwner = currentUserId === review.userId;
            const hasVoted = currentUserId && review.helpfulVoters?.includes(currentUserId);

            return (
              <Card key={review.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4 md:pt-6">
                  {/* Header - Mobile First */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm md:text-base flex-shrink-0">
                        {review.user?.firstName?.[0] || review.user?.username?.[0] || 'U'}
                      </div>

                      {/* User Info & Rating */}
                      <div className="flex-1">
                        <div className="font-medium text-foreground text-sm md:text-base">
                          {review.user?.firstName && review.user?.lastName
                            ? `${review.user.firstName} ${review.user.lastName}`
                            : review.user?.username || 'Ẩn danh'}
                        </div>
                        <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            {renderStars(review.rating)}
                          </div>
                          <span className="text-xs md:text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(review.createdAt), {
                              addSuffix: true,
                              locale: { formatDistance: () => 'Gần đây' } as any,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions Menu (for owner) - Mobile Optimized */}
                    {isOwner && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditReview?.(review)}
                          className="h-8 w-8 p-0"
                          title="Chỉnh sửa đánh giá"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteReview(review.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          title="Xóa đánh giá"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Comment */}
                  {review.comment && (
                    <p className="text-foreground text-sm md:text-base mb-4 whitespace-pre-wrap break-words">
                      {review.comment}
                    </p>
                  )}

                  {/* Helpful Button - Mobile Responsive */}
                  {currentUserId && !isOwner && (
                    <Button
                      variant={hasVoted ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleMarkHelpful(review.id)}
                      className="w-full xs:w-auto gap-2 text-xs md:text-sm"
                    >
                      <ThumbsUp
                        className={`w-3 h-3 md:w-4 md:h-4 ${hasVoted ? 'fill-current' : ''}`}
                      />
                      Hữu ích ({review.helpfulCount || 0})
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination - Mobile Responsive */}
      {total > pageSize && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 md:gap-3 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-full xs:w-auto"
          >
            Trước
          </Button>
          <span className="text-xs md:text-sm text-muted-foreground">
            Trang {page} / {Math.ceil(total / pageSize)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= Math.ceil(total / pageSize)}
            className="w-full xs:w-auto"
          >
            Sau
          </Button>
        </div>
      )}
    </div>
  );
}
