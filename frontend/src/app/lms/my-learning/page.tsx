'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { GET_MY_ENROLLMENTS } from '@/graphql/lms/enrollments.graphql';
import Image from 'next/image';
import Link from 'next/link';
import ProgressBar from '@/components/lms/ProgressBar';
import { BookOpen, Clock, TrendingUp, Award, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function MyLearningPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [filter, setFilter] = useState<'ALL' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/lms/my-learning');
    }
  }, [user, authLoading, router]);

  const { data, loading, error } = useQuery(GET_MY_ENROLLMENTS, {
    skip: !user, // Skip query if user is not logged in
  });

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Đang kiểm tra đăng nhập...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Đang tải khóa học của bạn...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Lỗi khi tải khóa học</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Vui lòng thử lại sau</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const enrollments = data?.myEnrollments || [];
  
  const filteredEnrollments = enrollments.filter((enrollment: any) => {
    if (filter === 'COMPLETED') return enrollment.status === 'COMPLETED';
    if (filter === 'IN_PROGRESS') return enrollment.status === 'ACTIVE' && enrollment.progress > 0;
    return true;
  });

  const stats = {
    total: enrollments.length,
    inProgress: enrollments.filter((e: any) => e.status === 'ACTIVE' && e.progress > 0).length,
    completed: enrollments.filter((e: any) => e.status === 'COMPLETED').length,
    averageProgress: enrollments.length > 0
      ? enrollments.reduce((acc: number, e: any) => acc + e.progress, 0) / enrollments.length
      : 0,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-6">Học tập của tôi</h1>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center gap-2 md:gap-3 mb-2">
                  <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                  <h3 className="text-xs md:text-sm font-medium text-blue-900 dark:text-blue-100">Tổng khóa học</h3>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.total}</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center gap-2 md:gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-yellow-600" />
                  <h3 className="text-xs md:text-sm font-medium text-yellow-900 dark:text-yellow-100">Đang học</h3>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-yellow-900 dark:text-yellow-100">{stats.inProgress}</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center gap-2 md:gap-3 mb-2">
                  <Award className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                  <h3 className="text-xs md:text-sm font-medium text-green-900 dark:text-green-100">Hoàn thành</h3>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-green-900 dark:text-green-100">{stats.completed}</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center gap-2 md:gap-3 mb-2">
                  <Clock className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
                  <h3 className="text-xs md:text-sm font-medium text-purple-900 dark:text-purple-100">Tiến độ TB</h3>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-purple-900 dark:text-purple-100">
                  {stats.averageProgress.toFixed(0)}%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              onClick={() => setFilter('ALL')}
              variant={filter === 'ALL' ? 'default' : 'outline'}
              size="sm"
            >
              Tất cả ({enrollments.length})
            </Button>
            <Button
              onClick={() => setFilter('IN_PROGRESS')}
              variant={filter === 'IN_PROGRESS' ? 'default' : 'outline'}
              size="sm"
            >
              Đang học ({stats.inProgress})
            </Button>
            <Button
              onClick={() => setFilter('COMPLETED')}
              variant={filter === 'COMPLETED' ? 'default' : 'outline'}
              size="sm"
            >
              Hoàn thành ({stats.completed})
            </Button>
          </div>
        </div>
      </div>

      {/* Course List */}
      <div className="container mx-auto px-4 py-6 md:py-8">
        {filteredEnrollments.length === 0 ? (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-16 pb-16 text-center">
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {filter === 'ALL' 
                  ? 'Chưa có khóa học nào' 
                  : filter === 'COMPLETED'
                  ? 'Chưa có khóa học hoàn thành'
                  : 'Chưa có khóa học đang học'}
              </h3>
              <p className="text-muted-foreground mb-6">
                Bắt đầu học bằng cách ghi danh khóa học
              </p>
              <Button asChild size="lg">
                <Link href="/lms/courses">
                  Duyệt khóa học
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredEnrollments.map((enrollment: any) => (
              <Link
                key={enrollment.id}
                href={`/lms/courses/${enrollment.course.slug}`}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 h-full">
                  {/* Thumbnail */}
                  <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden">
                    {enrollment.course.thumbnail ? (
                      <Image
                        src={enrollment.course.thumbnail}
                        alt={enrollment.course.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-blue-300" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <CardContent className="p-4 md:p-5">
                    {/* Title */}
                    <h3 className="text-base md:text-lg font-bold mb-3 line-clamp-2 hover:text-primary transition-colors">
                      {enrollment.course.title}
                    </h3>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Tiến độ</span>
                        <span className="text-sm font-medium">
                          {enrollment.progress}%
                        </span>
                      </div>
                      <ProgressBar 
                        progress={enrollment.progress} 
                        size="md"
                        color={enrollment.status === 'COMPLETED' ? 'green' : 'blue'}
                      />
                    </div>

                    {/* Status Badge */}
                    {enrollment.status === 'COMPLETED' && (
                      <Badge className="bg-green-600 hover:bg-green-700">
                        <Award className="w-3 h-3 mr-1" />
                        Hoàn thành
                      </Badge>
                    )}

                    {enrollment.completedAt && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Hoàn thành vào {new Date(enrollment.completedAt).toLocaleDateString('vi-VN')}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
