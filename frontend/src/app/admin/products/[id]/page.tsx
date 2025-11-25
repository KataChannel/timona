'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useProduct, useUpdateProduct } from '@/hooks/useProducts';
import { ProductForm } from '@/components/product';
import { UpdateProductInput } from '@/graphql/product.queries';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  console.log('EditProductPage - params:', params, 'productId:', productId);

  const { product, loading: loadingProduct } = useProduct(productId);
  const { updateProduct, loading: updating } = useUpdateProduct();

  const handleSubmit = async (data: UpdateProductInput | any) => {
    try {
      console.log('handleSubmit - productId:', productId, 'data:', data);
      const updateData = { ...data, id: productId };
      console.log('handleSubmit - updateData with id:', updateData);
      await updateProduct(updateData as UpdateProductInput);
      toast.success('Cập nhật sản phẩm thành công!');
      router.push('/admin/products');
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi cập nhật sản phẩm');
      console.error(error);
    }
  };

  const handleCancel = () => {
    router.push('/admin/products');
  };

  if (loadingProduct) {
    return (
      <div className="container mx-auto py-6 max-w-4xl">
        <div className="mb-6">
          <Button variant="ghost" onClick={handleCancel} className="mb-4">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách
          </Button>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto py-6 max-w-4xl">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Không tìm thấy sản phẩm</p>
          <Button onClick={handleCancel} className="mt-4">
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" onClick={handleCancel} className="mb-4">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Quay lại danh sách
        </Button>
        <h1 className="text-3xl font-bold">Chỉnh sửa sản phẩm</h1>
        <p className="text-muted-foreground mt-1">
          Cập nhật thông tin cho "{product.name}"
        </p>
      </div>

      <ProductForm
        product={product}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={updating}
      />
    </div>
  );
}
