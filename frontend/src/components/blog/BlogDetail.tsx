'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Calendar, User, Eye, Share2, Heart } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface BlogDetailProps {
  blog: {
    id: string;
    title: string;
    slug: string;
    content: string;
    shortDescription: string;
    author: {
      id: string;
      username: string;
      firstName: string;
      lastName: string;
    };
    thumbnailUrl: string;
    bannerUrl?: string;
    viewCount: number;
    publishedAt: string;
    updatedAt: string;
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
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
  };
  onShare?: () => void;
  onToggleFavorite?: (blogId: string) => void;
  className?: string;
}

export function BlogDetail({
  blog,
  onShare,
  onToggleFavorite,
  className,
}: BlogDetailProps) {
  const [isFavorite, setIsFavorite] = React.useState(false);
  const formattedDate = format(new Date(blog.publishedAt), 'dd MMMM yyyy', { locale: vi });
  const formattedUpdateDate = format(new Date(blog.updatedAt), 'dd MMMM yyyy', { locale: vi });

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    onToggleFavorite?.(blog.id);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: blog.title,
          text: blog.shortDescription,
          url: window.location.href,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert('Đã sao chép liên kết!');
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
    onShare?.();
  };

  return (
    <div className={cn('space-y-8', className)}>
      {/* Header */}
      <div className="space-y-4">
        {/* Category */}
        <div>
          <Badge variant="outline" className="mb-3">
            {blog.category.name}
          </Badge>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold leading-tight">{blog.title}</h1>

        {/* Meta Info */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-600 pt-4 pb-4 border-y">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Tác giả: <strong>
              {blog.author?.firstName && blog.author?.lastName 
                ? `${blog.author.firstName} ${blog.author.lastName}`
                : blog.author?.username || 'Admin'}
            </strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span>{blog.viewCount.toLocaleString('vi-VN')} lượt xem</span>
          </div>
        </div>

        {/* Short Description */}
        {blog.shortDescription && (
          <p className="text-lg text-gray-700 italic">{blog.shortDescription}</p>
        )}
      </div>

      {/* Banner/Feature Image */}
      {blog.bannerUrl && (
        <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
          <img
            src={blog.bannerUrl}
            alt={blog.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      {!blog.bannerUrl && blog.thumbnailUrl && (
        <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
          <img
            src={blog.thumbnailUrl}
            alt={blog.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant={isFavorite ? 'default' : 'outline'}
          size="sm"
          onClick={handleToggleFavorite}
          className="gap-2"
        >
          <Heart className={cn('h-4 w-4', isFavorite && 'fill-current')} />
          {isFavorite ? 'Đã lưu' : 'Lưu bài viết'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          className="gap-2"
        >
          <Share2 className="h-4 w-4" />
          Chia sẻ
        </Button>
      </div>

      {/* Content */}
      <div className="prose prose-sm max-w-none">
        <div
          dangerouslySetInnerHTML={{ __html: blog.content }}
          className="text-gray-800 leading-relaxed space-y-4"
        />
      </div>

      {/* Tags */}
      {blog.tags && blog.tags.length > 0 && (
        <div className="space-y-3 pt-4 border-t">
          <h3 className="font-semibold text-sm">Thẻ:</h3>
          <div className="flex flex-wrap gap-2">
            {blog.tags.map((tag) => (
              <Badge key={tag.id} variant="secondary">
                #{tag.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Update Info */}
      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
        <p>Cập nhật lần cuối: <strong>{formattedUpdateDate}</strong></p>
      </div>

      {/* Author Info */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold">Về tác giả</h3>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700">
            <strong>
              {blog.author?.firstName && blog.author?.lastName 
                ? `${blog.author.firstName} ${blog.author.lastName}`
                : blog.author?.username || 'Admin'}
            </strong> là tác giả của bài viết này. Hãy theo dõi để cập nhật những bài viết mới nhất.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
