'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@apollo/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, ArrowLeft, Upload, Link as LinkIcon, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  CREATE_SOURCE_DOCUMENT,
  GET_SOURCE_DOCUMENT_CATEGORIES,
} from '@/graphql/lms/source-documents';

const DOCUMENT_TYPES = [
  { value: 'FILE', label: 'File (PDF, DOC, XLS...)', icon: '📄' },
  { value: 'VIDEO', label: 'Video (MP4, YouTube...)', icon: '🎥' },
  { value: 'TEXT', label: 'Text (Markdown, HTML)', icon: '📝' },
  { value: 'AUDIO', label: 'Audio (MP3, Podcast)', icon: '🎵' },
  { value: 'LINK', label: 'Link (External URL)', icon: '🔗' },
  { value: 'IMAGE', label: 'Image (PNG, JPG)', icon: '🖼️' },
];

const DOCUMENT_STATUSES = [
  { value: 'DRAFT', label: 'Nháp' },
  { value: 'PUBLISHED', label: 'Xuất bản' },
  { value: 'ARCHIVED', label: 'Lưu trữ' },
];

export default function NewSourceDocumentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'FILE',
    status: 'DRAFT',
    url: '',
    content: '',
    fileName: '',
    thumbnailUrl: '',
    categoryId: '',
    tags: '',
  });

  // Get categories
  const { data: categoriesData } = useQuery(GET_SOURCE_DOCUMENT_CATEGORIES);
  const categories = categoriesData?.sourceDocumentCategories || [];

  // Create mutation
  const [createDocument, { loading }] = useMutation(CREATE_SOURCE_DOCUMENT, {
    refetchQueries: ['GetSourceDocuments'],
    awaitRefetchQueries: true,
    onCompleted: (data) => {
      toast({
        type: 'success',
        title: 'Thành công',
        description: 'Đã tạo tài liệu nguồn mới',
      });
      router.push(`/lms/admin/source-documents/${data.createSourceDocument.id}`);
    },
    onError: (error) => {
      toast({
        type: 'error',
        title: 'Lỗi',
        description: error.message,
      });
    },
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (!formData.title.trim()) {
      toast({
        type: 'error',
        title: 'Lỗi',
        description: 'Vui lòng nhập tiêu đề',
      });
      return;
    }

    // Prepare input - only include fields with values
    const input: any = {
      title: formData.title,
      type: formData.type,
      status: formData.status,
    };

    // Add optional fields only if they have values
    if (formData.description?.trim()) input.description = formData.description;
    if (formData.url?.trim()) input.url = formData.url;
    if (formData.content?.trim()) input.content = formData.content;
    if (formData.fileName?.trim()) input.fileName = formData.fileName;
    if (formData.thumbnailUrl?.trim()) input.thumbnailUrl = formData.thumbnailUrl;
    if (formData.categoryId) input.categoryId = formData.categoryId;
    if (formData.tags?.trim()) {
      input.tags = formData.tags.split(',').map((t) => t.trim()).filter(Boolean);
    }

    // User ID is automatically retrieved from JWT token by backend
    createDocument({
      variables: {
        input,
      },
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Tạo tài liệu nguồn mới
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Thêm file, video, hoặc nội dung text để sử dụng trong khóa học
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
            <CardDescription>
              Điền thông tin về tài liệu nguồn
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Tiêu đề <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Nhập tiêu đề tài liệu..."
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Mô tả chi tiết về tài liệu..."
                rows={3}
              />
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label htmlFor="type">
                Loại tài liệu <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            {categories.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="category">Danh mục</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => handleChange('categoryId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (phân cách bởi dấu phẩy)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => handleChange('tags', e.target.value)}
                placeholder="react, javascript, tutorial"
              />
              <p className="text-xs text-gray-500">
                Ví dụ: react, javascript, tutorial
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Content Section */}
        <Card>
          <CardHeader>
            <CardTitle>Nội dung</CardTitle>
            <CardDescription>
              {formData.type === 'FILE' && 'Upload file hoặc nhập URL'}
              {formData.type === 'VIDEO' && 'Nhập URL video (YouTube, Vimeo, MP4...)'}
              {formData.type === 'TEXT' && 'Nhập nội dung text/markdown'}
              {formData.type === 'AUDIO' && 'Upload audio hoặc nhập URL'}
              {formData.type === 'LINK' && 'Nhập URL liên kết'}
              {formData.type === 'IMAGE' && 'Upload ảnh hoặc nhập URL'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* URL (for FILE, VIDEO, AUDIO, LINK, IMAGE) */}
            {formData.type !== 'TEXT' && (
              <div className="space-y-2">
                <Label htmlFor="url">
                  <LinkIcon className="w-4 h-4 inline mr-1" />
                  URL
                </Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => handleChange('url', e.target.value)}
                  placeholder={
                    formData.type === 'VIDEO'
                      ? 'https://youtube.com/watch?v=...'
                      : formData.type === 'LINK'
                      ? 'https://example.com'
                      : 'https://...'
                  }
                />
              </div>
            )}

            {/* File Name */}
            {(formData.type === 'FILE' || formData.type === 'AUDIO' || formData.type === 'IMAGE') && (
              <div className="space-y-2">
                <Label htmlFor="fileName">Tên file</Label>
                <Input
                  id="fileName"
                  value={formData.fileName}
                  onChange={(e) => handleChange('fileName', e.target.value)}
                  placeholder="document.pdf"
                />
              </div>
            )}

            {/* Text Content */}
            {formData.type === 'TEXT' && (
              <div className="space-y-2">
                <Label htmlFor="content">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Nội dung (Markdown/HTML)
                </Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleChange('content', e.target.value)}
                  placeholder="# Tiêu đề&#10;&#10;Nội dung..."
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>
            )}

            {/* Thumbnail URL */}
            <div className="space-y-2">
              <Label htmlFor="thumbnailUrl">Thumbnail URL (tùy chọn)</Label>
              <Input
                id="thumbnailUrl"
                type="url"
                value={formData.thumbnailUrl}
                onChange={(e) => handleChange('thumbnailUrl', e.target.value)}
                placeholder="https://..."
              />
              {formData.thumbnailUrl && (
                <div className="mt-2">
                  <img
                    src={formData.thumbnailUrl}
                    alt="Preview"
                    className="w-full max-w-xs h-32 object-cover rounded-lg border"
                  />
                </div>
              )}
            </div>

            {/* File Upload Placeholder */}
            {(formData.type === 'FILE' || formData.type === 'AUDIO' || formData.type === 'IMAGE') && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-2">
                  Drag & drop file hoặc click để chọn
                </p>
                <p className="text-xs text-gray-500">
                  Chức năng upload file sẽ được thêm sau
                </p>
                <Button type="button" variant="outline" className="mt-4" disabled>
                  <Upload className="w-4 h-4 mr-2" />
                  Chọn file (Coming soon)
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang tạo...
              </>
            ) : (
              'Tạo tài liệu'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
