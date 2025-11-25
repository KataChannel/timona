'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface BlogCardProps {
  blog: {
    id: string;
    title: string;
    slug: string;
    shortDescription: string;
    excerpt?: string;
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
    tags?: Array<{
      id: string;
      name: string;
      slug: string;
    }>;
    isFeatured: boolean;
  };
  className?: string;
  showCategory?: boolean;
  showTags?: boolean;
}

export function BlogCard({
  blog,
  className,
  showCategory = true,
  showTags = false,
}: BlogCardProps) {
  const formattedDate = format(new Date(blog.publishedAt), 'dd MMM yyyy', { locale: vi });

  return (
    <Card className={cn('group overflow-hidden hover:shadow-lg transition-shadow duration-300', className)}>
      {/* Thumbnail */}
      <div className="relative overflow-hidden aspect-video bg-gray-100">
        <img
          src={blog.thumbnailUrl || '/placeholder-blog.png'}
          alt={blog.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {blog.isFeatured && (
          <Badge className="absolute top-3 right-3 bg-red-500 hover:bg-red-600">Nổi bật</Badge>
        )}
      </div>

      <CardHeader className="pb-3">
        {/* Category */}
        {showCategory && blog.category && (
          <Badge variant="outline" className="w-fit text-xs mb-2">
            {blog.category.name}
          </Badge>
        )}

        {/* Title */}
        <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-blue-600 transition-colors">
          {blog.title}
        </h3>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2">
          {blog.shortDescription || blog.excerpt || blog.title}
        </p>

        {/* Tags */}
        {showTags && blog.tags && blog.tags.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {blog.tags.slice(0, 2).map((tag) => (
              <Badge key={tag.id} variant="secondary" className="text-xs">
                #{tag.name}
              </Badge>
            ))}
            {blog.tags.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{blog.tags.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Meta Info */}
        <div className="flex flex-wrap gap-3 text-xs text-gray-500 pt-2 border-t">
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {formattedDate}
          </div>
          <div className="flex items-center gap-1">
            <User className="h-3.5 w-3.5" />
            {blog.author?.firstName && blog.author?.lastName 
              ? `${blog.author.firstName} ${blog.author.lastName}`
              : blog.author?.username || 'Admin'}
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {blog.viewCount.toLocaleString('vi-VN')}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
