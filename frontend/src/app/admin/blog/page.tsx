'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { GET_BLOGS, DELETE_BLOG } from '@/graphql/blog.queries';
import { AdvancedTable, ColumnDef, TableConfig } from '@/components/ui/advanced-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Edit, Trash2, Plus, Eye, FileText, TrendingUp, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

// Blog Row Type matching GraphQL response
interface BlogRow {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  author: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  thumbnailUrl?: string;
  featuredImage?: string;
  status: string;
  viewCount: number;
  publishedAt?: string;
  createdAt: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  isFeatured: boolean;
  isPublished: boolean;
  actions?: any; // Virtual field for actions column
}

export default function AdminBlogPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedBlogs, setSelectedBlogs] = useState<BlogRow[]>([]);

  // GraphQL Query - Request ALL statuses for admin
  const { data, loading, refetch } = useQuery(GET_BLOGS, {
    variables: { 
      page, 
      limit,
      search: search || undefined,
      categoryId: categoryFilter || undefined,
      statusFilter: 'ALL', // Show all statuses in admin
    },
  });

  // Delete Mutation
  const [deleteBlog] = useMutation(DELETE_BLOG, {
    onCompleted: () => {
      toast.success('Đã xóa bài viết thành công');
      refetch();
      setShowDeleteDialog(false);
      setSelectedBlogs([]);
    },
    onError: (error) => toast.error('Xóa thất bại: ' + error.message),
  });

  const blogs: BlogRow[] = data?.blogs?.items || [];
  const total = data?.blogs?.total || 0;

  // Stats calculation
  const stats = useMemo(() => {
    return {
      total,
      published: blogs.filter(b => b.status === 'PUBLISHED').length,
      draft: blogs.filter(b => b.status === 'DRAFT').length,
      featured: blogs.filter(b => b.isFeatured).length,
    };
  }, [blogs, total]);

  // Get image URL
  const getImageUrl = (blog: BlogRow) => {
    const url = blog.featuredImage || blog.thumbnailUrl;
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:12001';
    return `${apiBase}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    for (const blog of selectedBlogs) {
      await deleteBlog({ variables: { id: blog.id } });
    }
  };

  // Column definitions
  const columns: ColumnDef<BlogRow>[] = [
    {
      field: 'thumbnailUrl',
      headerName: 'Hình ảnh',
      width: 100,
      pinned: 'left',
      sortable: false,
      filterable: false,
      cellRenderer: ({ data }) => (
        <div className="flex items-center justify-center p-1">
          {getImageUrl(data) ? (
            <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-md overflow-hidden border">
              <Image
                src={getImageUrl(data)}
                alt={data.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 48px, 64px"
              />
            </div>
          ) : (
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-md bg-gray-100 flex items-center justify-center">
              <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
            </div>
          )}
        </div>
      ),
    },
    {
      field: 'title',
      headerName: 'Tiêu đề',
      width: 300,
      minWidth: 200,
      sortable: true,
      filterable: true,
      resizable: true,
      cellRenderer: ({ value, data }) => (
        <div className="space-y-1">
          <div className="font-medium text-sm sm:text-base line-clamp-2">
            {value}
          </div>
          {data.excerpt && (
            <div className="text-xs text-gray-500 line-clamp-1">
              {data.excerpt}
            </div>
          )}
        </div>
      ),
    },
    {
      field: 'author',
      headerName: 'Tác giả',
      width: 150,
      sortable: true,
      filterable: true,
      valueGetter: (row) => {
        const author = row.author;
        if (!author) return '-';
        return `${author.firstName || ''} ${author.lastName || ''}`.trim() || author.username || '-';
      },
      cellRenderer: ({ data }) => {
        const author = data.author;
        if (!author) return <div className="text-sm">-</div>;
        const fullName = `${author.firstName || ''} ${author.lastName || ''}`.trim();
        return (
          <div className="text-sm">
            {fullName || author.username}
          </div>
        );
      },
    },
    {
      field: 'category',
      headerName: 'Danh mục',
      width: 140,
      type: 'select',
      sortable: true,
      filterable: true,
      valueGetter: (row) => {
        return row.category?.name || '-';
      },
      cellRenderer: ({ data }) => (
        <span className="text-sm">
          {data.category?.name || '-'}
        </span>
      ),
    },
    {
      field: 'status',
      headerName: 'Trạng thái',
      width: 120,
      type: 'select',
      sortable: true,
      filterable: true,
      filterOptions: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
      cellRenderer: ({ value }) => {
        const statusConfig = {
          PUBLISHED: { color: 'bg-green-100 text-green-800', label: 'Đã xuất bản' },
          DRAFT: { color: 'bg-gray-100 text-gray-800', label: 'Bản nháp' },
          ARCHIVED: { color: 'bg-red-100 text-red-800', label: 'Lưu trữ' },
        };
        const config = statusConfig[value as keyof typeof statusConfig] || statusConfig.DRAFT;
        return (
          <Badge className={`${config.color} text-xs`}>
            {config.label}
          </Badge>
        );
      },
    },
    {
      field: 'isFeatured',
      headerName: 'Nổi bật',
      width: 100,
      type: 'boolean',
      sortable: true,
      filterable: true,
      cellRenderer: ({ value }) => (
        <div className="flex justify-center">
          {value ? (
            <TrendingUp className="h-5 w-5 text-yellow-500" />
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      ),
    },
    {
      field: 'viewCount',
      headerName: 'Lượt xem',
      width: 100,
      type: 'number',
      sortable: true,
      filterable: true,
      cellRenderer: ({ value }) => (
        <div className="text-sm font-medium text-center">
          {value?.toLocaleString() || 0}
        </div>
      ),
    },
    {
      field: 'publishedAt',
      headerName: 'Ngày xuất bản',
      width: 140,
      type: 'date',
      sortable: true,
      filterable: true,
      cellRenderer: ({ value }) => (
        <div className="text-sm">
          {value ? new Date(value).toLocaleDateString('vi-VN') : '-'}
        </div>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Ngày tạo',
      width: 140,
      type: 'date',
      sortable: true,
      filterable: true,
      cellRenderer: ({ value }) => (
        <div className="text-sm">
          {new Date(value).toLocaleDateString('vi-VN')}
        </div>
      ),
    },
    {
      field: 'actions',
      headerName: 'Thao tác',
      width: 150,
      pinned: 'right',
      sortable: false,
      filterable: false,
      cellRenderer: ({ data }) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(`/bai-viet/${data.slug}`, '_blank')}
            title="Xem bài viết"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/admin/blog/${data.id}/edit`)}
            title="Chỉnh sửa"
          >
            <Edit className="h-4 w-4 text-blue-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedBlogs([data]);
              setShowDeleteDialog(true);
            }}
            title="Xóa"
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      ),
    },
  ];

  // Table Config
  const tableConfig: TableConfig = {
    enableRowSelection: true,
    enableColumnResizing: true,
    enableColumnPinning: true,
    enableColumnHiding: true,
    enableSorting: true,
    enableFiltering: true,
    rowHeight: 80,
    showPagination: true,
    pageSize: limit,
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Quản lý Blog</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý bài viết blog với bảng nâng cao
          </p>
        </div>
        <Link href="/admin/blog/create">
          <Button className="w-full sm:w-auto">
            <Plus className="h-5 w-5 mr-2" />
            Tạo bài viết mới
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Tổng bài viết
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Đã xuất bản
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.published}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Bản nháp
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.draft}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Nổi bật
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.featured}</div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Table */}
      <Card>
        <CardContent className="p-0">
          <AdvancedTable
            data={blogs}
            columns={columns}
            config={tableConfig}
            loading={loading}
            onRowSelect={setSelectedBlogs}
          />
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedBlogs.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white shadow-lg rounded-lg p-4 border z-50">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">
              Đã chọn {selectedBlogs.length} bài viết
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Xóa đã chọn
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedBlogs([])}
            >
              Hủy
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa {selectedBlogs.length} bài viết đã chọn? 
              Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleBulkDelete}>
              Xác nhận xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
