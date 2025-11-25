'use client';

import { useState } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { Loader2, Sparkles, ArrowRight, ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ANALYZE_DOCUMENTS_FOR_COURSE, GENERATE_COURSE_FROM_DOCUMENTS } from '@/graphql/lms/courses.graphql';
import { SourceDocumentSelector } from '@/components/lms/SourceDocumentSelector';

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

export default function CreateCourseFromDocumentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  // Step control
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  
  // Step 1 state
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [additionalContext, setAdditionalContext] = useState('');
  
  // Step 2 state
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
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
        description: 'AI đã tổng hợp thông tin từ tài liệu nguồn',
      });
    },
    onError: (error) => {
      toast({
        type: 'error',
        title: 'Lỗi',
        description: error.message,
      });
    },
  });
  
  const [generateCourse, { loading: generating }] = useMutation(GENERATE_COURSE_FROM_DOCUMENTS, {
    onCompleted: (data) => {
      toast({
        type: 'success',
        title: 'Thành công',
        description: `Khóa học "${data.generateCourseFromDocuments.title}" đã được tạo`,
      });
      router.push(`/lms/instructor/courses/${data.generateCourseFromDocuments.id}/edit`);
    },
    onError: (error) => {
      toast({
        type: 'error',
        title: 'Lỗi',
        description: error.message,
      });
    },
  });
  
  // Step 1: Analyze
  const handleAnalyze = () => {
    if (selectedDocuments.length === 0) {
      toast({
        type: 'error',
        title: 'Lỗi',
        description: 'Vui lòng chọn ít nhất 1 tài liệu nguồn',
      });
      return;
    }
    
    analyzeDocuments({
      variables: {
        input: {
          documentIds: selectedDocuments,
          additionalContext: additionalContext || undefined,
        },
      },
    });
  };
  
  // Step 2: Generate
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
          documentIds: selectedDocuments,
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
    setCurrentStep(1);
  };
  
  return (
    <div className="container mx-auto py-4 px-4 sm:py-6 sm:px-6 max-w-6xl">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
          <h1 className="text-2xl sm:text-3xl font-bold">Tạo khóa học từ tài liệu nguồn</h1>
        </div>
        <p className="text-sm sm:text-base text-muted-foreground">
          AI sẽ phân tích tài liệu và đề xuất nội dung khóa học
        </p>
      </div>
      
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 sm:gap-4 mb-6 sm:mb-8">
        <div className={`flex items-center gap-2 ${currentStep === 1 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full border-2 ${
            currentStep === 1 ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'
          }`}>
            1
          </div>
          <span className="hidden sm:inline font-medium">Phân tích AI</span>
          <span className="sm:hidden text-xs font-medium">Phân tích</span>
        </div>
        
        <ArrowRight className="h-5 w-5 text-muted-foreground" />
        
        <div className={`flex items-center gap-2 ${currentStep === 2 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full border-2 ${
            currentStep === 2 ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'
          }`}>
            2
          </div>
          <span className="hidden sm:inline font-medium">Chỉnh sửa & Tạo</span>
          <span className="sm:hidden text-xs font-medium">Tạo</span>
        </div>
      </div>
      
      {/* Step 1: Select & Analyze */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Bước 1: Chọn tài liệu nguồn
            </CardTitle>
            <CardDescription>
              Chọn các tài liệu nguồn để AI phân tích và đề xuất nội dung khóa học
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Tài liệu nguồn *</Label>
              <SourceDocumentSelector
                value={selectedDocuments}
                onChange={setSelectedDocuments}
              />
              <p className="text-xs text-muted-foreground">
                Đã chọn {selectedDocuments.length} tài liệu
              </p>
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
              />
            </div>
            
            {/* Loading State */}
            {analyzing && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-start gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-2">
                    <p className="font-semibold text-blue-900">
                      🤖 AI đang phân tích {selectedDocuments.length} tài liệu...
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
              </div>
            )}
            
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => router.back()}
                disabled={analyzing}
              >
                Hủy
              </Button>
              <Button
                onClick={handleAnalyze}
                disabled={analyzing || selectedDocuments.length === 0}
                className="gap-2"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang phân tích...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Phân tích AI
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Step 2: Edit & Generate */}
      {currentStep === 2 && analysisResult && (
        <div className="space-y-6">
          {/* Analysis Summary */}
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Kết quả phân tích AI
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Thời lượng ước tính:</span>{' '}
                  <span className="text-muted-foreground">{analysisResult.estimatedDuration}</span>
                </div>
                <div>
                  <span className="font-medium">Cấp độ đề xuất:</span>{' '}
                  <span className="text-muted-foreground">{analysisResult.recommendedLevel}</span>
                </div>
              </div>
              
              {analysisResult.mainTopics.length > 0 && (
                <div>
                  <span className="font-medium text-sm">Chủ đề chính:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {analysisResult.mainTopics.map((topic, idx) => (
                      <span key={idx} className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {analysisResult.aggregatedKeywords.length > 0 && (
                <div>
                  <span className="font-medium text-sm">Từ khóa:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {analysisResult.aggregatedKeywords.slice(0, 10).map((keyword, idx) => (
                      <span key={idx} className="px-2 py-1 text-xs rounded-full bg-muted">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {analysisResult.analysisSummary && (
                <div>
                  <span className="font-medium text-sm">Tóm tắt:</span>
                  <p className="text-sm text-muted-foreground mt-1">{analysisResult.analysisSummary}</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Edit Form */}
          <Card>
            <CardHeader>
              <CardTitle>Bước 2: Chỉnh sửa & tạo khóa học</CardTitle>
              <CardDescription>
                Xem lại và chỉnh sửa thông tin trước khi tạo khóa học
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Tiêu đề khóa học *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Nhập tiêu đề khóa học"
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
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="level">Cấp độ</Label>
                  <Input
                    id="level"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    placeholder="VD: Beginner, Intermediate, Advanced"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="learningObjectives">Mục tiêu học tập</Label>
                    <Textarea
                      id="learningObjectives"
                      value={formData.learningObjectives}
                      onChange={(e) => setFormData({ ...formData, learningObjectives: e.target.value })}
                      placeholder="Mỗi dòng 1 mục tiêu"
                      rows={5}
                      className="resize-none text-sm"
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
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="requirements">Yêu cầu</Label>
                    <Textarea
                      id="requirements"
                      value={formData.requirements}
                      onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                      placeholder="Mỗi dòng 1 yêu cầu"
                      rows={5}
                      className="resize-none text-sm"
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
                    />
                  </div>
                </div>
                
                {analysisResult.suggestedStructure && (
                  <div className="space-y-2">
                    <Label>Cấu trúc đề xuất</Label>
                    <div className="p-4 rounded-lg bg-muted space-y-3">
                      {analysisResult.suggestedStructure.moduleCount && (
                        <div className="text-sm font-semibold text-primary">
                          📚 Gồm {analysisResult.suggestedStructure.moduleCount} modules
                        </div>
                      )}
                      
                      {analysisResult.suggestedStructure.modules && 
                       analysisResult.suggestedStructure.modules.length > 0 && (
                        <div className="space-y-3">
                          {analysisResult.suggestedStructure.modules.map((module, idx) => (
                            <div key={idx} className="border-l-2 border-primary pl-3 space-y-1">
                              <div className="font-medium text-sm">
                                {idx + 1}. {module.title}
                              </div>
                              {module.description && (
                                <div className="text-xs text-muted-foreground">
                                  {module.description}
                                </div>
                              )}
                              {module.topics && module.topics.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {module.topics.map((topic, topicIdx) => (
                                    <span 
                                      key={topicIdx}
                                      className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded"
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
              </div>
              
              {/* Loading State for Course Generation */}
              {generating && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
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
                </div>
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
                  className="gap-2"
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
  );
}
