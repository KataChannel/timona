'use client';

import React from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  GET_BLOG_CATEGORIES_WITH_COUNT,
  CREATE_BLOG_CATEGORY,
  UPDATE_BLOG_CATEGORY,
  DELETE_BLOG_CATEGORY,
  BlogCategory,
  CreateBlogCategoryInput,
  UpdateBlogCategoryInput,
} from '@/graphql/blog.queries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Folder, ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function BlogCategoriesPage() {
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<any>(null);
  
  const [formData, setFormData] = React.useState<CreateBlogCategoryInput>({
    name: '',
    slug: '',
    description: '',
    thumbnail: '',
    order: 0,
    isActive: true,
  });

  const { data, loading, refetch } = useQuery(GET_BLOG_CATEGORIES_WITH_COUNT);
  const [createCategory, { loading: creating }] = useMutation(CREATE_BLOG_CATEGORY, {
    onError: (error) => {
      // eslint-disable-next-line no-console
      console.error('=== useMutation onError ===');
      // eslint-disable-next-line no-console
      console.error('Error:', error);
      // eslint-disable-next-line no-console
      console.error('GraphQL errors:', error.graphQLErrors);
      // eslint-disable-next-line no-console
      console.error('Network error:', error.networkError);
    },
  });
  const [updateCategory, { loading: updating }] = useMutation(UPDATE_BLOG_CATEGORY);
  const [deleteCategory, { loading: deleting }] = useMutation(DELETE_BLOG_CATEGORY);

  const categories = data?.blogCategories || [];

  // Auto generate slug from name
  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim(),
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      thumbnail: '',
      order: 0,
      isActive: true,
    });
  };

  const handleCreate = async () => {
    try {
      // eslint-disable-next-line no-console
      console.log('=== FRONTEND handleCreate ===');
      // eslint-disable-next-line no-console
      console.log('formData:', formData);
      // eslint-disable-next-line no-console
      console.log('formData.name:', formData.name);
      // eslint-disable-next-line no-console
      console.log('formData.slug:', formData.slug);
      
      // Clean up empty optional fields
      const cleanInput: any = {
        name: formData.name,
        slug: formData.slug,
      };
      
      if (formData.description && formData.description.trim()) {
        cleanInput.description = formData.description;
      }
      if (formData.thumbnail && formData.thumbnail.trim()) {
        cleanInput.thumbnail = formData.thumbnail;
      }
      if (formData.order !== undefined && formData.order !== null) {
        cleanInput.order = formData.order;
      }
      if (formData.isActive !== undefined && formData.isActive !== null) {
        cleanInput.isActive = formData.isActive;
      }
      
      // eslint-disable-next-line no-console
      console.log('cleanInput:', cleanInput);
      // eslint-disable-next-line no-console
      console.log('Variables to send:', JSON.stringify({ input: cleanInput }, null, 2));
      
      await createCategory({
        variables: { input: cleanInput },
      });
      toast.success('Tạo danh mục thành công');
      setCreateDialogOpen(false);
      resetForm();
      refetch();
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error('=== CREATE CATEGORY ERROR ===');
      // eslint-disable-next-line no-console
      console.error('Error:', error);
      // eslint-disable-next-line no-console
      console.error('Error message:', error.message);
      // eslint-disable-next-line no-console
      console.error('GraphQL errors:', error.graphQLErrors);
      toast.error(error.message || 'Có lỗi xảy ra');
    }
  };

  const handleEditOpen = (category: any) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      thumbnail: category.thumbnail || '',
      order: category.order || 0,
      isActive: category.isActive,
    });
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedCategory) return;
    
    try {
      await updateCategory({
        variables: {
          id: selectedCategory.id,
          input: formData,
        },
      });
      toast.success('Cập nhật danh mục thành công');
      setEditDialogOpen(false);
      resetForm();
      setSelectedCategory(null);
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra');
    }
  };

  const handleDeleteOpen = (category: any) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;
    
    try {
      await deleteCategory({
        variables: { id: selectedCategory.id },
      });
      toast.success('Xóa danh mục thành công');
      setDeleteDialogOpen(false);
      setSelectedCategory(null);
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Danh Mục Blog</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý danh mục bài viết blog
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Tạo Danh Mục
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng Danh Mục
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Đang Hoạt Động
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categories.filter((c: any) => c.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng Bài Viết
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categories.reduce((sum: number, c: any) => sum + (c.postCount || 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh Sách Danh Mục</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hình Ảnh</TableHead>
                  <TableHead>Tên</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="hidden md:table-cell">Mô Tả</TableHead>
                  <TableHead className="text-center">Bài Viết</TableHead>
                  <TableHead className="text-center">Thứ Tự</TableHead>
                  <TableHead className="text-center">Trạng Thái</TableHead>
                  <TableHead className="text-right">Thao Tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      <Folder className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Chưa có danh mục nào</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((category: any) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        {category.thumbnail ? (
                          <img
                            src={category.thumbnail}
                            alt={category.name}
                            className="h-10 w-10 rounded object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                          {category.slug}
                        </code>
                      </TableCell>
                      <TableCell className="hidden md:table-cell max-w-xs truncate">
                        {category.description || '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{category.postCount || 0}</Badge>
                      </TableCell>
                      <TableCell className="text-center">{category.order}</TableCell>
                      <TableCell className="text-center">
                        {category.isActive ? (
                          <Badge variant="default">Hoạt động</Badge>
                        ) : (
                          <Badge variant="secondary">Tắt</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditOpen(category)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteOpen(category)}
                            disabled={category.postCount > 0}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Tạo Danh Mục Mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin danh mục blog mới
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-1">
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tên Danh Mục *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="VD: Công nghệ, Kinh doanh..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug (Đường dẫn URL) *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="VD: cong-nghe, kinh-doanh..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô Tả</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả ngắn gọn về danh mục..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="thumbnail">URL Hình Ảnh</Label>
                <Input
                  id="thumbnail"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="order">Thứ Tự Hiển Thị</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Kích hoạt danh mục</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreate} disabled={creating || !formData.name || !formData.slug}>
              {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Tạo Danh Mục
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Chỉnh Sửa Danh Mục</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin danh mục
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-1">
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Tên Danh Mục *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="VD: Công nghệ, Kinh doanh..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-slug">Slug (Đường dẫn URL) *</Label>
                <Input
                  id="edit-slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="VD: cong-nghe, kinh-doanh..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Mô Tả</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả ngắn gọn về danh mục..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-thumbnail">URL Hình Ảnh</Label>
                <Input
                  id="edit-thumbnail"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-order">Thứ Tự Hiển Thị</Label>
                <Input
                  id="edit-order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="edit-isActive">Kích hoạt danh mục</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleUpdate} disabled={updating || !formData.name || !formData.slug}>
              {updating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Cập Nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác Nhận Xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa danh mục <strong>{selectedCategory?.name}</strong>?
              <br />
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
