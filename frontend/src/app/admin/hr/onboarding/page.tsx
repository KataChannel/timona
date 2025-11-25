'use client';

import { useState } from 'react';
import { useOnboardingChecklists } from '@/hooks/useHR';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  UserPlus,
  Search,
  Filter,
  Eye,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { OnboardingStatus } from '@/types/hr';

export default function OnboardingListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OnboardingStatus | 'all'>('all');

  const { checklists, loading, total, hasMore, loadMore } = useOnboardingChecklists({
    status: statusFilter === 'all' ? undefined : statusFilter,
    take: 20,
  });

  const filteredChecklists = checklists.filter((checklist) =>
    checklist.employeeProfile?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    checklist.employeeProfile?.employeeCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: OnboardingStatus) => {
    const statusConfig: Record<OnboardingStatus, { variant: 'secondary' | 'default' | 'destructive', icon: any, label: string, className?: string }> = {
      [OnboardingStatus.PENDING]: { variant: 'secondary', icon: AlertCircle, label: 'Chờ xử lý' },
      [OnboardingStatus.IN_PROGRESS]: { variant: 'default', icon: Clock, label: 'Đang thực hiện' },
      [OnboardingStatus.COMPLETED]: { variant: 'default', icon: CheckCircle2, label: 'Hoàn thành', className: 'bg-green-500' },
      [OnboardingStatus.CANCELLED]: { variant: 'destructive', icon: XCircle, label: 'Đã hủy' },
    };
    const config = statusConfig[status];
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="mr-1 h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const calculateProgress = (checklist: any) => {
    if (!checklist.tasks || checklist.tasks.length === 0) return 0;
    const completedTasks = checklist.tasks.filter((task: any) => task.completed).length;
    return Math.round((completedTasks / checklist.tasks.length) * 100);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <UserPlus className="mr-3 h-8 w-8" />
            Onboarding - Nhập môn
          </h1>
          <p className="text-muted-foreground">
            Quản lý {total} quy trình nhập môn nhân viên mới
          </p>
        </div>
        <Link href="/admin/hr/onboarding/new">
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Tạo onboarding mới
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Filter className="mr-2 h-5 w-5" />
            Bộ lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên, mã NV..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as OnboardingStatus | 'all')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="PENDING">Chờ xử lý</SelectItem>
                <SelectItem value="IN_PROGRESS">Đang thực hiện</SelectItem>
                <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
                <SelectItem value="CANCELLED">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Onboarding Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredChecklists.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <UserPlus className="mx-auto h-12 w-12 mb-2" />
              <p>Không tìm thấy quy trình onboarding nào</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nhân viên</TableHead>
                  <TableHead>Ngày bắt đầu</TableHead>
                  <TableHead>Ngày kết thúc</TableHead>
                  <TableHead>Tiến độ</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Người phụ trách</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredChecklists.map((checklist) => {
                  const progress = calculateProgress(checklist);
                  return (
                    <TableRow key={checklist.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{checklist.employeeProfile?.fullName || 'N/A'}</p>
                          <p className="text-xs text-muted-foreground">
                            {checklist.employeeProfile?.employeeCode || '-'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-1 h-3 w-3 text-muted-foreground" />
                          {new Date(checklist.startDate).toLocaleDateString('vi-VN')}
                        </div>
                      </TableCell>
                      <TableCell>
                        {checklist.targetDate ? (
                          <div className="flex items-center text-sm">
                            <Calendar className="mr-1 h-3 w-3 text-muted-foreground" />
                            {new Date(checklist.targetDate).toLocaleDateString('vi-VN')}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(checklist.status)}</TableCell>
                      <TableCell>
                        {checklist.assignedTo ? (
                          <div className="text-sm">
                            <p className="font-medium">{checklist.assignedTo}</p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/admin/hr/onboarding/${checklist.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="mr-1 h-4 w-4" />
                            Xem chi tiết
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Load More */}
      {hasMore && (
        <div className="text-center">
          <Button onClick={loadMore} variant="outline" disabled={loading}>
            Tải thêm
          </Button>
        </div>
      )}
    </div>
  );
}
