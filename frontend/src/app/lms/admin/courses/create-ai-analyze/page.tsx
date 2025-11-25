'use client';

import { useState, useEffect } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Sparkles, ArrowRight, ArrowLeft, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ANALYZE_DOCUMENTS_FOR_COURSE, GENERATE_COURSE_FROM_DOCUMENTS } from '@/graphql/lms/courses.graphql';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AnalysisResult {
  suggestedTitle: string;
  suggestedDescription: string;
  recommendedLevel: string;
  aggregatedKeywords: string[];
  mainTopics: string[];
  learningObjectives: string[];
  whatYouWillLearn: string[];
  requirements: string[];
  targetAudience: string[];
  suggestedStructure: {
    moduleCount?: number;
    modules?: Array<{
      title: string;
      description: string;
      topics: string[];
    }>;
  };
  estimatedDuration: string;
  sourceDocumentIds: string[];
  analysisSummary: string;
}

interface FormData {
  title: string;
  description: string;
  level: string;
  learningObjectives: string;
  whatYouWillLearn: string;
  requirements: string;
  targetAudience: string;
  additionalContext: string;
}

export default function CreateAIAnalyzePage() {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  
  const documentsParam = searchParams.get('documents');
  const documentIds = documentsParam ? documentsParam.split(',') : [];
  
  // State
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [additionalContext, setAdditionalContext] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [hasAttemptedAnalysis, setHasAttemptedAnalysis] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    level: '',
    learningObjectives: '',
    whatYouWillLearn: '',
    requirements: '',
    targetAudience: '',
    additionalContext: '',
  });
  
  // GraphQL operations
  const [analyzeDocuments, { loading: analyzing }] = useLazyQuery(ANALYZE_DOCUMENTS_FOR_COURSE, {
    onCompleted: (data) => {
      const result = data.analyzeDocumentsForCourse;
      setAnalysisResult(result);
      
      // Pre-fill form with AI suggestions
      setFormData({
        title: result.suggestedTitle,
        description: result.suggestedDescription,
        level: result.recommendedLevel,
        learningObjectives: result.learningObjectives.join('\n'),
        whatYouWillLearn: result.whatYouWillLearn.join('\n'),
        requirements: result.requirements.join('\n'),
        targetAudience: result.targetAudience.join('\n'),
        additionalContext: additionalContext,
      });
      
      setCurrentStep(2);
      
      toast({
        type: 'success',
        title: 'Thành công',
        description: 'AI đã phân tích và tổng hợp thông tin từ tài liệu nguồn',
      });
    },
    onError: (error) => {
      const errorMessage = error.message;
      
      // Handle specific error cases
      if (errorMessage.includes('No valid published documents found')) {
        toast({
          type: 'error',
          title: 'Tài liệu chưa được xuất bản',
          description: 'Vui lòng xuất bản (publish) tài liệu nguồn trước khi sử dụng AI phân tích.',
        });
      } else if (errorMessage.includes('documentIds')) {
        toast({
          type: 'error',
          title: 'Thiếu tài liệu',
          description: 'Vui lòng chọn ít nhất 1 tài liệu nguồn.',
        });
      } else {
        toast({
          type: 'error',
          title: 'Lỗi phân tích AI',
          description: errorMessage || 'Không thể phân tích tài liệu. Vui lòng thử lại.',
        });
      }
      
      // DO NOT setCurrentStep(1) here - it will trigger useEffect loop!
      // The hasAttemptedAnalysis flag already prevents re-run
    },
  });
  
  const [generateCourse, { loading: generating }] = useMutation(GENERATE_COURSE_FROM_DOCUMENTS, {
    onCompleted: (data) => {
      toast({
        type: 'success',
        title: 'Thành công',
        description: `Khóa học "${data.generateCourseFromDocuments.title}" đã được tạo`,
      });
      router.push(`/lms/admin/courses/${data.generateCourseFromDocuments.id}`);
    },
    onError: (error) => {
      toast({
        type: 'error',
        title: 'Lỗi',
        description: error.message,
      });
    },
  });
  
  // No auto-analyze - user must click "Bắt đầu phân tích" button
  
  const handleAnalyze = () => {
    if (documentIds.length === 0) {
      toast({
        type: 'error',
        title: 'Lỗi',
        description: 'Không tìm thấy tài liệu nguồn',
      });
      router.push('/lms/admin/courses/create');
      return;
    }
    
    setHasAttemptedAnalysis(true);
    analyzeDocuments({
      variables: {
        input: {
          documentIds: documentIds,
          additionalContext: additionalContext || undefined,
        },
      },
    });
  };
  
  const handleGenerate = () => {
    if (!formData.title.trim()) {
      toast({
        type: 'error',
        title: 'Lỗi',
        description: 'Vui lòng nhập tiêu đề khóa học',
      });
      return;
    }
    
    generateCourse({
      variables: {
        input: {
          documentIds: documentIds,
          title: formData.title,
          description: formData.description || undefined,
          level: formData.level || undefined,
          learningObjectives: formData.learningObjectives 
            ? formData.learningObjectives.split('\n').filter(Boolean) 
            : undefined,
          whatYouWillLearn: formData.whatYouWillLearn 
            ? formData.whatYouWillLearn.split('\n').filter(Boolean) 
            : undefined,
          requirements: formData.requirements 
            ? formData.requirements.split('\n').filter(Boolean) 
            : undefined,
          targetAudience: formData.targetAudience 
            ? formData.targetAudience.split('\n').filter(Boolean) 
            : undefined,
          additionalContext: formData.additionalContext || undefined,
        },
      },
    });
  };
  
  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else {
      router.back();
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              disabled={analyzing || generating}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Quay lại</span>
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                    Phân tích AI
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                    AI phân tích tài liệu và đề xuất cấu trúc khóa học
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-6 sm:mb-8">
          <div className={`flex items-center gap-2 ${currentStep === 1 ? 'text-purple-600' : 'text-gray-400'}`}>
            <div className={`flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full border-2 font-semibold ${
              currentStep === 1 
                ? 'border-purple-600 bg-purple-600 text-white' 
                : analysisResult 
                  ? 'border-green-500 bg-green-500 text-white' 
                  : 'border-gray-300'
            }`}>
              {analysisResult ? <CheckCircle2 className="w-5 h-5" /> : '1'}
            </div>
            <span className="hidden sm:inline font-medium text-sm">Phân tích AI</span>
          </div>
          
          <ArrowRight className="h-5 w-5 text-gray-400" />
          
          <div className={`flex items-center gap-2 ${currentStep === 2 ? 'text-purple-600' : 'text-gray-400'}`}>
            <div className={`flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full border-2 font-semibold ${
              currentStep === 2 ? 'border-purple-600 bg-purple-600 text-white' : 'border-gray-300'
            }`}>
              2
            </div>
            <span className="hidden sm:inline font-medium text-sm">Chỉnh sửa & Tạo</span>
          </div>
        </div>
        
        {/* Step 1: Analyze */}
        {currentStep === 1 && (
          <div className="space-y-6">
            {/* Important Notice */}
            <Alert className="border-amber-200 bg-amber-50">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <AlertDescription className="text-amber-900 ml-2">
                <p className="font-semibold mb-1">📌 Lưu ý quan trọng</p>
                <p className="text-sm">
                  Tài liệu nguồn phải được <strong>xuất bản (PUBLISHED)</strong> trước khi sử dụng AI phân tích. 
                  Nếu gặp lỗi, vui lòng kiểm tra trạng thái tài liệu tại trang quản lý tài liệu nguồn.
                </p>
              </AlertDescription>
            </Alert>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Tài liệu đã chọn
                </CardTitle>
                <CardDescription>
                  AI sẽ phân tích {documentIds.length} tài liệu nguồn
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-base px-3 py-1">
                    {documentIds.length} tài liệu
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="additionalContext">Thông tin bổ sung (tùy chọn)</Label>
                  <Textarea
                    id="additionalContext"
                    placeholder="Nhập thông tin bổ sung để AI hiểu rõ hơn về khóa học bạn muốn tạo..."
                    value={additionalContext}
                    onChange={(e) => setAdditionalContext(e.target.value)}
                    rows={4}
                    className="resize-none"
                    disabled={analyzing}
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Loading State */}
            {analyzing && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-2">
                      <p className="font-semibold text-blue-900">
                        🤖 AI đang phân tích {documentIds.length} tài liệu...
                      </p>
                      <p className="text-sm text-blue-700">
                        ⏱️ Thời gian ước tính: 10-15 giây
                      </p>
                      <p className="text-xs text-blue-600">
                        AI đang tổng hợp nội dung, trích xuất từ khóa, phân tích chủ đề và đề xuất cấu trúc khóa học.
                        Vui lòng chờ trong giây lát...
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/lms/admin/courses/create')}
                className="gap-2"
                disabled={analyzing}
              >
                <ArrowLeft className="h-4 w-4" />
                Quay lại
              </Button>
              
              {!analyzing && !analysisResult && (
                <Button
                  onClick={handleAnalyze}
                  disabled={documentIds.length === 0}
                  size="lg"
                  className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Sparkles className="h-5 w-5" />
                  Bắt đầu phân tích bằng AI
                </Button>
              )}
            </div>
          </div>
        )}
        
        {/* Step 2: Edit & Generate */}
        {currentStep === 2 && analysisResult && (
          <div className="space-y-6">
            {/* Analysis Summary */}
            <Card className="border-purple-200 bg-purple-50/50">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  Kết quả phân tích AI
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="font-medium">Thời lượng ước tính:</span>
                    <span className="text-gray-600">{analysisResult.estimatedDuration}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="font-medium">Cấp độ đề xuất:</span>
                    <span className="text-gray-600">{analysisResult.recommendedLevel}</span>
                  </div>
                </div>
                
                {analysisResult.mainTopics.length > 0 && (
                  <div>
                    <span className="font-medium text-sm block mb-2">Chủ đề chính:</span>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.mainTopics.map((topic, idx) => (
                        <span key={idx} className="px-2.5 py-1 text-xs rounded-full bg-purple-100 text-purple-700 font-medium">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {analysisResult.aggregatedKeywords.length > 0 && (
                  <div>
                    <span className="font-medium text-sm block mb-2">Từ khóa:</span>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.aggregatedKeywords.slice(0, 10).map((keyword, idx) => (
                        <span key={idx} className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                          {keyword}
                        </span>
                      ))}
                      {analysisResult.aggregatedKeywords.length > 10 && (
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-500">
                          +{analysisResult.aggregatedKeywords.length - 10} từ khóa khác
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {analysisResult.analysisSummary && (
                  <div>
                    <span className="font-medium text-sm block mb-2">Tóm tắt:</span>
                    <p className="text-sm text-gray-700 leading-relaxed">{analysisResult.analysisSummary}</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Edit Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Chỉnh sửa thông tin khóa học</CardTitle>
                <CardDescription>
                  Xem lại và chỉnh sửa thông tin trước khi tạo khóa học
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Tiêu đề khóa học *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Nhập tiêu đề khóa học"
                    disabled={generating}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Mô tả</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Mô tả khóa học"
                    rows={4}
                    className="resize-none"
                    disabled={generating}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="level">Cấp độ</Label>
                  <Input
                    id="level"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    placeholder="VD: Beginner, Intermediate, Advanced"
                    disabled={generating}
                  />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="learningObjectives">Mục tiêu học tập</Label>
                    <Textarea
                      id="learningObjectives"
                      value={formData.learningObjectives}
                      onChange={(e) => setFormData({ ...formData, learningObjectives: e.target.value })}
                      placeholder="Mỗi dòng 1 mục tiêu"
                      rows={5}
                      className="resize-none text-sm"
                      disabled={generating}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="whatYouWillLearn">Bạn sẽ học được gì</Label>
                    <Textarea
                      id="whatYouWillLearn"
                      value={formData.whatYouWillLearn}
                      onChange={(e) => setFormData({ ...formData, whatYouWillLearn: e.target.value })}
                      placeholder="Mỗi dòng 1 kỹ năng"
                      rows={5}
                      className="resize-none text-sm"
                      disabled={generating}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="requirements">Yêu cầu</Label>
                    <Textarea
                      id="requirements"
                      value={formData.requirements}
                      onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                      placeholder="Mỗi dòng 1 yêu cầu"
                      rows={5}
                      className="resize-none text-sm"
                      disabled={generating}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="targetAudience">Đối tượng học viên</Label>
                    <Textarea
                      id="targetAudience"
                      value={formData.targetAudience}
                      onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                      placeholder="Mỗi dòng 1 nhóm đối tượng"
                      rows={5}
                      className="resize-none text-sm"
                      disabled={generating}
                    />
                  </div>
                </div>
                
                {analysisResult.suggestedStructure && (
                  <div className="space-y-2">
                    <Label>Cấu trúc đề xuất</Label>
                    <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 space-y-3">
                      {analysisResult.suggestedStructure.moduleCount && (
                        <div className="text-sm font-semibold text-purple-700">
                          📚 Gồm {analysisResult.suggestedStructure.moduleCount} modules
                        </div>
                      )}
                      
                      {analysisResult.suggestedStructure.modules && 
                       analysisResult.suggestedStructure.modules.length > 0 && (
                        <div className="space-y-3">
                          {analysisResult.suggestedStructure.modules.map((module, idx) => (
                            <div key={idx} className="border-l-3 border-purple-400 pl-3 space-y-1">
                              <div className="font-medium text-sm">
                                {idx + 1}. {module.title}
                              </div>
                              {module.description && (
                                <div className="text-xs text-gray-600">
                                  {module.description}
                                </div>
                              )}
                              {module.topics && module.topics.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-1.5">
                                  {module.topics.map((topic, topicIdx) => (
                                    <span 
                                      key={topicIdx}
                                      className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded"
                                    >
                                      {topic}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Loading State for Course Generation */}
                {generating && (
                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <Loader2 className="h-5 w-5 animate-spin text-green-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 space-y-2">
                          <p className="font-semibold text-green-900">
                            🚀 Đang tạo khóa học...
                          </p>
                          <p className="text-sm text-green-700">
                            ⏱️ Thời gian ước tính: 30-60 giây
                          </p>
                          <p className="text-xs text-green-600">
                            AI đang tạo cấu trúc khóa học đầy đủ với modules, lessons và quizzes.
                            Quá trình này có thể mất một chút thời gian...
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={generating}
                    className="gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại
                  </Button>
                  
                  <Button
                    onClick={handleGenerate}
                    disabled={generating || !formData.title.trim()}
                    className="gap-2 bg-purple-600 hover:bg-purple-700"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Đang tạo khóa học...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Tạo khóa học
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
