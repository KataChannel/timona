'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LinkManagement } from '@/components/affiliate';

export default function LinksPage() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Quản Lý Links
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Tạo, tùy chỉnh và theo dõi các links affiliate và hiệu suất
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Links Affiliate</CardTitle>
          <CardDescription>
            Tạo links theo dõi, giám sát lượt click và phân tích tỷ lệ chuyển đổi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LinkManagement />
        </CardContent>
      </Card>
    </div>
  );
}