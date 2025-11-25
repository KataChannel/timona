'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useRouter, useParams } from 'next/navigation';
import { UPDATE_BLOG, GET_BLOG_CATEGORIES } from '@/graphql/blog.queries';
import { gql } from '@apollo/client';
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

const GET_BLOG_BY_ID = gql`
  query GetBlogById($id: ID!) {
    blog(id: $id) {
      id
      title
      slug
      excerpt
      content
      thumbnailUrl
      isFeatured
      metaTitle
      metaDescription
      category {
        id
        name
      }
    }
  }
`;

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams();
  const blogId = params?.id as string;

  const [formData, setFormData] = useState({
    id: blogId || '',
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

  const { data, loading: loadingBlog, error } = useQuery(GET_BLOG_BY_ID, {
    variables: { id: blogId },
    skip: !blogId,
  });

  // Update form data when blog data is loaded
  useEffect(() => {
    if (data?.blog) {
      setFormData({
        id: data.blog.id || blogId,
        title: data.blog.title || '',
        slug: data.blog.slug || '',
        excerpt: data.blog.excerpt || '',
        content: data.blog.content || '',
        categoryId: data.blog.category?.id || '',
        featuredImage: data.blog.thumbnailUrl || '',
        status: 'DRAFT',
        isFeatured: data.blog.isFeatured || false,
        metaTitle: data.blog.metaTitle || '',
        metaDescription: data.blog.metaDescription || '',
      });
    }
  }, [data, blogId]);

  // Handle error
  useEffect(() => {
    if (error) {
      toast.error('Lỗi: ' + error.message);
      router.push('/admin/blog');
    }
  }, [error, router]);

  const [updateBlog, { loading: updating }] = useMutation(UPDATE_BLOG, {
    onCompleted: () => {
      toast.success('Đã cập nhật bài viết thành công!');
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

    // Ensure we have a valid ID
    const blogIdToUpdate = formData.id || blogId;
    if (!blogIdToUpdate) {
      console.error('Missing blog ID:', { formDataId: formData.id, blogId, params });
      toast.error('Không tìm thấy ID bài viết');
      return;
    }

    console.log('Updating blog with ID:', blogIdToUpdate);

    const inputVariables = {
      id: blogIdToUpdate,
      title: formData.title,
      slug: formData.slug,
      excerpt: formData.excerpt || undefined,
      content: formData.content,
      categoryId: formData.categoryId || undefined,
      thumbnailUrl: formData.featuredImage || undefined,
      isFeatured: formData.isFeatured,
      metaTitle: formData.metaTitle || undefined,
      metaDescription: formData.metaDescription || undefined,
    };

    console.log('GraphQL variables being sent:', JSON.stringify({ input: inputVariables }, null, 2));

    await updateBlog({ 
      variables: { 
        input: inputVariables
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

  if (loadingBlog) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

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
          <h1 className="text-2xl md:text-3xl font-bold">Chỉnh Sửa Bài Viết</h1>
          <p className="text-muted-foreground mt-1">
            Cập nhật thông tin bài viết blog
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
              <div className="flex gap-2">
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  placeholder="VD: huong-dan-su-dung-nextjs"
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormData({ ...formData, slug: generateSlug(formData.title) })}
                >
                  Tạo Slug
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Mô Tả Ngắn</Label>
              <div className="border rounded-md">
                <RichTextEditor
                  value={formData.excerpt}
                  onChange={(value) => setFormData({ ...formData, excerpt: value })}
                  placeholder="Mô tả ngắn gọn về bài viết..."
                  className="min-h-[120px]"
                />
              </div>
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
        <div className="flex flex-col sm:flex-row gap-4">
          <Button type="submit" disabled={updating || loadingBlog} className="w-full sm:w-auto">
            {updating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Save className="h-4 w-4 mr-2" />
            Cập Nhật Bài Viết
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="w-full sm:w-auto"
          >
            Hủy
          </Button>
        </div>
      </form>
    </div>
  );
}
