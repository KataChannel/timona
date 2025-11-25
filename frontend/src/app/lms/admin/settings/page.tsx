'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings,
  Bell,
  Mail,
  Lock,
  Globe,
  Palette,
  Database,
  Shield,
  Save,
  CheckCircle,
  AlertCircle,
  Upload,
  FileText,
  DollarSign,
  Award
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminSettingsPage() {
  const { toast } = useToast();
  
  // General Settings
  const [siteName, setSiteName] = useState('RauSachCore LMS');
  const [siteDescription, setSiteDescription] = useState('Nền tảng học trực tuyến hàng đầu');
  const [adminEmail, setAdminEmail] = useState('admin@rausachcore.com');
  const [language, setLanguage] = useState('vi');
  const [timezone, setTimezone] = useState('Asia/Ho_Chi_Minh');

  // Enrollment Settings
  const [autoEnrollment, setAutoEnrollment] = useState(false);
  const [requirePayment, setRequirePayment] = useState(true);
  const [allowGuestView, setAllowGuestView] = useState(false);
  const [maxEnrollments, setMaxEnrollments] = useState('100');

  // Certificate Settings
  const [enableCertificates, setEnableCertificates] = useState(true);
  const [certificatePrefix, setCertificatePrefix] = useState('RSC');
  const [requireCompletion, setRequireCompletion] = useState(true);
  const [minPassScore, setMinPassScore] = useState('80');

  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [enrollmentNotify, setEnrollmentNotify] = useState(true);
  const [completionNotify, setCompletionNotify] = useState(true);
  const [quizNotify, setQuizNotify] = useState(false);

  // Payment Settings
  const [paymentGateway, setPaymentGateway] = useState('vnpay');
  const [currency, setCurrency] = useState('VND');
  const [taxRate, setTaxRate] = useState('10');

  const handleSave = (section: string) => {
    toast({
      title: "Đã lưu thành công",
      description: `Cài đặt ${section} đã được cập nhật`,
      type: "success",
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:gap-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Cài đặt hệ thống</h1>
        <p className="text-sm sm:text-base text-gray-600">Quản lý cấu hình và tùy chọn LMS</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="w-full grid grid-cols-3 sm:grid-cols-6 gap-1">
            <TabsTrigger value="general" className="gap-1 text-xs sm:text-sm px-2 sm:px-3">
              <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Chung</span>
            </TabsTrigger>
            <TabsTrigger value="enrollment" className="gap-1 text-xs sm:text-sm px-2 sm:px-3">
              <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Ghi danh</span>
            </TabsTrigger>
            <TabsTrigger value="certificate" className="gap-1 text-xs sm:text-sm px-2 sm:px-3">
              <Award className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Chứng chỉ</span>
              <span className="xs:hidden">CC</span>
            </TabsTrigger>
            <TabsTrigger value="notification" className="gap-1 text-xs sm:text-sm px-2 sm:px-3">
              <Bell className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Thông báo</span>
              <span className="xs:hidden">TB</span>
            </TabsTrigger>
            <TabsTrigger value="payment" className="gap-1 text-xs sm:text-sm px-2 sm:px-3">
              <DollarSign className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Thanh toán</span>
              <span className="xs:hidden">TT</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-1 text-xs sm:text-sm px-2 sm:px-3">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Bảo mật</span>
              <span className="xs:hidden">BM</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Globe className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span>Thông tin chung</span>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Cấu hình thông tin cơ bản của hệ thống</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
              <div className="space-y-2">
                <Label htmlFor="siteName" className="text-sm">Tên website</Label>
                <Input
                  id="siteName"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="Nhập tên website"
                  className="h-10 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteDescription" className="text-sm">Mô tả</Label>
                <Textarea
                  id="siteDescription"
                  value={siteDescription}
                  onChange={(e) => setSiteDescription(e.target.value)}
                  placeholder="Nhập mô tả website"
                  rows={3}
                  className="text-sm resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminEmail" className="text-sm">Email quản trị</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="h-10 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language" className="text-sm">Ngôn ngữ</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger id="language" className="h-10 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vi">Tiếng Việt</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ja">日本語</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone" className="text-sm">Múi giờ</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger id="timezone" className="h-10 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Ho_Chi_Minh">Việt Nam (GMT+7)</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo (GMT+9)</SelectItem>
                      <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={() => handleSave('chung')} className="gap-2 w-full sm:w-auto" size="sm">
                <Save className="w-4 h-4" />
                Lưu thay đổi
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enrollment Settings */}
        <TabsContent value="enrollment" className="space-y-4">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span>Cài đặt ghi danh</span>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Quản lý quy trình ghi danh khóa học</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
              <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg gap-3">
                <div className="space-y-0.5 flex-1 min-w-0">
                  <Label className="text-sm">Tự động ghi danh</Label>
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">Cho phép học viên tự ghi danh khóa học</p>
                </div>
                <Switch checked={autoEnrollment} onCheckedChange={setAutoEnrollment} />
              </div>

              <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg gap-3">
                <div className="space-y-0.5 flex-1 min-w-0">
                  <Label className="text-sm">Yêu cầu thanh toán</Label>
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">Bắt buộc thanh toán trước khi ghi danh</p>
                </div>
                <Switch checked={requirePayment} onCheckedChange={setRequirePayment} />
              </div>

              <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg gap-3">
                <div className="space-y-0.5 flex-1 min-w-0">
                  <Label className="text-sm">Cho phép khách xem</Label>
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">Khách có thể xem nội dung miễn phí</p>
                </div>
                <Switch checked={allowGuestView} onCheckedChange={setAllowGuestView} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxEnrollments" className="text-sm">Số lượng ghi danh tối đa/khóa</Label>
                <Input
                  id="maxEnrollments"
                  type="number"
                  value={maxEnrollments}
                  onChange={(e) => setMaxEnrollments(e.target.value)}
                  placeholder="100"
                  className="h-10 text-sm"
                />
                <p className="text-xs text-gray-600">Để trống = không giới hạn</p>
              </div>

              <Button onClick={() => handleSave('ghi danh')} className="gap-2 w-full sm:w-auto" size="sm">
                <Save className="w-4 h-4" />
                Lưu thay đổi
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Certificate Settings */}
        <TabsContent value="certificate" className="space-y-4">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Award className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span>Cài đặt chứng chỉ</span>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Quản lý chứng chỉ hoàn thành khóa học</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
              <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg gap-3">
                <div className="space-y-0.5 flex-1 min-w-0">
                  <Label className="text-sm">Kích hoạt chứng chỉ</Label>
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">Cấp chứng chỉ khi hoàn thành khóa học</p>
                </div>
                <Switch checked={enableCertificates} onCheckedChange={setEnableCertificates} />
              </div>

              <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg gap-3">
                <div className="space-y-0.5 flex-1 min-w-0">
                  <Label className="text-sm">Yêu cầu hoàn thành 100%</Label>
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">Phải hoàn thành toàn bộ khóa học</p>
                </div>
                <Switch checked={requireCompletion} onCheckedChange={setRequireCompletion} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="certificatePrefix" className="text-sm">Tiền tố mã chứng chỉ</Label>
                <Input
                  id="certificatePrefix"
                  value={certificatePrefix}
                  onChange={(e) => setCertificatePrefix(e.target.value)}
                  placeholder="RSC"
                  maxLength={5}
                  className="h-10 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minPassScore" className="text-sm">Điểm tối thiểu để đạt (%)</Label>
                <Input
                  id="minPassScore"
                  type="number"
                  value={minPassScore}
                  onChange={(e) => setMinPassScore(e.target.value)}
                  min="0"
                  max="100"
                  className="h-10 text-sm"
                />
              </div>

              <Button onClick={() => handleSave('chứng chỉ')} className="gap-2 w-full sm:w-auto" size="sm">
                <Save className="w-4 h-4" />
                Lưu thay đổi
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notification" className="space-y-4">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span>Cài đặt thông báo</span>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Quản lý thông báo email và hệ thống</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
              <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg gap-3">
                <div className="space-y-0.5 flex-1 min-w-0">
                  <Label className="text-sm">Email thông báo</Label>
                  <p className="text-xs sm:text-sm text-gray-600">Kích hoạt gửi email tự động</p>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>

              <div className="pl-3 sm:pl-4 space-y-2 sm:space-y-3 border-l-2 border-gray-200">
                <div className="flex items-center justify-between p-2 sm:p-3 bg-white rounded-lg border gap-2">
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <Label className="text-xs sm:text-sm">Thông báo ghi danh mới</Label>
                    <p className="text-xs text-gray-600 line-clamp-1">Email khi có ghi danh mới</p>
                  </div>
                  <Switch 
                    checked={enrollmentNotify} 
                    onCheckedChange={setEnrollmentNotify}
                    disabled={!emailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between p-2 sm:p-3 bg-white rounded-lg border gap-2">
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <Label className="text-xs sm:text-sm">Thông báo hoàn thành</Label>
                    <p className="text-xs text-gray-600 line-clamp-1">Email khi hoàn thành khóa học</p>
                  </div>
                  <Switch 
                    checked={completionNotify} 
                    onCheckedChange={setCompletionNotify}
                    disabled={!emailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between p-2 sm:p-3 bg-white rounded-lg border gap-2">
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <Label className="text-xs sm:text-sm">Thông báo kết quả quiz</Label>
                    <p className="text-xs text-gray-600 line-clamp-1">Email kết quả bài kiểm tra</p>
                  </div>
                  <Switch 
                    checked={quizNotify} 
                    onCheckedChange={setQuizNotify}
                    disabled={!emailNotifications}
                  />
                </div>
              </div>

              <Button onClick={() => handleSave('thông báo')} className="gap-2 w-full sm:w-auto" size="sm">
                <Save className="w-4 h-4" />
                Lưu thay đổi
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span>Cài đặt thanh toán</span>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Quản lý cổng thanh toán và tiền tệ</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
              <div className="space-y-2">
                <Label htmlFor="paymentGateway" className="text-sm">Cổng thanh toán</Label>
                <Select value={paymentGateway} onValueChange={setPaymentGateway}>
                  <SelectTrigger id="paymentGateway" className="h-10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vnpay">VNPay</SelectItem>
                    <SelectItem value="momo">MoMo</SelectItem>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency" className="text-sm">Đơn vị tiền tệ</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger id="currency" className="h-10 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VND">VND (₫)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxRate" className="text-sm">Thuế (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                    min="0"
                    max="100"
                    className="h-10 text-sm"
                  />
                </div>
              </div>

              <div className="p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-blue-900">Lưu ý</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Cần cấu hình API key của cổng thanh toán trong file .env
                    </p>
                  </div>
                </div>
              </div>

              <Button onClick={() => handleSave('thanh toán')} className="gap-2 w-full sm:w-auto" size="sm">
                <Save className="w-4 h-4" />
                Lưu thay đổi
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span>Cài đặt bảo mật</span>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Quản lý bảo mật và quyền truy cập</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <Label className="text-sm sm:text-base">Đổi mật khẩu quản trị</Label>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1 mb-3">Cập nhật mật khẩu tài khoản admin</p>
                  <Button variant="outline" className="gap-2 w-full sm:w-auto" size="sm">
                    <Lock className="w-4 h-4" />
                    Đổi mật khẩu
                  </Button>
                </div>

                <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <Label className="text-sm sm:text-base">Sao lưu dữ liệu</Label>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1 mb-3">Tạo bản sao lưu toàn bộ hệ thống</p>
                  <Button variant="outline" className="gap-2 w-full sm:w-auto" size="sm">
                    <Database className="w-4 h-4" />
                    Sao lưu ngay
                  </Button>
                </div>

                <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <Label className="text-sm sm:text-base">Nhật ký hoạt động</Label>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1 mb-3">Xem lịch sử thay đổi hệ thống</p>
                  <Button variant="outline" className="gap-2 w-full sm:w-auto" size="sm">
                    <FileText className="w-4 h-4" />
                    Xem nhật ký
                  </Button>
                </div>
              </div>

              <div className="p-3 sm:p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-red-900">Cảnh báo bảo mật</p>
                    <p className="text-xs text-red-700 mt-1">
                      Thường xuyên cập nhật mật khẩu và sao lưu dữ liệu để đảm bảo an toàn
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
