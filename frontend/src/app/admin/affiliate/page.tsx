'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AffiliateDashboard,
  CampaignManagement,
  LinkManagement,
  PaymentManagement 
} from '@/components/affiliate';

export default function AffiliatePage() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Tiếp Thị Affiliate
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Quản lý chương trình affiliate, chiến dịch và theo dõi hiệu suất
        </p>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Bảng Điều Khiển</TabsTrigger>
          <TabsTrigger value="campaigns">Chiến Dịch</TabsTrigger>
          <TabsTrigger value="links">Links</TabsTrigger>
          <TabsTrigger value="payments">Thanh Toán</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Bảng Điều Khiển Affiliate</CardTitle>
              <CardDescription>
                Tổng quan hiệu suất chương trình affiliate của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AffiliateDashboard />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="campaigns" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Quản Lý Chiến Dịch</CardTitle>
              <CardDescription>
                Tạo và quản lý các chiến dịch affiliate của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CampaignManagement />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="links" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Quản Lý Links</CardTitle>
              <CardDescription>
                Tạo và theo dõi các links affiliate của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LinkManagement />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payments" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Quản Lý Thanh Toán</CardTitle>
              <CardDescription>
                Theo dõi thu nhập và quản lý yêu cầu thanh toán
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentManagement />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}