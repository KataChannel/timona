'use client';

import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_CATEGORIES, GET_ACTIVE_CATEGORIES } from '@/graphql/category.queries';
import { GET_CHEAP_PRODUCTS } from '@/graphql/product.queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  slug: string;
  productCount?: number;
}

interface CheapProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  thumbnail: string;
}

interface CategorySidebarProps {
  selectedCategoryId?: string | null;
  onCategorySelect?: (categoryId: string | null) => void;
  className?: string;
}

export function CategorySidebar({
  selectedCategoryId,
  onCategorySelect,
  className,
}: CategorySidebarProps) {
  // Fetch categories
  const { data: categoriesData, loading: categoriesLoading } = useQuery(GET_ACTIVE_CATEGORIES, {
    errorPolicy: 'all'
  });

  // Fetch cheap products (sorted by price, limit 5)
  const { data: cheapProductsData, loading: cheapProductsLoading } = useQuery(GET_CHEAP_PRODUCTS, {
    variables: {
      input: {
        limit: 5,
        sortBy: 'price',
        sortOrder: 'ASC'
      }
    },
    errorPolicy: 'all'
  });

  const categories: Category[] = categoriesData?.categories?.items || [];
  const cheapProducts: CheapProduct[] = cheapProductsData?.products?.items || [];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Categories Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Danh Mục Sản Phẩm</CardTitle>
        </CardHeader>
        <CardContent>
          {categoriesLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : categories.length > 0 ? (
            <div className="space-y-2">
              {/* All Categories Link */}
              <button
                onClick={() => onCategorySelect?.(null)}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-lg transition-colors',
                  !selectedCategoryId
                    ? 'bg-primary text-white'
                    : 'hover:bg-gray-100'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">Tất cả danh mục</span>
                  <Badge variant="outline" className="text-xs">
                    {categories.reduce((sum, cat) => sum + (cat.productCount || 0), 0)}
                  </Badge>
                </div>
              </button>

              {/* Category Items */}
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => onCategorySelect?.(category.id)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-lg transition-colors group',
                    selectedCategoryId === category.id
                      ? 'bg-primary text-white'
                      : 'hover:bg-gray-100'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      'font-medium truncate',
                      selectedCategoryId === category.id ? 'text-white' : ''
                    )}>
                      {category.name}
                    </span>
                    <Badge
                      variant={selectedCategoryId === category.id ? 'secondary' : 'outline'}
                      className="text-xs ml-2 flex-shrink-0"
                    >
                      {category.productCount || 0}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Không tìm thấy danh mục nào</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cheap Products Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">🔥 Sản Phẩm Giá Rẻ</CardTitle>
        </CardHeader>
        <CardContent>
          {cheapProductsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : cheapProducts.length > 0 ? (
            <div className="space-y-3">
              {cheapProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/product-detail/${product.slug}`}
                  className="flex gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  {/* Product Image */}
                  <div className="w-16 h-16 flex-shrink-0">
                    <img
                      src={product.thumbnail || '/placeholder-product.png'}
                      alt={product.name}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h4>
                    <p className="text-primary font-bold text-sm mt-1">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Không tìm thấy sản phẩm nào</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
