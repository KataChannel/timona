'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { CheckCircle, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { REQUEST_COURSE_APPROVAL } from '@/graphql/lms/courses.graphql';
import { REQUEST_DOCUMENT_APPROVAL } from '@/graphql/lms/source-documents';

interface ApprovalRequestButtonProps {
  type: 'course' | 'document';
  id: string;
  title: string;
  approvalRequested?: boolean;
  status?: string;
  onSuccess?: () => void;
}

export function ApprovalRequestButton({
  type,
  id,
  title,
  approvalRequested = false,
  status = 'DRAFT',
  onSuccess,
}: ApprovalRequestButtonProps) {
  const { toast } = useToast();
  const [isRequesting, setIsRequesting] = useState(false);

  const mutation = type === 'course' ? REQUEST_COURSE_APPROVAL : REQUEST_DOCUMENT_APPROVAL;
  const variables = type === 'course' ? { courseId: id } : { documentId: id };

  const [requestApproval, { loading }] = useMutation(mutation, {
    onCompleted: () => {
      toast({
        title: 'Thành công',
        description: `Đã gửi yêu cầu phê duyệt ${type === 'course' ? 'khóa học' : 'tài liệu'} "${title}" đến admin`,
        variant: 'default',
      });
      setIsRequesting(true);
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể gửi yêu cầu phê duyệt',
        variant: 'destructive',
      });
    },
  });

  const handleRequestApproval = async () => {
    if (status !== 'DRAFT') {
      toast({
        title: 'Cảnh báo',
        description: `Chỉ có thể gửi yêu cầu phê duyệt cho ${type === 'course' ? 'khóa học' : 'tài liệu'} ở trạng thái nháp`,
        variant: 'default',
      });
      return;
    }

    if (approvalRequested || isRequesting) {
      toast({
        title: 'Thông báo',
        description: 'Yêu cầu phê duyệt đã được gửi trước đó',
        variant: 'default',
      });
      return;
    }

    await requestApproval({ variables });
  };

  if (approvalRequested || isRequesting) {
    return (
      <Button variant="outline" disabled>
        <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
        Đã gửi yêu cầu phê duyệt
      </Button>
    );
  }

  if (status !== 'DRAFT') {
    return null;
  }

  return (
    <Button onClick={handleRequestApproval} disabled={loading} variant="default">
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Đang gửi...
        </>
      ) : (
        <>
          <Send className="w-4 h-4 mr-2" />
          Gửi yêu cầu phê duyệt
        </>
      )}
    </Button>
  );
}
