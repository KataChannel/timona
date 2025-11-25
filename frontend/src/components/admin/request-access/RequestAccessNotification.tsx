/**
 * RequestAccessNotification Component
 * 
 * Display a notification for users without admin access requesting permission
 * Shows admin contact information and instructions from website settings
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Mail, Phone, FileText, Home, ArrowRight } from 'lucide-react';
import { useWebsiteSettingsMap } from '@/hooks/useWebsiteSettings';

interface RequestAccessNotificationProps {
  userRole?: string;
  userName?: string;
}

export function RequestAccessNotification({ 
  userRole = 'User',
  userName = 'User'
}: RequestAccessNotificationProps) {
  const router = useRouter();
  const { settings, loading } = useWebsiteSettingsMap();

  // Get contact info from CONTACT category in website settings
  const contactEmail = settings['contact.email'] || settings['contact_email'] || 'admin@example.com';
  const contactPhone = settings['contact.phone'] || settings['contact_phone'] || '+84 123 456 789';
  const contactPhoneDisplay = settings['contact.phone_display'] || settings['contact_phone_display'] || contactPhone;
  const companyName = settings['contact.company_name'] || settings['site_name'] || 'Công ty';
  const companyAddress = settings['contact.address'] || settings['contact_address'] || '';
  const siteName = settings['site.name'] || settings['site_name'] || companyName;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-4 md:p-6 flex items-center justify-center">
      <div className="w-full max-w-3xl">
        {/* Main Card */}
        <Card className="border-2 border-amber-200 shadow-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-100 border-b-2 border-amber-200">
            <div className="flex items-start gap-3 mb-2">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-amber-100 rounded-full flex items-center justify-center">
                  <ShieldAlert className="w-6 h-6 md:w-7 md:h-7 text-amber-600" />
                </div>
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl md:text-2xl text-amber-900 mb-1">
                  Truy cập bị hạn chế
                </CardTitle>
                <CardDescription className="text-amber-800 text-sm md:text-base">
                  Bạn không có quyền truy cập vào khu vực quản trị này
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 md:p-6 lg:p-8">
            {/* Current Role Info */}
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
              <p className="text-sm font-semibold text-gray-700 mb-3">Thông tin tài khoản hiện tại</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-gray-600 text-xs">Người dùng</p>
                    <p className="font-semibold text-gray-900">{userName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <div>
                    <p className="text-gray-600 text-xs">Quyền hạn</p>
                    <p className="font-semibold text-amber-600">{userRole}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="mb-6">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-blue-600 rounded"></div>
                Làm cách nào để yêu cầu quyền truy cập?
              </h3>
              
              <div className="space-y-3">
                {/* Option 1: Email */}
                <div className="group flex gap-3 md:gap-4 p-4 bg-white rounded-xl border-2 border-gray-100 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Mail className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                      Gửi email yêu cầu
                      <ArrowRight className="w-4 h-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Liên hệ với nhóm quản trị qua email để yêu cầu quyền truy cập
                    </p>
                    <a 
                      href={`mailto:${contactEmail}?subject=Yêu cầu quyền truy cập quản trị - ${siteName}&body=Xin chào,%0D%0A%0D%0ATôi là ${userName} (${userRole})%0D%0ATôi muốn yêu cầu quyền truy cập vào khu vực quản trị.%0D%0A%0D%0ALý do:%0D%0A[Vui lòng mô tả lý do cần quyền truy cập]%0D%0A%0D%0AXin cảm ơn!`}
                      className="text-sm font-semibold text-blue-600 hover:text-blue-700 underline break-all"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {contactEmail}
                    </a>
                  </div>
                </div>

                {/* Option 2: Phone */}
                <div className="group flex gap-3 md:gap-4 p-4 bg-white rounded-xl border-2 border-gray-100 hover:border-green-300 hover:shadow-md transition-all cursor-pointer">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Phone className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                      Gọi điện thoại
                      <ArrowRight className="w-4 h-4 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Liên hệ trực tiếp với đội hỗ trợ qua điện thoại
                    </p>
                    <a 
                      href={`tel:${contactPhone.replace(/\s/g, '').replace(/\./g, '')}`}
                      className="text-sm font-semibold text-green-600 hover:text-green-700 underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {contactPhoneDisplay}
                    </a>
                  </div>
                </div>

                {/* Option 3: Form */}
                <div className="group flex gap-3 md:gap-4 p-4 bg-white rounded-xl border-2 border-gray-100 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer"
                     onClick={() => router.push('/contact?type=admin-access')}>
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FileText className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                      Điền mẫu yêu cầu
                      <ArrowRight className="w-4 h-4 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Điền biểu mẫu yêu cầu quyền truy cập trực tuyến
                    </p>
                    <span className="text-sm font-semibold text-purple-600">
                      Mở biểu mẫu →
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Note */}
            <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl">
              <div className="flex gap-3">
                <div className="text-2xl">📌</div>
                <div>
                  <p className="text-sm text-amber-900 leading-relaxed">
                    <span className="font-bold">Lưu ý quan trọng:</span> Nhóm quản trị sẽ xem xét yêu cầu của bạn trong vòng <strong>1-2 ngày làm việc</strong>. 
                    Vui lòng cung cấp thông tin chi tiết và chính xác về lý do cần truy cập.
                  </p>
                </div>
              </div>
            </div>

            {/* Process Steps */}
            <div className="mb-6">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-purple-600 rounded"></div>
                Quy trình xét duyệt
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-md">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Gửi yêu cầu</p>
                    <p className="text-sm text-gray-600">Liên hệ với quản trị viên kèm lý do yêu cầu chi tiết</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-md">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Xem xét</p>
                    <p className="text-sm text-gray-600">Nhóm quản trị sẽ đánh giá yêu cầu của bạn</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-md">
                    3
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Cấp quyền</p>
                    <p className="text-sm text-gray-600">Nếu được phê duyệt, bạn sẽ nhận quyền quản trị qua email</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t-2 border-gray-200">
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                className="flex-1 h-12 border-2"
                size="lg"
              >
                <Home className="w-4 h-4 mr-2" />
                Quay về trang chủ
              </Button>
              <Button
                onClick={() => router.push('/dashboard')}
                className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md"
                size="lg"
              >
                Vào bảng điều khiển
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="mt-6 text-center space-y-3">
          {/* Company Info */}
          {companyName && (
            <div className="p-4 bg-white/80 backdrop-blur rounded-lg border border-gray-200 shadow-sm">
              <p className="font-semibold text-gray-900 mb-1">{companyName}</p>
              {companyAddress && (
                <p className="text-xs text-gray-600 mb-2">{companyAddress}</p>
              )}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs text-gray-600">
                <a 
                  href={`tel:${contactPhone.replace(/\s/g, '').replace(/\./g, '')}`}
                  className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                >
                  <Phone className="w-3 h-3" />
                  {contactPhoneDisplay}
                </a>
                <span className="hidden sm:inline text-gray-300">•</span>
                <a 
                  href={`mailto:${contactEmail}`}
                  className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                >
                  <Mail className="w-3 h-3" />
                  {contactEmail}
                </a>
              </div>
            </div>
          )}
          
          {/* Error Contact */}
          <p className="text-sm text-gray-600">
            Nếu bạn cho rằng đây là một lỗi, vui lòng{' '}
            <a 
              href={`mailto:${contactEmail}`}
              className="text-blue-600 hover:text-blue-700 underline font-semibold"
            >
              liên hệ với quản trị viên
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
