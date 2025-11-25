'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { GET_BLOG_CATEGORIES } from '@/graphql/blog.queries';
import { GET_CATEGORY_TREE } from '@/graphql/category.queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Folder,
  FileText,
  Package,
  Plus,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function ContentNavigator() {
  const { data: blogCatData, loading: blogCatLoading } = useQuery(GET_BLOG_CATEGORIES);
  const { data: prodCatData, loading: prodCatLoading } = useQuery(GET_CATEGORY_TREE);

  const blogCategories = blogCatData?.blogCategories || [];
  const productCategories = prodCatData?.categoryTree || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Blog Categories */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle>Danh Mục Bài Viết</CardTitle>
            </div>
            <Button size="sm" asChild>
              <Link href="/admin/blog/categories">
                Quản lý
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {blogCatLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : blogCategories.length === 0 ? (
            <div className="text-center py-8">
              <Folder className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground mb-4">Chưa có danh mục</p>
              <Button size="sm" variant="outline" asChild>
                <Link href="/admin/blog/categories">
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo danh mục
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {blogCategories.slice(0, 6).map((category: any) => (
                <Link
                  key={category.id}
                  href={`/admin/blog?categoryId=${category.id}`}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg',
                    'hover:bg-muted transition-colors group'
                  )}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Folder className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {category.postCount || 0} bài
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ))}
              {blogCategories.length > 6 && (
                <Button variant="ghost" size="sm" className="w-full" asChild>
                  <Link href="/admin/blog/categories">
                    Xem tất cả ({blogCategories.length})
                  </Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Categories */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <CardTitle>Danh Mục Sản Phẩm</CardTitle>
            </div>
            <Button size="sm" asChild>
              <Link href="/admin/categories">
                Quản lý
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {prodCatLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : productCategories.length === 0 ? (
            <div className="text-center py-8">
              <Folder className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground mb-4">Chưa có danh mục</p>
              <Button size="sm" variant="outline" asChild>
                <Link href="/admin/categories">
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo danh mục
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {productCategories.slice(0, 6).map((category: any) => (
                <div key={category.id} className="space-y-1">
                  <Link
                    href={`/admin/products?categoryId=${category.id}`}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-lg',
                      'hover:bg-muted transition-colors group'
                    )}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Folder className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {category._count?.products || 0} SP
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                  {category.children && category.children.length > 0 && (
                    <div className="ml-8 space-y-1">
                      {category.children.slice(0, 3).map((child: any) => (
                        <Link
                          key={child.id}
                          href={`/admin/products?categoryId=${child.id}`}
                          className={cn(
                            'flex items-center justify-between p-2 rounded-lg',
                            'hover:bg-muted/50 transition-colors group text-sm'
                          )}
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <ChevronRight className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">{child.name}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {child._count?.products || 0}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {productCategories.length > 6 && (
                <Button variant="ghost" size="sm" className="w-full" asChild>
                  <Link href="/admin/categories">
                    Xem tất cả ({productCategories.length})
                  </Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ContentNavigator;
