'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFindUnique } from '@/hooks/useDynamicGraphQL';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft,
  UserCircle2,
  Mail,
  Phone,
  Calendar,
  MapPin,
  BookOpen,
  Award,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Star,
  MessageSquare,
  PlayCircle,
  FileText,
  Trophy
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EnrollmentDetail {
  id: string;
  status: string;
  progress: number;
  enrolledAt: string;
  completedAt: string | null;
  lastAccessedAt: string | null;
  course: {
    id: string;
    title: string;
    slug: string;
    thumbnail: string;
    level: string;
    duration: number;
    category: {
      name: string;
    };
    instructor: {
      firstName: string;
      lastName: string;
    };
  };
}

interface Certificate {
  id: string;
  issuedAt: string;
  course: {
    title: string;
    level: string;
  };
}

interface CourseReview {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  course: {
    title: string;
  };
}

interface StudentDetail {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  avatar: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  lastLoginAt: string;
  enrollments: EnrollmentDetail[];
  certificates: Certificate[];
  courseReviews: CourseReview[];
  _count: {
    enrollments: number;
    certificates: number;
    courseReviews: number;
  };
}

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const studentId = params.id as string;

  const { data: student, loading, error } = useFindUnique<StudentDetail>('User', {
    where: {
      id: studentId,
    },
    select: {
      id: true,
      username: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      avatar: true,
      isActive: true,
      isVerified: true,
      createdAt: true,
      lastLoginAt: true,
    },
    include: {
      enrollments: {
        include: {
          course: {
            include: {
              category: true,
              instructor: true,
            },
          },
        },
        orderBy: {
          enrolledAt: 'desc',
        },
      },
      certificates: {
        include: {
          course: true,
        },
        orderBy: {
          issuedAt: 'desc',
        },
      },
      courseReviews: {
        include: {
          course: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
      _count: {
        select: {
          enrollments: true,
          certificates: true,
          courseReviews: true,
        },
      },
    },
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Chưa có';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'Chưa có';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getFullName = (student: StudentDetail) => {
    if (student.firstName && student.lastName) {
      return `${student.firstName} ${student.lastName}`;
    }
    return student.username;
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string, icon: any }> = {
      ACTIVE: { variant: 'default', label: 'Đang học', icon: PlayCircle },
      COMPLETED: { variant: 'outline', label: 'Hoàn thành', icon: CheckCircle2 },
      DROPPED: { variant: 'destructive', label: 'Đã bỏ', icon: AlertCircle },
    };
    return statusMap[status] || statusMap.ACTIVE;
  };

  const getLevelColor = (level: string) => {
    const levelMap: Record<string, string> = {
      BEGINNER: 'bg-green-100 text-green-800',
      INTERMEDIATE: 'bg-blue-100 text-blue-800',
      ADVANCED: 'bg-purple-100 text-purple-800',
    };
    return levelMap[level] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Đang tải thông tin học viên...</p>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">
              {error?.message || 'Không tìm thấy học viên'}
            </p>
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="mt-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeEnrollments = student.enrollments?.filter(e => e.status === 'ACTIVE') || [];
  const completedEnrollments = student.enrollments?.filter(e => e.status === 'COMPLETED') || [];
  const averageProgress = student.enrollments?.length > 0
    ? Math.round(student.enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / student.enrollments.length)
    : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          onClick={() => router.back()}
          variant="outline"
          size="sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Chi tiết học viên
          </h1>
        </div>
      </div>

      {/* Student Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {student.avatar ? (
                <img
                  src={student.avatar}
                  alt={getFullName(student)}
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center border-4 border-white shadow-lg">
                  <UserCircle2 className="w-16 h-16 sm:w-20 sm:h-20 text-white" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4">
              <div>
                <CardTitle className="text-2xl mb-2">{getFullName(student)}</CardTitle>
                <CardDescription className="text-base">@{student.username}</CardDescription>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant={student.isActive ? 'default' : 'secondary'}>
                  {student.isActive ? 'Hoạt động' : 'Tạm khóa'}
                </Badge>
                {student.isVerified && (
                  <Badge variant="outline" className="gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Đã xác thực
                  </Badge>
                )}
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {student.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <span>{student.email}</span>
                  </div>
                )}
                {student.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4 text-green-600" />
                    <span>{student.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <span>Tham gia: {formatDate(student.createdAt)}</span>
                </div>
                {student.lastLoginAt && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span>Hoạt động: {formatDateTime(student.lastLoginAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Tổng khóa học</CardDescription>
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {student._count?.enrollments || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {activeEnrollments.length} đang học
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Hoàn thành</CardDescription>
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {completedEnrollments.length}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {student._count?.enrollments > 0
                ? Math.round((completedEnrollments.length / student._count.enrollments) * 100)
                : 0}% tỷ lệ hoàn thành
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Chứng chỉ</CardDescription>
              <Award className="w-5 h-5 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {student._count?.certificates || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Đã đạt được
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Tiến độ TB</CardDescription>
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {averageProgress}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Trung bình các khóa
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Enrollments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Khóa học đã đăng ký ({student.enrollments?.length || 0})
              </CardTitle>
              <CardDescription className="mt-1">
                Danh sách các khóa học học viên đang tham gia
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!student.enrollments || student.enrollments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>Chưa đăng ký khóa học nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {student.enrollments.map((enrollment) => {
                const statusInfo = getStatusBadge(enrollment.status);
                const StatusIcon = statusInfo.icon;

                return (
                  <Card key={enrollment.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* Thumbnail */}
                        <div className="flex-shrink-0">
                          {enrollment.course.thumbnail ? (
                            <img
                              src={enrollment.course.thumbnail}
                              alt={enrollment.course.title}
                              className="w-full sm:w-32 h-20 sm:h-20 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-full sm:w-32 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                              <BookOpen className="w-8 h-8 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                            <div>
                              <h3 className="font-semibold text-lg">
                                {enrollment.course.title}
                              </h3>
                              <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-600">
                                <Badge variant="secondary" className={getLevelColor(enrollment.course.level)}>
                                  {enrollment.course.level}
                                </Badge>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {enrollment.course.duration || 0} phút
                                </span>
                                {enrollment.course.category && (
                                  <span className="text-gray-500">
                                    • {enrollment.course.category.name}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Badge variant={statusInfo.variant} className="gap-1">
                              <StatusIcon className="w-3 h-3" />
                              {statusInfo.label}
                            </Badge>
                          </div>

                          {/* Progress */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Tiến độ học tập</span>
                              <span className="font-semibold">{enrollment.progress || 0}%</span>
                            </div>
                            <Progress value={enrollment.progress || 0} className="h-2" />
                          </div>

                          {/* Dates */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>Đăng ký: {formatDate(enrollment.enrolledAt)}</span>
                            </div>
                            {enrollment.lastAccessedAt && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>Truy cập: {formatDate(enrollment.lastAccessedAt)}</span>
                              </div>
                            )}
                            {enrollment.completedAt && (
                              <div className="flex items-center gap-1 text-green-600">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Hoàn thành: {formatDate(enrollment.completedAt)}</span>
                              </div>
                            )}
                          </div>

                          {/* Instructor */}
                          {enrollment.course.instructor && (
                            <div className="text-xs text-gray-600">
                              Giảng viên: {enrollment.course.instructor.firstName} {enrollment.course.instructor.lastName}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Certificates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Chứng chỉ đã đạt được ({student.certificates?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!student.certificates || student.certificates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Award className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>Chưa có chứng chỉ nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {student.certificates.map((cert) => (
                <Card key={cert.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                          <Trophy className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate">
                          {cert.course.title}
                        </h4>
                        <Badge variant="secondary" className={`${getLevelColor(cert.course.level)} mt-1 text-xs`}>
                          {cert.course.level}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-2">
                          Cấp ngày: {formatDate(cert.issuedAt)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reviews */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Đánh giá của học viên ({student.courseReviews?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!student.courseReviews || student.courseReviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Star className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>Chưa có đánh giá nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {student.courseReviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold">{review.course.title}</h4>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="text-sm text-gray-600 ml-2">
                            {review.rating}/5
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-gray-700 mt-2 italic">
                        &quot;{review.comment}&quot;
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
