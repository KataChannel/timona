'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { CREATE_BLOG, GET_BLOG_CATEGORIES } from '@/graphql/blog.queries';
import { toast } from 'sonner';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { CategorySelect } from '@/components/category/CategorySelect';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, ArrowLeft, Save } from 'lucide-react';

export default function CreateBlogPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    categoryId: '',
    featuredImage: '',
    status: 'DRAFT',
    isFeatured: false,
    metaTitle: '',
    metaDescription: '',
  });

  const [createBlog, { loading }] = useMutation(CREATE_BLOG, {
    onCompleted: () => {
      toast.success('Đã tạo bài viết thành công!');
      router.push('/admin/blog');
    },
    onError: (error) => toast.error('Lỗi: ' + error.message),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.slug || !formData.content) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    await createBlog({ 
      variables: { 
        input: {
          ...formData,
          categoryId: formData.categoryId || undefined,
        }
      } 
    });
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Tạo Bài Viết Mới</h1>
          <p className="text-muted-foreground mt-1">
            Tạo bài viết blog với trình soạn thảo rich text
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Info */}
        <Card>
          <CardHeader>
            <CardTitle>Thông Tin Cơ Bản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Tiêu Đề <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    title: e.target.value,
                    slug: generateSlug(e.target.value),
                  });
                }}
                placeholder="VD: Hướng dẫn sử dụng Next.js..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">
                Slug (Đường dẫn URL) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                placeholder="VD: huong-dan-su-dung-nextjs"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Mô Tả Ngắn</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) =>
                  setFormData({ ...formData, excerpt: e.target.value })
                }
                placeholder="Mô tả ngắn gọn về bài viết..."
                rows={3}
              />
            </div>

            <CategorySelect
              value={formData.categoryId}
              onChange={(value) => setFormData({ ...formData, categoryId: value })}
              query={GET_BLOG_CATEGORIES}
              queryName="blogCategories"
              label="Danh Mục"
              placeholder="Chọn danh mục bài viết"
              allowEmpty
            />

            <div className="space-y-2">
              <Label htmlFor="featuredImage">URL Ảnh Đại Diện</Label>
              <Input
                id="featuredImage"
                value={formData.featuredImage}
                onChange={(e) =>
                  setFormData({ ...formData, featuredImage: e.target.value })
                }
                placeholder="https://example.com/image.jpg"
              />
              {formData.featuredImage && (
                <img
                  src={formData.featuredImage}
                  alt="Preview"
                  className="w-full max-w-md rounded-lg mt-2"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle>
              Nội Dung <span className="text-red-500">*</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RichTextEditor
              value={formData.content}
              onChange={(value) => setFormData({ ...formData, content: value })}
              placeholder="Viết nội dung bài viết ở đây..."
            />
          </CardContent>
        </Card>

        {/* SEO */}
        <Card>
          <CardHeader>
            <CardTitle>SEO & Meta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="metaTitle">Meta Title</Label>
              <Input
                id="metaTitle"
                value={formData.metaTitle}
                onChange={(e) =>
                  setFormData({ ...formData, metaTitle: e.target.value })
                }
                placeholder="Tiêu đề SEO (tối đa 60 ký tự)"
                maxLength={60}
              />
              <p className="text-sm text-muted-foreground">
                {formData.metaTitle.length}/60 ký tự
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="metaDescription">Meta Description</Label>
              <Textarea
                id="metaDescription"
                value={formData.metaDescription}
                onChange={(e) =>
                  setFormData({ ...formData, metaDescription: e.target.value })
                }
                placeholder="Mô tả SEO (tối đa 160 ký tự)"
                rows={3}
                maxLength={160}
              />
              <p className="text-sm text-muted-foreground">
                {formData.metaDescription.length}/160 ký tự
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Cài Đặt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Trạng Thái</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Bản Nháp</SelectItem>
                  <SelectItem value="PUBLISHED">Đã Xuất Bản</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isFeatured"
                checked={formData.isFeatured}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isFeatured: checked })
                }
              />
              <Label htmlFor="isFeatured">Bài viết nổi bật</Label>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Save className="h-4 w-4 mr-2" />
            Tạo Bài Viết
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Hủy
          </Button>
        </div>
      </form>
    </div>
  );
}
