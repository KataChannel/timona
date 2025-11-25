'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar, User, Eye, Settings, Trash2, Newspaper } from 'lucide-react';
import { PageBlock, BlogCarouselBlockContent } from '@/types/page-builder';
import { Button } from '@/components/ui/button';
import { useQuery } from '@apollo/client';
import { GET_BLOGS, GET_FEATURED_BLOGS, GET_BLOGS_BY_CATEGORY, Blog } from '@/graphql/blog.queries';
import { BlogCarouselSettingsDialog } from './BlogCarouselSettingsDialog';
import { ProductImage } from '@/components/ui/product-image';
import Link from 'next/link';

interface BlogCarouselBlockProps {
  block: PageBlock;
  isEditable?: boolean;
  onUpdate: (content: any, style?: any) => void;
  onDelete: () => void;
}

export const BlogCarouselBlock: React.FC<BlogCarouselBlockProps> = ({
  block,
  isEditable = true,
  onUpdate,
  onDelete,
}) => {
  const content = block.content as BlogCarouselBlockContent;
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState<BlogCarouselBlockContent>(content || {
    title: 'Tin tức nổi bật',
    filterType: 'all',
    itemsToShow: 6,
    showViewAllButton: true,
    viewAllLink: '/tin-tuc',
    autoplay: false,
    autoplayDelay: 5000,
    loop: true,
    showNavigation: true,
    showExcerpt: true,
    showAuthor: true,
    showDate: true,
    showCategory: true,
    responsive: {
      mobile: 1,
      tablet: 2,
      desktop: 3,
    },
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Fetch blogs based on filter type
  const shouldFetchAll = editContent.filterType === 'all' || editContent.filterType === 'recent';
  const shouldFetchFeatured = editContent.filterType === 'featured';
  const shouldFetchByCategory = editContent.filterType === 'category' && editContent.categoryId;

  const { data: allBlogsData, loading: allBlogsLoading } = useQuery(GET_BLOGS, {
    variables: {
      limit: editContent.itemsToShow || 6,
      page: 1,
      sort: editContent.filterType === 'recent' ? 'publishedAt_DESC' : undefined,
    },
    skip: !shouldFetchAll,
    fetchPolicy: 'cache-first',
  });

  const { data: featuredBlogsData, loading: featuredBlogsLoading } = useQuery(GET_FEATURED_BLOGS, {
    variables: {
      limit: editContent.itemsToShow || 6,
    },
    skip: !shouldFetchFeatured,
    fetchPolicy: 'cache-first',
  });

  const { data: categoryBlogsData, loading: categoryBlogsLoading } = useQuery(GET_BLOGS_BY_CATEGORY, {
    variables: {
      categoryId: editContent.categoryId,
      limit: editContent.itemsToShow || 6,
      page: 1,
    },
    skip: !shouldFetchByCategory,
    fetchPolicy: 'cache-first',
  });

  const loading = allBlogsLoading || featuredBlogsLoading || categoryBlogsLoading;

  // Extract blogs from response
  const blogs: Blog[] = React.useMemo(() => {
    if (shouldFetchFeatured && featuredBlogsData?.featuredBlogs) {
      return featuredBlogsData.featuredBlogs;
    }
    if (shouldFetchByCategory && categoryBlogsData?.blogsByCategory?.items) {
      return categoryBlogsData.blogsByCategory.items;
    }
    if (shouldFetchAll && allBlogsData?.blogs?.items) {
      return allBlogsData.blogs.items;
    }
    return [];
  }, [
    shouldFetchFeatured,
    shouldFetchByCategory,
    shouldFetchAll,
    featuredBlogsData,
    categoryBlogsData,
    allBlogsData,
  ]);

  // Responsive items per view
  const getItemsPerView = () => {
    if (typeof window === 'undefined') return editContent.responsive?.desktop || 3;
    
    const width = window.innerWidth;
    if (width < 640) return editContent.responsive?.mobile || 1;
    if (width < 1024) return editContent.responsive?.tablet || 2;
    return editContent.responsive?.desktop || 3;
  };

  const [itemsPerView, setItemsPerView] = useState(getItemsPerView());

  useEffect(() => {
    const handleResize = () => {
      setItemsPerView(getItemsPerView());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [editContent.responsive]);

  // Autoplay
  useEffect(() => {
    if (!editContent.autoplay || isEditing) return;

    const interval = setInterval(() => {
      handleNext();
    }, editContent.autoplayDelay || 5000);

    return () => clearInterval(interval);
  }, [editContent.autoplay, editContent.autoplayDelay, currentIndex, isEditing]);

  const maxIndex = Math.max(0, blogs.length - itemsPerView);

  const handlePrev = () => {
    setCurrentIndex(prev => {
      if (prev <= 0) {
        return editContent.loop ? maxIndex : 0;
      }
      return prev - 1;
    });
  };

  const handleNext = () => {
    setCurrentIndex(prev => {
      if (prev >= maxIndex) {
        return editContent.loop ? 0 : maxIndex;
      }
      return prev + 1;
    });
  };

  const handleSave = () => {
    onUpdate(editContent);
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const getBlogUrl = (blog: Blog) => {
    return `/tin-tuc/${blog.slug}`;
  };

  if (!isEditable) {
    // Frontend display mode
    return (
      <div className="blog-carousel-block py-4 sm:py-6 md:py-8 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Header với Navigation */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            {/* Title - Left */}
            <div className="inline-flex items-center bg-green-600 text-white px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 rounded-tr-full rounded-br-full shadow-lg">
              <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold uppercase tracking-wide whitespace-nowrap">
                {editContent.title || 'TIN TỨC'}
              </h2>
            </div>
            {/* Navigation Arrows - Right */}
            {editContent.showNavigation && blogs.length > itemsPerView && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePrev}
                  disabled={currentIndex === 0 && !editContent.loop}
                  className="bg-white hover:bg-gray-100 rounded-full shadow-md border w-8 h-8 sm:w-10 sm:h-10 disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNext}
                  disabled={currentIndex >= maxIndex && !editContent.loop}
                  className="bg-white hover:bg-gray-100 rounded-full shadow-md border w-8 h-8 sm:w-10 sm:h-10 disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </div>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              <p className="mt-4 text-gray-600">Đang tải bài viết...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && blogs.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg">
              <Newspaper className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 text-lg">Không có bài viết nào</p>
              <p className="text-gray-500 text-sm mt-2">
                Filter: {editContent.filterType}
              </p>
            </div>
          )}

          {/* Carousel */}
          {!loading && blogs.length > 0 && (
            <div className="relative overflow-hidden">
              <div
                ref={carouselRef}
                className="flex transition-transform duration-300 ease-in-out gap-3 sm:gap-4 md:gap-6"
                style={{
                  transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
                }}
              >
                {blogs.map((blog) => (
                  <div
                    key={blog.id}
                    className="flex-shrink-0"
                    style={{ width: `calc(${100 / itemsPerView}% - ${(itemsPerView - 1) * (24 / itemsPerView)}px)` }}
                  >
                    <Link href={getBlogUrl(blog)}>
                      <div className="bg-white rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer h-full flex flex-col">
                        {/* Blog Image */}
                        <div className="relative aspect-video bg-gray-100">
                          <ProductImage
                            src={blog.thumbnailUrl || blog.featuredImage || '/placeholder-blog.jpg'}
                            alt={blog.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {blog.isFeatured && (
                            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs font-bold rounded">
                              NỔI BẬT
                            </div>
                          )}
                        </div>

                        {/* Blog Info */}
                        <div className="p-3 sm:p-4 flex-1 flex flex-col">
                          {/* Category & Date */}
                          <div className="flex items-center gap-2 mb-2 text-xs sm:text-sm text-gray-500">
                            {editContent.showCategory && blog.category && (
                              <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded font-medium">
                                {blog.category.name}
                              </span>
                            )}
                            {editContent.showDate && blog.publishedAt && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(blog.publishedAt)}
                              </span>
                            )}
                          </div>

                          {/* Title */}
                          <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 text-sm sm:text-base lg:text-lg hover:text-blue-600 transition-colors flex-1">
                            {blog.title}
                          </h3>

                          {/* Excerpt */}
                          {editContent.showExcerpt && blog.shortDescription && (
                            <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 mb-3">
                              {blog.shortDescription}
                            </p>
                          )}

                          {/* Author & Views */}
                          <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 border-t pt-2">
                            {editContent.showAuthor && blog.author && (
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {blog.author.firstName} {blog.author.lastName}
                              </span>
                            )}
                            {blog.viewCount > 0 && (
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {blog.viewCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* View All Button */}
          {!loading && blogs.length > 0 && editContent.showViewAllButton && editContent.viewAllLink && (
            <div className="text-center mt-6 sm:mt-8">
              <Link href={editContent.viewAllLink}>
                <button className="inline-flex items-center gap-2 px-6 sm:px-8 py-2 sm:py-3 border-2 border-orange-400 text-orange-500 hover:bg-orange-50 rounded-md font-semibold transition-colors text-sm sm:text-base">
                  Xem Tất Cả Tin Tức
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Editor mode
  return (
    <div className="relative border-2 border-dashed border-blue-300 rounded-lg p-4 bg-blue-50/20 group">
      {/* Control Bar */}
      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsEditing(true)}
          className="bg-white shadow-sm hover:bg-blue-50"
        >
          <Settings className="w-4 h-4 mr-1" />
          Settings
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={onDelete}
          className="shadow-sm"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Settings Dialog */}
      <BlogCarouselSettingsDialog
        open={isEditing}
        onOpenChange={setIsEditing}
        settings={editContent}
        onSave={(newSettings: BlogCarouselBlockContent) => {
          setEditContent(newSettings);
          onUpdate(newSettings);
        }}
      />

      {/* Preview */}
      <div className="pointer-events-none">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-700 flex items-center gap-2">
            <Newspaper className="w-5 h-5" />
            {editContent.title || 'Tin tức'} (Preview)
          </h2>
          {editContent.showNavigation && (
            <div className="flex gap-2">
              <Button variant="outline" size="icon" disabled>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" disabled>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="bg-white p-4 rounded border">
          <p className="text-sm text-gray-600">
            📰 {blogs.length} bài viết • 
            {editContent.filterType === 'all' && ' Tất cả'}
            {editContent.filterType === 'featured' && ' Nổi bật'}
            {editContent.filterType === 'recent' && ' Mới nhất'}
            {editContent.filterType === 'category' && ` Danh mục: ${editContent.categoryId || 'Chưa chọn'}`}
          </p>
          
          {loading && <p className="text-sm text-gray-500 mt-2">Đang tải...</p>}
        </div>
      </div>
    </div>
  );
};

export default BlogCarouselBlock;
