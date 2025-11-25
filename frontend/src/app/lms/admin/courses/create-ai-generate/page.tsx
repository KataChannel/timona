'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Sparkles, FileText, Zap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function CreateAIGeneratePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const documentsParam = searchParams.get('documents');
  const documentIds = documentsParam ? documentsParam.split(',') : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Quay lại</span>
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                    Tạo hoàn toàn bằng AI
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                    AI sẽ tự động tạo khóa học hoàn chỉnh từ tài liệu
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="space-y-6">
          {/* Documents Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Tài liệu đã chọn
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Badge variant="outline">{documentIds.length} tài liệu</Badge>
                <span>sẽ được AI xử lý tự động</span>
              </div>
            </CardContent>
          </Card>

          {/* Coming Soon Notice */}
          <Alert className="border-emerald-200 bg-emerald-50">
            <Zap className="h-5 w-5 text-emerald-600" />
            <AlertDescription className="text-emerald-900 mt-2">
              <p className="font-semibold mb-2">Tính năng đang được phát triển</p>
              <p className="text-sm">
                Tính năng "Tạo hoàn toàn bằng AI" sẽ tự động tạo khóa học hoàn chỉnh bao gồm:
              </p>
              <ul className="mt-2 space-y-1 text-sm list-disc list-inside ml-2">
                <li>Phân tích và trích xuất nội dung từ tài liệu</li>
                <li>Tạo cấu trúc modules và lessons logic</li>
                <li>Sinh nội dung bài giảng chi tiết</li>
                <li>Tạo video scripts và presentations</li>
                <li>Sinh bài tập thực hành</li>
                <li>Tạo quiz và đánh giá tự động</li>
                <li>Đề xuất learning path</li>
              </ul>
              <p className="text-sm mt-3">
                Quá trình này có thể mất vài phút tùy thuộc vào số lượng và độ phức tạp của tài liệu.
              </p>
            </AlertDescription>
          </Alert>

          {/* AI Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Xử lý thông minh</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-2">
                <p>• Nhận dạng định dạng tài liệu (PDF, Word, PPT...)</p>
                <p>• Trích xuất text, images, diagrams</p>
                <p>• Phân tích cấu trúc và mức độ kiến thức</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Nội dung chất lượng</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-2">
                <p>• Tạo nội dung dễ hiểu, logic</p>
                <p>• Thêm ví dụ và case studies</p>
                <p>• Tối ưu cho học trực tuyến</p>
              </CardContent>
            </Card>
          </div>

          {/* Temporary Action */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Loader2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 mb-4">
                  Tính năng này sẽ có sẵn trong phiên bản tiếp theo
                </p>
                <Button
                  variant="outline"
                  onClick={() => router.push('/lms/admin/courses/create')}
                >
                  Quay lại chọn phương thức khác
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
