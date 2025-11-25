'use client';

import { useState, useEffect } from 'react';
import { useFindMany } from '@/hooks/useDynamicGraphQL';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Pagination, { usePagination } from '@/components/ui/pagination';
import { 
  Search, 
  Users,
  BookOpen,
  AlertCircle,
  TrendingUp,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Enrollment {
  id: string;
  status: string;
  progress: number;
  paymentAmount: number;
  paymentMethod: string;
  enrolledAt: string;
  completedAt: string;
  lastAccessedAt: string;
  user: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  course: {
    id: string;
    title: string;
    slug: string;
    price: number;
  };
}

export default function AdminEnrollmentsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'ACTIVE' | 'COMPLETED' | 'DROPPED'>('all');
  
  // Pagination state
  const { 
    currentPage, 
    pageSize, 
    handlePageChange, 
    handlePageSizeChange,
    resetPagination,
  } = usePagination(20); // 20 items per page for table layout

  const { data: enrollments, loading, error, refetch } = useFindMany('Enrollment', {
    select: {
      id: true,
      status: true,
      progress: true,
      paymentAmount: true,
      paymentMethod: true,
      enrolledAt: true,
      completedAt: true,
      lastAccessedAt: true,
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
          price: true,
        },
      },
    },
    orderBy: {
      enrolledAt: 'desc',
    },
  });

  // Filter enrollments
  const filteredEnrollments = (enrollments || []).filter((enrollment: Enrollment) => {
    const userName = enrollment.user.firstName && enrollment.user.lastName
      ? `${enrollment.user.firstName} ${enrollment.user.lastName}`
      : enrollment.user.username;
    
    const matchesSearch = 
      userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (enrollment.user.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      enrollment.course.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = 
      filterStatus === 'all' || 
      enrollment.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  // Pagination calculations
  const totalFilteredItems = filteredEnrollments.length;
  const totalPages = Math.ceil(totalFilteredItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedEnrollments = filteredEnrollments.slice(startIndex, endIndex);

  // Reset pagination when filters change
  useEffect(() => {
    resetPagination();
  }, [searchQuery, filterStatus, resetPagination]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    if (!price) return 'Miễn phí';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string; icon: any }> = {
      ACTIVE: { variant: 'default', label: 'Đang học', icon: TrendingUp },
      COMPLETED: { variant: 'default', label: 'Hoàn thành', icon: CheckCircle },
      DROPPED: { variant: 'secondary', label: 'Đã bỏ', icon: XCircle },
    };
    
    const config = variants[status] || { variant: 'outline', label: status, icon: Clock };
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 20) return 'bg-yellow-500';
    return 'bg-gray-300';
  };

  const getUserName = (user: Enrollment['user']) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username;
  };

  // Stats calculation
  const stats = {
    total: enrollments?.length || 0,
    active: enrollments?.filter((e: Enrollment) => e.status === 'ACTIVE').length || 0,
    completed: enrollments?.filter((e: Enrollment) => e.status === 'COMPLETED').length || 0,
    dropped: enrollments?.filter((e: Enrollment) => e.status === 'DROPPED').length || 0,
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Quản lý ghi danh</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Tổng cộng {stats.total} ghi danh</p>
        </div>
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
              <TrendingUp className="w-4 h-4" />
              Đang học
            </CardDescription>
            <CardTitle className="text-2xl text-blue-600">{stats.active}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              Hoàn thành
            </CardDescription>
            <CardTitle className="text-2xl text-green-600">{stats.completed}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-1">
              <XCircle className="w-4 h-4" />
              Đã bỏ
            </CardDescription>
            <CardTitle className="text-2xl text-gray-600">{stats.dropped}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm theo học viên, khóa học..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          <Button
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('all')}
            size="sm"
          >
            Tất cả
          </Button>
          <Button
            variant={filterStatus === 'ACTIVE' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('ACTIVE')}
            size="sm"
          >
            Đang học
          </Button>
          <Button
            variant={filterStatus === 'COMPLETED' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('COMPLETED')}
            size="sm"
          >
            Hoàn thành
          </Button>
          <Button
            variant={filterStatus === 'DROPPED' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('DROPPED')}
            size="sm"
          >
            Đã bỏ
          </Button>
        </div>
      </div>

      {/* Enrollments List */}
      {loading ? (
        <div className="text-center py-8 sm:py-12">
          <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 mx-auto animate-spin" />
          <p className="text-sm sm:text-base text-gray-500 mt-4">Đang tải ghi danh...</p>
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">Lỗi: {error.message}</p>
          </CardContent>
        </Card>
      ) : paginatedEnrollments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Không tìm thấy ghi danh nào</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {paginatedEnrollments.map((enrollment: Enrollment) => (
            <Card key={enrollment.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      <Users className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base mb-1">
                          {getUserName(enrollment.user)}
                        </CardTitle>
                        <p className="text-sm text-gray-600 truncate">
                          {enrollment.user.email || enrollment.user.username}
                        </p>
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(enrollment.status)}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Course Info */}
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <BookOpen className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{enrollment.course.title}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Giá: {formatPrice(enrollment.course.price)}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tiến độ học tập</span>
                    <span className="font-semibold text-gray-900">{Math.round(enrollment.progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${getProgressColor(enrollment.progress)}`}
                      style={{ width: `${enrollment.progress}%` }}
                    />
                  </div>
                </div>

                {/* Payment Info */}
                {enrollment.paymentAmount > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 p-2 bg-blue-50 rounded">
                    <DollarSign className="w-4 h-4 text-blue-600" />
                    <span>Thanh toán: {formatPrice(enrollment.paymentAmount)}</span>
                    {enrollment.paymentMethod && (
                      <Badge variant="outline" className="ml-auto">
                        {enrollment.paymentMethod}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Timeline */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t text-xs">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-3 h-3" />
                    <div>
                      <p className="text-gray-500">Ghi danh</p>
                      <p className="font-medium text-gray-900">{formatDate(enrollment.enrolledAt)}</p>
                    </div>
                  </div>
                  
                  {enrollment.lastAccessedAt && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-3 h-3" />
                      <div>
                        <p className="text-gray-500">Truy cập cuối</p>
                        <p className="font-medium text-gray-900">{formatDate(enrollment.lastAccessedAt)}</p>
                      </div>
                    </div>
                  )}
                  
                  {enrollment.completedAt && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      <div>
                        <p className="text-gray-500">Hoàn thành</p>
                        <p className="font-medium text-green-900">{formatDate(enrollment.completedAt)}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t">
                  <Button variant="outline" size="sm" className="flex-1">
                    Xem chi tiết
                  </Button>
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
              pageSizeOptions={[20, 50, 100]}
            />
          )}
        </>
      )}
    </div>
  );
}
