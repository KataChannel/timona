'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { GET_BLOG_CATEGORIES } from '@/graphql/blog.queries';
import { GET_CATEGORIES } from '@/graphql/category.queries';
import { ContentNavigator } from '@/components/content/ContentNavigator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Package,
  Folder,
  Plus,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export default function ContentManagementPage() {
  const { data: blogCatData } = useQuery(GET_BLOG_CATEGORIES);
  const { data: prodCatData } = useQuery(GET_CATEGORIES, {
    variables: { input: { page: 1, limit: 100 } },
  });

  const blogCategoriesCount = blogCatData?.blogCategories?.length || 0;
  const productCategoriesCount = prodCatData?.categories?.total || 0;
  const totalBlogPosts =
    blogCatData?.blogCategories?.reduce((sum: number, cat: any) => sum + (cat.postCount || 0), 0) || 0;
  const totalProducts =
    prodCatData?.categories?.items?.reduce(
      (sum: number, cat: any) => sum + (cat._count?.products || 0),
      0
    ) || 0;

  const stats = [
    {
      title: 'Tổng Bài Viết',
      value: totalBlogPosts,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      link: '/admin/blog',
      action: 'Tạo bài viết',
      actionLink: '/admin/blog/create',
    },
    {
      title: 'Danh Mục Blog',
      value: blogCategoriesCount,
      icon: Folder,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      link: '/admin/blog/categories',
      action: 'Quản lý',
      actionLink: '/admin/blog/categories',
    },
    {
      title: 'Tổng Sản Phẩm',
      value: totalProducts,
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      link: '/admin/products',
      action: 'Tạo sản phẩm',
      actionLink: '/admin/products/create',
    },
    {
      title: 'Danh Mục SP',
      value: productCategoriesCount,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      link: '/admin/categories',
      action: 'Quản lý',
      actionLink: '/admin/categories',
    },
  ];

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Quản Lý Nội Dung</h1>
        <p className="text-muted-foreground mt-1">
          Quản lý bài viết, sản phẩm và danh mục
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">{stat.value}</div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={stat.actionLink}>
                      <Plus className="h-3 w-3 mr-1" />
                      {stat.action}
                    </Link>
                  </Button>
                  <Button size="sm" variant="ghost" asChild>
                    <Link href={stat.link}>
                      Xem tất cả
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Thao Tác Nhanh</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button asChild className="h-auto flex-col py-6">
              <Link href="/admin/blog/create">
                <FileText className="h-8 w-8 mb-2" />
                <span>Tạo Bài Viết Mới</span>
              </Link>
            </Button>
            <Button asChild className="h-auto flex-col py-6" variant="secondary">
              <Link href="/admin/blog/categories">
                <Folder className="h-8 w-8 mb-2" />
                <span>Quản Lý Danh Mục Blog</span>
              </Link>
            </Button>
            <Button asChild className="h-auto flex-col py-6" variant="secondary">
              <Link href="/admin/products/create">
                <Package className="h-8 w-8 mb-2" />
                <span>Tạo Sản Phẩm Mới</span>
              </Link>
            </Button>
            <Button asChild className="h-auto flex-col py-6" variant="outline">
              <Link href="/admin/categories">
                <TrendingUp className="h-8 w-8 mb-2" />
                <span>Quản Lý Danh Mục SP</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Content Navigator */}
      <ContentNavigator />

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Liên Kết Nhanh</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Quản Lý Blog
              </h3>
              <div className="space-y-2">
                <Link
                  href="/admin/blog"
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  • Danh sách tất cả bài viết
                </Link>
                <Link
                  href="/admin/blog/create"
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  • Tạo bài viết mới
                </Link>
                <Link
                  href="/admin/blog/categories"
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  • Quản lý danh mục blog
                </Link>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Package className="h-4 w-4" />
                Quản Lý Sản Phẩm
              </h3>
              <div className="space-y-2">
                <Link
                  href="/admin/products"
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  • Danh sách tất cả sản phẩm
                </Link>
                <Link
                  href="/admin/products/create"
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  • Tạo sản phẩm mới
                </Link>
                <Link
                  href="/admin/categories"
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  • Quản lý danh mục sản phẩm
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
