'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { GET_BLOG_BY_SLUG, GET_BLOG_CATEGORIES } from '@/graphql/blog.queries';
import {
  Calendar,
  User,
  Clock,
  Eye,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  MessageCircle,
  Send,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [commentContent, setCommentContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  // Fetch blog post
  const { data, loading, error } = useQuery(GET_BLOG_BY_SLUG, {
    variables: { slug },
    skip: !slug,
  });

  // Fetch categories for sidebar
  const { data: categoriesData } = useQuery(GET_BLOG_CATEGORIES);

  const blog = data?.blogBySlug;
  const categories = categoriesData?.blogCategories || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    alert('Chức năng bình luận đang được phát triển');
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = blog?.title;

    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-16 h-16 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </Card>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 sm:p-8 text-center">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              Không tìm thấy bài viết
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              Bài viết bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
            </p>
            <Button onClick={() => router.push('/bai-viet')} className="w-full sm:w-auto">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại danh sách
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Category sidebar component
  const CategorySidebar = () => (
    <div className="space-y-0">
      {/* Green Header */}
      <div className="bg-green-600 text-white px-4 py-3 rounded-t-lg">
        <h2 className="font-bold text-base uppercase">DANH MỤC SẢN PHẨM</h2>
      </div>

      {/* Categories List */}
      <div className="border border-t-0 rounded-b-lg overflow-hidden">
        <div className="divide-y">
          {categories.map((category: any) => (
            <Link
              key={category.id}
              href={`/bai-viet?categoryId=${category.id}`}
              className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 transition-colors text-gray-700 hover:text-green-600"
            >
              <span className="text-lg">
                {category.icon || '📂'}
              </span>
              <span className="text-sm">{category.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Additional Section */}
      <div className="mt-6 bg-green-600 text-white px-4 py-3 rounded-t-lg">
        <h2 className="font-bold text-sm uppercase">Sản Phẩm Giá Rẻ</h2>
      </div>
      <div className="border border-t-0 rounded-b-lg p-4 bg-white">
        <div className="text-center text-sm text-gray-500">
          <img src="/placeholder.png" alt="" className="w-12 h-12 mx-auto mb-2 bg-gray-100 rounded" onError={(e) => e.currentTarget.style.display = 'none'} />
          <span className="text-sm text-gray-700">Khổ qua rừng</span>
        </div>
      </div>
    </div>
  );

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
            {/* Article Card */}
            <article className="bg-white rounded-lg shadow-sm p-6">
              {/* Featured Image */}
              {blog.featuredImage && (
                <div className="relative h-64 sm:h-80 mb-6 rounded-lg overflow-hidden">
                  <Image
                    src={blog.featuredImage}
                    alt={blog.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(blog.publishedAt || blog.createdAt)}
                </span>
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {blog.author?.fullName || 'Admin'}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {blog.viewCount} lượt xem
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 uppercase">
                {blog.title}
              </h1>

              {/* Short Description */}
              {blog.shortDescription && (
                <div className="text-gray-700 mb-6 pb-6 border-b">
                  {blog.shortDescription}
                </div>
              )}

              {/* Content */}
              <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}
