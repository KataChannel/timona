'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Category, CreateCategoryInput, UpdateCategoryInput } from '@/graphql/category.queries';
import { useCategoryTree } from '@/hooks/useCategories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Folder } from 'lucide-react';
import { FilePicker } from '@/components/file-manager/FilePicker';
import { File, FileType } from '@/types/file';

const categorySchema = z.object({
  name: z.string().min(2, 'Tên danh mục phải có ít nhất 2 ký tự'),
  description: z.string().optional(),
  imageUrl: z.string().url('URL ảnh không hợp lệ').optional().or(z.literal('')),
  parentId: z.string().optional(),
  displayOrder: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  category?: Category;
  onSubmit: (data: CreateCategoryInput | UpdateCategoryInput) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  excludeId?: string; // Exclude this category from parent selection (prevent circular reference)
}

export function CategoryForm({
  category,
  onSubmit,
  onCancel,
  loading = false,
  excludeId,
}: CategoryFormProps) {
  const { categoryTree, loading: categoriesLoading } = useCategoryTree();
  const [filePickerOpen, setFilePickerOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: category
      ? {
          name: category.name,
          description: category.description || '',
          imageUrl: category.image || '',
          parentId: category.parent?.id || '',
          displayOrder: category.displayOrder || 0,
          isActive: category.isActive,
        }
      : {
          displayOrder: 0,
          isActive: true,
        },
  });

  const watchedFields = watch();

  // Flatten category tree for parent selection
  const flattenCategories = (
    categories: Category[],
    level: number = 0,
    exclude?: string
  ): Array<Category & { level: number }> => {
    const result: Array<Category & { level: number }> = [];
    categories.forEach((cat) => {
      if (cat.id !== exclude) {
        result.push({ ...cat, level });
        if (cat.children && cat.children.length > 0) {
          result.push(...flattenCategories(cat.children, level + 1, exclude));
        }
      }
    });
    return result;
  };

  const flatCategories = React.useMemo(
    () => flattenCategories(categoryTree, 0, excludeId || category?.id),
    [categoryTree, excludeId, category?.id]
  );

  const handleFormSubmit = async (data: CategoryFormData) => {
    // Remove empty parentId and map imageUrl to image
    const submitData = {
      ...data,
      parentId: data.parentId || undefined,
      image: data.imageUrl || undefined,
      description: data.description || undefined,
    };
    // Remove imageUrl from submitData as it's renamed to image
    delete (submitData as any).imageUrl;
    await onSubmit(submitData as any);
  };

  const handleFileSelect = (file: File | string) => {
    if (typeof file === 'string') {
      setValue('imageUrl', file);
    } else {
      setValue('imageUrl', file.url);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Thông tin danh mục</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Tên danh mục *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Nhập tên danh mục"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Mô tả về danh mục"
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Hình ảnh danh mục</Label>
            <div className="flex gap-2">
              <Input
                id="imageUrl"
                {...register('imageUrl')}
                placeholder="https://example.com/image.jpg"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setFilePickerOpen(true)}
              >
                <Folder className="h-4 w-4 mr-2" />
                Chọn từ thư viện
              </Button>
            </div>
            {errors.imageUrl && (
              <p className="text-sm text-red-500">{errors.imageUrl.message}</p>
            )}
            {watchedFields.imageUrl && (
              <div className="mt-2 border rounded-lg p-2 bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Xem trước:</p>
                <img
                  src={watchedFields.imageUrl}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Parent Category */}
          <div className="space-y-2">
            <Label htmlFor="parentId">Danh mục cha</Label>
            <Select
              value={watchedFields.parentId || 'none'}
              onValueChange={(value) => setValue('parentId', value === 'none' ? '' : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn danh mục cha (tùy chọn)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Không có (danh mục gốc)</SelectItem>
                {categoriesLoading ? (
                  <div className="p-2 text-center text-sm">Đang tải...</div>
                ) : (
                  flatCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {'—'.repeat(cat.level)} {cat.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.parentId && (
              <p className="text-sm text-red-500">{errors.parentId.message}</p>
            )}
          </div>

          {/* Display Order */}
          <div className="space-y-2">
            <Label htmlFor="displayOrder">Thứ tự hiển thị</Label>
            <Input
              id="displayOrder"
              type="number"
              {...register('displayOrder', { valueAsNumber: true })}
              placeholder="0"
            />
            <p className="text-xs text-muted-foreground">
              Số thứ tự hiển thị (số nhỏ hơn sẽ hiển thị trước)
            </p>
            {errors.displayOrder && (
              <p className="text-sm text-red-500">{errors.displayOrder.message}</p>
            )}
          </div>

          {/* Is Active */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="isActive">Trạng thái hoạt động</Label>
              <p className="text-xs text-muted-foreground">
                Danh mục sẽ hiển thị trên website khi được kích hoạt
              </p>
            </div>
            <Switch
              id="isActive"
              checked={watchedFields.isActive}
              onCheckedChange={(checked) => setValue('isActive', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Category Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Xem trước</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-3">
              {watchedFields.imageUrl ? (
                <img
                  src={watchedFields.imageUrl}
                  alt="Preview"
                  className="w-12 h-12 rounded object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center">
                  <span className="text-lg">📁</span>
                </div>
              )}
              <div className="flex-1">
                <h4 className="font-medium">
                  {watchedFields.name || 'Tên danh mục'}
                </h4>
                {watchedFields.description && (
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {watchedFields.description}
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className={`text-xs ${watchedFields.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                  {watchedFields.isActive ? '✓ Hoạt động' : '✗ Không hoạt động'}
                </div>
                <div className="text-xs text-muted-foreground">
                  Thứ tự: {watchedFields.displayOrder || 0}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Hủy
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {category ? 'Cập nhật' : 'Tạo mới'}
        </Button>
      </div>

      {/* File Picker Dialog */}
      <FilePicker
        open={filePickerOpen}
        onOpenChange={setFilePickerOpen}
        onSelect={handleFileSelect}
        fileTypes={[FileType.IMAGE]}
        allowUrl={true}
      />
    </form>
  );
}
