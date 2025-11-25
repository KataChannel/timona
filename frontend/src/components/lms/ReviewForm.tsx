// ✅ MIGRATED TO LMS REVIEW MUTATIONS + SHADCN/UI - 2025-11-01
// Original backup: ReviewForm.DYNAMIC.tsx

'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_REVIEW, UPDATE_REVIEW } from '@/graphql/lms/reviews.graphql';
import { Star, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ReviewFormProps {
  courseId: string;
  existingReview?: {
    id: string;
    rating: number;
    comment?: string;
  } | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ReviewForm({
  courseId,
  existingReview,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [error, setError] = useState('');

  // ✅ Use custom LMS mutations
  const [createReview, { loading: creating }] = useMutation(CREATE_REVIEW, {
    onCompleted: () => {
      onSuccess?.();
    },
    onError: (err) => {
      setError(err.message || 'Không thể tạo đánh giá');
    },
  });

  const [updateReview, { loading: updating }] = useMutation(UPDATE_REVIEW, {
    onCompleted: () => {
      onSuccess?.();
    },
    onError: (err) => {
      setError(err.message || 'Không thể cập nhật đánh giá');
    },
  });

  const loading = creating || updating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (rating === 0) {
      setError('Vui lòng chọn đánh giá sao');
      return;
    }

    try {
      if (existingReview) {
        // Update existing review
        await updateReview({
          variables: {
            input: {
              reviewId: existingReview.id,
              rating,
              comment: comment.trim() || undefined,
            },
          },
        });
      } else {
        // Create new review
        await createReview({
          variables: {
            input: {
              courseId,
              rating,
              comment: comment.trim() || undefined,
            },
          },
        });
      }
    } catch (err: any) {
      // Error handled in onError callback
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
      {/* Star Rating - Mobile First */}
      <div className="space-y-2">
        <Label className="text-sm md:text-base font-medium">
          Đánh giá của bạn <span className="text-destructive">*</span>
        </Label>
        <div className="flex items-center gap-1 flex-wrap">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="focus:outline-none focus:ring-2 focus:ring-primary rounded-sm transition-transform hover:scale-110"
              aria-label={`Rate ${star} stars`}
            >
              <Star
                className={`w-6 h-6 md:w-8 md:h-8 transition-colors ${
                  star <= (hoveredRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-muted-foreground'
                }`}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 md:ml-4 text-sm md:text-base font-medium text-foreground">
              {rating} sao
            </span>
          )}
        </div>
      </div>

      {/* Comment - Mobile First */}
      <div className="space-y-2">
        <Label htmlFor="comment" className="text-sm md:text-base font-medium">
          Nhận xét của bạn <span className="text-muted-foreground">(Tùy chọn)</span>
        </Label>
        <textarea
          id="comment"
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={1000}
          placeholder="Chia sẻ trải nghiệm của bạn về khóa học này..."
          className="w-full px-3 md:px-4 py-2 md:py-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 resize-none bg-background text-foreground text-sm md:text-base"
        />
        <p className="text-xs md:text-sm text-muted-foreground">
          {comment.length} / 1000 ký tự
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <Alert className="border-destructive bg-destructive/10">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-sm md:text-base text-destructive">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Action Buttons - Mobile Responsive */}
      <div className="flex flex-col-reverse sm:flex-row gap-2 md:gap-3">
        <Button
          type="submit"
          disabled={loading}
          className="w-full sm:flex-1 md:text-base"
        >
          {loading
            ? 'Đang gửi...'
            : existingReview
            ? 'Cập nhật đánh giá'
            : 'Gửi đánh giá'}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="w-full sm:flex-1 md:text-base"
          >
            Hủy
          </Button>
        )}
      </div>
    </form>
  );
}
