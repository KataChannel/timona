'use client';

import { useQuery, useMutation } from '@apollo/client';
import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  GET_TECHNICAL_SUPPORT_TICKETS,
  ASSIGN_TECHNICAL_SUPPORT_TICKET,
  RESOLVE_TECHNICAL_SUPPORT_TICKET,
} from '@/graphql/release-hub/support.queries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Clock, AlertCircle, CheckCircle, XCircle, Eye, TrendingUp } from 'lucide-react';

const STATUS_FILTERS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'OPEN', label: 'Mới' },
  { value: 'IN_PROGRESS', label: 'Đang xử lý' },
  { value: 'RESOLVED', label: 'Đã giải quyết' },
  { value: 'CLOSED', label: 'Đã đóng' },
];

export default function AdminSupportPage() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState('all');

  const { data, loading, error, refetch } = useQuery(GET_TECHNICAL_SUPPORT_TICKETS, {
    variables: {
      status: statusFilter === 'all' ? undefined : statusFilter,
    },
  });

  const [assignTicket, { loading: assigning }] = useMutation(ASSIGN_TECHNICAL_SUPPORT_TICKET, {
    onCompleted: () => {
      toast({
        type: 'success',
        title: 'Thành công',
        description: 'Ticket đã được assign',
      });
      refetch();
    },
    onError: (error) => {
      toast({
        type: 'error',
        title: 'Lỗi',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const [resolveTicket, { loading: resolving }] = useMutation(RESOLVE_TECHNICAL_SUPPORT_TICKET, {
    onCompleted: () => {
      toast({
        type: 'success',
        title: 'Thành công',
        description: 'Ticket đã được giải quyết',
      });
      refetch();
    },
    onError: (error) => {
      toast({
        type: 'error',
        title: 'Lỗi',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string; icon: any }> = {
      OPEN: { variant: 'default', label: 'Mới', icon: Clock },
      IN_PROGRESS: { variant: 'secondary', label: 'Đang xử lý', icon: TrendingUp },
      RESOLVED: { variant: 'outline', label: 'Đã giải quyết', icon: CheckCircle },
      CLOSED: { variant: 'outline', label: 'Đã đóng', icon: XCircle },
    };
    const config = variants[status] || variants.OPEN;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      CRITICAL: 'bg-red-500 text-white',
      HIGH: 'bg-orange-500 text-white',
      MEDIUM: 'bg-yellow-500 text-white',
      LOW: 'bg-green-500 text-white',
    };
    const labels: Record<string, string> = {
      CRITICAL: 'Khẩn cấp',
      HIGH: 'Cao',
      MEDIUM: 'Trung bình',
      LOW: 'Thấp',
    };
    return (
      <Badge className={colors[priority] || colors.LOW}>{labels[priority] || priority}</Badge>
    );
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      BUG: 'Lỗi',
      FEATURE_REQUEST: 'Yêu cầu tính năng',
      TECHNICAL_SUPPORT: 'Hỗ trợ kỹ thuật',
      ACCOUNT_ISSUE: 'Vấn đề tài khoản',
      PAYMENT_ISSUE: 'Vấn đề thanh toán',
      OTHER: 'Khác',
    };
    return labels[category] || category;
  };

  // Calculate stats
  const tickets = data?.technicalSupportTickets || [];
  const stats = {
    total: tickets.length,
    open: tickets.filter((t: any) => t.status === 'OPEN').length,
    inProgress: tickets.filter((t: any) => t.status === 'IN_PROGRESS').length,
    resolved: tickets.filter((t: any) => t.status === 'RESOLVED').length,
    avgRating:
      tickets.filter((t: any) => t.rating).reduce((acc: number, t: any) => acc + t.rating, 0) /
        tickets.filter((t: any) => t.rating).length || 0,
  };

  if (error) {
    return (
      <div className="container max-w-7xl py-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <p className="text-lg font-semibold mb-2">Có lỗi xảy ra</p>
            <p className="text-gray-600 mb-4">{error.message}</p>
            <Button onClick={() => window.location.reload()}>Thử lại</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Quản Lý Support Tickets</h1>
        <p className="text-gray-600">Quản lý và xử lý yêu cầu hỗ trợ từ khách hàng</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tổng tickets</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-2">
            <CardDescription>Mới</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{stats.open}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-2">
            <CardDescription>Đang xử lý</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{stats.inProgress}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-2">
            <CardDescription>Đã giải quyết</CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.resolved}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Đánh giá TB</CardDescription>
            <CardTitle className="text-3xl">
              {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '-'}
              {stats.avgRating > 0 && <span className="text-lg text-gray-500">/5</span>}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh sách tickets</CardTitle>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTERS.map((filter) => (
                  <SelectItem key={filter.value} value={filter.value}>
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-gray-200 animate-pulse rounded" />
              ))}
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Không có ticket nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket#</TableHead>
                    <TableHead>Chủ đề</TableHead>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead>Phân loại</TableHead>
                    <TableHead>Độ ưu tiên</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Người xử lý</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.map((ticket: any) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-mono font-semibold text-xs">
                        {ticket.ticketNumber}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="font-semibold truncate">{ticket.subject}</div>
                        <div className="text-xs text-gray-600 truncate">
                          {ticket.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{ticket.customerName}</div>
                        <div className="text-xs text-gray-600">{ticket.customerEmail}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getCategoryLabel(ticket.category)}</Badge>
                      </TableCell>
                      <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                      <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                      <TableCell>
                        {ticket.assignedAgent ? (
                          <div className="text-sm">{ticket.assignedAgent.name}</div>
                        ) : (
                          <span className="text-gray-400 text-sm">Chưa assign</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(ticket.createdAt), 'PP', { locale: vi })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/support/ticket/${ticket.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
