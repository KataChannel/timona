'use client';

import React from 'react';
import { Users, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function InstructorStudentsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Học viên
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Quản lý học viên trong các khóa học của bạn
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Card>
          <CardHeader className="border-b space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Danh sách học viên</CardTitle>
                <CardDescription>
                  Xem và quản lý học viên đã ghi danh
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm học viên..."
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-12 sm:py-16">
              <div className="p-3 bg-muted rounded-lg mb-4">
                <Users className="w-8 h-8 sm:w-12 sm:h-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Chưa có học viên</h3>
              <p className="text-sm text-muted-foreground text-center">
                Học viên sẽ xuất hiện ở đây khi họ ghi danh vào khóa học của bạn
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
