'use client';

import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_MY_TECHNICAL_SUPPORT_TICKETS } from '@/graphql/release-hub/support.queries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Plus, Ticket, MessageSquare, Clock, AlertCircle } from 'lucide-react';

export default function SupportPage() {
  const { data, loading, error, refetch } = useQuery(GET_MY_TECHNICAL_SUPPORT_TICKETS, {
    variables: { status: undefined },
  });

  const tickets = data?.myTechnicalSupportTickets || [];

  const openTickets = tickets.filter((t: any) => t.status === 'OPEN');
  const inProgressTickets = tickets.filter((t: any) => t.status === 'IN_PROGRESS');
  const resolvedTickets = tickets.filter((t: any) => ['RESOLVED', 'CLOSED'].includes(t.status));

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'IN_PROGRESS':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'WAITING_CUSTOMER':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      OPEN: 'Mới',
      IN_PROGRESS: 'Đang xử lý',
      WAITING_CUSTOMER: 'Chờ phản hồi',
      RESOLVED: 'Đã giải quyết',
      CLOSED: 'Đã đóng',
    };
    return statusMap[status] || status;
  };

  const getCategoryText = (category: string) => {
    const categoryMap: Record<string, string> = {
      TECHNICAL: 'Kỹ thuật',
      BILLING: 'Thanh toán',
      FEATURE_REQUEST: 'Yêu cầu tính năng',
      BUG_REPORT: 'Báo lỗi',
      GENERAL_INQUIRY: 'Thắc mắc chung',
      ACCOUNT: 'Tài khoản',
      OTHER: 'Khác',
    };
    return categoryMap[category] || category;
  };

  const TicketCard = ({ ticket }: { ticket: any }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className="font-mono text-xs">
            {ticket.ticketNumber}
          </Badge>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
              {ticket.priority === 'CRITICAL' ? 'Khẩn cấp' : 
               ticket.priority === 'HIGH' ? 'Cao' : 
               ticket.priority === 'MEDIUM' ? 'Trung bình' : 'Thấp'}
            </Badge>
            <Badge variant="outline" className={getStatusColor(ticket.status)}>
              {getStatusText(ticket.status)}
            </Badge>
          </div>
        </div>
        <CardTitle className="text-lg line-clamp-2">{ticket.subject}</CardTitle>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {ticket.description}
        </p>

        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            {getCategoryText(ticket.category)}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true, locale: vi })}
          </div>
          {ticket.lastResponseAt && (
            <div className="flex items-center gap-1 text-green-600">
              <MessageSquare className="h-3 w-3" />
              Phản hồi {formatDistanceToNow(new Date(ticket.lastResponseAt), { addSuffix: true, locale: vi })}
            </div>
          )}
        </div>
      </CardContent>

      <div className="px-6 pb-4">
        <Button asChild variant="ghost" className="w-full">
          <Link href={`/support/ticket/${ticket.id}`}>
            Xem chi tiết
          </Link>
        </Button>
      </div>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Trung Tâm Hỗ Trợ</h1>
          <p className="text-muted-foreground">
            Quản lý các ticket hỗ trợ của bạn
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/support/new">
            <Plus className="h-4 w-4 mr-2" />
            Tạo Ticket Mới
          </Link>
        </Button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-8 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
          <p className="text-red-500 mb-4">Có lỗi xảy ra khi tải danh sách ticket</p>
          <Button variant="outline" onClick={() => refetch()}>
            Thử lại
          </Button>
        </div>
      )}

      {/* Tickets Tabs */}
      {!loading && !error && (
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">
              Tất cả
              {tickets.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {tickets.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="open">
              Mới
              {openTickets.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {openTickets.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="in-progress">
              Đang xử lý
              {inProgressTickets.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {inProgressTickets.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="resolved">
              Đã giải quyết
              {resolvedTickets.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {resolvedTickets.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {tickets.length === 0 ? (
              <div className="text-center py-12">
                <Ticket className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">Bạn chưa có ticket nào</p>
                <Button asChild>
                  <Link href="/support/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Tạo Ticket Đầu Tiên
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tickets.map((ticket: any) => (
                  <TicketCard key={ticket.id} ticket={ticket} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="open">
            {openTickets.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Không có ticket mới</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {openTickets.map((ticket: any) => (
                  <TicketCard key={ticket.id} ticket={ticket} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="in-progress">
            {inProgressTickets.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Không có ticket đang xử lý</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {inProgressTickets.map((ticket: any) => (
                  <TicketCard key={ticket.id} ticket={ticket} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="resolved">
            {resolvedTickets.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Không có ticket đã giải quyết</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resolvedTickets.map((ticket: any) => (
                  <TicketCard key={ticket.id} ticket={ticket} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
