'use client';

import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_RELATED_BLOGS } from '@/graphql/blog.queries';
import { BlogCard } from './BlogCard';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface RelatedBlogsProps {
  categoryId: string;
  excludeBlogId: string;
  limit?: number;
  title?: string;
  className?: string;
}

interface RelatedBlogsData {
  relatedBlogs: Array<{
    id: string;
    title: string;
    slug: string;
    shortDescription: string;
    thumbnailUrl: string;
    author: {
      id: string;
      username: string;
      firstName: string;
      lastName: string;
    };
    publishedAt: string;
    viewCount: number;
    category: {
      id: string;
      name: string;
      slug: string;
    };
    isFeatured: boolean;
  }>;
}

export function RelatedBlogs({
  categoryId,
  excludeBlogId,
  limit = 3,
  title = 'Bài viết liên quan',
  className,
}: RelatedBlogsProps) {
  const { data, loading, error } = useQuery<RelatedBlogsData>(GET_RELATED_BLOGS, {
    variables: {
      categoryId,
      excludeBlogId,
      limit,
    },
    errorPolicy: 'all',
  });

  const blogs = data?.relatedBlogs || [];

  if (loading) {
    return (
      <div className={cn('space-y-6', className)}>
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="aspect-video rounded-lg" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !blogs || blogs.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-6', className)}>
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((blog) => (
          <Link key={blog.id} href={`/website/baiviet/${blog.slug}`}>
            <BlogCard
              blog={{
                ...blog,
                excerpt: blog.shortDescription,
                shortDescription: blog.shortDescription,
                tags: [],
              }}
              showCategory={true}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
