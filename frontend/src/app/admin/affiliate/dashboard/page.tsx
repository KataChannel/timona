'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AffiliateDashboard } from '@/components/affiliate';

export default function AffiliateDashboardPage() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Bảng Điều Khiển Affiliate
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Tổng quan hiệu suất chương trình affiliate và các chỉ số quan trọng
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tổng Quan Hiệu Suất</CardTitle>
          <CardDescription>
            Theo dõi các chỉ số và chỉ báo hiệu suất chương trình affiliate
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AffiliateDashboard />
        </CardContent>
      </Card>
    </div>
  );
}