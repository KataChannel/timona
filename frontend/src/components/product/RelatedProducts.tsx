'use client';

import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_PRODUCTS_BY_CATEGORY } from '@/graphql/product.queries';
import { ProductCard } from './ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface RelatedProductsProps {
  categoryId: string;
  excludeProductId?: string;
  title?: string;
  limit?: number;
  className?: string;
}

export function RelatedProducts({
  categoryId,
  excludeProductId,
  title = 'Sản phẩm liên quan',
  limit = 4,
  className,
}: RelatedProductsProps) {
  const { data, loading, error } = useQuery(GET_PRODUCTS_BY_CATEGORY, {
    variables: {
      categoryId,
      input: {
        limit: limit + 1, // Get extra in case we need to exclude
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      },
    },
    errorPolicy: 'all',
  });

  const products = data?.productsByCategory?.items || [];
  const filteredProducts = excludeProductId
    ? products.filter((p: any) => p.id !== excludeProductId).slice(0, limit)
    : products.slice(0, limit);

  if (loading) {
    return (
      <div className={cn('', className)}>
        <h2 className="text-2xl font-bold mb-6">{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border rounded-lg overflow-hidden">
              <Skeleton className="aspect-square w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-3 w-1/4" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-6 w-1/2" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 w-9" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || filteredProducts.length === 0) {
    return null;
  }

  return (
    <div className={cn('', className)}>
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product: any) => (
          <ProductCard key={product.id} product={product} variant="default" />
        ))}
      </div>
    </div>
  );
}
