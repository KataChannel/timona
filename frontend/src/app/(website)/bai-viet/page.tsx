'use client';

import { useState, useEffect, Suspense } from 'react';
import { useQuery } from '@apollo/client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { GET_BLOGS, GET_BLOG_CATEGORIES } from '@/graphql/blog.queries';
import { Search, Calendar, User, Clock, TrendingUp, Filter, X, Home, ChevronRight, Check, ChevronsUpDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { cn } from '@/lib/utils';

function BlogPageContent() {
  const searchParams = useSearchParams();
  
  // Lấy params từ URL (từ menu queryConditions)
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [categoryId, setCategoryId] = useState<string | null>(
    searchParams.get('categoryId') || null
  );
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [openSortCombobox, setOpenSortCombobox] = useState(false);
  const [limit] = useState(Number(searchParams.get('limit')) || 12);

  const sortOptions = [
    { value: 'newest', label: 'Mới nhất' },
    { value: 'oldest', label: 'Cũ nhất' },
    { value: 'popular', label: 'Phổ biến nhất' },
  ];

  // Update state khi URL params thay đổi
  useEffect(() => {
    const urlCategoryId = searchParams.get('categoryId');
    const urlSearch = searchParams.get('search');
    const urlSort = searchParams.get('sort');
    const urlPage = searchParams.get('page');

    if (urlCategoryId) setCategoryId(urlCategoryId);
    if (urlSearch) setSearchQuery(urlSearch);
    if (urlSort) setSortBy(urlSort);
    if (urlPage) setPage(Number(urlPage));
  }, [searchParams]);

  // Fetch blogs
  const { data, loading, error } = useQuery(GET_BLOGS, {
    variables: {
      page,
      limit,
      categoryId: categoryId || undefined,
      search: searchQuery || undefined,
      sort: sortBy,
    },
  });

  // Fetch categories
  const { data: categoriesData } = useQuery(GET_BLOG_CATEGORIES);

  const blogs = data?.blogs?.items || [];
  const total = data?.blogs?.total || 0;
  const hasMore = data?.blogs?.hasMore || false;
  const totalPages = data?.blogs?.totalPages || 0;
  const categories = categoriesData?.blogCategories || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return minutes;
  };

  const handleClearFilters = () => {
    setCategoryId(null);
    setSearchQuery('');
    setSortBy('newest');
    setPage(1);
  };

  const activeFiltersCount = [categoryId, searchQuery !== ''].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <p className="text-sm sm:text-base text-gray-600">
            Hiện có <span className="font-semibold text-red-600">{total}</span> Bài Viết
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Sidebar - Categories */}
          <aside className="hidden lg:block lg:w-64 flex-shrink-0">
            <div className="sticky top-24">
              {/* Green Header */}
              <div className="bg-green-600 text-white px-4 py-3 rounded-t-lg">
                <h2 className="font-bold text-base uppercase">Món Ngon Mỗi Ngày</h2>
              </div>

              {/* Categories List */}
              <div className="border border-t-0 rounded-b-lg overflow-hidden bg-white">
                <div className="divide-y">
                  <button
                    onClick={() => setCategoryId(null)}
                    className={`w-full px-4 py-3 text-left flex items-center gap-2 hover:bg-gray-50 transition-colors ${
                      categoryId === null ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-700'
                    }`}
                  >
                    <span className="text-lg">📰</span>
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
                      <span className="text-lg">{category.icon || '📂'}</span>
                      <span className="text-sm">{category.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Label Section */}
              <div className="mt-6 bg-green-600 text-white px-4 py-3 rounded-t-lg">
                <h2 className="font-bold text-sm uppercase">Thông Tin</h2>
              </div>
              <div className="border border-t-0 rounded-b-lg p-4 bg-white">
                <div className="text-center text-sm text-gray-500">
                  {new Date().toLocaleDateString('vi-VN', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-4 bg-white border-b sticky top-[73px] z-20 shadow-sm">
              <div className="px-4 py-4">
                {/* Mobile Categories Dropdown */}
                <div className="flex gap-2 overflow-x-auto">
                  <Button
                    variant={categoryId === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCategoryId(null)}
                    className="whitespace-nowrap"
                  >
                    Tất cả
                  </Button>
                  {categories.map((category: any) => (
                    <Button
                      key={category.id}
                      variant={categoryId === category.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCategoryId(category.id)}
                      className="whitespace-nowrap"
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Loading State */}
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {[...Array(limit)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="animate-pulse">
                      <div className="bg-gray-200 aspect-video"></div>
                      <CardContent className="p-4 space-y-3">
                        <div className="bg-gray-200 h-4 rounded"></div>
                        <div className="bg-gray-200 h-4 rounded w-2/3"></div>
                        <div className="bg-gray-200 h-3 rounded w-1/2"></div>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Error State */}
            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4 sm:p-6">
                  <p className="text-red-700 text-sm sm:text-base">
                    Có lỗi xảy ra: {error.message}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Blog List */}
            {!loading && blogs.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {blogs.map((blog: any) => (
                    <Card key={blog.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-white">
                      <CardContent className="p-0">
                        {/* Featured Image */}
                        <Link href={`/bai-viet/${blog.slug}`} className="block">
                          <div className="relative aspect-video bg-gray-100 overflow-hidden">
                            {blog.thumbnailUrl ? (
                              <Image
                                src={blog.thumbnailUrl}
                                alt={blog.title}
                                fill
                                className="object-cover hover:scale-105 transition-transform duration-300"
                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <span className="text-4xl">📰</span>
                              </div>
                            )}
                            {blog.category && (
                              <Badge className="absolute top-2 left-2 bg-orange-500 text-white text-xs">
                                {blog.category.name}
                              </Badge>
                            )}
                          </div>
                        </Link>

                        {/* Content */}
                        <div className="p-4">
                          {/* Date */}
                          <p className="text-xs text-gray-500 mb-2">
                            Món Ngon Mỗi Ngày | {formatDate(blog.publishedAt || blog.createdAt)}
                          </p>

                          {/* Title */}
                          <Link href={`/bai-viet/${blog.slug}`}>
                            <h2 className="font-bold text-gray-900 text-base mb-2 line-clamp-2 hover:text-green-600 transition-colors uppercase">
                              {blog.title}
                            </h2>
                          </Link>

                          {/* Excerpt */}
                          {blog.shortDescription && (
                            <p className="text-gray-600 text-sm line-clamp-3 uppercase">
                              {blog.shortDescription}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination - Mobile Optimized */}
                <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-gray-600 order-2 sm:order-1">
                    Hiển thị {(page - 1) * limit + 1} - {Math.min(page * limit, total)} của {total} bài viết
                  </p>
                  
                  <div className="flex items-center gap-2 order-1 sm:order-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                    >
                      Trước
                    </Button>
                    
                    {/* Page numbers - Show on desktop only */}
                    <div className="hidden sm:flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (page <= 3) {
                          pageNum = i + 1;
                        } else if (page >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = page - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={page === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPage(pageNum)}
                            className="w-9"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    
                    {/* Current page indicator on mobile */}
                    <span className="sm:hidden px-3 py-1 bg-gray-100 rounded text-sm font-medium">
                      {page} / {totalPages}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={!hasMore}
                    >
                      Sau
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* Empty State */}
            {!loading && blogs.length === 0 && (
              <Card>
                <CardContent className="p-8 sm:p-12 text-center">
                  <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                      Không tìm thấy bài viết
                    </h3>
                    <p className="text-sm sm:text-base text-gray-500 mb-4">
                      Thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác
                    </p>
                    {activeFiltersCount > 0 && (
                      <Button variant="outline" onClick={handleClearFilters}>
                        Xóa tất cả bộ lọc
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

// Wrapper component với Suspense boundary
export default function BlogPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải bài viết...</p>
        </div>
      </div>
    }>
      <BlogPageContent />
    </Suspense>
  );
}
