'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Users, Award, TrendingUp, Play, FileText, CheckCircle } from 'lucide-react';
import { useSiteName } from '@/hooks/useSiteName';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function LMSHomePage() {
  const router = useRouter();
  const { siteName } = useSiteName();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Check user role and redirect if authenticated
    const token = localStorage.getItem('accessToken');
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserRole(payload.roleType);
        
        // Optional: Auto-redirect to role-specific dashboard
        // Uncomment to enable auto-redirect:
        // switch (payload.roleType) {
        //   case 'ADMIN':
        //     router.push('/lms/admin');
        //     break;
        //   case 'GIANGVIEN':
        //     router.push('/lms/instructor');
        //     break;
        //   case 'USER':
        //     router.push('/lms/my-learning');
        //     break;
        // }
      } catch (error) {
        console.error('Failed to parse token:', error);
      }
    }
  }, [router]);

  const features = [
    {
      icon: <Play className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600" />,
      title: 'Khóa học Video',
      description: 'Video chất lượng cao với theo dõi tiến độ học tập',
      link: '/lms/courses',
    },
    {
      icon: <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-green-600" />,
      title: 'Nội dung Đa dạng',
      description: 'Bài giảng text với trình soạn thảo tương tác',
      link: '/lms/courses',
    },
    {
      icon: <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-purple-600" />,
      title: 'Bài kiểm tra',
      description: 'Kiểm tra kiến thức với hệ thống chấm điểm tự động',
      link: '/lms/courses',
    },
    {
      icon: <Award className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-600" />,
      title: 'Chứng chỉ',
      description: 'Nhận chứng chỉ khi hoàn thành khóa học',
      link: '/lms/my-learning',
    },
  ];

  const stats = [
    { label: 'Khóa học', value: '100+', icon: <BookOpen className="w-6 h-6 sm:w-8 sm:h-8" /> },
    { label: 'Học viên', value: '10K+', icon: <Users className="w-6 h-6 sm:w-8 sm:h-8" /> },
    { label: 'Giảng viên', value: '50+', icon: <Award className="w-6 h-6 sm:w-8 sm:h-8" /> },
    { label: 'Tỉ lệ thành công', value: '95%', icon: <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary via-indigo-600 to-purple-600 text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-4 py-12 sm:py-16 md:py-24 lg:py-32">
          <div className="text-center space-y-6 md:space-y-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight">
              Chào mừng đến {siteName} LMS
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-primary-foreground/90 max-w-3xl mx-auto px-4">
              Chuyển đổi hành trình học tập của bạn với hệ thống quản lý học tập toàn diện
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Button
                onClick={() => router.push('/lms/courses')}
                size="lg"
                variant="secondary"
                className="text-base sm:text-lg h-12 sm:h-14 px-6 sm:px-8"
              >
                Khám phá Khóa học
              </Button>

              <Button
                onClick={() => router.push('/lms/instructor')}
                size="lg"
                variant="secondary"
                className="text-base sm:text-lg h-12 sm:h-14 px-6 sm:px-8"
              >
                Trở thành Giảng viên
              </Button>

              <Button
                onClick={() => router.push('/lms/my-learning')}
                size="lg"
                variant="secondary"
                className="text-base sm:text-lg h-12 sm:h-14 px-6 sm:px-8"
              >
                Học tập của tôi
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 -mt-8 sm:-mt-12 md:-mt-16 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="text-center hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex justify-center text-primary mb-2 sm:mb-3">
                  {stat.icon}
                </div>
                <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm md:text-base text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-12 sm:py-16 md:py-20">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 px-4">
            Tại sao chọn {siteName} LMS?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Trải nghiệm nền tảng học tập toàn diện và thân thiện nhất
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              onClick={() => router.push(feature.link)}
              className="cursor-pointer hover:shadow-xl transition-all hover:-translate-y-2"
            >
              <CardContent className="p-6 sm:p-8">
                <div className="mb-3 sm:mb-4">{feature.icon}</div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      {/* <section className="bg-gradient-to-r from-primary to-indigo-600 text-primary-foreground">
        <div className="container mx-auto px-4 py-12 sm:py-16">
          <div className="text-center space-y-6 sm:space-y-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold px-4">
              Sẵn sàng bắt đầu học?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto px-4">
              Tham gia cùng hàng nghìn học viên đang học tập trên nền tảng của chúng tôi
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Button
                onClick={() => router.push('/lms/courses')}
                size="lg"
                variant="secondary"
                className="text-base sm:text-lg h-12 sm:h-14 px-6 sm:px-8"
              >
                Khám phá tất cả khóa học
              </Button>
              <Button
                onClick={() => router.push('/lms/instructor')}
                size="lg"
                variant="secondary"
                className="text-base sm:text-lg h-12 sm:h-14 px-6 sm:px-8"
              >
                Trở thành Giảng viên
              </Button>
            </div>
          </div>
        </div>
      </section> */}

      {/* Quick Links Section */}
      <section className="container mx-auto px-4 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl">Dành cho Học viên</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 sm:mt-1 flex-shrink-0" />
                  <span>Truy cập hơn 100+ khóa học</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 sm:mt-1 flex-shrink-0" />
                  <span>Theo dõi tiến độ học tập</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 sm:mt-1 flex-shrink-0" />
                  <span>Nhận chứng chỉ hoàn thành</span>
                </li>
              </ul>
              <Button
                onClick={() => router.push('/lms/courses')}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Bắt đầu học
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl">Dành cho Giảng viên</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 sm:mt-1 flex-shrink-0" />
                  <span>Tạo khóa học không giới hạn</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 sm:mt-1 flex-shrink-0" />
                  <span>Upload video & tài liệu</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 sm:mt-1 flex-shrink-0" />
                  <span>Theo dõi tiến độ học viên</span>
                </li>
              </ul>
              <Button
                onClick={() => router.push('/lms/instructor')}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Bắt đầu giảng dạy
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl">Tính năng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 sm:mt-1 flex-shrink-0" />
                  <span>Video HD chất lượng cao</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 sm:mt-1 flex-shrink-0" />
                  <span>Bài kiểm tra tương tác</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 sm:mt-1 flex-shrink-0" />
                  <span>Theo dõi tiến độ chi tiết</span>
                </li>
              </ul>
              <Button
                onClick={() => router.push('/lms/courses')}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Khám phá tính năng
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
