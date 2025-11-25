'use client';

import { useState } from 'react';
import { useFindMany, useDeleteOne, useUpdateOne } from '@/hooks/useDynamicGraphQL';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus,
  Edit,
  Trash2,
  FileQuestion,
  Clock,
  Award,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Target,
  Users
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';

interface Quiz {
  id: string;
  title: string;
  description: string;
  passingScore: number;
  timeLimit: number;
  maxAttempts: number;
  isRequired: boolean;
  lesson: {
    id: string;
    title: string;
    courseModule: {
      course: {
        id: string;
        title: string;
      };
    };
  };
  _count: {
    questions: number;
    attempts: number;
  };
  createdAt: string;
  updatedAt: string;
}

export default function AdminQuizzesPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRequired, setFilterRequired] = useState<'all' | 'required' | 'optional'>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<string | null>(null);

  const { data: quizzes, loading, error, refetch } = useFindMany('Quiz', {
    select: {
      id: true,
      title: true,
      description: true,
      passingScore: true,
      timeLimit: true,
      maxAttempts: true,
      isRequired: true,
      createdAt: true,
      updatedAt: true,
    },
    include: {
      lesson: {
        select: {
          id: true,
          title: true,
          courseModule: {
            select: {
              course: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
      },
      _count: {
        select: {
          questions: true,
          attempts: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const [deleteQuiz] = useDeleteOne('Quiz');

  // Filter quizzes
  const filteredQuizzes = (quizzes || []).filter((quiz: Quiz) => {
    const matchesSearch = 
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (quiz.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.lesson.courseModule.course.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = 
      filterRequired === 'all' || 
      (filterRequired === 'required' && quiz.isRequired) ||
      (filterRequired === 'optional' && !quiz.isRequired);
    
    return matchesSearch && matchesFilter;
  });

  const handleDelete = async () => {
    if (!quizToDelete) return;

    try {
      await deleteQuiz({ where: { id: quizToDelete } });
      toast({
        title: "Xóa thành công",
        description: "Quiz đã được xóa khỏi hệ thống",
        type: "success",
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa quiz",
        type: "error",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setQuizToDelete(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Stats calculation
  const stats = {
    total: quizzes?.length || 0,
    required: quizzes?.filter((q: Quiz) => q.isRequired).length || 0,
    optional: quizzes?.filter((q: Quiz) => !q.isRequired).length || 0,
    totalAttempts: quizzes?.reduce((sum: number, q: Quiz) => sum + q._count.attempts, 0) || 0,
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Quản lý bài kiểm tra</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Tổng cộng {stats.total} bài kiểm tra</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Tạo bài kiểm tra</span>
          <span className="sm:hidden">Tạo mới</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Tổng số</CardDescription>
            <CardTitle className="text-2xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-1">
              <AlertCircle className="w-4 h-4 text-red-500" />
              Bắt buộc
            </CardDescription>
            <CardTitle className="text-2xl text-red-600">{stats.required}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-blue-500" />
              Tùy chọn
            </CardDescription>
            <CardTitle className="text-2xl text-blue-600">{stats.optional}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              Lượt làm bài
            </CardDescription>
            <CardTitle className="text-2xl text-green-600">{stats.totalAttempts}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm bài kiểm tra..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          <Button
            variant={filterRequired === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterRequired('all')}
            size="sm"
          >
            Tất cả
          </Button>
          <Button
            variant={filterRequired === 'required' ? 'default' : 'outline'}
            onClick={() => setFilterRequired('required')}
            size="sm"
          >
            Bắt buộc
          </Button>
          <Button
            variant={filterRequired === 'optional' ? 'default' : 'outline'}
            onClick={() => setFilterRequired('optional')}
            size="sm"
          >
            Tùy chọn
          </Button>
        </div>
      </div>

      {/* Quizzes List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Đang tải...</p>
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">Lỗi: {error.message}</p>
          </CardContent>
        </Card>
      ) : filteredQuizzes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileQuestion className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Không tìm thấy bài kiểm tra nào</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredQuizzes.map((quiz: Quiz) => (
            <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-2">
                      <FileQuestion className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <CardTitle className="text-base line-clamp-2">{quiz.title}</CardTitle>
                    </div>
                    {quiz.description && (
                      <CardDescription className="line-clamp-2 text-xs">
                        {quiz.description}
                      </CardDescription>
                    )}
                  </div>
                  {quiz.isRequired && (
                    <Badge variant="destructive" className="flex-shrink-0">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Bắt buộc
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Course Info */}
                <div className="p-3 bg-gray-50 rounded-lg text-sm">
                  <p className="text-gray-500 mb-1">Khóa học</p>
                  <p className="font-medium text-gray-900 truncate">
                    {quiz.lesson.courseModule.course.title}
                  </p>
                  <p className="text-gray-600 text-xs mt-1 truncate">
                    Bài học: {quiz.lesson.title}
                  </p>
                </div>

                {/* Quiz Settings */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Target className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="text-gray-500 text-xs">Điểm đạt</p>
                      <p className="font-semibold text-gray-900">{quiz.passingScore}%</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <div>
                      <p className="text-gray-500 text-xs">Thời gian</p>
                      <p className="font-semibold text-gray-900">
                        {quiz.timeLimit ? `${quiz.timeLimit} phút` : 'Không giới hạn'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-gray-500 text-xs">Số lần làm</p>
                      <p className="font-semibold text-gray-900">
                        {quiz.maxAttempts ? `${quiz.maxAttempts} lần` : 'Không giới hạn'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <FileQuestion className="w-4 h-4 text-purple-600" />
                    <div>
                      <p className="text-gray-500 text-xs">Câu hỏi</p>
                      <p className="font-semibold text-gray-900">{quiz._count.questions}</p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 pt-3 border-t text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>{quiz._count.attempts} lượt làm</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(quiz.createdAt)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t">
                  <Button variant="outline" size="sm" className="flex-1 gap-2">
                    <Edit className="w-4 h-4" />
                    Chỉnh sửa
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 gap-2 text-red-600 hover:text-red-700"
                    onClick={() => {
                      setQuizToDelete(quiz.id);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                    Xóa
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa bài kiểm tra này? Hành động này không thể hoàn tác và sẽ xóa tất cả câu hỏi và kết quả làm bài liên quan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
