'use client';

import { useHRStatistics, useOnboardingChecklists, useOffboardingProcesses } from '@/hooks/useHR';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  UserPlus, 
  UserMinus, 
  UserCheck, 
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import { OnboardingStatus, OffboardingStatus } from '@/types/hr';

export default function HRDashboard() {
  const { statistics, loading: statsLoading } = useHRStatistics();
  const { checklists, loading: onboardingLoading } = useOnboardingChecklists({
    status: OnboardingStatus.IN_PROGRESS,
    take: 5,
  });
  const { processes, loading: offboardingLoading } = useOffboardingProcesses({
    status: OffboardingStatus.IN_PROGRESS,
    take: 5,
  });

  const loading = statsLoading || onboardingLoading || offboardingLoading;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">HR Dashboard</h1>
          <p className="text-muted-foreground">
            Quản lý nhân sự và quy trình onboarding/offboarding
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/hr/employees">
            <Button>
              <Users className="mr-2 h-4 w-4" />
              Danh sách nhân viên
            </Button>
          </Link>
          <Link href="/admin/hr/employee/new">
            <Button variant="outline">
              <UserPlus className="mr-2 h-4 w-4" />
              Thêm nhân viên
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng nhân viên</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{statistics?.totalEmployees || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {statistics?.activeEmployees || 0} đang làm việc
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang onboarding</CardTitle>
            <UserPlus className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold text-blue-600">
                  {statistics?.onboarding.total || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {statistics?.onboarding.inProgress || 0} đang xử lý
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang offboarding</CardTitle>
            <UserMinus className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold text-orange-600">
                  {statistics?.offboarding.total || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {statistics?.offboarding.inProgress || 0} đang xử lý
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nhân viên hoạt động</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600">
                  {statistics?.activeEmployees || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {statistics?.inactiveEmployees || 0} không hoạt động
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/admin/hr/onboarding" className="block">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <UserPlus className="mr-2 h-5 w-5 text-blue-500" />
                Onboarding
              </CardTitle>
              <CardDescription>Quản lý quy trình nhập việc</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{statistics?.onboarding.pending || 0}</span>
                <Badge variant="secondary">Chờ xử lý</Badge>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/hr/offboarding" className="block">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <UserMinus className="mr-2 h-5 w-5 text-orange-500" />
                Offboarding
              </CardTitle>
              <CardDescription>Quản lý quy trình nghỉ việc</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{statistics?.offboarding.pending || 0}</span>
                <Badge variant="secondary">Chờ xử lý</Badge>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/hr/reports" className="block">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <FileText className="mr-2 h-5 w-5 text-purple-500" />
                Báo cáo
              </CardTitle>
              <CardDescription>Thống kê và phân tích HR</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Xem báo cáo</span>
                <Badge variant="secondary">Mới</Badge>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Onboarding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Onboarding đang xử lý
          </CardTitle>
          <CardDescription>5 quy trình onboarding gần nhất</CardDescription>
        </CardHeader>
        <CardContent>
          {onboardingLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : checklists.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="mx-auto h-12 w-12 mb-2 text-green-500" />
              <p>Không có onboarding đang xử lý</p>
            </div>
          ) : (
            <div className="space-y-3">
              {checklists.map((checklist) => (
                <Link
                  key={checklist.id}
                  href={`/admin/hr/onboarding/${checklist.id}`}
                  className="block"
                >
                  <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="font-medium">{checklist.employeeProfile?.fullName}</p>
                        <p className="text-sm text-muted-foreground">
                          {checklist.employeeProfile?.department} - {checklist.employeeProfile?.position}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {checklist.completedTasks}/{checklist.totalTasks} tasks
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {checklist.progressPercentage.toFixed(0)}% hoàn thành
                        </p>
                      </div>
                      <Badge variant={checklist.status === OnboardingStatus.IN_PROGRESS ? 'default' : 'secondary'}>
                        {checklist.status}
                      </Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          {checklists.length > 0 && (
            <div className="mt-4 text-center">
              <Link href="/admin/hr/onboarding">
                <Button variant="outline">Xem tất cả onboarding</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Offboarding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="mr-2 h-5 w-5" />
            Offboarding đang xử lý
          </CardTitle>
          <CardDescription>5 quy trình offboarding gần nhất</CardDescription>
        </CardHeader>
        <CardContent>
          {offboardingLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : processes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="mx-auto h-12 w-12 mb-2 text-green-500" />
              <p>Không có offboarding đang xử lý</p>
            </div>
          ) : (
            <div className="space-y-3">
              {processes.map((process) => (
                <Link
                  key={process.id}
                  href={`/admin/hr/offboarding/${process.id}`}
                  className="block"
                >
                  <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="font-medium">{process.employeeProfile?.fullName}</p>
                        <p className="text-sm text-muted-foreground">
                          {process.employeeProfile?.department} - {process.employeeProfile?.position}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          Ngày nghỉ: {new Date(process.lastWorkingDay).toLocaleDateString('vi-VN')}
                        </p>
                        <p className="text-xs text-muted-foreground">{process.exitType}</p>
                      </div>
                      <Badge
                        variant={
                          process.status === OffboardingStatus.IN_PROGRESS
                            ? 'default'
                            : process.status === OffboardingStatus.APPROVED
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {process.status}
                      </Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          {processes.length > 0 && (
            <div className="mt-4 text-center">
              <Link href="/admin/hr/offboarding">
                <Button variant="outline">Xem tất cả offboarding</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
