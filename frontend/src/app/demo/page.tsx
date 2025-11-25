/**
 * Demo Navigation Page
 */

'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Rocket,
  FileText, 
  Database, 
  Palette,
  Code,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';

export default function DemoPage() {
  const demos = [
    {
      id: 'simple-templates',
      title: 'Simple Template Demo',
      description: 'Test basic template compilation với variable substitution và loops',
      icon: FileText,
      color: 'bg-blue-500',
      path: '/demo/simple-templates',
      status: 'ready',
      features: [
        'Variable substitution: {{title}}',
        'Array loops: {{#each items}}',
        'Live HTML preview',
        'JSON variable input',
      ],
    },
    {
      id: 'dynamic-templates',
      title: 'Advanced Template System',
      description: 'Complete Dynamic Template Manager với database integration',
      icon: Database,
      color: 'bg-green-500',
      path: '/demo/dynamic-templates',
      status: 'ready',
      features: [
        'Product, Task, Category templates',
        'GraphQL database integration',
        'Template browser & editor',
        'Export/Import templates',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white">
                <Rocket className="h-8 w-8" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Dynamic Template System
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Complete template system với database integration, variable substitution, và visual page builder
            </p>
            <div className="flex items-center justify-center gap-4 mt-6">
              <Badge variant="secondary" className="px-4 py-2">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Production Ready
              </Badge>
              <Badge variant="outline" className="px-4 py-2">
                8 Components Created
              </Badge>
              <Badge variant="outline" className="px-4 py-2">
                120KB+ Code
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Cards */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {demos.map((demo) => (
            <Card key={demo.id} className="group hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-2 hover:border-blue-200">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 rounded-xl ${demo.color} text-white group-hover:scale-110 transition-transform`}>
                    <demo.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl">{demo.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge 
                        variant={demo.status === 'ready' ? 'secondary' : 'outline'}
                        className="text-xs"
                      >
                        {demo.status === 'ready' ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Ready
                          </>
                        ) : (
                          'Available'
                        )}
                      </Badge>
                    </div>
                  </div>
                </div>
                <CardDescription className="text-base">
                  {demo.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {/* Features */}
                  <div>
                    <h4 className="text-sm font-semibold mb-3 text-gray-700">Features:</h4>
                    <ul className="space-y-2">
                      {demo.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <div className="pt-4 border-t">
                    <Link href={demo.path}>
                      <Button 
                        className="w-full group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-purple-600 transition-all"
                        size="lg"
                      >
                        <span>Open Demo</span>
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-500 rounded-full">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng người dùng</p>
                <p className="text-2xl font-semibold text-gray-900">1,234</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-500 rounded-full">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Doanh thu</p>
                <p className="text-2xl font-semibold text-gray-900">₫56.7M</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-500 rounded-full">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Đơn hàng</p>
                <p className="text-2xl font-semibold text-gray-900">567</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-500 rounded-full">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sản phẩm</p>
                <p className="text-2xl font-semibold text-gray-900">89</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Hoạt động gần đây</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">Người dùng mới đăng ký</p>
                      <p className="text-xs text-gray-500">2 phút trước</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Thống kê nhanh</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tăng trưởng người dùng</span>
                  <span className="text-sm font-semibold text-green-600">+12%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tỷ lệ chuyển đổi</span>
                  <span className="text-sm font-semibold text-blue-600">3.2%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Đánh giá trung bình</span>
                  <span className="text-sm font-semibold text-yellow-600">4.5/5</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Thời gian phản hồi</span>
                  <span className="text-sm font-semibold text-gray-600">2.1s</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}