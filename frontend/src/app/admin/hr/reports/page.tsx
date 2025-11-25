'use client';

import { useMemo } from 'react';
import { useHRStatistics, useEmployeeProfiles, useOnboardingChecklists, useOffboardingProcesses } from '@/hooks/useHR';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  BarChart3,
  TrendingUp,
  Users,
  UserPlus,
  UserMinus,
  Calendar,
  Building2,
  Award,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { OnboardingStatus, OffboardingStatus } from '@/types/hr';

export default function ReportsPage() {
  const { statistics, loading: loadingStats } = useHRStatistics();
  const { employees, loading: loadingEmployees } = useEmployeeProfiles({ take: 1000 });
  const { checklists, loading: loadingOnboarding } = useOnboardingChecklists({ take: 1000 });
  const { processes, loading: loadingOffboarding } = useOffboardingProcesses({ take: 1000 });

  // Calculate department distribution
  const departmentStats = useMemo(() => {
    const deptMap = new Map<string, number>();
    employees.forEach((emp) => {
      const dept = emp.department || 'Không xác định';
      deptMap.set(dept, (deptMap.get(dept) || 0) + 1);
    });
    return Array.from(deptMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [employees]);

  // Calculate position distribution
  const positionStats = useMemo(() => {
    const posMap = new Map<string, number>();
    employees.forEach((emp) => {
      const pos = emp.position || 'Không xác định';
      posMap.set(pos, (posMap.get(pos) || 0) + 1);
    });
    return Array.from(posMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10
  }, [employees]);

  // Calculate contract type distribution
  const contractStats = useMemo(() => {
    const contractMap = new Map<string, number>();
    employees.forEach((emp) => {
      const contract = emp.contractType || 'Không xác định';
      const label =
        contract === 'FULL_TIME' ? 'Toàn thời gian' :
        contract === 'PART_TIME' ? 'Bán thời gian' :
        contract === 'CONTRACT' ? 'Hợp đồng' :
        contract === 'INTERNSHIP' ? 'Thực tập' :
        contract === 'PROBATION' ? 'Thử việc' : 'Khác';
      contractMap.set(label, (contractMap.get(label) || 0) + 1);
    });
    return Array.from(contractMap.entries()).map(([name, count]) => ({ name, count }));
  }, [employees]);

  // Calculate onboarding completion rate
  const onboardingStats = useMemo(() => {
    const total = checklists.length;
    const completed = checklists.filter(c => c.status === OnboardingStatus.COMPLETED).length;
    const inProgress = checklists.filter(c => c.status === OnboardingStatus.IN_PROGRESS).length;
    const pending = checklists.filter(c => c.status === OnboardingStatus.PENDING).length;
    const cancelled = checklists.filter(c => c.status === OnboardingStatus.CANCELLED).length;
    
    return {
      total,
      completed,
      inProgress,
      pending,
      cancelled,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      avgProgress: total > 0 
        ? Math.round(checklists.reduce((sum, c) => sum + c.progressPercentage, 0) / total)
        : 0,
    };
  }, [checklists]);

  // Calculate offboarding stats
  const offboardingStats = useMemo(() => {
    const total = processes.length;
    const completed = processes.filter(p => p.status === OffboardingStatus.COMPLETED).length;
    const inProgress = processes.filter(p => p.status === OffboardingStatus.IN_PROGRESS).length;
    const pendingApproval = processes.filter(p => p.status === OffboardingStatus.PENDING_APPROVAL).length;
    
    // Calculate by exit type
    const exitTypeMap = new Map<string, number>();
    processes.forEach((p) => {
      const type =
        p.exitType === 'RESIGNATION' ? 'Từ chức' :
        p.exitType === 'TERMINATION' ? 'Chấm dứt HĐ' :
        p.exitType === 'RETIREMENT' ? 'Nghỉ hưu' :
        p.exitType === 'CONTRACT_END' ? 'Hết hợp đồng' : 'Thỏa thuận chung';
      exitTypeMap.set(type, (exitTypeMap.get(type) || 0) + 1);
    });
    
    return {
      total,
      completed,
      inProgress,
      pendingApproval,
      exitTypes: Array.from(exitTypeMap.entries()).map(([name, count]) => ({ name, count })),
    };
  }, [processes]);

  // Calculate monthly trends (last 6 months)
  const monthlyTrends = useMemo(() => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' });
      
      const onboardingCount = checklists.filter(c => {
        const startDate = new Date(c.startDate);
        return startDate.getMonth() === date.getMonth() && startDate.getFullYear() === date.getFullYear();
      }).length;
      
      const offboardingCount = processes.filter(p => {
        const lastDay = new Date(p.lastWorkingDay);
        return lastDay.getMonth() === date.getMonth() && lastDay.getFullYear() === date.getFullYear();
      }).length;
      
      months.push({
        month: monthName,
        onboarding: onboardingCount,
        offboarding: offboardingCount,
      });
    }
    
    return months;
  }, [checklists, processes]);

  const loading = loadingStats || loadingEmployees || loadingOnboarding || loadingOffboarding;

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <BarChart3 className="mr-3 h-8 w-8" />
          Báo cáo & Phân tích
        </h1>
        <p className="text-muted-foreground">
          Thống kê và phân tích toàn diện về nhân sự
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng nhân viên</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics?.totalEmployees || 0}</div>
            <p className="text-xs text-muted-foreground">
              {statistics?.activeEmployees || 0} đang hoạt động
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Onboarding</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{onboardingStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {onboardingStats.completionRate}% hoàn thành
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offboarding</CardTitle>
            <UserMinus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{offboardingStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {offboardingStats.inProgress} đang xử lý
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tỷ lệ thay đổi</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics?.totalEmployees
                ? Math.round((offboardingStats.total / statistics.totalEmployees) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Turnover rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="mr-2 h-5 w-5" />
              Phân bổ theo phòng ban
            </CardTitle>
            <CardDescription>Top phòng ban có nhiều nhân viên nhất</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departmentStats.slice(0, 8).map((dept) => {
                const percentage = statistics?.totalEmployees
                  ? Math.round((dept.count / statistics.totalEmployees) * 100)
                  : 0;
                return (
                  <div key={dept.name} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{dept.name}</span>
                      <span className="text-muted-foreground">{dept.count} người ({percentage}%)</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Contract Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="mr-2 h-5 w-5" />
              Loại hợp đồng
            </CardTitle>
            <CardDescription>Phân bổ theo loại hợp đồng lao động</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contractStats.map((contract) => {
                const percentage = statistics?.totalEmployees
                  ? Math.round((contract.count / statistics.totalEmployees) * 100)
                  : 0;
                return (
                  <div key={contract.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      <span className="text-sm font-medium">{contract.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">{contract.count}</span>
                      <Badge variant="secondary">{percentage}%</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Onboarding Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserPlus className="mr-2 h-5 w-5" />
              Phân tích Onboarding
            </CardTitle>
            <CardDescription>Trạng thái và tiến độ onboarding</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-3xl font-bold text-primary">{onboardingStats.completionRate}%</p>
                <p className="text-xs text-muted-foreground mt-1">Tỷ lệ hoàn thành</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-3xl font-bold text-blue-600">{onboardingStats.avgProgress}%</p>
                <p className="text-xs text-muted-foreground mt-1">Tiến độ trung bình</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Hoàn thành</span>
                <Badge className="bg-green-500">{onboardingStats.completed}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Đang thực hiện</span>
                <Badge className="bg-blue-500">{onboardingStats.inProgress}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Chờ xử lý</span>
                <Badge variant="secondary">{onboardingStats.pending}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Đã hủy</span>
                <Badge variant="destructive">{onboardingStats.cancelled}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Offboarding Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserMinus className="mr-2 h-5 w-5" />
              Phân tích Offboarding
            </CardTitle>
            <CardDescription>Lý do và trạng thái nghỉ việc</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Lý do nghỉ việc</h4>
              {offboardingStats.exitTypes.map((type) => {
                const percentage = offboardingStats.total
                  ? Math.round((type.count / offboardingStats.total) * 100)
                  : 0;
                return (
                  <div key={type.name} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{type.name}</span>
                      <span className="text-muted-foreground">{type.count} ({percentage}%)</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500 transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Trạng thái</h4>
              <div className="flex justify-between items-center">
                <span className="text-sm">Hoàn thành</span>
                <Badge className="bg-green-500">{offboardingStats.completed}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Đang xử lý</span>
                <Badge className="bg-blue-500">{offboardingStats.inProgress}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Chờ phê duyệt</span>
                <Badge className="bg-yellow-500">{offboardingStats.pendingApproval}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Xu hướng 6 tháng gần đây
          </CardTitle>
          <CardDescription>Số lượng onboarding và offboarding theo tháng</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyTrends.map((month) => (
              <div key={month.month} className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>{month.month}</span>
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center text-green-600">
                      <ArrowUp className="h-4 w-4 mr-1" />
                      {month.onboarding} vào
                    </span>
                    <span className="flex items-center text-red-600">
                      <ArrowDown className="h-4 w-4 mr-1" />
                      {month.offboarding} ra
                    </span>
                    <span className="text-muted-foreground">
                      Net: {month.onboarding - month.offboarding > 0 ? '+' : ''}
                      {month.onboarding - month.offboarding}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-1 h-8">
                  <div
                    className="bg-green-500 rounded transition-all"
                    style={{
                      width: `${Math.max((month.onboarding / Math.max(...monthlyTrends.map(m => Math.max(m.onboarding, m.offboarding)))) * 100, 2)}%`,
                    }}
                  />
                  <div
                    className="bg-red-500 rounded transition-all"
                    style={{
                      width: `${Math.max((month.offboarding / Math.max(...monthlyTrends.map(m => Math.max(m.onboarding, m.offboarding)))) * 100, 2)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Positions */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Chức vụ</CardTitle>
          <CardDescription>Các vị trí có nhiều nhân viên nhất</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {positionStats.map((pos, index) => (
              <div key={pos.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">#{index + 1}</span>
                  </div>
                  <span className="font-medium">{pos.name}</span>
                </div>
                <Badge variant="outline">{pos.count} người</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
