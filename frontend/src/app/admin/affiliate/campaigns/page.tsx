'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CampaignManagement } from '@/components/affiliate';

export default function CampaignsPage() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Quản Lý Chiến Dịch
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Tạo, quản lý và giám sát các chiến dịch tiếp thị affiliate
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chiến Dịch Đang Hoạt Động</CardTitle>
          <CardDescription>
            Quản lý chiến dịch affiliate, thiết lập tỷ lệ hoa hồng và theo dõi hiệu suất
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CampaignManagement />
        </CardContent>
      </Card>
    </div>
  );
}