'use client';

import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_MY_COURSES } from '@/graphql/lms/courses.graphql';
import Link from 'next/link';
import Image from 'next/image';
import { 
  BookOpen, 
  Plus,
  Edit,
  Eye,
  List,
  PlayCircle,
  HelpCircle,
  Loader2,
  AlertCircle,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function InstructorCoursesPage() {
  const { data, loading, error } = useQuery(GET_MY_COURSES);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Đang tải khóa học...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md border-red-200">
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <CardTitle>Lỗi tải dữ liệu</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {error.message || 'Có lỗi xảy ra khi tải khóa học'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const courses = data?.myCourses || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Khóa học của tôi
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Quản lý tất cả khóa học bạn đang giảng dạy
              </p>
            </div>
            <Button asChild className="w-full sm:w-auto gap-2">
              <Link href="/lms/instructor/courses/create">
                <Plus className="w-4 h-4" />
                <span>Tạo khóa học</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Danh sách khóa học</CardTitle>
            <CardDescription>
              {courses.length} khóa học
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            {courses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 sm:py-16">
                <div className="p-3 bg-muted rounded-lg mb-4">
                  <BookOpen className="w-8 h-8 sm:w-12 sm:h-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">Chưa có khóa học</h3>
                <p className="text-sm text-muted-foreground mb-6 text-center">
                  Bắt đầu tạo khóa học đầu tiên của bạn
                </p>
                <Button asChild className="gap-2">
                  <Link href="/lms/instructor/courses/create">
                    <Plus className="w-4 h-4" />
                    Tạo khóa học
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-3 px-4 font-semibold">Khóa học</th>
                      <th className="text-left py-3 px-4 font-semibold hidden sm:table-cell">Trạng thái</th>
                      <th className="text-left py-3 px-4 font-semibold hidden md:table-cell">Học viên</th>
                      <th className="text-left py-3 px-4 font-semibold hidden lg:table-cell">Tài liệu</th>
                      <th className="text-left py-3 px-4 font-semibold hidden lg:table-cell">Doanh thu</th>
                      <th className="text-right py-3 px-4 font-semibold">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {courses.map((course: any) => (
                      <tr key={course.id} className="hover:bg-muted/50 transition-colors">
                        <td className="py-3 sm:py-4 px-4">
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            {course.thumbnail ? (
                              <Image
                                src={course.thumbnail}
                                alt={course.title}
                                width={48}
                                height={36}
                                className="rounded w-12 h-9 object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-9 bg-muted rounded flex items-center justify-center flex-shrink-0">
                                <BookOpen className="w-5 h-5 text-muted-foreground" />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm sm:text-base truncate">
                                {course.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {course.level}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 sm:py-4 px-4 hidden sm:table-cell">
                          <Badge
                            variant={
                              course.status === 'PUBLISHED'
                                ? 'default'
                                : course.status === 'DRAFT'
                                ? 'secondary'
                                : 'outline'
                            }
                            className="text-xs"
                          >
                            {course.status === 'PUBLISHED'
                              ? 'Đã xuất bản'
                              : course.status === 'DRAFT'
                              ? 'Bản nháp'
                              : course.status}
                          </Badge>
                        </td>
                        <td className="py-3 sm:py-4 px-4 hidden md:table-cell">
                          <p className="text-sm">{course.enrollmentCount || 0}</p>
                        </td>
                        <td className="py-3 sm:py-4 px-4 hidden lg:table-cell">
                          <div className="flex items-center gap-1 text-sm">
                            <FileText className="w-4 h-4 text-green-600" />
                            <span>{course.sourceDocumentsCount || 0}</span>
                          </div>
                        </td>
                        <td className="py-3 sm:py-4 px-4 hidden lg:table-cell">
                          <p className="text-sm font-medium">
                            ${((course.price || 0) * (course.enrollmentCount || 0)).toFixed(2)}
                          </p>
                        </td>
                        <td className="py-3 sm:py-4 px-4">
                          <div className="flex items-center justify-end gap-1 sm:gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              title="Xem"
                              className="h-8 w-8 p-0"
                            >
                              <Link href={`/lms/courses/${course.slug}`}>
                                <Eye className="w-4 h-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              title="Quản lý"
                              className="h-8 w-8 p-0"
                            >
                              <Link href={`/lms/instructor/courses/${course.id}/manage`}>
                                <List className="w-4 h-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              title="Bài học"
                              className="h-8 w-8 p-0"
                            >
                              <Link href={`/lms/instructor/courses/${course.id}/lessons`}>
                                <PlayCircle className="w-4 h-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              title="Quiz"
                              className="h-8 w-8 p-0"
                            >
                              <Link href={`/lms/instructor/courses/${course.id}/quizzes`}>
                                <HelpCircle className="w-4 h-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              title="Sửa"
                              className="h-8 w-8 p-0"
                            >
                              <Link href={`/lms/instructor/courses/${course.id}/edit`}>
                                <Edit className="w-4 h-4" />
                              </Link>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
