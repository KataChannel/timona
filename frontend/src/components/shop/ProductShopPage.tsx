'use client';

import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_PRODUCTS, GET_PRODUCTS_BY_CATEGORY } from '@/graphql/product.queries';
import { CategorySidebar, ProductFilter, ProductGrid, type SortOption } from '@/components/shop';
import { Button } from '@/components/ui/button';
import { ChevronRight, Filter } from 'lucide-react';
import Link from 'next/link';
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

const ITEMS_PER_PAGE = 12;

export function ProductShopPage() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Build the sort/filter options based on sortBy
  const getSortParams = (sort: SortOption) => {
    switch (sort) {
      case 'price-low':
        return { sortBy: 'price', sortOrder: 'ASC' };
      case 'price-high':
        return { sortBy: 'price', sortOrder: 'DESC' };
      case 'bestseller':
        return { sortBy: 'isBestSeller', sortOrder: 'DESC' };
      case 'popular':
        return { sortBy: 'isFeatured', sortOrder: 'DESC' };
      case 'newest':
      default:
        return { sortBy: 'createdAt', sortOrder: 'DESC' };
    }
  };

  const sortParams = getSortParams(sortBy);

  // Fetch products based on category
  const fetchQuery = selectedCategoryId ? GET_PRODUCTS_BY_CATEGORY : GET_PRODUCTS;
  const fetchVariables = selectedCategoryId
    ? {
        categoryId: selectedCategoryId,
        input: {
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          filters: searchQuery ? { search: searchQuery } : undefined,
          ...sortParams,
        },
      }
    : {
        input: {
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          filters: searchQuery ? { search: searchQuery } : undefined,
          ...sortParams,
        },
      };

  const { data, loading, error } = useQuery(fetchQuery, {
    variables: fetchVariables,
    errorPolicy: 'all',
  });

  const products: Product[] = data?.products?.items || data?.productsByCategory?.items || [];
  const total = data?.products?.total || data?.productsByCategory?.total || 0;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  // Reset to page 1 when search or category changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategoryId, searchQuery]);

  const handleAddToCart = (product: Product) => {
    console.log('Add to cart:', product);
    // TODO: Implement add to cart logic with toast notification
  };

  const handleToggleFavorite = (product: Product) => {
    console.log('Toggle favorite:', product);
    // TODO: Implement favorite logic
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/website" className="hover:text-foreground transition-colors">
              Trang chủ
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">Sản phẩm</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Hidden on mobile */}
          <div className="hidden lg:block lg:col-span-1">
            <CategorySidebar
              selectedCategoryId={selectedCategoryId}
              onCategorySelect={setSelectedCategoryId}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Mobile Filter Button */}
            <div className="lg:hidden flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Bộ lọc
              </Button>
            </div>

            {/* Mobile Sidebar */}
            {isMobileFilterOpen && (
              <div className="lg:hidden">
                <CategorySidebar
                  selectedCategoryId={selectedCategoryId}
                  onCategorySelect={(id) => {
                    setSelectedCategoryId(id);
                    setIsMobileFilterOpen(false);
                  }}
                />
              </div>
            )}

            {/* Product Filter */}
            <ProductFilter
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortBy={sortBy}
              onSortChange={setSortBy}
              totalProducts={total}
            />

            {/* Product Grid */}
            <ProductGrid
              products={products}
              loading={loading}
              error={error}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              onAddToCart={handleAddToCart}
              onToggleFavorite={handleToggleFavorite}
            />
          </div>
        </div>
      </div>

      {/* Empty State Background */}
      {!loading && products.length === 0 && (
        <div className="bg-white border-t mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <p className="text-muted-foreground">
                Thử thay đổi bộ lọc hoặc tìm kiếm để tìm sản phẩm khác
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
