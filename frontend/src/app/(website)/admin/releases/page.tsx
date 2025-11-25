'use client';

import { useQuery, useMutation } from '@apollo/client';
import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  GET_SYSTEM_RELEASES,
  DELETE_SYSTEM_RELEASE,
  PUBLISH_SYSTEM_RELEASE,
} from '@/graphql/release-hub/release.queries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Plus, MoreVertical, Edit, Trash, Eye, Download, Send } from 'lucide-react';

export default function AdminReleasesPage() {
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRelease, setSelectedRelease] = useState<any>(null);

  const { data, loading, error, refetch } = useQuery(GET_SYSTEM_RELEASES, {
    variables: { status: undefined },
  });

  const [deleteRelease, { loading: deleting }] = useMutation(DELETE_SYSTEM_RELEASE, {
    onCompleted: () => {
      toast({
        type: 'success',
        title: 'Thành công',
        description: 'Release đã được xóa',
      });
      setDeleteDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast({
        type: 'error',
        title: 'Lỗi',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const [publishRelease, { loading: publishing }] = useMutation(PUBLISH_SYSTEM_RELEASE, {
    onCompleted: () => {
      toast({
        type: 'success',
        title: 'Thành công',
        description: 'Release đã được phát hành',
      });
      refetch();
    },
    onError: (error) => {
      toast({
        type: 'error',
        title: 'Lỗi',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleDelete = async () => {
    if (selectedRelease) {
      await deleteRelease({ variables: { id: selectedRelease.id } });
    }
  };

  const handlePublish = async (id: string) => {
    await publishRelease({ variables: { id } });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      DRAFT: { variant: 'outline', label: 'Nháp' },
      SCHEDULED: { variant: 'secondary', label: 'Đã lên lịch' },
      RELEASED: { variant: 'default', label: 'Đã phát hành' },
      ARCHIVED: { variant: 'outline', label: 'Đã lưu trữ' },
    };
    const config = variants[status] || variants.DRAFT;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      MAJOR: 'bg-red-500 text-white',
      MINOR: 'bg-blue-500 text-white',
      PATCH: 'bg-green-500 text-white',
      HOTFIX: 'bg-orange-500 text-white',
    };
    return <Badge className={colors[type] || colors.PATCH}>{type}</Badge>;
  };

  if (error) {
    return (
      <div className="container max-w-7xl py-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-red-500 mb-4">Có lỗi xảy ra: {error.message}</p>
            <Button onClick={() => window.location.reload()}>Thử lại</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản Lý Releases</h1>
          <p className="text-gray-600">Quản lý phiên bản và changelog hệ thống</p>
        </div>
        <Button asChild>
          <Link href="/admin/releases/new">
            <Plus className="h-4 w-4 mr-2" />
            Tạo Release Mới
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tổng số releases</CardDescription>
            <CardTitle className="text-3xl">{data?.systemReleases?.length || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Đã phát hành</CardDescription>
            <CardTitle className="text-3xl">
              {data?.systemReleases?.filter((r: any) => r.status === 'RELEASED').length || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Nháp</CardDescription>
            <CardTitle className="text-3xl">
              {data?.systemReleases?.filter((r: any) => r.status === 'DRAFT').length || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Lượt tải xuống</CardDescription>
            <CardTitle className="text-3xl">
              {data?.systemReleases?.reduce((acc: number, r: any) => acc + r.downloadCount, 0) || 0}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách releases</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-gray-200 animate-pulse rounded" />
              ))}
            </div>
          ) : data?.systemReleases?.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">Chưa có release nào</p>
              <Button asChild>
                <Link href="/admin/releases/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo Release Đầu Tiên
                </Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Version</TableHead>
                    <TableHead>Tiêu đề</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày phát hành</TableHead>
                    <TableHead className="text-center">Lượt xem</TableHead>
                    <TableHead className="text-center">Tải xuống</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.systemReleases?.map((release: any) => (
                    <TableRow key={release.id}>
                      <TableCell className="font-mono font-semibold">
                        {release.version}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{release.title}</TableCell>
                      <TableCell>{getTypeBadge(release.releaseType)}</TableCell>
                      <TableCell>{getStatusBadge(release.status)}</TableCell>
                      <TableCell>
                        {release.publishedAt
                          ? format(new Date(release.publishedAt), 'PP', { locale: vi })
                          : '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Eye className="h-4 w-4 text-gray-400" />
                          {release.viewCount}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Download className="h-4 w-4 text-gray-400" />
                          {release.downloadCount}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/releases/${release.slug}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                Xem
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/releases/${release.id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Chỉnh sửa
                              </Link>
                            </DropdownMenuItem>
                            {release.status === 'DRAFT' && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handlePublish(release.id)}
                                  disabled={publishing}
                                >
                                  <Send className="h-4 w-4 mr-2" />
                                  Phát hành
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedRelease(release);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-red-600"
                            >
                              <Trash className="h-4 w-4 mr-2" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa release{' '}
              <span className="font-semibold">{selectedRelease?.version}</span>? Hành động này
              không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
