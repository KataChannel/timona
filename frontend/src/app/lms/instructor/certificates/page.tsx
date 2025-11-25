'use client';

import React from 'react';
import { Award, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function InstructorCertificatesPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Chứng chỉ
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Quản lý chứng chỉ cho khóa học
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Mẫu chứng chỉ</CardTitle>
            <CardDescription>
              Tạo và quản lý mẫu chứng chỉ cho học viên hoàn thành khóa học
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-12 sm:py-16">
              <div className="p-3 bg-muted rounded-lg mb-4">
                <Award className="w-8 h-8 sm:w-12 sm:h-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Chưa có mẫu chứng chỉ</h3>
              <p className="text-sm text-muted-foreground mb-6 text-center">
                Tạo mẫu chứng chỉ để tặng học viên khi hoàn thành khóa học
              </p>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Tạo mẫu chứng chỉ
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
