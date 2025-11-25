// ✅ MIGRATED TO DYNAMIC GRAPHQL + SHADCN/UI - 2025-11-01
// Original backup: ReviewsSection.tsx.backup

'use client';

import { useState } from 'react';
import { useFindMany, useFindUnique } from '@/hooks/useDynamicGraphQL';
import { MessageSquare, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';

interface ReviewsSectionProps {
  courseId: string;
  currentUserId?: string;
  isEnrolled: boolean;
}

export default function ReviewsSection({
  courseId,
  currentUserId,
  isEnrolled,
}: ReviewsSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<any>(null);

  // ✅ Migrated to Dynamic GraphQL  
  const { data: userReviews, refetch: refetchUserReview } = useFindMany('review', {
    where: {
      courseId,
      ...(currentUserId && { userId: currentUserId }),
    },
    take: 1,
  });

  const userReview = userReviews?.[0];

  const handleSuccess = () => {
    setShowForm(false);
    setEditingReview(null);
    refetchUserReview();
  };

  const handleEditReview = (review: any) => {
    setEditingReview(review);
    setShowForm(true);
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Section Header - Mobile First Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2 md:gap-3">
          <MessageSquare className="w-5 h-5 md:w-6 md:h-6 text-primary flex-shrink-0" />
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            Đánh giá từ học viên
          </h2>
        </div>

        {/* Add/Edit Review Button - Mobile Optimized */}
        {isEnrolled && currentUserId && (
          <div>
            {userReview && !showForm ? (
              <Button
                onClick={() => {
                  setEditingReview(userReview);
                  setShowForm(true);
                }}
                size="sm"
                className="w-full sm:w-auto gap-2"
              >
                <Edit2 className="w-4 h-4" />
                <span className="hidden xs:inline">Chỉnh sửa đánh giá</span>
                <span className="xs:hidden">Chỉnh sửa</span>
              </Button>
            ) : !userReview && !showForm ? (
              <Button
                onClick={() => setShowForm(true)}
                size="sm"
                className="w-full sm:w-auto"
              >
                Viết đánh giá
              </Button>
            ) : null}
          </div>
        )}
      </div>

      {/* Enrollment Requirement Notice */}
      {!isEnrolled && currentUserId && (
        <Alert className="border-blue-200 bg-blue-50">
          <AlertDescription className="text-sm text-blue-800">
            <strong className="block sm:inline">Ghi danh khóa học này</strong>
            <span className="block sm:inline sm:before:content-[' '] md:before:content-[' ']">
              để viết đánh giá và chia sẻ trải nghiệm của bạn với các học viên khác.
            </span>
          </AlertDescription>
        </Alert>
      )}

      {/* Review Form - Mobile First */}
      {showForm && isEnrolled && currentUserId && (
        <Card className="border-2 border-primary/20">
          <CardContent className="pt-6">
            <h3 className="text-base md:text-lg font-semibold text-foreground mb-4">
              {editingReview ? 'Chỉnh sửa đánh giá của bạn' : 'Viết đánh giá của bạn'}
            </h3>
            <ReviewForm
              courseId={courseId}
              existingReview={editingReview}
              onSuccess={handleSuccess}
              onCancel={() => {
                setShowForm(false);
                setEditingReview(null);
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Review List */}
      <ReviewList
        courseId={courseId}
        currentUserId={currentUserId}
        onEditReview={handleEditReview}
      />
    </div>
  );
}
