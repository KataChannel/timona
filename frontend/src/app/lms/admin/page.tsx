'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BookOpen, 
  Users, 
  GraduationCap, 
  TrendingUp,
  Award,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function AdminLMSPage() {
  // Mock data - sẽ thay bằng GraphQL query
  const stats = {
    totalCourses: 8,
    activeCourses: 8,
    totalStudents: 0,
    totalInstructors: 0,
    totalEnrollments: 0,
    completionRate: 0,
    averageRating: 0,
    totalQuizzes: 0,
  };

  const recentActivities = [
    { id: 1, type: 'course', message: 'Khóa học mới được tạo', time: '2 giờ trước' },
    { id: 2, type: 'enrollment', message: 'Học viên mới ghi danh', time: '5 giờ trước' },
    { id: 3, type: 'quiz', message: 'Bài kiểm tra hoàn thành', time: '1 ngày trước' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Tổng quan LMS</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Quản lý toàn bộ hệ thống học tập trực tuyến</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Tổng khóa học</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats.totalCourses}</div>
            <p className="text-xs text-green-600 mt-1">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              {stats.activeCourses} đang hoạt động
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Tổng học viên</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.totalEnrollments} lượt ghi danh
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Giảng viên</CardTitle>
            <GraduationCap className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats.totalInstructors}</div>
            <p className="text-xs text-gray-500 mt-1">
              Đang hoạt động
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Tỷ lệ hoàn thành</CardTitle>
            <Award className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats.completionRate}%</div>
            <p className="text-xs text-gray-500 mt-1">
              Trung bình các khóa
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts & Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Hoạt động gần đây</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Các hoạt động mới nhất trong hệ thống</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-2 sm:gap-3 pb-3 sm:pb-4 border-b last:border-0">
                  <div className="mt-0.5 sm:mt-1">
                    {activity.type === 'course' && <BookOpen className="h-4 w-4 text-blue-600" />}
                    {activity.type === 'enrollment' && <Users className="h-4 w-4 text-green-600" />}
                    {activity.type === 'quiz' && <CheckCircle className="h-4 w-4 text-purple-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      <Clock className="inline h-3 w-3 mr-1" />
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Thao tác nhanh</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Các tác vụ thường dùng</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <button className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-xs sm:text-sm font-medium text-center">Tạo khóa học</p>
              </button>
              <button className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 mx-auto mb-2" />
                <p className="text-xs sm:text-sm font-medium text-center">Thêm học viên</p>
              </button>
              <button className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors">
                <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 mx-auto mb-2" />
                <p className="text-xs sm:text-sm font-medium text-center">Thêm giảng viên</p>
              </button>
              <button className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-colors">
                <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600 mx-auto mb-2" />
                <p className="text-xs sm:text-sm font-medium text-center">Xem báo cáo</p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Courses */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Khóa học phổ biến</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Top 5 khóa học có nhiều học viên nhất</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-xs sm:text-sm text-gray-500 text-center py-6 sm:py-8">
              Chưa có dữ liệu khóa học
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
