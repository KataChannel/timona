'use client';

import React from 'react';
import { ProductCard } from '@/components/product/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  thumbnail?: string;
  category?: {
    id: string;
    name: string;
  };
  stock: number;
  minStock: number;
  status: string;
  unit: string;
  origin?: string;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isOnSale?: boolean;
}

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  error?: Error | null;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onAddToCart?: (product: Product) => void;
  onToggleFavorite?: (product: Product) => void;
  className?: string;
  emptyMessage?: string;
}

export function ProductGrid({
  products,
  loading = false,
  error = null,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  onAddToCart,
  onToggleFavorite,
  className,
  emptyMessage = 'Không tìm thấy sản phẩm nào',
}: ProductGridProps) {
  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive rounded-lg p-6">
        <h3 className="text-sm font-semibold text-destructive mb-2">Lỗi tải sản phẩm</h3>
        <p className="text-sm text-destructive/80">{error.message}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={cn('grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3', className)}>
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={index} className="border rounded-lg overflow-hidden">
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
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📦</div>
        <h3 className="text-xl font-semibold text-foreground mb-2">{emptyMessage}</h3>
        <p className="text-muted-foreground">
          Vui lòng thử tìm kiếm hoặc lọc khác để tìm sản phẩm bạn muốn
        </p>
      </div>
    );
  }

  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <div className="space-y-8">
      {/* Products Grid */}
      <div className={cn('grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3', className)}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product as any}
            variant="default"
            onAddToCart={onAddToCart}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 py-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange?.(currentPage - 1)}
            disabled={!canGoPrevious}
            className="h-10 w-10"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              const isCurrentPage = pageNum === currentPage;
              const isNearby = Math.abs(pageNum - currentPage) <= 2;

              if (!isNearby && pageNum !== 1 && pageNum !== totalPages) {
                return null;
              }

              if (
                (pageNum === 2 && currentPage > 3) ||
                (pageNum === totalPages - 1 && currentPage < totalPages - 2)
              ) {
                return (
                  <span key={pageNum} className="px-2 py-1 text-muted-foreground">
                    ...
                  </span>
                );
              }

              return (
                <Button
                  key={pageNum}
                  variant={isCurrentPage ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onPageChange?.(pageNum)}
                  className="h-10 min-w-10"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange?.(currentPage + 1)}
            disabled={!canGoNext}
            className="h-10 w-10"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Page Info */}
      {totalPages > 1 && (
        <div className="text-center text-sm text-muted-foreground">
          Trang <span className="font-semibold text-foreground">{currentPage}</span> trên{' '}
          <span className="font-semibold text-foreground">{totalPages}</span>
        </div>
      )}
    </div>
  );
}
