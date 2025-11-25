'use client';

import React from 'react';
import { MessageSquare } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function InstructorDiscussionsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Thảo luận
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Quản lý câu hỏi và thảo luận từ học viên
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Danh sách thảo luận</CardTitle>
            <CardDescription>
              Xem và trả lời câu hỏi từ học viên
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-12 sm:py-16">
              <div className="p-3 bg-muted rounded-lg mb-4">
                <MessageSquare className="w-8 h-8 sm:w-12 sm:h-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Chưa có thảo luận</h3>
              <p className="text-sm text-muted-foreground text-center">
                Câu hỏi và thảo luận từ học viên sẽ xuất hiện ở đây
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
