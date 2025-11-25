'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  FolderTree,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  GET_SOURCE_DOCUMENT_CATEGORY_TREE,
  CREATE_SOURCE_DOCUMENT_CATEGORY,
  UPDATE_SOURCE_DOCUMENT_CATEGORY,
  DELETE_SOURCE_DOCUMENT_CATEGORY,
} from '@/graphql/lms/source-documents';

// Icon picker (simplified - using emojis)
const ICON_OPTIONS = [
  '📁', '📂', '📚', '📖', '📝', '📄', '📃', '📑',
  '🎥', '🎬', '🎞️', '📹', '🎵', '🎶', '🎧', '🔊',
  '🖼️', '🖌️', '🎨', '🌈', '💡', '🔬', '🔭', '⚗️',
  '💻', '⌨️', '🖥️', '📱', '🌐', '🔗', '📡', '🛰️',
];

// Color picker (simplified)
const COLOR_OPTIONS = [
  '#3B82F6', // blue
  '#8B5CF6', // purple
  '#10B981', // green
  '#F59E0B', // orange
  '#EF4444', // red
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#6366F1', // indigo
];

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  parentId?: string;
  children?: Category[];
}

export default function CategoriesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '📁',
    color: '#3B82F6',
    parentId: '',
  });

  // Queries
  const { data, loading, error, refetch } = useQuery(GET_SOURCE_DOCUMENT_CATEGORY_TREE, {
    fetchPolicy: 'cache-and-network',
  });

  // Mutations
  const [createCategory, { loading: creating }] = useMutation(CREATE_SOURCE_DOCUMENT_CATEGORY, {
    onCompleted: () => {
      toast({ type: 'success', title: 'Thành công', description: 'Đã tạo danh mục mới' });
      setCreateDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast({ type: 'error', title: 'Lỗi', description: error.message });
    },
  });

  const [updateCategory, { loading: updating }] = useMutation(UPDATE_SOURCE_DOCUMENT_CATEGORY, {
    onCompleted: () => {
      toast({ type: 'success', title: 'Thành công', description: 'Đã cập nhật danh mục' });
      setEditDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast({ type: 'error', title: 'Lỗi', description: error.message });
    },
  });

  const [deleteCategory, { loading: deleting }] = useMutation(DELETE_SOURCE_DOCUMENT_CATEGORY, {
    onCompleted: () => {
      toast({ type: 'success', title: 'Thành công', description: 'Đã xóa danh mục' });
      setDeleteDialogOpen(false);
      setSelectedCategory(null);
      refetch();
    },
    onError: (error) => {
      toast({ type: 'error', title: 'Lỗi', description: error.message });
    },
  });

  const categories = data?.sourceDocumentCategoryTree || [];

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      icon: '📁',
      color: '#3B82F6',
      parentId: '',
    });
  };

  const handleCreate = () => {
    if (!formData.name.trim() || !formData.slug.trim()) {
      toast({ type: 'error', title: 'Lỗi', description: 'Vui lòng nhập tên và slug' });
      return;
    }

    createCategory({
      variables: {
        input: {
          name: formData.name,
          slug: formData.slug,
          description: formData.description || null,
          icon: formData.icon,
          color: formData.color,
          parentId: formData.parentId || null,
        },
      },
    });
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      icon: category.icon || '📁',
      color: category.color || '#3B82F6',
      parentId: category.parentId || '',
    });
    setEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!selectedCategory || !formData.name.trim() || !formData.slug.trim()) {
      toast({ type: 'error', title: 'Lỗi', description: 'Vui lòng nhập tên và slug' });
      return;
    }

    updateCategory({
      variables: {
        id: selectedCategory.id,
        input: {
          name: formData.name,
          slug: formData.slug,
          description: formData.description || null,
          icon: formData.icon,
          color: formData.color,
          parentId: formData.parentId || null,
        },
      },
    });
  };

  const handleDelete = (category: Category) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedCategory) {
      deleteCategory({ variables: { id: selectedCategory.id } });
    }
  };

  const toggleExpand = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const renderCategory = (category: Category, level = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);

    return (
      <div key={category.id}>
        <div
          className={`flex items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors ${
            level > 0 ? 'ml-6' : ''
          }`}
          style={{ paddingLeft: `${level * 24 + 12}px` }}
        >
          {/* Expand/Collapse button */}
          {hasChildren ? (
            <button
              onClick={() => toggleExpand(category.id)}
              className="p-1 hover:bg-gray-200 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-600" />
              )}
            </button>
          ) : (
            <div className="w-6" />
          )}

          {/* Icon */}
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
            style={{ backgroundColor: `${category.color}20`, color: category.color }}
          >
            {category.icon}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm sm:text-base text-gray-900">
              {category.name}
            </h3>
            {category.description && (
              <p className="text-xs sm:text-sm text-gray-500 truncate">
                {category.description}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(category)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(category)}
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </Button>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="mt-1">
            {category.children!.map((child) => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Danh mục tài liệu nguồn
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Quản lý danh mục phân loại tài liệu
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm danh mục
        </Button>
      </div>

      {/* Categories Tree */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-blue-600" />
            <CardTitle>Cây danh mục</CardTitle>
          </div>
          <CardDescription>
            Click vào mũi tên để mở rộng/thu gọn danh mục con
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 text-blue-600 mx-auto animate-spin" />
              <p className="text-gray-500 mt-4">Đang tải...</p>
            </div>
          ) : error ? (
            <p className="text-red-600 text-center py-8">Lỗi: {error.message}</p>
          ) : categories.length === 0 ? (
            <div className="text-center py-12">
              <FolderTree className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Chưa có danh mục nào</p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Tạo danh mục đầu tiên
              </Button>
            </div>
          ) : (
            <div className="space-y-1">
              {categories.map((category: Category) => renderCategory(category))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tạo danh mục mới</DialogTitle>
            <DialogDescription>
              Điền thông tin danh mục
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên danh mục *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nhập tên danh mục..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="category-slug"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả danh mục..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="grid grid-cols-8 gap-2">
                {ICON_OPTIONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon })}
                    className={`p-2 text-xl rounded border-2 transition-colors ${
                      formData.icon === icon
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Màu sắc</Label>
              <div className="flex gap-2">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-10 h-10 rounded-full border-2 transition-transform ${
                      formData.color === color
                        ? 'border-gray-800 scale-110'
                        : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreateDialogOpen(false);
                resetForm();
              }}
              disabled={creating}
            >
              Hủy
            </Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                'Tạo danh mục'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa danh mục</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin danh mục
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Tên danh mục *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nhập tên danh mục..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-slug">Slug *</Label>
              <Input
                id="edit-slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="category-slug"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Mô tả</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả danh mục..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="grid grid-cols-8 gap-2">
                {ICON_OPTIONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon })}
                    className={`p-2 text-xl rounded border-2 transition-colors ${
                      formData.icon === icon
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Màu sắc</Label>
              <div className="flex gap-2">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-10 h-10 rounded-full border-2 transition-transform ${
                      formData.color === color
                        ? 'border-gray-800 scale-110'
                        : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditDialogOpen(false);
                resetForm();
              }}
              disabled={updating}
            >
              Hủy
            </Button>
            <Button onClick={handleUpdate} disabled={updating}>
              {updating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang cập nhật...
                </>
              ) : (
                'Cập nhật'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn xóa danh mục "{selectedCategory?.name}"?
              <br />
              <span className="text-red-600 font-medium">
                Các danh mục con (nếu có) cũng sẽ bị xóa!
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Hủy
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                'Xóa'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
