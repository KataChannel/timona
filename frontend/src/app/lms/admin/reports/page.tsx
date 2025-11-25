'use client';

import { useState } from 'react';
import { useFindMany } from '@/hooks/useDynamicGraphQL';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp,
  Users,
  BookOpen,
  Award,
  DollarSign,
  Download,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  CheckCircle,
  Clock,
  Target,
  AlertCircle
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminReportsPage() {
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | '90days' | 'all'>('30days');

  // Fetch enrollments data
  const { data: enrollments, loading: enrollmentsLoading } = useFindMany('Enrollment', {
    select: {
      id: true,
      status: true,
      progress: true,
      paymentAmount: true,
      enrolledAt: true,
      completedAt: true,
    },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          price: true,
        },
      },
    },
  });

  // Fetch courses data
  const { data: courses } = useFindMany('Course', {
    select: {
      id: true,
      title: true,
      status: true,
      price: true,
    },
    include: {
      _count: {
        select: {
          enrollments: true,
        },
      },
    },
  });

  // Fetch certificates
  const { data: certificates } = useFindMany('Certificate', {
    select: {
      id: true,
      issueDate: true,
      grade: true,
    },
    include: {
      course: {
        select: {
          title: true,
        },
      },
    },
  });

  // Fetch quiz attempts
  const { data: quizAttempts } = useFindMany('QuizAttempt', {
    select: {
      id: true,
      score: true,
      passed: true,
      completedAt: true,
    },
  });

  // Calculate stats
  const stats = {
    totalEnrollments: enrollments?.length || 0,
    activeEnrollments: enrollments?.filter((e: any) => e.status === 'ACTIVE').length || 0,
    completedEnrollments: enrollments?.filter((e: any) => e.status === 'COMPLETED').length || 0,
    totalRevenue: enrollments?.reduce((sum: number, e: any) => sum + (e.paymentAmount || 0), 0) || 0,
    totalCourses: courses?.length || 0,
    publishedCourses: courses?.filter((c: any) => c.status === 'PUBLISHED').length || 0,
    certificatesIssued: certificates?.length || 0,
    avgQuizScore: quizAttempts?.length 
      ? (quizAttempts.reduce((sum: number, a: any) => sum + (a.score || 0), 0) / quizAttempts.length).toFixed(1)
      : 0,
    quizPassRate: quizAttempts?.length
      ? ((quizAttempts.filter((a: any) => a.passed).length / quizAttempts.length) * 100).toFixed(1)
      : 0,
  };

  // Get top courses by enrollment
  const topCourses = courses
    ? [...courses].sort((a: any, b: any) => b._count.enrollments - a._count.enrollments)
        .slice(0, 5)
    : [];

  // Recent enrollments
  const recentEnrollments = enrollments ? [...enrollments].sort((a: any, b: any) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime())
    .slice(0, 10)
    : [];

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
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Báo cáo & Thống kê</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Tổng quan hoạt động hệ thống LMS</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">7 ngày qua</SelectItem>
              <SelectItem value="30days">30 ngày qua</SelectItem>
              <SelectItem value="90days">90 ngày qua</SelectItem>
              <SelectItem value="all">Tất cả</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Xuất báo cáo</span>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              Tổng ghi danh
            </CardDescription>
            <CardTitle className="text-2xl">{stats.totalEnrollments}</CardTitle>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {stats.activeEnrollments} đang học
            </p>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              Doanh thu
            </CardDescription>
            <CardTitle className="text-2xl">{formatPrice(stats.totalRevenue)}</CardTitle>
            <p className="text-xs text-gray-600">
              Từ {stats.totalEnrollments} ghi danh
            </p>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-1">
              <Award className="w-4 h-4" />
              Chứng chỉ
            </CardDescription>
            <CardTitle className="text-2xl">{stats.certificatesIssued}</CardTitle>
            <p className="text-xs text-gray-600">
              {stats.completedEnrollments} hoàn thành
            </p>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-1">
              <Target className="w-4 h-4" />
              Tỷ lệ đạt
            </CardDescription>
            <CardTitle className="text-2xl">{stats.quizPassRate}%</CardTitle>
            <p className="text-xs text-gray-600">
              Điểm TB: {stats.avgQuizScore}
            </p>
          </CardHeader>
        </Card>
      </div>

      {/* Tabs for different reports */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="courses">Khóa học</TabsTrigger>
          <TabsTrigger value="students">Học viên</TabsTrigger>
          <TabsTrigger value="revenue">Doanh thu</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Enrollment Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Trạng thái ghi danh
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm">Đang học</span>
                    </div>
                    <span className="font-semibold">{stats.activeEnrollments}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(stats.activeEnrollments / stats.totalEnrollments) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm">Hoàn thành</span>
                    </div>
                    <span className="font-semibold">{stats.completedEnrollments}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(stats.completedEnrollments / stats.totalEnrollments) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                      <span className="text-sm">Đã bỏ</span>
                    </div>
                    <span className="font-semibold">
                      {stats.totalEnrollments - stats.activeEnrollments - stats.completedEnrollments}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gray-400 h-2 rounded-full"
                      style={{ 
                        width: `${((stats.totalEnrollments - stats.activeEnrollments - stats.completedEnrollments) / stats.totalEnrollments) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Course Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Thống kê khóa học
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Tổng khóa học</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.totalCourses}</p>
                  </div>
                  <BookOpen className="w-12 h-12 text-blue-600 opacity-20" />
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Đã xuất bản</p>
                    <p className="text-2xl font-bold text-green-600">{stats.publishedCourses}</p>
                  </div>
                  <CheckCircle className="w-12 h-12 text-green-600 opacity-20" />
                </div>

                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Bản nháp</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {stats.totalCourses - stats.publishedCourses}
                    </p>
                  </div>
                  <Clock className="w-12 h-12 text-orange-600 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Top 5 khóa học phổ biến
              </CardTitle>
              <CardDescription>Xếp hạng theo số lượng ghi danh</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCourses.map((course: any, index: number) => (
                  <div key={course.id} className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{course.title}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-gray-600">
                          {course._count.enrollments} học viên
                        </span>
                        <span className="text-sm text-green-600 font-medium">
                          {formatPrice(course.price)}
                        </span>
                      </div>
                    </div>
                    <div className="w-24 h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-blue-500 rounded-full"
                        style={{ 
                          width: `${(course._count.enrollments / (topCourses[0]?._count?.enrollments || 1)) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Hoạt động ghi danh gần đây
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentEnrollments.map((enrollment: any) => (
                  <div key={enrollment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{enrollment.course.title}</p>
                      <p className="text-sm text-gray-600">
                        Ghi danh: {formatDate(enrollment.enrolledAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {enrollment.status === 'COMPLETED' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : enrollment.status === 'ACTIVE' ? (
                        <Clock className="w-5 h-5 text-blue-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-gray-600" />
                      )}
                      <span className="text-sm font-medium">{Math.round(enrollment.progress)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Tổng quan doanh thu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Tổng doanh thu</p>
                  <p className="text-2xl font-bold text-green-600">{formatPrice(stats.totalRevenue)}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Doanh thu trung bình/khóa</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatPrice(stats.totalEnrollments ? stats.totalRevenue / stats.totalEnrollments : 0)}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 mb-3">Doanh thu theo khóa học</p>
                <div className="space-y-3">
                  {topCourses.map((course: any) => {
                    const courseRevenue = enrollments
                      ?.filter((e: any) => e.course.id === course.id)
                      .reduce((sum: number, e: any) => sum + (e.paymentAmount || 0), 0) || 0;
                    
                    return (
                      <div key={course.id} className="flex items-center justify-between">
                        <span className="text-sm text-gray-900 truncate flex-1">{course.title}</span>
                        <span className="font-semibold text-green-600">{formatPrice(courseRevenue)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
