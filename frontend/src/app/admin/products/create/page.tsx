'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCreateProduct } from '@/hooks/useProducts';
import { ProductForm } from '@/components/product';
import { CreateProductInput } from '@/graphql/product.queries';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateProductPage() {
  const router = useRouter();
  const { createProduct, loading } = useCreateProduct();

  const handleSubmit = async (data: CreateProductInput | any) => {
    try {
      await createProduct(data as CreateProductInput);
      toast.success('Tạo sản phẩm thành công!');
      router.push('/admin/products');
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi tạo sản phẩm');
      console.error(error);
    }
  };

  const handleCancel = () => {
    router.push('/admin/products');
  };

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={handleCancel}
          className="mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Quay lại danh sách
        </Button>
        <h1 className="text-3xl font-bold">Tạo sản phẩm mới</h1>
        <p className="text-muted-foreground mt-1">
          Điền thông tin để tạo sản phẩm mới
        </p>
      </div>

      <ProductForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
    </div>
  );
}
