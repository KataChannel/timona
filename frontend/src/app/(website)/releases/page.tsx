'use client';

import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_SYSTEM_RELEASES } from '@/graphql/release-hub/release.queries';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Calendar, Download, Eye, Package, Search } from 'lucide-react';

export default function ReleasesPage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string | null>(null);

  const { data, loading, error } = useQuery(GET_SYSTEM_RELEASES, {
    variables: {
      where: {
        status: statusFilter,
        search: searchTerm || undefined,
      },
      take: 20,
      skip: 0,
    },
  });

  const getReleaseTypeColor = (type: string) => {
    switch (type) {
      case 'MAJOR':
        return 'bg-red-500 text-white';
      case 'MINOR':
        return 'bg-blue-500 text-white';
      case 'PATCH':
        return 'bg-green-500 text-white';
      case 'HOTFIX':
        return 'bg-orange-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RELEASED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Phiên Bản Phát Hành</h1>
        <p className="text-muted-foreground">
          Xem các phiên bản mới nhất và changelog chi tiết
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm phiên bản..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={statusFilter === null ? 'default' : 'outline'}
            onClick={() => setStatusFilter(null)}
            size="sm"
          >
            Tất cả
          </Button>
          <Button
            variant={statusFilter === 'RELEASED' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('RELEASED')}
            size="sm"
          >
            Đã phát hành
          </Button>
          <Button
            variant={statusFilter === 'SCHEDULED' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('SCHEDULED')}
            size="sm"
          >
            Sắp ra mắt
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-20 mb-2" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-500">Có lỗi xảy ra khi tải danh sách phiên bản</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Thử lại
          </Button>
        </div>
      )}

      {/* Releases Grid */}
      {!loading && !error && data?.systemReleases && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.systemReleases.map((release: any) => (
            <Card key={release.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge className={getReleaseTypeColor(release.releaseType)}>
                    {release.releaseType}
                  </Badge>
                  <Badge variant="outline" className={getStatusColor(release.status)}>
                    {release.status === 'RELEASED' ? 'Đã phát hành' : 
                     release.status === 'SCHEDULED' ? 'Sắp ra mắt' : 'Bản nháp'}
                  </Badge>
                </div>
                <CardTitle className="text-xl">
                  {release.version}
                </CardTitle>
                <CardDescription className="font-semibold text-base text-foreground">
                  {release.title}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                  {release.summary || release.description}
                </p>

                {/* Stats */}
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    <span className="text-green-600 font-medium">{release.features?.length || 0}</span> Features
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-blue-600 font-medium">{release.improvements?.length || 0}</span> Cải tiến
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-orange-600 font-medium">{release.bugfixes?.length || 0}</span> Sửa lỗi
                  </div>
                </div>

                {/* Meta info */}
                <div className="flex flex-wrap gap-4 mt-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {release.releaseDate
                      ? formatDistanceToNow(new Date(release.releaseDate), {
                          addSuffix: true,
                          locale: vi,
                        })
                      : 'Chưa xác định'}
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {release.viewCount}
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="h-3 w-3" />
                    {release.downloadCount}
                  </div>
                </div>
              </CardContent>

              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/releases/${release.slug}`}>
                    Xem chi tiết
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && data?.systemReleases?.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Không tìm thấy phiên bản nào</p>
        </div>
      )}
    </div>
  );
}
