'use client';

import { useWebsiteSetting } from '@/hooks/useWebsiteSettings';
import { Construction, RefreshCw, Home, Mail } from 'lucide-react';
import Link from 'next/link';

export default function MaintenancePage() {
  const { value: offlineMessage, loading } = useWebsiteSetting('site.offline_message');
  const { value: siteName } = useWebsiteSetting('site.name');
  const { value: contactEmail } = useWebsiteSetting('contact.email');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
          {/* Icon */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-6">
                <Construction className="w-16 h-16 text-white" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Đang bảo trì
          </h1>

          {/* Message */}
          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
            {offlineMessage || 'Website đang trong quá trình bảo trì. Vui lòng quay lại sau.'}
          </p>

          {/* Progress Animation */}
          <div className="mb-8">
            <div className="flex justify-center items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center justify-center gap-2 mb-2">
                <RefreshCw className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Thời gian dự kiến</h3>
              </div>
              <p className="text-sm text-gray-600">Sớm nhất có thể</p>
            </div>

            {contactEmail && (
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Mail className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-900">Liên hệ</h3>
                </div>
                <a 
                  href={`mailto:${contactEmail}`}
                  className="text-sm text-purple-600 hover:text-purple-700 hover:underline"
                >
                  {contactEmail}
                </a>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => window.location.reload()}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
            >
              <RefreshCw className="w-5 h-5" />
              Tải lại trang
            </button>
            
            <Link
              href="/"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-900 px-8 py-3 rounded-lg font-medium transition-colors border-2 border-gray-200 hover:border-gray-300"
            >
              <Home className="w-5 h-5" />
              Về trang chủ
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>© 2025 {siteName || 'Website'}. Cảm ơn sự kiên nhẫn của bạn.</p>
        </div>
      </div>
    </div>
  );
}
