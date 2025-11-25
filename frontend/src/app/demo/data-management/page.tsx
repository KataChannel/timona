'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataImportComponent } from '@/components/DataImport';
import { ImageUploadComponent } from '@/components/ImageUpload';
import { FileSpreadsheet, Image, Database } from 'lucide-react';

export default function DataManagementPage() {
  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Quản Lý Dữ Liệu</h1>
        <p className="text-muted-foreground">
          Import/Export dữ liệu với <strong>Drag & Drop Mapping</strong> - Powered by Dynamic GraphQL
        </p>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="import" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="import" className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Data Import/Export
          </TabsTrigger>
          <TabsTrigger value="image" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Image Upload
          </TabsTrigger>
        </TabsList>

        {/* Data Import/Export Tab */}
        <TabsContent value="import" className="space-y-6">
          <Card className="border-primary/20">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Import & Export Dữ Liệu
              </CardTitle>
              <CardDescription>
                Copy dữ liệu từ Excel, Text, JSON → Preview → <strong>Drag-Drop Mapping</strong> → Import vào Database
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <DataImportComponent
                modelName="product"
                onImportComplete={(result) => {
                  console.log('Import completed:', result);
                }}
              />
            </CardContent>
          </Card>

          {/* Features Info */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🎯 Drag & Drop</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Kéo thả trường dữ liệu giữa source và database. Trực quan, dễ dùng, nhanh chóng!
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🤖 Auto Mapping</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                AI tự động gợi ý mapping dựa trên tên trường. Tiết kiệm 80% thời gian!
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">✅ Real-time Validate</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Kiểm tra required fields, validation errors ngay lập tức khi mapping
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Image Upload Tab */}
        <TabsContent value="image" className="space-y-6">
          <Card className="border-primary/20">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Upload & Edit Hình Ảnh
              </CardTitle>
              <CardDescription>
                Copy hình ảnh → Edit → Upload MinIO → Mapping → Lưu vào Database
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ImageUploadComponent
                modelName="product"
                recordId="1"
                imageField="imageUrl"
                onUploadComplete={(result) => {
                  console.log('Upload completed:', result);
                }}
              />
            </CardContent>
          </Card>

          {/* Image Features Info */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📸 Multi Source</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Upload từ file, paste clipboard, hoặc copy từ URL
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">✂️ Edit Tools</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Resize, rotate, flip, crop, blur và nhiều công cụ khác
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">☁️ MinIO Storage</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Upload lên MinIO object storage an toàn và hiệu quả
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🔗 Auto Mapping</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Tự động map URL hình ảnh vào record trong database
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Documentation Card */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle>📚 Hướng Dẫn Sử Dụng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <h3 className="font-semibold mb-2">Import Dữ Liệu với Drag-Drop Mapping:</h3>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Chọn Model/Bảng dữ liệu cần import (ví dụ: product, category, post...)</li>
              <li>Copy dữ liệu từ Excel/Text/JSON và paste vào ô nhập liệu</li>
              <li>Click &quot;Preview Dữ Liệu&quot; để xem trước và load database schema</li>
              <li>
                <strong>Drag & Drop Mapping:</strong>
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                  <li>Hệ thống tự động suggest mapping (AI-powered)</li>
                  <li>Kéo field từ bên TRÁI (dữ liệu nguồn)</li>
                  <li>Thả vào field tương ứng bên PHẢI (database)</li>
                  <li>Màu cam = Required fields phải map</li>
                  <li>Màu xanh lá = Fields đã map thành công</li>
                  <li>Thả vào vùng ĐỎ để xóa mapping</li>
                </ul>
              </li>
              <li>Kiểm tra stats: Nguồn/Đã map/Bắt buộc/Status</li>
              <li>Click &quot;Import&quot; khi validation ✅ hoàn tất</li>
            </ol>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Upload Hình Ảnh:</h3>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Click để chọn file hoặc paste hình ảnh (Ctrl+V)</li>
              <li>Hoặc nhập URL để copy hình ảnh từ internet</li>
              <li>Sử dụng các công cụ edit để chỉnh sửa hình ảnh</li>
              <li>Click "Apply Edits" để áp dụng thay đổi</li>
              <li>Click "Upload lên MinIO" để hoàn tất</li>
            </ol>
          </div>

          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              💡 <strong>Tip:</strong> Tất cả tính năng sử dụng Dynamic GraphQL Engine + Schema Inspector.
              Database schema được load real-time từ Prisma DMMF. Drag-drop mapping với @dnd-kit.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
