'use client';

import React from 'react';
import { ClipboardList, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function InstructorQuizzesPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Bài kiểm tra
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Quản lý bài kiểm tra và đánh giá
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Danh sách bài kiểm tra</CardTitle>
            <CardDescription>
              Tạo và quản lý bài kiểm tra cho khóa học
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-12 sm:py-16">
              <div className="p-3 bg-muted rounded-lg mb-4">
                <ClipboardList className="w-8 h-8 sm:w-12 sm:h-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Chưa có bài kiểm tra</h3>
              <p className="text-sm text-muted-foreground mb-6 text-center">
                Tạo bài kiểm tra để đánh giá kiến thức học viên
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
