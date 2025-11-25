'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Product, CreateProductInput, UpdateProductInput } from '@/graphql/product.queries';
import { useActiveCategories } from '@/hooks/useCategories';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Image as ImageIcon, Folder } from 'lucide-react';
import { FilePicker } from '@/components/file-manager/FilePicker';
import { File, FileType } from '@/types/file';

const productSchema = z.object({
  name: z.string().min(3, 'Tên sản phẩm phải có ít nhất 3 ký tự'),
  categoryId: z.string().min(1, 'Vui lòng chọn danh mục'),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  price: z.number().min(0, 'Giá phải lớn hơn 0'),
  compareAtPrice: z.number().optional(),
  costPrice: z.number().optional(),
  unit: z.enum(['KG', 'G', 'BUNDLE', 'PIECE', 'BAG', 'BOX']),
  stock: z.number().min(0, 'Tồn kho không được âm'),
  minStock: z.number().min(0).optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE', 'OUT_OF_STOCK', 'DISCONTINUED']).optional(),
  imageUrl: z.string().url('URL ảnh không hợp lệ').optional().or(z.literal('')),
  origin: z.string().optional(),
  isFeatured: z.boolean().optional(),
  isNew: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  isOrganic: z.boolean().optional(),
  weight: z.number().optional(),
  dimensions: z.string().optional(),
  manufacturer: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: CreateProductInput | UpdateProductInput) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

const UNIT_OPTIONS = [
  { value: 'KG', label: 'Kilogram (kg)' },
  { value: 'G', label: 'Gram (g)' },
  { value: 'BUNDLE', label: 'Bó' },
  { value: 'PIECE', label: 'Củ/Quả' },
  { value: 'BAG', label: 'Túi' },
  { value: 'BOX', label: 'Hộp' },
];

const STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Nháp' },
  { value: 'ACTIVE', label: 'Đang bán' },
  { value: 'INACTIVE', label: 'Ngừng bán' },
  { value: 'OUT_OF_STOCK', label: 'Hết hàng' },
  { value: 'DISCONTINUED', label: 'Ngừng kinh doanh' },
];

