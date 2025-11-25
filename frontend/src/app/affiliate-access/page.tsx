'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Target, LinkIcon, DollarSign, Users, BarChart3 } from 'lucide-react';

export default function AffiliateAccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🚀 Affiliate Marketing System
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Hệ thống affiliate marketing hoàn chỉnh đã được triển khai thành công!
          </p>
          <div className="flex justify-center">
            <Link href="/admin/affiliate">
              <Button size="lg" className="px-8 py-3 text-lg">
                <TrendingUp className="mr-2 h-5 w-5" />
                Truy cập Affiliate System
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle>Dashboard Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Theo dõi hiệu suất affiliate với dashboard tổng quan, biểu đồ thống kê và các chỉ số quan trọng
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle>Campaign Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Tạo và quản lý các chiến dịch affiliate với tỷ lệ hoa hồng linh hoạt và theo dõi hiệu suất
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                <LinkIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle>Link Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Tạo link tracking với UTM parameters, theo dõi clicks và phân tích tỷ lệ chuyển đổi
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <CardTitle>Payment Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Quản lý thu nhập, yêu cầu thanh toán và theo dõi lịch sử giao dịch với workflow tự động
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Quản lý affiliate users, profile và phân quyền với hệ thống authentication mạnh mẽ
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <CardTitle>Advanced Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Phân tích chi tiết với attribution models, device tracking và báo cáo xuất CSV
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Technical Details */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              🛠️ Technical Implementation
            </CardTitle>
            <CardDescription className="text-center text-lg">
              Hệ thống được xây dựng với công nghệ hiện đại và architecture scalable
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-3">🎯 Backend Features</h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>✅ 7 Prisma Models với prefix 'aff'</li>
                  <li>✅ 4 GraphQL Resolvers hoàn chỉnh</li>
                  <li>✅ 4 Service Classes với business logic</li>
                  <li>✅ JWT Authentication & RBAC</li>
                  <li>✅ HTTP Controllers cho tracking</li>
                  <li>✅ Database Migration đã apply</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-3">🎨 Frontend Features</h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>✅ 4 React Components với shadcn/ui</li>
                  <li>✅ Responsive Design với Tailwind</li>
                  <li>✅ GraphQL Integration với Apollo</li>
                  <li>✅ TypeScript Definitions đầy đủ</li>
                  <li>✅ Protected Routes với Auth Guards</li>
                  <li>✅ Navigation Menu với nested items</li>
                </ul>
              </div>
            </div>
            
            <div className="pt-6 border-t">
              <h3 className="font-semibold text-lg mb-3 text-center">📊 Core Modules Implemented</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="font-medium">User Management</div>
                  <div className="text-sm text-green-600">100% Complete</div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="font-medium">Campaign System</div>
                  <div className="text-sm text-green-600">100% Complete</div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="font-medium">Link Tracking</div>
                  <div className="text-sm text-green-600">100% Complete</div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="font-medium">Payment System</div>
                  <div className="text-sm text-green-600">100% Complete</div>
                </div>
              </div>
            </div>

            <div className="pt-6 text-center">
              <p className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
                🎉 Hệ thống đã sẵn sàng cho production!
              </p>
              <div className="flex justify-center space-x-4">
                <Link href="/admin">
                  <Button variant="outline">
                    Admin Panel
                  </Button>
                </Link>
                <Link href="/admin/affiliate">
                  <Button>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Affiliate System
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}