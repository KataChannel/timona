'use client';

import { useParams, useRouter } from 'next/navigation';
import { useFindUnique, useDeleteOne, useUpdateOne } from '@/hooks/useDynamicGraphQL';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft,
  Edit,
  Trash2,
  BookOpen,
  Users,
  Clock,
  Star,
  Video,
  DollarSign,
  Target,
  CheckCircle,
  AlertCircle,
  Calendar,
  Eye,
  TrendingUp,
  Award,
  Globe,
  Tag,
  MessageSquare
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
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const courseId = (params?.id as string) || '';

  const { data: course, loading, error, refetch } = useFindUnique(
    'Course',
    { id: courseId },
    {
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            modules: true,
            enrollments: true,
            reviews: true,
            discussions: true,
          },
        },
      },
    },
    { skip: !courseId || courseId === '' }
  );

  const [deleteCourse, { loading: deleteLoading }] = useDeleteOne('Course');
  const [updateCourse] = useUpdateOne('Course');

  const handleBack = () => {
    router.push('/lms/admin/courses');
  };

  const handleEdit = () => {
    router.push(`/lms/admin/courses/${courseId}/edit`);
  };

  const handleDelete = async () => {
    try {
      await deleteCourse({ where: { id: courseId } });
      toast({
        title: 'Thành công',
        description: `Đã xóa khóa học "${course?.title}"`,
        type: 'success',
      });
      router.push('/lms/admin/courses');
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể xóa khóa học',
        type: 'error',
      });
    }
  };

  const handleTogglePublish = async () => {
    if (!course) return;
    try {
      const newStatus = course.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
      await updateCourse({
        where: { id: courseId },
        data: { status: newStatus },
      });
      toast({
        title: 'Thành công',
        description: `Đã ${newStatus === 'PUBLISHED' ? 'xuất bản' : 'chuyển về nháp'} khóa học`,
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getLevelLabel = (level: string) => {
    const levels: Record<string, string> = {
      BEGINNER: 'Cơ bản',
      INTERMEDIATE: 'Trung cấp',
      ADVANCED: 'Nâng cao',
      EXPERT: 'Chuyên gia',
    };
    return levels[level] || level;
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">{error?.message || 'Không tìm thấy khóa học'}</p>
            <Button onClick={handleBack} className="mt-4">
              Quay lại
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Chi tiết khóa học</h1>
            <p className="text-sm text-gray-600 mt-1">Xem thông tin chi tiết</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={course.status === 'PUBLISHED' ? 'outline' : 'default'}
            onClick={handleTogglePublish}
            className="gap-2"
          >
            {course.status === 'PUBLISHED' ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Đã xuất bản</span>
              </>
            ) : (
              <>
                <Clock className="w-4 h-4" />
                <span className="hidden sm:inline">Xuất bản</span>
              </>
            )}
          </Button>
          <Button 
            variant="default" 
            onClick={() => router.push(`/lms/instructor/courses/${courseId}/manage`)}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Quản lý Nội dung</span>
            <span className="sm:hidden">Nội dung</span>
          </Button>
          <Button variant="outline" onClick={handleEdit} className="gap-2">
            <Edit className="w-4 h-4" />
            <span className="hidden sm:inline">Chỉnh sửa</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setDeleteDialogOpen(true)}
            className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Xóa</span>
          </Button>
        </div>
      </div>

      {/* Main Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">{course.title}</CardTitle>
                  <CardDescription className="text-sm">{course.slug}</CardDescription>
                </div>
                <Badge variant={course.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                  {course.status === 'PUBLISHED' ? 'Đã xuất bản' : 'Nháp'}
                </Badge>
              </div>

              {/* Thumbnail */}
              {course.thumbnail && (
                <div className="relative w-full h-64 rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Description */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Mô tả</h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {course.description || 'Chưa có mô tả'}
                </p>
              </div>

              <Separator />

              {/* What You Will Learn */}
              {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
                <>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Target className="w-5 h-5 text-blue-600" />
                      Bạn sẽ học được gì
                    </h3>
                    <ul className="space-y-2">
                      {course.whatYouWillLearn.map((item: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Separator />
                </>
              )}

              {/* Requirements */}
              {course.requirements && course.requirements.length > 0 && (
                <>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                      Yêu cầu
                    </h3>
                    <ul className="space-y-2">
                      {course.requirements.map((item: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-gray-600">•</span>
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Separator />
                </>
              )}

              {/* Target Audience */}
              {course.targetAudience && course.targetAudience.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    Đối tượng học viên
                  </h3>
                  <ul className="space-y-2">
                    {course.targetAudience.map((item: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-gray-600">•</span>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SEO Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thông tin SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Meta Title</p>
                <p className="text-gray-600">{course.metaTitle || 'Chưa thiết lập'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Meta Description</p>
                <p className="text-gray-600">{course.metaDescription || 'Chưa thiết lập'}</p>
              </div>
              {course.tags && course.tags.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {course.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="outline" className="gap-1">
                        <Tag className="w-3 h-3" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Stats & Info */}
        <div className="space-y-6">
          {/* Quick Actions - Quản lý nội dung */}
          <Card className="border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-white">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-blue-900">
                <BookOpen className="w-5 h-5" />
                Quản lý Nội dung Khóa học
              </CardTitle>
              <CardDescription>
                Thêm và chỉnh sửa modules, lessons, quizzes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={() => router.push(`/lms/instructor/courses/${courseId}/manage`)}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Quản lý Modules
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline"
                  onClick={() => router.push(`/lms/instructor/courses/${courseId}/lessons`)}
                  className="text-sm"
                >
                  Lessons
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push(`/lms/instructor/courses/${courseId}/quizzes`)}
                  className="text-sm"
                >
                  Quizzes
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thống kê</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-blue-600">{course._count.enrollments}</p>
                  <p className="text-xs text-gray-600">Học viên</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <BookOpen className="w-6 h-6 text-green-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-green-600">{course._count.modules}</p>
                  <p className="text-xs text-gray-600">Modules</p>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <Star className="w-6 h-6 text-yellow-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-yellow-600">{course.avgRating.toFixed(1)}</p>
                  <p className="text-xs text-gray-600">{course._count.reviews} đánh giá</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <Eye className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-purple-600">{course.viewCount}</p>
                  <p className="text-xs text-gray-600">Lượt xem</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Giá
                  </span>
                  <span className="font-semibold text-green-600">
                    {course.price > 0 ? formatPrice(Number(course.price)) : 'Miễn phí'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Cấp độ
                  </span>
                  <Badge variant="outline">{getLevelLabel(course.level)}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Thời lượng
                  </span>
                  <span className="font-medium">{course.duration || 0} phút</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Ngôn ngữ
                  </span>
                  <span className="font-medium">{course.language === 'vi' ? 'Tiếng Việt' : course.language}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Thảo luận
                  </span>
                  <span className="font-medium">{course._count.discussions}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instructor */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Giảng viên</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-semibold text-gray-900">
                  {course.instructor.firstName && course.instructor.lastName
                    ? `${course.instructor.firstName} ${course.instructor.lastName}`
                    : course.instructor.username}
                </p>
                <p className="text-sm text-gray-600">{course.instructor.email}</p>
              </div>
            </CardContent>
          </Card>

          {/* Category */}
          {course.category && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Danh mục</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className="text-sm">
                  {course.category.name}
                </Badge>
              </CardContent>
            </Card>
          )}

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thời gian</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <p className="text-gray-600">Tạo lúc</p>
                <p className="font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {formatDate(course.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Cập nhật lúc</p>
                <p className="font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {formatDate(course.updatedAt)}
                </p>
              </div>
              {course.publishedAt && (
                <div>
                  <p className="text-gray-600">Xuất bản lúc</p>
                  <p className="font-medium flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    {formatDate(course.publishedAt)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trailer */}
          {course.trailer && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  Video giới thiệu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={course.trailer}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm break-all"
                >
                  {course.trailer}
                </a>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa khóa học</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa khóa học <strong>&quot;{course.title}&quot;</strong>?
              <br />
              <br />
              <span className="text-red-600 font-semibold">
                Hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteLoading ? 'Đang xóa...' : 'Xóa khóa học'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