export function ProductForm({ product, onSubmit, onCancel, loading = false }: ProductFormProps) {
  const { categories, loading: categoriesLoading } = useActiveCategories();
  const [filePickerOpen, setFilePickerOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          name: product.name,
          categoryId: product.category?.id || '',
          description: product.description || '',
          shortDescription: product.shortDesc || '',
          sku: product.sku || '',
          barcode: product.barcode || '',
          price: product.price,
          compareAtPrice: product.originalPrice || undefined,
          costPrice: product.costPrice || undefined,
          unit: product.unit as any,
          stock: product.stock,
          minStock: product.minStock || undefined,
          status: product.status as any,
          imageUrl: product.thumbnail || '',
          origin: product.origin || '',
          isFeatured: product.isFeatured || false,
          isNew: product.isNewArrival || false,
          isBestSeller: product.isBestSeller || false,
          isOrganic: product.isFeatured || false,
          weight: product.weight || undefined,
          dimensions: product.attributes?.dimensions || '',
          manufacturer: product.attributes?.manufacturer || '',
          metaTitle: product.metaTitle || '',
          metaDescription: product.metaDescription || '',
          metaKeywords: product.metaKeywords || '',
        }
      : {
          price: 0,
          stock: 0,
          unit: 'KG',
          status: 'DRAFT',
          isFeatured: false,
          isNew: false,
          isBestSeller: false,
          isOrganic: false,
        },
  });

  const watchedFields = watch();

  const handleFormSubmit = async (data: ProductFormData) => {
    console.log('ProductForm - raw form data:', data);
    // Map form fields to backend fields
    const mappedData = {
      name: data.name,
      categoryId: data.categoryId,
      description: data.description,
      shortDesc: data.shortDescription, // Form field → Backend field
      sku: data.sku,
      barcode: data.barcode,
      price: data.price,
      originalPrice: data.compareAtPrice, // compareAtPrice → originalPrice
      costPrice: data.costPrice,
      unit: data.unit,
      stock: data.stock,
      minStock: data.minStock,
      status: data.status,
      thumbnail: data.imageUrl, // imageUrl → thumbnail
      origin: data.origin,
      isFeatured: data.isFeatured,
      isNewArrival: data.isNew, // isNew → isNewArrival
      isBestSeller: data.isBestSeller,
      weight: data.weight,
      attributes: {
        dimensions: data.dimensions,
        manufacturer: data.manufacturer,
      },
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      metaKeywords: data.metaKeywords,
    };

    console.log('ProductForm - mappedData:', mappedData);
    await onSubmit(mappedData as any);
  };

  const handleFileSelect = (file: File | string) => {
    if (typeof file === 'string') {
      // URL string
      setValue('imageUrl', file);
    } else {
      // File object from FileManager
      setValue('imageUrl', file.url);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Thông tin cơ bản</TabsTrigger>
          <TabsTrigger value="pricing">Giá & Kho</TabsTrigger>
          <TabsTrigger value="attributes">Thuộc tính</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        {/* Basic Information */}
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tên sản phẩm *</Label>
                <Input id="name" {...register('name')} placeholder="Nhập tên sản phẩm" />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryId">Danh mục *</Label>
                <Select
                  value={watchedFields.categoryId}
                  onValueChange={(value) => setValue('categoryId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriesLoading ? (
                      <div className="p-2 text-center">Đang tải...</div>
                    ) : (
                      categories.map((category:any) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.categoryId && (
                  <p className="text-sm text-red-500">{errors.categoryId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortDescription">Mô tả ngắn</Label>
                <Textarea
                  id="shortDescription"
                  {...register('shortDescription')}
                  placeholder="Mô tả ngắn về sản phẩm"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô tả chi tiết</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Mô tả chi tiết về sản phẩm"
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">Hình ảnh sản phẩm</Label>
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
                    <div className="relative aspect-video bg-background rounded-md overflow-hidden flex items-center justify-center">
                      <img
                        src={watchedFields.imageUrl}
                        alt="Preview"
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing & Inventory */}
        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Giá & Kho hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Giá bán *</Label>
                  <Input
                    id="price"
                    type="number"
                    {...register('price', { valueAsNumber: true })}
                    placeholder="0"
                  />
                  {errors.price && (
                    <p className="text-sm text-red-500">{errors.price.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="compareAtPrice">Giá so sánh</Label>
                  <Input
                    id="compareAtPrice"
                    type="number"
                    {...register('compareAtPrice', { valueAsNumber: true })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="costPrice">Giá nhập</Label>
                  <Input
                    id="costPrice"
                    type="number"
                    {...register('costPrice', { valueAsNumber: true })}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">Đơn vị tính *</Label>
                  <Select
                    value={watchedFields.unit}
                    onValueChange={(value) => setValue('unit', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {UNIT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stock">Tồn kho *</Label>
                  <Input
                    id="stock"
                    type="number"
                    {...register('stock', { valueAsNumber: true })}
                    placeholder="0"
                  />
                  {errors.stock && (
                    <p className="text-sm text-red-500">{errors.stock.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minStock">Tồn kho tối thiểu</Label>
                  <Input
                    id="minStock"
                    type="number"
                    {...register('minStock', { valueAsNumber: true })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input id="sku" {...register('sku')} placeholder="SKU-001" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="barcode">Barcode</Label>
                  <Input id="barcode" {...register('barcode')} placeholder="1234567890" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái</Label>
                <Select
                  value={watchedFields.status}
                  onValueChange={(value) => setValue('status', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attributes */}
        <TabsContent value="attributes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Thuộc tính & Đặc điểm</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="origin">Xuất xứ</Label>
                <Input id="origin" {...register('origin')} placeholder="Đà Lạt, Lâm Đồng" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="manufacturer">Nhà sản xuất</Label>
                <Input id="manufacturer" {...register('manufacturer')} placeholder="Tên nhà sản xuất" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Trọng lượng (gram)</Label>
                  <Input
                    id="weight"
                    type="number"
                    {...register('weight', { valueAsNumber: true })}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dimensions">Kích thước</Label>
                  <Input id="dimensions" {...register('dimensions')} placeholder="L x W x H" />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Đặc điểm</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isFeatured"
                      checked={watchedFields.isFeatured}
                      onCheckedChange={(checked) => setValue('isFeatured', checked as boolean)}
                    />
                    <Label htmlFor="isFeatured" className="font-normal cursor-pointer">
                      Sản phẩm nổi bật
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isNew"
                      checked={watchedFields.isNew}
                      onCheckedChange={(checked) => setValue('isNew', checked as boolean)}
                    />
                    <Label htmlFor="isNew" className="font-normal cursor-pointer">
                      Sản phẩm mới
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isBestSeller"
                      checked={watchedFields.isBestSeller}
                      onCheckedChange={(checked) => setValue('isBestSeller', checked as boolean)}
                    />
                    <Label htmlFor="isBestSeller" className="font-normal cursor-pointer">
                      Bán chạy nhất
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isOrganic"
                      checked={watchedFields.isOrganic}
                      onCheckedChange={(checked) => setValue('isOrganic', checked as boolean)}
                    />
                    <Label htmlFor="isOrganic" className="font-normal cursor-pointer">
                      Hữu cơ (Organic)
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO */}
        <TabsContent value="seo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tối ưu SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Tiêu đề SEO</Label>
                <Input
                  id="metaTitle"
                  {...register('metaTitle')}
                  placeholder="Tiêu đề cho công cụ tìm kiếm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaDescription">Mô tả SEO</Label>
                <Textarea
                  id="metaDescription"
                  {...register('metaDescription')}
                  placeholder="Mô tả cho công cụ tìm kiếm"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaKeywords">Từ khóa SEO</Label>
                <Input
                  id="metaKeywords"
                  {...register('metaKeywords')}
                  placeholder="từ khóa 1, từ khóa 2, từ khóa 3"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Hủy
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {product ? 'Cập nhật' : 'Tạo mới'}
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
