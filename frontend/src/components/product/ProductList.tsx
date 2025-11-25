'use client';

import React from 'react';
import { Product } from '@/graphql/product.queries';
import { ProductCard } from './ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductListProps {
  products: Product[];
  loading?: boolean;
  error?: Error | null;
  variant?: 'default' | 'compact' | 'featured';
  columns?: 2 | 3 | 4 | 5;
  onAddToCart?: (product: Product) => void;
  onToggleFavorite?: (product: Product) => void;
  className?: string;
  emptyMessage?: string;
}

export function ProductList({
  products,
  loading = false,
  error = null,
  variant = 'default',
  columns = 4,
  onAddToCart,
  onToggleFavorite,
  className,
  emptyMessage = 'Không tìm thấy sản phẩm nào',
}: ProductListProps) {
  const gridCols: Record<number, string> = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
  };

  if (error) {
    return (
      <Alert className="border-destructive">
        <AlertCircle className="h-4 w-4 text-destructive" />
        <AlertDescription>
          Lỗi khi tải danh sách sản phẩm: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <div className={cn('grid gap-6', gridCols[columns], className)}>
        {Array.from({ length: columns * 2 }).map((_, index) => (
          <ProductCardSkeleton key={index} variant={variant} />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn('grid gap-6', gridCols[columns], className)}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          variant={variant}
          onAddToCart={onAddToCart}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}

function ProductCardSkeleton({ variant }: { variant: 'default' | 'compact' | 'featured' }) {
  if (variant === 'compact') {
    return (
      <div className="border rounded-lg p-3">
        <div className="flex gap-3">
          <Skeleton className="w-20 h-20 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Skeleton className="aspect-square w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-3 w-1/4" />
        <Skeleton className="h-5 w-full" />
        {variant === 'featured' && <Skeleton className="h-4 w-full" />}
        <Skeleton className="h-6 w-1/2" />
        <div className="flex gap-2">
          <Skeleton className="h-9 flex-1" />
          {variant === 'default' && <Skeleton className="h-9 w-9" />}
        </div>
      </div>
    </div>
  );
}
