'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import Link from 'next/link';
import { GET_PRODUCTS, GET_PRODUCT_CATEGORIES } from '@/graphql/ecommerce.queries';
import { ShoppingCart, Heart, Star, ChevronDown, Filter, Search, X, SlidersHorizontal, Grid3x3, List } from 'lucide-react';
import { ProductImage } from '@/components/ui/product-image';
import { AddToCartButton } from '@/components/ecommerce/AddToCartButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch products
  const { data, loading, error } = useQuery(GET_PRODUCTS, {
    variables: {
      input: {
        page,
        limit: 12,
        sortBy,
        sortOrder: 'desc',
        filters: {
          categoryId: categoryId || undefined,
          search: searchQuery || undefined,
          minPrice: priceRange[0],
          maxPrice: priceRange[1],
          inStock: true,
        }
      }
    }
  });

  // Fetch categories
  const { data: categoriesData } = useQuery(GET_PRODUCT_CATEGORIES, {
    variables: {
      input: {
        page: 1,
        limit: 100
      }
    }
  });

  const products = data?.products?.items || [];
  const total = data?.products?.total || 0;
  const hasMore = data?.products?.hasMore || false;
  const categories = categoriesData?.categories?.items || [];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Filter sidebar component
  const FilterSidebar = () => (
    <div className="space-y-0">
      {/* Green Header */}
      <div className="bg-green-600 text-white px-4 py-3 rounded-t-lg">
        <h2 className="font-bold text-base uppercase">DANH MỤC SẢN PHẨM</h2>
      </div>

      {/* Categories List */}
      <div className="border border-t-0 rounded-b-lg overflow-hidden">
        <div className="divide-y">
          <button
            onClick={() => setCategoryId(null)}
            className={`w-full px-4 py-3 text-left flex items-center gap-2 hover:bg-gray-50 transition-colors ${
              categoryId === null ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-700'
            }`}
          >
            <span className="text-lg">📦</span>
            <span className="text-sm">Tất cả</span>
          </button>
          {categories.map((category: any) => (
            <button
              key={category.id}
              onClick={() => setCategoryId(category.id)}
              className={`w-full px-4 py-3 text-left flex items-center gap-2 hover:bg-gray-50 transition-colors ${
                categoryId === category.id ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-700'
              }`}
            >
              <span className="text-lg">
                {category.icon || '📂'}
              </span>
              <span className="text-sm">{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Additional Filters Section */}
      <div className="mt-6 bg-green-600 text-white px-4 py-3 rounded-t-lg">
        <h2 className="font-bold text-sm uppercase">Sản Phẩm Giá Rẻ</h2>
      </div>
      <div className="border border-t-0 rounded-b-lg p-4">
        <div className="space-y-2">
          <button
            onClick={() => setCategoryId(null)}
            className="w-full flex items-center gap-2 text-left hover:text-green-600 transition-colors"
          >
            <img src="/placeholder-product.png" alt="" className="w-12 h-12 object-cover bg-gray-100 rounded" onError={(e) => e.currentTarget.style.display = 'none'} />
            <span className="text-sm text-gray-700">Khổ qua rừng</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Mobile First */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <p className="text-sm sm:text-base text-gray-600">
            Hiện có <span className="font-semibold text-red-600">{total}</span> Sản Phẩm
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block lg:w-64 flex-shrink-0">
            <Card className="sticky top-24">
              <CardContent className="p-0">
                <FilterSidebar />
              </CardContent>
            </Card>
          </aside>

          {/* Products Grid */}
          <main className="flex-1 min-w-0">
            {/* Toolbar - Mobile First */}
            <Card className="mb-4 sm:mb-6">
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  {/* Mobile Filter Button */}
                  <Sheet open={showFilters} onOpenChange={setShowFilters}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="lg:hidden w-full sm:w-auto">
                        <SlidersHorizontal className="mr-2 h-4 w-4" />
                        Bộ lọc
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80 overflow-y-auto">
                      <SheetHeader>
                        <SheetTitle>Bộ lọc sản phẩm</SheetTitle>
                      </SheetHeader>
                      <div className="mt-6">
                        <FilterSidebar />
                      </div>
                    </SheetContent>
                  </Sheet>

                  {/* View Mode Toggle - Hidden on mobile */}
                  <div className="hidden sm:flex items-center gap-2 ml-auto">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid3x3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Sort Select */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Label htmlFor="sort" className="text-sm whitespace-nowrap hidden sm:block">
                      Sắp xếp:
                    </Label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger id="sort" className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Sắp xếp theo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Mới nhất</SelectItem>
                        <SelectItem value="price_asc">Giá thấp đến cao</SelectItem>
                        <SelectItem value="price_desc">Giá cao đến thấp</SelectItem>
                        <SelectItem value="popular">Phổ biến nhất</SelectItem>
                        <SelectItem value="rating">Đánh giá cao</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Loading State */}
            {loading && (
              <div className={`grid gap-4 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <Skeleton className="aspect-square rounded-lg mb-4" />
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Error State */}
            {error && (
              <Card className="border-destructive">
                <CardContent className="p-6 text-center text-destructive">
                  <p className="font-medium">Có lỗi xảy ra</p>
                  <p className="text-sm mt-1">{error.message}</p>
                </CardContent>
              </Card>
            )}

            {/* Products Grid/List */}
            {!loading && products.length > 0 && (
              <>
                <div className={`grid gap-4 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                    : 'grid-cols-1'
                }`}>
                  {products.map((product: any) => (
                    <Card key={product.id} className="h-full hover:shadow-lg transition-shadow group overflow-hidden bg-white">
                      <CardContent className="p-0">
                        {/* Product Image */}
                        <div className="relative aspect-square bg-gray-100 overflow-hidden">
                          <ProductImage
                            src={product.thumbnail}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {/* Cart Icon - Orange Circle */}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              // Add to cart logic here
                            }}
                            disabled={product.stock === 0}
                            className="absolute bottom-3 right-3 bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-full shadow-lg z-10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <ShoppingCart className="h-5 w-5" />
                          </button>
                        </div>

                        {/* Product Info */}
                        <div className="p-4 flex flex-col">
                          <Link
                            href={`/san-pham/${product.slug}`}
                            className="block"
                          >
                            <h3 className="font-medium text-sm sm:text-base line-clamp-2 mb-3 text-gray-800 hover:text-green-600 transition-colors min-h-[2.5rem]">
                              {product.name}
                            </h3>
                          </Link>
                          
                          {/* Price - Red Color */}
                          <div className="mb-3">
                            <div className="flex items-baseline gap-2 flex-wrap">
                              <span className="text-lg sm:text-xl font-bold text-red-600">
                                {product.price > 0 ? formatPrice(product.price) : '0₫'}
                              </span>
                              <span className="text-sm text-gray-500">
                                /{product.unit || 'Kg'}
                              </span>
                            </div>
                          </div>

                          {/* Buy Now Button - Red */}
                          <Button
                            asChild
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium"
                            disabled={product.stock === 0}
                          >
                            <Link href={`/san-pham/${product.slug}`}>
                              Mua Ngay
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                  >
                    Trước
                  </Button>
                  <div className="px-4 py-2 text-sm font-medium">
                    Trang {page}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setPage(page + 1)}
                    disabled={!hasMore}
                  >
                    Sau
                  </Button>
                </div>
              </>
            )}

            {/* Empty State */}
            {!loading && products.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Không tìm thấy sản phẩm nào</p>
                  <Button
                    variant="link"
                    onClick={() => {
                      setCategoryId(null);
                      setSearchQuery('');
                      setPriceRange([0, 10000000]);
                    }}
                    className="mt-2"
                  >
                    Xóa bộ lọc
                  </Button>
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
