'use client';

import React from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_TECHNICAL_SUPPORT_TICKET } from '@/graphql/release-hub/support.queries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function NewTicketPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = React.useState({
    subject: '',
    description: '',
    category: 'TECHNICAL',
    priority: 'MEDIUM',
    customerEmail: '',
    customerName: '',
    customerPhone: '',
    relatedUrl: '',
    environment: '',
    browserInfo: '',
    osInfo: '',
    deviceInfo: '',
    errorLogs: '',
  });

  const [createTicket, { loading }] = useMutation(CREATE_TECHNICAL_SUPPORT_TICKET, {
    onCompleted: (data) => {
      toast({
        type: 'success',
        title: 'Ticket đã được tạo!',
        description: `Mã ticket: ${data.createTechnicalSupportTicket.ticketNumber}`,
      });
      router.push(`/support/ticket/${data.createTechnicalSupportTicket.id}`);
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

  React.useEffect(() => {
    // Auto-detect environment info
    const detectEnvironment = () => {
      const ua = navigator.userAgent;
      const browser = /Firefox/.test(ua) ? 'Firefox' :
                      /Chrome/.test(ua) ? 'Chrome' :
                      /Safari/.test(ua) ? 'Safari' :
                      /Edge/.test(ua) ? 'Edge' : 'Unknown';
      
      const os = /Windows/.test(ua) ? 'Windows' :
                 /Mac/.test(ua) ? 'MacOS' :
                 /Linux/.test(ua) ? 'Linux' :
                 /Android/.test(ua) ? 'Android' :
                 /iOS/.test(ua) ? 'iOS' : 'Unknown';

      const isMobile = /Mobile|Android|iPhone/.test(ua);
      const device = isMobile ? 'Mobile' : 'Desktop';

      setFormData(prev => ({
        ...prev,
        environment: window.location.hostname,
        browserInfo: `${browser} - ${ua}`,
        osInfo: os,
        deviceInfo: device,
      }));
    };

    detectEnvironment();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.subject || !formData.description) {
      toast({
        type: 'error',
        title: 'Lỗi',
        description: 'Vui lòng điền đầy đủ thông tin bắt buộc',
        variant: 'destructive',
      });
      return;
    }

    await createTicket({
      variables: {
        input: {
          subject: formData.subject,
          description: formData.description,
          category: formData.category,
          priority: formData.priority,
          customerEmail: formData.customerEmail || undefined,
          customerName: formData.customerName || undefined,
          customerPhone: formData.customerPhone || undefined,
          relatedUrl: formData.relatedUrl || undefined,
          environment: formData.environment || undefined,
          browserInfo: formData.browserInfo || undefined,
          osInfo: formData.osInfo || undefined,
          deviceInfo: formData.deviceInfo || undefined,
          errorLogs: formData.errorLogs || undefined,
        },
      },
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Back Button */}
      <Button asChild variant="ghost" className="mb-6">
        <Link href="/support">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Tạo Ticket Hỗ Trợ Mới</CardTitle>
          <CardDescription>
            Vui lòng mô tả chi tiết vấn đề của bạn để chúng tôi có thể hỗ trợ tốt nhất
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="font-semibold">Thông tin liên hệ</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Họ tên</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="Nguyễn Văn A"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Email</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerPhone">Số điện thoại</Label>
                <Input
                  id="customerPhone"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  placeholder="0123456789"
                />
              </div>
            </div>

            {/* Ticket Info */}
            <div className="space-y-4">
              <h3 className="font-semibold">Thông tin vấn đề</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Danh mục <span className="text-red-500">*</span></Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TECHNICAL">Kỹ thuật</SelectItem>
                      <SelectItem value="BILLING">Thanh toán</SelectItem>
                      <SelectItem value="FEATURE_REQUEST">Yêu cầu tính năng</SelectItem>
                      <SelectItem value="BUG_REPORT">Báo lỗi</SelectItem>
                      <SelectItem value="GENERAL_INQUIRY">Thắc mắc chung</SelectItem>
                      <SelectItem value="ACCOUNT">Tài khoản</SelectItem>
                      <SelectItem value="OTHER">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Độ ưu tiên <span className="text-red-500">*</span></Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Thấp</SelectItem>
                      <SelectItem value="MEDIUM">Trung bình</SelectItem>
                      <SelectItem value="HIGH">Cao</SelectItem>
                      <SelectItem value="CRITICAL">Khẩn cấp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Tiêu đề <span className="text-red-500">*</span></Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Mô tả ngắn gọn vấn đề"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô tả chi tiết <span className="text-red-500">*</span></Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải..."
                  rows={6}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="relatedUrl">URL liên quan (nếu có)</Label>
                <Input
                  id="relatedUrl"
                  value={formData.relatedUrl}
                  onChange={(e) => setFormData({ ...formData, relatedUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="errorLogs">Log lỗi (nếu có)</Label>
                <Textarea
                  id="errorLogs"
                  value={formData.errorLogs}
                  onChange={(e) => setFormData({ ...formData, errorLogs: e.target.value })}
                  placeholder="Paste log lỗi hoặc thông báo lỗi tại đây..."
                  rows={4}
                />
              </div>
            </div>

            {/* Environment Info (Auto-detected) */}
            <div className="space-y-4">
              <h3 className="font-semibold">Thông tin môi trường (tự động)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Hệ điều hành</Label>
                  <p className="text-sm">{formData.osInfo}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Thiết bị</Label>
                  <p className="text-sm">{formData.deviceInfo}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Môi trường</Label>
                  <p className="text-sm">{formData.environment}</p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.back()}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Tạo Ticket
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
