'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  Award,
  AlertCircle,
  UserCircle2,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Student {
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
  _count: {
    enrollments: number;
    certificates: number;
    courseReviews: number;
  };
}

export default function AdminStudentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'enrolled'>('all');
  
  // Pagination state
  const { 
    currentPage, 
    pageSize, 
    handlePageChange, 
    handlePageSizeChange,
    resetPagination,
  } = usePagination(16); // 16 items per page for grid layout

  const { data: students, loading, error, refetch } = useFindMany('User', {
    where: {
      roleType: 'USER',
      enrollments: {
        some: {},  // Chỉ lấy user có ít nhất 1 enrollment (học viên thực sự)
      },
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
      _count: {
        select: {
          enrollments: true,
          certificates: true,
          courseReviews: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Filter students
  const filteredStudents = (students || []).filter((student: Student) => {
    const matchesSearch = 
      student.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.firstName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.lastName || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = 
      filterStatus === 'all' || 
      (filterStatus === 'active' && student.isActive) ||
      (filterStatus === 'inactive' && !student.isActive) ||
      (filterStatus === 'enrolled' && student._count?.enrollments > 0);
    
    return matchesSearch && matchesFilter;
  });

  // Pagination calculations
  const totalFilteredItems = filteredStudents.length;
  const totalPages = Math.ceil(totalFilteredItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

  // Reset pagination when filters change
  useEffect(() => {
    resetPagination();
  }, [searchQuery, filterStatus, resetPagination]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Chưa có';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getFullName = (student: Student) => {
    if (student.firstName && student.lastName) {
      return `${student.firstName} ${student.lastName}`;
    }
    return student.username;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Quản lý học viên</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Tổng cộng {students?.length || 0} học viên đã đăng ký khóa học
          </p>
          <p className="text-xs text-gray-500 mt-1">
            💡 Chỉ hiển thị user có ít nhất 1 enrollment
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm học viên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('all')}
            size="sm"
          >
            Tất cả
          </Button>
          <Button
            variant={filterStatus === 'active' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('active')}
            size="sm"
          >
            Hoạt động
          </Button>
          <Button
            variant={filterStatus === 'inactive' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('inactive')}
            size="sm"
          >
            Không hoạt động
          </Button>
          <Button
            variant={filterStatus === 'enrolled' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('enrolled')}
            size="sm"
          >
            Có khóa học
          </Button>
        </div>
      </div>

      {/* Students Grid */}
      {loading ? (
        <div className="text-center py-8 sm:py-12">
          <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 mx-auto animate-spin" />
          <p className="text-sm sm:text-base text-gray-500 mt-4">Đang tải học viên...</p>
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">Lỗi: {error.message}</p>
          </CardContent>
        </Card>
      ) : paginatedStudents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <UserCircle2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Không tìm thấy học viên nào</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedStudents.map((student: Student) => (
            <Card key={student.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {student.avatar ? (
                      <img
                        src={student.avatar}
                        alt={getFullName(student)}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <UserCircle2 className="w-8 h-8 text-blue-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">{getFullName(student)}</CardTitle>
                      <p className="text-xs text-gray-500 truncate">@{student.username}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Badge variant={student.isActive ? 'default' : 'secondary'} className="text-xs">
                    {student.isActive ? 'Hoạt động' : 'Tạm khóa'}
                  </Badge>
                  {student.isVerified && (
                    <Badge variant="outline" className="text-xs">
                      Đã xác thực
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Contact Info */}
                <div className="space-y-2 text-xs">
                  {student.email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{student.email}</span>
                    </div>
                  )}
                  {student.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-3 h-3 flex-shrink-0" />
                      <span>{student.phone}</span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <BookOpen className="w-3 h-3 text-blue-600" />
                    </div>
                    <p className="text-lg font-bold text-gray-900">{student._count?.enrollments || 0}</p>
                    <p className="text-xs text-gray-500">Khóa học</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Award className="w-3 h-3 text-yellow-600" />
                    </div>
                    <p className="text-lg font-bold text-gray-900">{student._count?.certificates || 0}</p>
                    <p className="text-xs text-gray-500">Chứng chỉ</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <TrendingUp className="w-3 h-3 text-green-600" />
                    </div>
                    <p className="text-lg font-bold text-gray-900">{student._count?.courseReviews || 0}</p>
                    <p className="text-xs text-gray-500">Đánh giá</p>
                  </div>
                </div>

                {/* Timeline */}
                <div className="pt-3 border-t space-y-1 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    <span>Tham gia: {formatDate(student.createdAt)}</span>
                  </div>
                  {student.lastLoginAt && (
                    <div className="flex items-center gap-2">
                      <Users className="w-3 h-3" />
                      <span>Hoạt động: {formatDate(student.lastLoginAt)}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-3 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => router.push(`/lms/admin/students/${student.id}`)}
                  >
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
              pageSizeOptions={[16, 32, 64]}
            />
          )}
        </>
      )}
    </div>
  );
}
