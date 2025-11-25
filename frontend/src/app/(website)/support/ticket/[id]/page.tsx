'use client';

import { useQuery, useMutation } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  GET_TECHNICAL_SUPPORT_TICKET,
  CREATE_TECHNICAL_SUPPORT_MESSAGE,
  RESOLVE_TECHNICAL_SUPPORT_TICKET,
  RATE_TECHNICAL_SUPPORT_TICKET,
} from '@/graphql/release-hub/support.queries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Send,
  CheckCircle2,
  Clock,
  User,
  Mail,
  Phone,
  Star,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';

export default function SupportTicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [message, setMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');

  const { data, loading, error, refetch } = useQuery(GET_TECHNICAL_SUPPORT_TICKET, {
    variables: { id: params.id },
    skip: !params.id,
  });

  const [createMessage, { loading: sendingMessage }] = useMutation(
    CREATE_TECHNICAL_SUPPORT_MESSAGE,
    {
      onCompleted: () => {
        toast({
          type: 'success',
          title: 'Thành công',
          description: 'Tin nhắn đã được gửi',
        });
        setMessage('');
        setIsInternal(false);
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
    }
  );

  const [resolveTicket, { loading: resolving }] = useMutation(
    RESOLVE_TECHNICAL_SUPPORT_TICKET,
    {
      onCompleted: () => {
        toast({
          type: 'success',
          title: 'Thành công',
          description: 'Ticket đã được đánh dấu là đã giải quyết',
        });
        refetch();
        setShowRatingDialog(true);
      },
      onError: (error) => {
        toast({
          type: 'error',
          title: 'Lỗi',
          description: error.message,
          variant: 'destructive',
        });
      },
    }
  );

  const [rateTicket, { loading: submittingRating }] = useMutation(RATE_TECHNICAL_SUPPORT_TICKET, {
    onCompleted: () => {
      toast({
        type: 'success',
        title: 'Cảm ơn đánh giá của bạn',
        description: 'Đánh giá đã được ghi nhận',
      });
      setShowRatingDialog(false);
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

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [data?.technicalSupportTicket?.messages]);

  if (loading) {
    return (
      <div className="container max-w-7xl py-6 space-y-6">
        <div className="h-8 w-48 bg-gray-200 animate-pulse rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-64 bg-gray-200 animate-pulse rounded-lg" />
            <div className="h-96 bg-gray-200 animate-pulse rounded-lg" />
          </div>
          <div className="space-y-4">
            <div className="h-48 bg-gray-200 animate-pulse rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data?.technicalSupportTicket) {
    return (
      <div className="container max-w-7xl py-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <p className="text-lg font-semibold mb-2">Không tìm thấy ticket</p>
            <p className="text-gray-600 mb-4">Ticket không tồn tại hoặc đã bị xóa</p>
            <Button onClick={() => router.push('/support')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại danh sách
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const ticket = data.technicalSupportTicket;

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast({
        type: 'error',
        title: 'Lỗi',
        description: 'Vui lòng nhập nội dung tin nhắn',
        variant: 'destructive',
      });
      return;
    }

    await createMessage({
      variables: {
        input: {
          ticketId: params.id,
          message: message.trim(),
          isInternal,
        },
      },
    });
  };

  const handleResolve = async () => {
    await resolveTicket({
      variables: { id: params.id },
    });
  };

  const handleSubmitRating = async () => {
    if (rating === 0) {
      toast({
        type: 'error',
        title: 'Lỗi',
        description: 'Vui lòng chọn số sao đánh giá',
        variant: 'destructive',
      });
      return;
    }

    await rateTicket({
      variables: {
        input: {
          id: params.id,
          rating,
          comment: ratingComment.trim() || undefined,
        },
      },
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      OPEN: { variant: 'default', label: 'Mới' },
      IN_PROGRESS: { variant: 'secondary', label: 'Đang xử lý' },
      RESOLVED: { variant: 'outline', label: 'Đã giải quyết' },
      CLOSED: { variant: 'outline', label: 'Đã đóng' },
    };
    const config = variants[status] || variants.OPEN;
    return <Badge variant={config.variant}>{config.label}</Badge>;
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

  const canResolve = ticket.status === 'IN_PROGRESS' || ticket.status === 'OPEN';
  const canRate = ticket.status === 'RESOLVED' && !ticket.rating;

  return (
    <div className="container max-w-7xl py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.push('/support')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">{ticket.ticketNumber}</h1>
          </div>
          <p className="text-gray-600">{ticket.subject}</p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(ticket.status)}
          {getPriorityBadge(ticket.priority)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Info */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin ticket</CardTitle>
              <CardDescription>
                Tạo lúc {format(new Date(ticket.createdAt), 'PPp', { locale: vi })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-semibold">Phân loại</Label>
                <p className="text-sm">{getCategoryLabel(ticket.category)}</p>
              </div>
              <div>
                <Label className="text-sm font-semibold">Mô tả</Label>
                <p className="text-sm whitespace-pre-wrap">{ticket.description}</p>
              </div>
              {ticket.relatedUrl && (
                <div>
                  <Label className="text-sm font-semibold">URL liên quan</Label>
                  <a
                    href={ticket.relatedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {ticket.relatedUrl}
                  </a>
                </div>
              )}
              {ticket.errorLogs && (
                <div>
                  <Label className="text-sm font-semibold">Logs lỗi</Label>
                  <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                    {ticket.errorLogs}
                  </pre>
                </div>
              )}
              {ticket.environment && (
                <div>
                  <Label className="text-sm font-semibold">Môi trường</Label>
                  <div className="text-sm space-y-1">
                    {ticket.environment.browser && <p>Browser: {ticket.environment.browser}</p>}
                    {ticket.environment.os && <p>OS: {ticket.environment.os}</p>}
                    {ticket.environment.device && <p>Device: {ticket.environment.device}</p>}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Messages Timeline */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Lịch sử trao đổi
                </CardTitle>
                <Badge variant="outline">
                  {ticket.messages?.length || 0} tin nhắn
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {ticket.messages?.map((msg: any) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.isInternal ? 'bg-yellow-50 p-3 rounded-lg' : ''}`}
                  >
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">
                          {msg.sender?.name || 'Người dùng'}
                        </span>
                        {msg.isInternal && (
                          <Badge variant="outline" className="text-xs">
                            Nội bộ
                          </Badge>
                        )}
                        <span className="text-xs text-gray-500">
                          {format(new Date(msg.createdAt), 'PPp', { locale: vi })}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      {msg.attachments?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {msg.attachments.map((att: string, idx: number) => (
                            <a
                              key={idx}
                              href={att}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline"
                            >
                              Attachment {idx + 1}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Form */}
              <div className="mt-6 space-y-4 border-t pt-4">
                <Textarea
                  placeholder="Nhập tin nhắn của bạn..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="internal"
                      checked={isInternal}
                      onCheckedChange={(checked) => setIsInternal(checked as boolean)}
                    />
                    <Label htmlFor="internal" className="text-sm cursor-pointer">
                      Ghi chú nội bộ (không gửi cho khách hàng)
                    </Label>
                  </div>
                  <Button onClick={handleSendMessage} disabled={sendingMessage || !message.trim()}>
                    <Send className="h-4 w-4 mr-2" />
                    Gửi
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          {canResolve && (
            <Card>
              <CardContent className="pt-6">
                <Button onClick={handleResolve} disabled={resolving} className="w-full">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Đánh dấu đã giải quyết
                </Button>
              </CardContent>
            </Card>
          )}

          {canRate && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="text-center space-y-3">
                  <p className="font-semibold">Ticket của bạn đã được giải quyết</p>
                  <p className="text-sm text-gray-600">
                    Vui lòng đánh giá chất lượng hỗ trợ để chúng tôi cải thiện dịch vụ
                  </p>
                  <Button onClick={() => setShowRatingDialog(true)} variant="default">
                    <Star className="h-4 w-4 mr-2" />
                    Đánh giá ngay
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Thông tin khách hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{ticket.customerName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <a
                  href={`mailto:${ticket.customerEmail}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {ticket.customerEmail}
                </a>
              </div>
              {ticket.customerPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <a
                    href={`tel:${ticket.customerPhone}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {ticket.customerPhone}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assigned Agent */}
          {ticket.assignedAgent && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Người xử lý</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{ticket.assignedAgent.name}</p>
                    <p className="text-xs text-gray-600">{ticket.assignedAgent.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Thời gian</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-semibold">Tạo</p>
                  <p className="text-gray-600">
                    {format(new Date(ticket.createdAt), 'PPp', { locale: vi })}
                  </p>
                </div>
              </div>
              {ticket.firstResponseAt && (
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-semibold">Phản hồi đầu tiên</p>
                    <p className="text-gray-600">
                      {format(new Date(ticket.firstResponseAt), 'PPp', { locale: vi })}
                    </p>
                  </div>
                </div>
              )}
              {ticket.resolvedAt && (
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-semibold">Giải quyết</p>
                    <p className="text-gray-600">
                      {format(new Date(ticket.resolvedAt), 'PPp', { locale: vi })}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rating */}
          {ticket.rating && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="text-base">Đánh giá</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= ticket.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                {ticket.ratingComment && (
                  <p className="text-sm text-gray-700">{ticket.ratingComment}</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Rating Dialog */}
      <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Đánh giá chất lượng hỗ trợ</DialogTitle>
            <DialogDescription>
              Vui lòng cho chúng tôi biết mức độ hài lòng của bạn về dịch vụ hỗ trợ
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <div>
              <Label htmlFor="rating-comment">Nhận xét (tùy chọn)</Label>
              <Textarea
                id="rating-comment"
                placeholder="Chia sẻ trải nghiệm của bạn..."
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                rows={4}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRatingDialog(false)}>
              Để sau
            </Button>
            <Button onClick={handleSubmitRating} disabled={submittingRating || rating === 0}>
              Gửi đánh giá
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
