'use client';

import { useState } from 'react';
import { useOffboardingProcesses } from '@/hooks/useHR';
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
  UserMinus,
  Search,
  Filter,
  Eye,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';
import { OffboardingStatus, ClearanceStatus } from '@/types/hr';

export default function OffboardingListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OffboardingStatus | 'all'>('all');

  const { processes, loading, total, hasMore, loadMore } = useOffboardingProcesses({
    status: statusFilter === 'all' ? undefined : statusFilter,
    take: 20,
  });

  const filteredProcesses = processes.filter((process) =>
    process.employeeProfile?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    process.employeeProfile?.employeeCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: OffboardingStatus) => {
    const statusConfig: Record<OffboardingStatus, { variant: 'secondary' | 'default' | 'destructive', icon: any, label: string, className?: string }> = {
      [OffboardingStatus.INITIATED]: { variant: 'secondary', icon: AlertCircle, label: 'Khởi tạo' },
      [OffboardingStatus.IN_PROGRESS]: { variant: 'default', icon: Clock, label: 'Đang xử lý' },
      [OffboardingStatus.PENDING_APPROVAL]: { variant: 'default', icon: AlertTriangle, label: 'Chờ phê duyệt', className: 'bg-yellow-500' },
      [OffboardingStatus.APPROVED]: { variant: 'default', icon: CheckCircle2, label: 'Đã phê duyệt', className: 'bg-blue-500' },
      [OffboardingStatus.COMPLETED]: { variant: 'default', icon: CheckCircle2, label: 'Hoàn thành', className: 'bg-green-500' },
      [OffboardingStatus.CANCELLED]: { variant: 'destructive', icon: XCircle, label: 'Đã hủy' },
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

  const getClearanceBadge = (status: ClearanceStatus) => {
    const clearanceConfig: Record<ClearanceStatus, { variant: 'secondary' | 'default' | 'destructive', label: string }> = {
      [ClearanceStatus.PENDING]: { variant: 'secondary', label: 'Chưa hoàn tất' },
      [ClearanceStatus.PARTIAL]: { variant: 'default', label: 'Một phần' },
      [ClearanceStatus.COMPLETE]: { variant: 'default', label: 'Hoàn tất' },
    };
    const config = clearanceConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <UserMinus className="mr-3 h-8 w-8" />
            Offboarding - Thôi việc
          </h1>
          <p className="text-muted-foreground">
            Quản lý {total} quy trình offboarding nhân viên
          </p>
        </div>
        <Link href="/admin/hr/offboarding/new">
          <Button>
            <UserMinus className="mr-2 h-4 w-4" />
            Khởi tạo offboarding
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
              onValueChange={(value) => setStatusFilter(value as OffboardingStatus | 'all')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="INITIATED">Khởi tạo</SelectItem>
                <SelectItem value="IN_PROGRESS">Đang xử lý</SelectItem>
                <SelectItem value="PENDING_APPROVAL">Chờ phê duyệt</SelectItem>
                <SelectItem value="APPROVED">Đã phê duyệt</SelectItem>
                <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
                <SelectItem value="CANCELLED">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Offboarding Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredProcesses.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <UserMinus className="mx-auto h-12 w-12 mb-2" />
              <p>Không tìm thấy quy trình offboarding nào</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nhân viên</TableHead>
                  <TableHead>Lý do nghỉ việc</TableHead>
                  <TableHead>Ngày cuối làm việc</TableHead>
                  <TableHead>Trạng thái clearance</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Người khởi tạo</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProcesses.map((process) => (
                  <TableRow key={process.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{process.employeeProfile?.fullName || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground">
                          {process.employeeProfile?.employeeCode || '-'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="text-sm font-medium">{process.exitReason}</p>
                        <p className="text-xs text-muted-foreground">
                          {process.exitType === 'RESIGNATION' ? 'Từ chức' :
                           process.exitType === 'TERMINATION' ? 'Chấm dứt HĐ' :
                           process.exitType === 'RETIREMENT' ? 'Nghỉ hưu' :
                           process.exitType === 'CONTRACT_END' ? 'Hết hợp đồng' :
                           process.exitType === 'MUTUAL_AGREEMENT' ? 'Thỏa thuận chung' : 'Khác'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <Calendar className="mr-1 h-3 w-3 text-muted-foreground" />
                        {new Date(process.lastWorkingDay).toLocaleDateString('vi-VN')}
                      </div>
                    </TableCell>
                    <TableCell>{getClearanceBadge(process.clearanceStatus)}</TableCell>
                    <TableCell>{getStatusBadge(process.status)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {process.initiatedBy || '-'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/hr/offboarding/${process.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="mr-1 h-4 w-4" />
                          Xem chi tiết
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
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
