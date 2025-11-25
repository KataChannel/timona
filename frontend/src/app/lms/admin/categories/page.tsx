'use client';

import { useState } from 'react';
import { useFindMany, useDeleteOne, useCreateOne, useUpdateOne } from '@/hooks/useDynamicGraphQL';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  Folder,
  AlertCircle,
  BookOpen,
  FolderOpen
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  _count?: {
    courses: number;
  };
}

export default function AdminCategoriesPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    slug: '',
    description: '',
  });

  const { data: categories, loading, error, refetch } = useFindMany('CourseCategory', {
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
    },
    include: {
      _count: {
        select: {
          courses: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  const [createCategory, { loading: createLoading }] = useCreateOne('CourseCategory');
  const [updateCategory, { loading: updateLoading }] = useUpdateOne('CourseCategory');
  const [deleteCategory, { loading: deleteLoading }] = useDeleteOne('CourseCategory');

  // Filter categories
  const filteredCategories = (categories || []).filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (category.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handlers
  const handleCreate = () => {
    setEditMode(false);
    setFormData({ id: '', name: '', slug: '', description: '' });
    setDialogOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditMode(true);
    setFormData({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description || '',
    });
    setDialogOpen(true);
  };

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập tên danh mục',
        type: 'error',
      });
      return;
    }

    try {
      if (editMode) {
        await updateCategory({
          where: { id: formData.id },
          data: {
            name: formData.name,
            slug: formData.slug,
            description: formData.description || null,
          },
        });

        toast({
          title: 'Thành công',
          description: 'Đã cập nhật danh mục',
          type: 'success',
        });
      } else {
        await createCategory({
          data: {
            name: formData.name,
            slug: formData.slug,
            description: formData.description || null,
          },
        });

        toast({
          title: 'Thành công',
          description: 'Đã tạo danh mục mới',
          type: 'success',
        });
      }

      setDialogOpen(false);
      setFormData({ id: '', name: '', slug: '', description: '' });
      refetch();
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể lưu danh mục',
        type: 'error',
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;

    try {
      await deleteCategory({
        where: { id: categoryToDelete.id },
      });

      toast({
        title: 'Thành công',
        description: `Đã xóa danh mục "${categoryToDelete.name}"`,
        type: 'success',
      });

      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
      refetch();
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể xóa danh mục',
        type: 'error',
      });
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Quản lý danh mục</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Tổng cộng {categories?.length || 0} danh mục</p>
        </div>
        <Button onClick={handleCreate} className="gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          Tạo danh mục mới
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Tìm kiếm danh mục..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Đang tải...</p>
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">Lỗi: {error.message}</p>
          </CardContent>
        </Card>
      ) : filteredCategories.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Không tìm thấy danh mục nào</p>
            <Button onClick={handleCreate}>
              Tạo danh mục đầu tiên
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCategories.map((category) => (
            <Card key={category.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Folder className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">{category.name}</CardTitle>
                      <p className="text-xs text-gray-500 truncate">/{category.slug}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Description */}
                {category.description && (
                  <CardDescription className="line-clamp-2 text-sm">
                    {category.description}
                  </CardDescription>
                )}

                {/* Stats */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <BookOpen className="w-4 h-4" />
                  <span>{category._count?.courses || 0} khóa học</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 gap-2"
                    onClick={() => handleEdit(category)}
                  >
                    <Edit className="w-4 h-4" />
                    Sửa
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDeleteClick(category)}
                    disabled={(category._count?.courses || 0) > 0}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{editMode ? 'Sửa danh mục' : 'Tạo danh mục mới'}</DialogTitle>
            <DialogDescription>
              {editMode ? 'Cập nhật thông tin danh mục' : 'Nhập thông tin danh mục mới'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tên danh mục *</Label>
                <Input
                  id="name"
                  placeholder="Ví dụ: Lập trình Web"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  placeholder="lap-trinh-web"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500">Tự động tạo từ tên danh mục</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  placeholder="Mô tả chi tiết về danh mục..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>
            </div>
          </form>

          <DialogFooter className="border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={createLoading || updateLoading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={createLoading || updateLoading}
            >
              {createLoading || updateLoading ? 'Đang lưu...' : editMode ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa danh mục</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa danh mục <strong>&quot;{categoryToDelete?.name}&quot;</strong>?
              <br />
              <br />
              {(categoryToDelete?._count?.courses || 0) > 0 ? (
                <span className="text-red-600 font-semibold">
                  Danh mục này có {categoryToDelete?._count?.courses} khóa học. Không thể xóa!
                </span>
              ) : (
                <span className="text-gray-600">
                  Hành động này không thể hoàn tác.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteLoading || (categoryToDelete?._count?.courses || 0) > 0}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteLoading ? 'Đang xóa...' : 'Xóa danh mục'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
