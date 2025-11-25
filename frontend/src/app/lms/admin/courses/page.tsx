'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFindMany, useDeleteOne, useUpdateOne } from '@/hooks/useDynamicGraphQL';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Pagination, { usePagination } from '@/components/ui/pagination';
import { extractPaginationInfo } from '@/lib/lms/pagination-utils';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Users,
  Clock,
  Star,
  AlertCircle,
  BookOpen,
  Sparkles,
  Loader2,
  FileText,
  HelpCircle,
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

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  level: string;
  price: number;
  duration: number;
  thumbnailUrl: string;
  status: string;
  sourceDocumentsCount?: number;
  instructor: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
  };
  _count: {
    enrollments: number;
    modules: number;
    reviews: number;
  };
  createdAt: string;
}

export default function AdminCoursesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<any>(null);
  
  // Pagination state
  const { 
    currentPage, 
    pageSize, 
    handlePageChange, 
    handlePageSizeChange,
    resetPagination,
  } = usePagination(12); // 12 items per page for grid layout

  const { data: courses, loading, error, refetch } = useFindMany('Course', {
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      level: true,
      price: true,
      thumbnail: true,
      status: true,
      createdAt: true,
      duration: true,
    },
    include: {
      _count: {
        select: {
          enrollments: true,
          modules: true,
          reviews: true,
        },
      },
      instructor: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const [deleteCourse, { loading: deleteLoading }] = useDeleteOne('Course');
  const [updateCourse] = useUpdateOne('Course');

  // Filter courses
  const filteredCourses = (courses || []).filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (course.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'published' && course.status === 'PUBLISHED') ||
                         (filterStatus === 'draft' && course.status === 'DRAFT');
    return matchesSearch && matchesFilter;
  });

  // Pagination calculations
  const totalFilteredItems = filteredCourses.length;
  const totalPages = Math.ceil(totalFilteredItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedCourses = filteredCourses.slice(startIndex, endIndex);

  // Reset pagination when filters change
  useEffect(() => {
    resetPagination();
  }, [searchQuery, filterStatus, resetPagination]);

  // Handlers
  const handleCreateCourse = () => {
    router.push('/lms/admin/courses/create');
  };

  const handleCreateWithAI = () => {
    router.push('/lms/admin/courses/create-with-ai');
  };

  const handleCreateFromDocuments = () => {
    router.push('/lms/admin/courses/create-from-documents');
  };

  const handleViewCourse = (courseId: string) => {
    router.push(`/lms/admin/courses/${courseId}`);
  };

  const handleEditCourse = (courseId: string) => {
    router.push(`/lms/admin/courses/${courseId}/edit`);
  };

  const handleDeleteClick = (course: any) => {
    setCourseToDelete(course);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!courseToDelete) return;

    try {
      await deleteCourse({
        where: { id: courseToDelete.id },
      });

      toast({
        title: 'Thành công',
        description: `Đã xóa khóa học "${courseToDelete.title}"`,
        type: 'success',
      });

      setDeleteDialogOpen(false);
      setCourseToDelete(null);
      refetch();
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể xóa khóa học',
        type: 'error',
      });
    }
  };

  const handleTogglePublish = async (course: any) => {
    try {
      const newStatus = course.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
      await updateCourse({
        where: { id: course.id },
        data: {
          status: newStatus,
        },
      });

      toast({
        title: 'Thành công',
        description: `Đã ${newStatus === 'PUBLISHED' ? 'xuất bản' : 'chuyển về nháp'} khóa học "${course.title}"`,
        type: 'success',
      });

      refetch();
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể cập nhật trạng thái',
        type: 'error',
      });
    }
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Quản lý khóa học</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Tổng cộng {courses?.length || 0} khóa học</p>
        </div>
        <div className="flex flex-col xs:flex-row gap-2 sm:gap-3">
          <Button onClick={handleCreateCourse} variant="outline" className="gap-2 text-sm sm:text-base">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Tạo thủ công</span>
            <span className="sm:hidden">Thủ công</span>
          </Button>
          <Button 
            onClick={handleCreateFromDocuments}
            variant="outline"
            className="gap-2 text-sm sm:text-base border-purple-300 text-purple-700 hover:bg-purple-50"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Từ tài liệu</span>
            <span className="sm:hidden">Tài liệu</span>
          </Button>
          <Button 
            onClick={handleCreateWithAI} 
            className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-sm sm:text-base"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Tạo với AI</span>
            <span className="sm:hidden">AI</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm khóa học..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 sm:h-auto"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <Button
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('all')}
            size="sm"
            className="whitespace-nowrap"
          >
            Tất cả
          </Button>
          <Button
            variant={filterStatus === 'published' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('published')}
            size="sm"
            className="whitespace-nowrap"
          >
            Đã xuất bản
          </Button>
          <Button
            variant={filterStatus === 'draft' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('draft')}
            size="sm"
            className="whitespace-nowrap"
          >
            Nháp
          </Button>
        </div>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="text-center py-8 sm:py-12">
          <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 mx-auto animate-spin" />
          <p className="text-sm sm:text-base text-gray-500 mt-4">Đang tải khóa học...</p>
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-8 sm:py-12 text-center">
            <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-red-500 mx-auto mb-4" />
            <p className="text-sm sm:text-base text-red-600">Lỗi: {error.message}</p>
          </CardContent>
        </Card>
      ) : filteredCourses.length === 0 ? (
        <Card>
          <CardContent className="py-8 sm:py-12 text-center">
            <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm sm:text-base text-gray-500">Không tìm thấy khóa học nào</p>
            <Button onClick={handleCreateCourse} className="mt-4" size="sm">
              Tạo khóa học đầu tiên
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {paginatedCourses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-start justify-between mb-2 gap-2">
                  <Badge 
                    variant={course.status === 'PUBLISHED' ? 'default' : 'secondary'}
                    className="cursor-pointer text-xs"
                    onClick={() => handleTogglePublish(course)}
                  >
                    {course.status === 'PUBLISHED' ? 'Đã xuất bản' : 'Nháp'}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {course.level || 'Beginner'}
                  </Badge>
                </div>
                <CardTitle className="line-clamp-2 text-base sm:text-lg">{course.title}</CardTitle>
                <CardDescription className="mt-2 line-clamp-2 text-xs sm:text-sm">
                  {course.description || 'Chưa có mô tả'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
                {/* Instructor */}
                {course.instructor && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                    <Users className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">Giảng viên: {course.instructor.firstName && course.instructor.lastName 
                      ? `${course.instructor.firstName} ${course.instructor.lastName}` 
                      : course.instructor.username}</span>
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600 overflow-x-auto pb-1">
                  <div className="flex items-center gap-1 whitespace-nowrap">
                    <Users className="w-4 h-4" />
                    <span>{course._count?.enrollments || 0}</span>
                  </div>
                  <div className="flex items-center gap-1 whitespace-nowrap">
                    <BookOpen className="w-4 h-4" />
                    <span>{course._count?.modules || 0} modules</span>
                  </div>
                  <div className="flex items-center gap-1 whitespace-nowrap" title="Mỗi module có 1 quiz">
                    <HelpCircle className="w-4 h-4 text-purple-600" />
                    <span>~{course._count?.modules || 0} quiz</span>
                  </div>
                  <div className="flex items-center gap-1 whitespace-nowrap">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration || 0}p</span>
                  </div>
                  <div className="flex items-center gap-1 whitespace-nowrap">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>{course._count?.reviews || 0}</span>
                  </div>
                  {course.sourceDocumentsCount > 0 && (
                    <div className="flex items-center gap-1 whitespace-nowrap">
                      <FileText className="w-4 h-4 text-green-600" />
                      <span>{course.sourceDocumentsCount} tài liệu</span>
                    </div>
                  )}
                </div>

                {/* Price */}
                <div className="text-base sm:text-lg font-bold text-blue-600">
                  {course.price ? formatPrice(course.price) : 'Miễn phí'}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 pt-2">
                  {/* Primary Action - Quản lý nội dung */}
                  <Button 
                    variant="default"
                    size="sm" 
                    className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
                    onClick={() => router.push(`/lms/instructor/courses/${course.id}/manage`)}
                  >
                    <BookOpen className="w-4 h-4" />
                    Quản lý Modules & Quiz
                  </Button>
                  
                  {/* Secondary Actions */}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 gap-1 sm:gap-2"
                      onClick={() => handleViewCourse(course.id)}
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline">Xem</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 gap-1 sm:gap-2"
                      onClick={() => handleEditCourse(course.id)}
                    >
                      <Edit className="w-4 h-4" />
                      <span className="hidden sm:inline">Sửa</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1 sm:gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteClick(course)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalFilteredItems > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalFilteredItems}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              loading={loading}
              showPageSize={true}
              pageSizeOptions={[12, 24, 48]}
            />
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg">Xác nhận xóa khóa học</AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm">
              Bạn có chắc chắn muốn xóa khóa học <strong>&quot;{courseToDelete?.title}&quot;</strong>?
              <br />
              <br />
              <span className="text-red-600 font-semibold">
                Hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan (bài học, quiz, enrollment, v.v.)
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="m-0">Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700 m-0"
            >
              {deleteLoading ? 'Đang xóa...' : 'Xóa khóa học'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
