'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PaymentManagement } from '@/components/affiliate';

export default function PaymentsPage() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Quản Lý Thanh Toán
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Theo dõi thu nhập, quản lý yêu cầu thanh toán và xem lịch sử thanh toán
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thu Nhập & Thanh Toán</CardTitle>
          <CardDescription>
            Giám sát thu nhập hoa hồng, yêu cầu thanh toán và quản lý phương thức thanh toán
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PaymentManagement />
        </CardContent>
      </Card>
    </div>
  );
}