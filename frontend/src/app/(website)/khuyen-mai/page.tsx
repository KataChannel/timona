'use client';

import { useState, useEffect, Suspense } from 'react';
import { useQuery } from '@apollo/client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { GET_BLOGS, GET_BLOG_CATEGORIES } from '@/graphql/blog.queries';
import { Calendar, User, Eye, Tag } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

function PromotionsPageContent() {
  const searchParams = useSearchParams();
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [limit] = useState(12);

  // Get blog categories to find "Khuyến Mãi" category
  const { data: categoriesData } = useQuery(GET_BLOG_CATEGORIES);
  const categories = categoriesData?.blogCategories || [];
  
  // Find "Khuyến Mãi" category
  const promotionCategory = categories.find(
    (cat: any) => cat.slug === 'khuyen-mai' || cat.name.toLowerCase().includes('khuyến mãi')
  );

  // Get blogs filtered by promotion category
  const { data, loading, error } = useQuery(GET_BLOGS, {
    variables: {
      page,
      limit,
      categoryId: promotionCategory?.id || null,
      sortBy: 'newest',
    },
    skip: !promotionCategory?.id,
  });

  const blogs = data?.blogs?.items || [];
  const totalPages = data?.blogs?.meta?.totalPages || 1;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Category sidebar component
  const CategorySidebar = () => (
    <div className="space-y-0">
      {/* Green Header */}
      <div className="bg-green-600 text-white px-4 py-3 rounded-t-lg">
        <h2 className="font-bold text-base uppercase">DANH MỤC KHUYẾN MÃI</h2>
      </div>

      {/* Categories List */}
      <div className="border border-t-0 rounded-b-lg overflow-hidden">
        <div className="divide-y">
          <Link
            href="/khuyen-mai"
            className="flex items-center gap-2 px-4 py-3 bg-green-50 text-green-600 font-medium"
          >
            <span className="text-lg">🎉</span>
            <span className="text-sm">Tất cả khuyến mãi</span>
          </Link>
          {categories
            .filter((cat: any) => cat.slug === 'khuyen-mai' || cat.name.toLowerCase().includes('khuyến mãi'))
            .map((category: any) => (
              <Link
                key={category.id}
                href={`/bai-viet?categoryId=${category.id}`}
                className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 transition-colors text-gray-700 hover:text-green-600"
              >
                <span className="text-lg">{category.icon || '📂'}</span>
                <span className="text-sm">{category.name}</span>
              </Link>
            ))}
        </div>
      </div>

      {/* Additional Info Section */}
      <div className="mt-6 bg-green-600 text-white px-4 py-3 rounded-t-lg">
        <h2 className="font-bold text-sm uppercase">Ưu Đãi Hot</h2>
      </div>
      <div className="border border-t-0 rounded-b-lg p-4 bg-white">
        <div className="text-center">
          <div className="text-2xl mb-2">🔥</div>
          <p className="text-sm text-gray-700 font-medium">Giảm giá đến 50%</p>
          <p className="text-xs text-gray-500 mt-1">Áp dụng cho đơn hàng từ 300K</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải khuyến mãi...</p>
        </div>
      </div>
    );
  }

  if (error || !promotionCategory) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">
            {error ? 'Có lỗi xảy ra khi tải khuyến mãi' : 'Danh mục khuyến mãi không tồn tại'}
          </p>
          <Link href="/bai-viet" className="text-green-600 hover:underline mt-2 inline-block">
            ← Quay lại trang bài viết
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Categories */}
          <aside className="hidden lg:block lg:w-64 flex-shrink-0">
            <div className="sticky top-4">
              <CategorySidebar />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Page Title */}
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 uppercase mb-2">
                KHUYẾN MÃI HOT
              </h1>
              <p className="text-gray-600">
                Cập nhật các chương trình khuyến mãi mới nhất
              </p>
            </div>

            {/* Blog Grid */}
            {blogs.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <div className="text-4xl mb-4">📭</div>
                <p className="text-gray-600">Chưa có chương trình khuyến mãi nào</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {blogs.map((blog: any) => (
                    <Link key={blog.id} href={`/bai-viet/${blog.slug}`}>
                      <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden group">
                        {/* Image */}
                        {blog.featuredImage && (
                          <div className="relative h-48 overflow-hidden">
                            <Image
                              src={blog.featuredImage}
                              alt={blog.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {/* Promotion Badge */}
                            <div className="absolute top-2 right-2">
                              <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                                HOT
                              </span>
                            </div>
                          </div>
                        )}

                        <CardContent className="p-4">
                          {/* Date */}
                          <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(blog.publishedAt || blog.createdAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {blog.viewCount || 0}
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 uppercase text-sm group-hover:text-green-600 transition-colors">
                            {blog.title}
                          </h3>

                          {/* Short Description */}
                          {blog.shortDescription && (
                            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                              {blog.shortDescription}
                            </p>
                          )}

                          {/* Category Tag */}
                          {blog.category && (
                            <div className="flex items-center gap-2">
                              <Tag className="h-3 w-3 text-green-600" />
                              <span className="text-xs text-green-600 font-medium">
                                {blog.category.name}
                              </span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ← Trước
                    </button>
                    
                    <div className="flex gap-2">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`px-4 py-2 rounded-lg ${
                              page === pageNum
                                ? 'bg-green-600 text-white'
                                : 'bg-white border hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sau →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PromotionsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    }>
      <PromotionsPageContent />
    </Suspense>
  );
}
