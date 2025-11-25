'use client';

import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { Star, ThumbsUp, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const GET_PRODUCT_REVIEWS = gql`
  query GetProductReviews($productId: ID!, $page: Int, $limit: Int) {
    productReviews(productId: $productId, page: $page, limit: $limit) {
      items {
        id
        rating
        title
        comment
        images
        isVerifiedPurchase
        helpfulCount
        createdAt
        user {
          id
          firstName
          lastName
          avatar
        }
        guestName
      }
      total
      page
      totalPages
    }
    productRatingSummary(productId: $productId) {
      averageRating
      totalReviews
      ratingDistribution {
        5: _5
        4: _4
        3: _3
        2: _2
        1: _1
      }
    }
  }
`;

const CREATE_REVIEW = gql`
  mutation CreateReview($input: CreateReviewInput!) {
    createReview(input: $input) {
      id
      rating
      title
      comment
    }
  }
`;

const MARK_REVIEW_HELPFUL = gql`
  mutation MarkReviewHelpful($input: ReviewHelpfulInput!) {
    markReviewHelpful(input: $input) {
      success
      helpfulCount
    }
  }
`;

interface ProductReviewsProps {
  productId: string;
  userCanReview?: boolean;
}

export function ProductReviews({ productId, userCanReview = false }: ProductReviewsProps) {
  const [page, setPage] = useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');

  const { data, loading, refetch } = useQuery(GET_PRODUCT_REVIEWS, {
    variables: { productId, page, limit: 10 },
  });

  const [createReview, { loading: submitting }] = useMutation(CREATE_REVIEW, {
    onCompleted: () => {
      toast.success('Đánh giá của bạn đã được gửi!');
      setShowReviewForm(false);
      setRating(5);
      setTitle('');
      setComment('');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const [markHelpful] = useMutation(MARK_REVIEW_HELPFUL, {
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
          rating,
          title,
          comment,
        },
      },
    });
  };

  const handleMarkHelpful = async (reviewId: string) => {
    await markHelpful({
      variables: {
        input: {
          reviewId,
          helpful: true,
        },
      },
    });
  };

  const reviews = data?.productReviews?.items || [];
  const summary = data?.productRatingSummary;
  const distribution = summary?.ratingDistribution || {};

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      {summary && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Average Rating */}
              <div className="text-center">
                <div className="text-5xl font-bold text-blue-600">
                  {summary.averageRating.toFixed(1)}
                </div>
                <div className="flex justify-center gap-1 my-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-6 h-6 ${
                        star <= Math.round(summary.averageRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-600">{summary.totalReviews} đánh giá</p>
              </div>

              {/* Rating Distribution */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = distribution[star] || 0;
                  const percentage =
                    summary.totalReviews > 0 ? (count / summary.totalReviews) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-sm w-12">{star} sao</span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm w-12 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Write Review Button */}
      {userCanReview && !showReviewForm && (
        <div className="text-center">
          <Button onClick={() => setShowReviewForm(true)} size="lg">
            Viết đánh giá
          </Button>
        </div>
      )}

      {/* Review Form */}
      {showReviewForm && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Đánh giá của bạn
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 cursor-pointer transition-colors ${
                          star <= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300 hover:text-yellow-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Tiêu đề (không bắt buộc)
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Tóm tắt đánh giá của bạn"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Nhận xét
                </label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                  rows={4}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowReviewForm(false)}
                >
                  Hủy
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
          </div>
        ) : reviews.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8 text-gray-500">
              Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sản phẩm này!
            </CardContent>
          </Card>
        ) : (
          reviews.map((review: any) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    {review.user?.avatar ? (
                      <img
                        src={review.user.avatar}
                        alt={review.user.firstName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-600 font-semibold">
                        {(review.user?.firstName || review.guestName || 'U')[0].toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Review Content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold">
                          {review.user
                            ? `${review.user.firstName || ''} ${review.user.lastName || ''}`.trim()
                            : review.guestName}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          {review.isVerifiedPurchase && (
                            <div className="flex items-center gap-1 text-green-600 text-sm">
                              <CheckCircle className="w-4 h-4" />
                              <span>Đã mua hàng</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(review.createdAt), {
                          addSuffix: true,
                          locale: vi,
                        })}
                      </span>
                    </div>

                    {review.title && (
                      <h4 className="font-semibold mb-2">{review.title}</h4>
                    )}

                    <p className="text-gray-700 mb-3 whitespace-pre-wrap">{review.comment}</p>

                    {/* Review Images */}
                    {review.images && review.images.length > 0 && (
                      <div className="flex gap-2 mb-3">
                        {review.images.map((img: string, idx: number) => (
                          <img
                            key={idx}
                            src={img}
                            alt={`Review ${idx + 1}`}
                            className="w-20 h-20 object-cover rounded border"
                          />
                        ))}
                      </div>
                    )}

                    {/* Helpful Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkHelpful(review.id)}
                    >
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      Hữu ích ({review.helpfulCount})
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {data?.productReviews?.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Trước
          </Button>
          <span className="px-4 py-2">
            Trang {page} / {data.productReviews.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page >= data.productReviews.totalPages}
            onClick={() => setPage(page + 1)}
          >
            Sau
          </Button>
        </div>
      )}
    </div>
  );
}
