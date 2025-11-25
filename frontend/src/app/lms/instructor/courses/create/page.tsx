'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Wand2, Hand, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { SourceDocumentSelector } from '@/components/lms/SourceDocumentSelector';

type CreationMethod = 'manual' | 'ai-analyze' | 'ai-generate' | null;

export default function CreateCoursePage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [creationMethod, setCreationMethod] = useState<CreationMethod>(null);

  const handleDocumentSelection = (documentIds: string[]) => {
    setSelectedDocuments(documentIds);
  };

  const handleNextStep = () => {
    if (selectedDocuments.length === 0) {
      return;
    }
    setStep(2);
  };

  const handleMethodSelect = (method: CreationMethod) => {
    setCreationMethod(method);
    
    const documentsParam = selectedDocuments.join(',');
    
    switch (method) {
      case 'manual':
        router.push('/lms/instructor/courses/create-manual?documents=' + documentsParam);
        break;
      case 'ai-analyze':
        router.push('/lms/instructor/courses/create-ai-analyze?documents=' + documentsParam);
        break;
      case 'ai-generate':
        router.push('/lms/instructor/courses/create-ai-generate?documents=' + documentsParam);
        break;
    }
  };

  const creationMethods = [
    {
      id: 'manual' as CreationMethod,
      title: 'Tạo thủ công',
      description: 'Tự tạo nội dung khóa học từ tài liệu đã chọn',
      icon: Hand,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
      borderColor: 'border-blue-200',
      features: [
        'Kiểm soát hoàn toàn nội dung',
        'Tùy chỉnh chi tiết từng bài học',
        'Thêm bài tập và đánh giá',
      ],
    },
    {
      id: 'ai-analyze' as CreationMethod,
      title: 'Phân tích AI',
      description: 'AI phân tích tài liệu và đề xuất cấu trúc khóa học',
      icon: Wand2,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 hover:bg-purple-100',
      borderColor: 'border-purple-200',
      features: [
        'AI phân tích nội dung tài liệu',
        'Đề xuất cấu trúc khóa học',
        'Bạn chỉnh sửa và hoàn thiện',
      ],
    },
    {
      id: 'ai-generate' as CreationMethod,
      title: 'Tạo hoàn toàn bằng AI',
      description: 'AI tự động tạo khóa học hoàn chỉnh từ tài liệu',
      icon: Sparkles,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 hover:bg-emerald-100',
      borderColor: 'border-emerald-200',
      features: [
        'AI tạo toàn bộ nội dung khóa học',
        'Tự động chia module và bài học',
        'Tạo bài tập và câu hỏi đánh giá',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => step === 1 ? router.back() : setStep(1)}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Quay lại</span>
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex-1">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                Tạo khóa học mới
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                {step === 1 ? 'Bước 1: Chọn tài liệu nguồn' : 'Bước 2: Chọn phương thức tạo'}
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <div className={'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ' + (step === 1 ? 'bg-blue-600 text-white' : 'bg-green-600 text-white')}>
                1
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <div className={'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ' + (step === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500')}>
                2
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {step === 1 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg sm:text-xl">Chọn tài liệu nguồn</CardTitle>
                    <CardDescription className="mt-1.5">
                      Chọn một hoặc nhiều tài liệu làm nguồn để tạo khóa học
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <SourceDocumentSelector
                  value={selectedDocuments}
                  onChange={handleDocumentSelection}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => router.back()}>
                Hủy
              </Button>
              <Button
                onClick={handleNextStep}
                disabled={selectedDocuments.length === 0}
                className="gap-2"
              >
                Tiếp theo
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Chọn phương thức tạo khóa học</CardTitle>
                <CardDescription className="mt-1.5">
                  Đã chọn {selectedDocuments.length} tài liệu. Chọn cách bạn muốn tạo khóa học.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {creationMethods.map((method) => {
                    const Icon = method.icon;
                    const isSelected = creationMethod === method.id;
                    
                    return (
                      <button
                        key={method.id}
                        onClick={() => handleMethodSelect(method.id)}
                        className={'text-left p-5 rounded-xl border-2 transition-all ' + method.bgColor + ' ' + method.borderColor + ' ' + (isSelected ? 'ring-2 ring-offset-2 ring-blue-500' : '')}
                      >
                        <div className="flex items-start gap-3 mb-4">
                          <div className={'w-10 h-10 rounded-lg ' + method.bgColor + ' flex items-center justify-center flex-shrink-0'}>
                            <Icon className={'w-5 h-5 ' + method.color} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className={'font-semibold ' + method.color + ' text-base sm:text-lg truncate'}>
                              {method.title}
                            </h3>
                            <Badge variant="outline" className="mt-1 text-xs">
                              {method.id === 'manual' ? 'Khuyên dùng cho chuyên gia' : 
                               method.id === 'ai-analyze' ? 'Nhanh & Linh hoạt' : 
                               'Nhanh nhất'}
                            </Badge>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-4">
                          {method.description}
                        </p>
                        
                        <ul className="space-y-2">
                          {method.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-gray-700">
                              <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-gray-400" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
