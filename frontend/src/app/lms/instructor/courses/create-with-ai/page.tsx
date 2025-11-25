'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  Sparkles,
  Lightbulb,
  Copy,
  Check,
  Loader2,
  BookOpen,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFindMany } from '@/hooks/useDynamicGraphQL';

const GENERATE_COURSE_FROM_PROMPT = gql`
  mutation GenerateCourseFromPrompt($prompt: String!, $categoryId: String) {
    generateCourseFromPrompt(prompt: $prompt, categoryId: $categoryId) {
      id
      title
      slug
      description
      status
      modules {
        id
        title
        lessons {
          id
          title
          quizzes {
            id
            title
          }
        }
      }
    }
  }
`;

const GET_SAMPLE_PROMPTS = gql`
  query GetSamplePrompts {
    sampleCoursePrompts
    coursePromptTemplates
  }
`;

export default function InstructorCreateCourseWithAIPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [prompt, setPrompt] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const { data: categories } = useFindMany('CourseCategory', {
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  const { data: promptsData } = useQuery(GET_SAMPLE_PROMPTS);
  const [generateCourse, { loading }] = useMutation(GENERATE_COURSE_FROM_PROMPT);

  const samplePrompts = promptsData?.sampleCoursePrompts || [];
  const templates = promptsData?.coursePromptTemplates || [];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        type: 'error',
        title: 'Lỗi',
        description: 'Vui lòng nhập mô tả khóa học',
      });
      return;
    }

    try {
      const result = await generateCourse({
        variables: {
          prompt: prompt.trim(),
          categoryId: categoryId || null,
        },
      });

      const course = result.data.generateCourseFromPrompt;

      toast({
        type: 'success',
        title: 'Thành công! 🎉',
        description: `Đã tạo khóa học "${course.title}" với ${course.modules.length} modules`,
      });

      // Navigate to edit page
      router.push(`/lms/instructor/courses/${course.id}/edit`);
    } catch (error: any) {
      console.error('Generate error:', error);
      toast({
        type: 'error',
        title: 'Lỗi',
        description: error.message || 'Không thể tạo khóa học với AI',
      });
    }
  };

  const copyPrompt = (text: string, index: number) => {
    setPrompt(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleBack = () => {
    router.push('/lms/instructor/courses');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-purple-600" />
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Tạo Khóa Học Với AI
              </h1>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Mô tả khóa học bạn muốn, AI sẽ tự động tạo nội dung chi tiết
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Input Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Prompt Input Card */}
            <Card className="shadow-lg border-purple-100">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Mô Tả Khóa Học
                </CardTitle>
                <CardDescription>
                  Nhập mô tả chi tiết về khóa học bạn muốn tạo
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="prompt">Mô tả khóa học *</Label>
                  <Textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="VD: Tạo khóa học về Kỹ năng giao tiếp hiệu quả dành cho người mới bắt đầu, bao gồm giao tiếp cá nhân, giao tiếp nhóm, thuyết trình..."
                    className="min-h-[150px] resize-none focus:ring-2 focus:ring-purple-500"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500">
                    {prompt.length} ký tự - Càng chi tiết càng tốt
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoryId">Danh mục (Tùy chọn)</Label>
                  <Select 
                    value={categoryId} 
                    onValueChange={setCategoryId}
                    disabled={loading}
                  >
                    <SelectTrigger id="categoryId">
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((cat: any) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={loading || !prompt.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-12 text-base font-semibold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Đang tạo khóa học...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Tạo Khóa Học Với AI
                    </>
                  )}
                </Button>

                {loading && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Loader2 className="w-5 h-5 text-blue-600 animate-spin mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-semibold mb-1">AI đang xử lý...</p>
                        <p>Tạo cấu trúc khóa học, modules, lessons và quiz. Quá trình này có thể mất 30-60 giây.</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sample Prompts */}
            <Card className="shadow-lg border-amber-100">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50">
                <CardTitle className="flex items-center gap-2 text-amber-900">
                  <Lightbulb className="w-5 h-5 text-amber-600" />
                  Gợi Ý Nhanh
                </CardTitle>
                <CardDescription>Click để sử dụng mẫu prompt</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid gap-3">
                  {samplePrompts.map((sample: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => copyPrompt(sample, index)}
                      disabled={loading}
                      className="text-left p-4 bg-white hover:bg-amber-50 border border-gray-200 hover:border-amber-300 rounded-lg transition-all group disabled:opacity-50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm text-gray-700 flex-1">{sample}</p>
                        {copiedIndex === index ? (
                          <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400 group-hover:text-amber-600 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Templates Sidebar */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg sticky top-4 border-indigo-100">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
                <CardTitle className="text-indigo-900">Mẫu Chi Tiết</CardTitle>
                <CardDescription>Khóa học về kỹ năng mềm</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid w-full grid-cols-1">
                    <TabsTrigger value="all">Tất cả ({templates.length})</TabsTrigger>
                  </TabsList>
                  <TabsContent value="all" className="space-y-4 mt-4">
                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                      {templates.map((template: any, index: number) => (
                        <div
                          key={index}
                          onClick={() => copyPrompt(template.prompt, -index - 1)}
                          className="border border-gray-200 hover:border-indigo-300 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md bg-white hover:bg-indigo-50"
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="font-semibold text-sm text-gray-900">
                              {template.title}
                            </h4>
                            {copiedIndex === -index - 1 ? (
                              <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            )}
                          </div>
                          
                          <Badge variant="outline" className="mb-3 text-xs">
                            {template.category}
                          </Badge>

                          <div className="flex flex-wrap gap-1 mb-3">
                            {template.tags.map((tag: string) => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>

                          <p className="text-xs text-gray-600 line-clamp-3">
                            {template.prompt}
                          </p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tips */}
        <Card className="shadow-lg border-green-100">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-900 mb-2">
                  💡 Mẹo để tạo prompt hiệu quả:
                </h3>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>✓ Nêu rõ đối tượng học viên (người mới, trung cấp, chuyên gia)</li>
                  <li>✓ Liệt kê các chủ đề chính muốn đề cập</li>
                  <li>✓ Mô tả mục tiêu sau khi hoàn thành khóa học</li>
                  <li>✓ Đề cập số lượng modules mong muốn (4-6 modules)</li>
                  <li>✓ Yêu cầu bài tập thực hành hoặc case study nếu cần</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
