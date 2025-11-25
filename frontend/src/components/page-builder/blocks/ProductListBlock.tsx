/**
 * Product List Block
 * Displays a list of products fetched from GraphQL API
 */

'use client';

import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_PRODUCTS } from '@/graphql/product.queries';
import { Product } from '@/graphql/product.queries';
import { PageBlock } from '@/types/page-builder';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice } from '@/lib/format-utils';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Eye } from 'lucide-react';

export interface ProductListBlockContent {
  title?: string;
  subtitle?: string;
  limit?: number;
  categoryId?: string;
  filters?: {
    isFeatured?: boolean;
    isNew?: boolean;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
  };
  layout?: 'grid' | 'list';
  columns?: 2 | 3 | 4;
  showPrice?: boolean;
  showCategory?: boolean;
  showDescription?: boolean;
  showAddToCart?: boolean;
  cardVariant?: 'default' | 'compact' | 'detailed';
  style?: any;
}

export interface ProductListBlockProps {
  block: PageBlock;
  isEditable?: boolean;
  onUpdate: (content: any, style?: any) => void;
  onDelete: () => void;
}

export function ProductListBlock({ block, isEditable = true, onUpdate, onDelete }: ProductListBlockProps) {
  const content = (block.content || {}) as ProductListBlockContent;
  const {
    title = 'Sản phẩm',
    subtitle,
    limit = 12,
    categoryId,
    filters = {},
    layout = 'grid',
    columns = 3,
    showPrice = true,
    showCategory = true,
    showDescription = false,
    showAddToCart = true,
    cardVariant = 'default',
  } = content;

  const [page, setPage] = useState(1);

  // Build GraphQL query variables
  const variables = {
    input: {
      limit,
      page,
      filters: {
        ...filters,
        ...(categoryId && { categoryId }),
      },
    },
  };

  const { data, loading, error } = useQuery(GET_PRODUCTS, {
    variables,
    skip: isEditable, // Don't fetch in editing mode
  });

  const products = data?.products?.items || [];
  const total = data?.products?.total || 0;
  const totalPages = Math.ceil(total / limit);

  // Edit mode placeholder
  if (isEditable) {
    return (
      <div className="p-6 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50">
        <div className="text-center">
          <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-blue-500" />
          <h3 className="text-lg font-semibold mb-2">Product List Block</h3>
          <p className="text-sm text-gray-600 mb-4">
            Hiển thị {limit} sản phẩm {categoryId && 'từ danh mục đã chọn'}
            {filters.isFeatured && ' (Nổi bật)'}
            {filters.isNew && ' (Mới)'}
          </p>
          <div className="flex gap-2 justify-center text-xs text-gray-500">
            <Badge variant="secondary">Layout: {layout}</Badge>
            <Badge variant="secondary">Columns: {columns}</Badge>
            <Badge variant="secondary">Variant: {cardVariant}</Badge>
          </div>
        </div>
      </div>
    );
  }

  // Grid layout classes
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }[columns];

  // Error state
  if (error && !isEditable) {
    return (
      <div className="p-6 border border-red-200 rounded-lg bg-red-50">
        <p className="text-red-600 text-center">
          Lỗi tải sản phẩm: {error.message}
        </p>
      </div>
    );
  }

  // Loading state  
  if (loading && !isEditable) {
    return (
      <div className="container mx-auto py-8">
        <div className={`grid ${gridCols} gap-6`}>
          {Array.from({ length: limit }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-48 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8" style={content.style}>
      {/* Header */}
      {(title || subtitle) && (
        <div className="text-center mb-8">
          {title && <h2 className="text-3xl font-bold mb-2">{title}</h2>}
          {subtitle && <p className="text-gray-600">{subtitle}</p>}
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <div className={`grid ${gridCols} gap-6`}>
          {Array.from({ length: limit }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Không có sản phẩm nào</p>
        </div>
      ) : (
        <div className={`grid ${gridCols} gap-6`}>
          {products.map((product: Product) => (
            <ProductCard
              key={product.id}
              product={product}
              showPrice={showPrice}
              showCategory={showCategory}
              showDescription={showDescription}
              showAddToCart={showAddToCart}
              variant={cardVariant}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
          >
            Trước
          </Button>
          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? 'default' : 'outline'}
                  onClick={() => setPage(pageNum)}
                  disabled={loading}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
          >
            Sau
          </Button>
        </div>
      )}
    </div>
  );
}

// Product Card Component
function ProductCard({
  product,
  showPrice,
  showCategory,
  showDescription,
  showAddToCart,
  variant,
}: {
  product: Product;
  showPrice: boolean;
  showCategory: boolean;
  showDescription: boolean;
  showAddToCart: boolean;
  variant: string;
}) {
  const discount = product.discountPercentage || 0;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {product.thumbnail ? (
            <Image
              src={product.thumbnail}
              alt={product.name}
              fill
              className="object-cover hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.isNewArrival && (
              <Badge className="bg-green-500">Mới</Badge>
            )}
            {product.isFeatured && (
              <Badge className="bg-blue-500">Nổi bật</Badge>
            )}
            {discount > 0 && (
              <Badge className="bg-red-500">-{discount}%</Badge>
            )}
          </div>
        </div>
      </Link>

      {/* Content */}
      <CardHeader className="pb-3">
        {showCategory && product.category && (
          <CardDescription className="text-xs">{product.category.name}</CardDescription>
        )}
        <CardTitle className="text-base line-clamp-2">
          <Link href={`/products/${product.slug}`} className="hover:text-primary">
            {product.name}
          </Link>
        </CardTitle>
        {showDescription && product.shortDesc && (
          <CardDescription className="text-sm line-clamp-2">
            {product.shortDesc}
          </CardDescription>
        )}
      </CardHeader>

      {/* Footer */}
      <CardFooter className="flex justify-between items-center pt-0">
        {showPrice && (
          <div className="flex flex-col">
            <span className="text-lg font-bold text-primary">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        )}
        
        {showAddToCart && (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" asChild>
              <Link href={`/products/${product.slug}`}>
                <Eye className="w-4 h-4" />
              </Link>
            </Button>
            <Button size="sm">
              <ShoppingCart className="w-4 h-4 mr-1" />
              Mua
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

// Skeleton Loader
function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-square" />
      <CardHeader>
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-5 w-full" />
      </CardHeader>
      <CardFooter className="flex justify-between">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-9 w-20" />
      </CardFooter>
    </Card>
  );
}
