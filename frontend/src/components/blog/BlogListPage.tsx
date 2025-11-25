'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_BLOGS, GET_BLOG_CATEGORIES } from '@/graphql/blog.queries';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { BlogCard } from './BlogCard';
import { useErrorNotification, parseGraphQLError } from '@/hooks/useErrorNotification';

interface BlogsQueryData {
  blogs: {
    items: Array<{
      id: string;
      title: string;
      slug: string;
      shortDescription: string;
      excerpt: string;
      author: {
        id: string;
        username: string;
        firstName: string;
        lastName: string;
      };
      thumbnailUrl: string;
      viewCount: number;
      publishedAt: string;
      category: {
        id: string;
        name: string;
        slug: string;
      };
      tags: Array<{
        id: string;
        name: string;
        slug: string;
      }>;
      isFeatured: boolean;
      isPublished: boolean;
    }>;
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasMore: boolean;
  };
}

interface CategoriesQueryData {
  blogCategories: Array<{
    id: string;
    name: string;
    slug: string;
    description: string;
    thumbnail: string;
  }>;
}

export function BlogListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [displayError, setDisplayError] = useState<{ message: string; details?: string } | null>(null);
  const { notify } = useErrorNotification();

  const { data, loading, error, refetch } = useQuery<BlogsQueryData>(GET_BLOGS, {
    variables: {
      page,
      limit: 12,
      search: search || undefined,
      categoryId: selectedCategory || undefined,
      sort: sortBy,
    },
    errorPolicy: 'all',
  });

  const { data: categoriesData, loading: categoriesLoading, error: categoriesError } = useQuery<CategoriesQueryData>(GET_BLOG_CATEGORIES, {
    errorPolicy: 'all',
  });

  // Handle errors and display notifications
  useEffect(() => {
    if (error) {
      const errorInfo = parseGraphQLError(error);
      setDisplayError({
        message: errorInfo.message,
        details: errorInfo.details,
      });
      notify(errorInfo);
    } else {
      setDisplayError(null);
    }
  }, [error, notify]);

  // Log categories errors
  useEffect(() => {
    if (categoriesError) {
      const errorInfo = parseGraphQLError(categoriesError);
      console.warn('[Categories Error]', errorInfo);
    }
  }, [categoriesError]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setPage(1);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setPage(1);
  };

  const blogs = data?.blogs?.items || [];
  const totalPages = data?.blogs?.totalPages || 0;
  const categories = categoriesData?.blogCategories || [];

  return (
    <div className="min-h-screen bg-white">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Blog & Bài Viết</h1>
          <p className="text-blue-100 text-lg">
            Khám phá các bài viết hữu ích, mẹo vặt, và tin tức mới nhất từ chúng tôi
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm bài viết..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 h-12"
            />
          </div>

          {/* Category and Sort Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category Filter */}
            <Select value={selectedCategory || 'all'} onValueChange={(value) => handleCategoryChange(value === 'all' ? '' : value)}>
              <SelectTrigger className="h-10">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Chọn danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort Filter */}
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Mới nhất</SelectItem>
                <SelectItem value="oldest">Cũ nhất</SelectItem>
                <SelectItem value="popular">Phổ biến nhất</SelectItem>
                <SelectItem value="featured">Nổi bật</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Blog List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-video rounded-lg" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="space-y-4">
            {/* Error Banner */}
            <div className="bg-red-50 border border-red-300 rounded-lg p-6 shadow-md">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-800 mb-2">
                    {displayError?.message || 'Lỗi tải bài viết'}
                  </h3>
                  {displayError?.details && (
                    <details className="mb-4 cursor-pointer">
                      <summary className="text-sm text-red-700 hover:text-red-800 font-medium">
                        Chi tiết lỗi
                      </summary>
                      <pre className="mt-2 text-xs bg-red-100 p-3 rounded border border-red-200 overflow-auto max-h-40 text-red-700 font-mono">
                        {displayError.details}
                      </pre>
                    </details>
                  )}
                  <p className="text-sm text-red-700 mb-4">
                    Vui lòng thử lại. Nếu vẫn lỗi, hãy liên hệ với bộ phận hỗ trợ.
                  </p>
                  <Button
                    onClick={() => {
                      setDisplayError(null);
                      refetch();
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Thử lại
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Không tìm thấy bài viết nào.</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearch('');
                setSelectedCategory('');
                setSortBy('latest');
                setPage(1);
              }}
              className="mt-4"
            >
              Xóa bộ lọc
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog) => (
                <Link key={blog.id} href={`/website/baiviet/${blog.slug}`}>
                  <BlogCard blog={blog} />
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center gap-2">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(Math.max(1, page - 1))}
                >
                  Trang trước
                </Button>

                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? 'default' : 'outline'}
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}

                <Button
                  variant="outline"
                  disabled={page === totalPages}
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                >
                  Trang sau
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
