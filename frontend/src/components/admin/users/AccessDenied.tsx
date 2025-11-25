/**
 * AccessDenied Component
 * 
 * Display access denied message for unauthorized users
 * Shows options to contact admin for permission
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Mail, ArrowLeft } from 'lucide-react';

interface AccessDeniedProps {
  userRole?: string;
  requiredRole?: string;
}

export function AccessDenied({ 
  userRole = 'Unknown', 
  requiredRole = 'ADMIN' 
}: AccessDeniedProps) {
  const router = useRouter();

  return (
    <div className="container mx-auto py-12 px-4">
      <Card className="max-w-md mx-auto border-2 border-yellow-200">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <ShieldAlert className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-yellow-900 mb-2">Truy cập bị hạn chế</h3>
            <p className="text-gray-600 mb-4">
              Bạn cần quyền <strong>{requiredRole}</strong> để truy cập trang này.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Quyền hiện tại: <strong className="text-blue-600">{userRole}</strong>
            </p>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-600 font-medium mb-3">
                📌 Liên hệ quản trị viên để yêu cầu quyền truy cập:
              </p>
              <a
                href="mailto:admin@rausachcore.dev?subject=Yêu cầu quyền truy cập quản trị"
                className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                <Mail className="w-4 h-4" />
                Gửi email
              </a>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <Button 
                onClick={() => router.push('/request-access')}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Xem hướng dẫn yêu cầu
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
