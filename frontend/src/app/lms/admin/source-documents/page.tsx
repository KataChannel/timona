'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Pagination, { usePagination } from '@/components/ui/pagination';
import {
  Plus,
  Search,
  FileText,
  Video,
  Link as LinkIcon,
  File,
  Music,
  Image as ImageIcon,
  Loader2,
  Eye,
  Download,
  Trash2,
  Edit,
  ExternalLink,
  Filter,
  Sparkles,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  GET_SOURCE_DOCUMENTS,
  GET_SOURCE_DOCUMENT_CATEGORIES,
  DELETE_SOURCE_DOCUMENT,
} from '@/graphql/lms/source-documents';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Type icons mapping
const TYPE_ICONS = {
  FILE: File,
  VIDEO: Video,
  TEXT: FileText,
  AUDIO: Music,
  LINK: LinkIcon,
  IMAGE: ImageIcon,
};

// Type colors
const TYPE_COLORS = {
  FILE: 'text-blue-600 bg-blue-50',
  VIDEO: 'text-purple-600 bg-purple-50',
  TEXT: 'text-green-600 bg-green-50',
  AUDIO: 'text-orange-600 bg-orange-50',
  LINK: 'text-cyan-600 bg-cyan-50',
  IMAGE: 'text-pink-600 bg-pink-50',
};

// Status badges
const STATUS_CONFIG = {
  DRAFT: { variant: 'secondary' as const, label: 'Nháp' },
  PROCESSING: { variant: 'default' as const, label: 'Đang xử lý' },
  PUBLISHED: { variant: 'default' as const, label: 'Đã xuất bản' },
  ARCHIVED: { variant: 'outline' as const, label: 'Lưu trữ' },
};

export default function SourceDocumentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<any>(null);

  // Pagination
  const {
    currentPage,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    resetPagination,
  } = usePagination(12);

  // GraphQL queries
  const { data: categoriesData } = useQuery(GET_SOURCE_DOCUMENT_CATEGORIES);

  const { data, loading, error, refetch } = useQuery(GET_SOURCE_DOCUMENTS, {
    variables: {
      page: currentPage,
      limit: pageSize,
    },
    fetchPolicy: 'cache-and-network',
  });

  const [deleteDocument, { loading: deleting }] = useMutation(DELETE_SOURCE_DOCUMENT, {
    onCompleted: () => {
      toast({
        type: 'success',
        title: 'Thành công',
        description: 'Đã xóa tài liệu nguồn',
      });
      setDeleteDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast({
        type: 'error',
        title: 'Lỗi',
        description: error.message,
      });
    },
  });

  const documents = data?.sourceDocuments || [];
  const categories = categoriesData?.sourceDocumentCategories || [];

  // Client-side filtering
  const filteredDocuments = documents.filter((doc: any) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.tags || []).some((tag: string) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesType = filterType === 'all' || doc.type === filterType;
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
    const matchesCategory =
      filterCategory === 'all' || doc.categoryId === filterCategory;

    return matchesSearch && matchesType && matchesStatus && matchesCategory;
  });

  // Pagination calculations
  const totalFilteredItems = filteredDocuments.length;
  const totalPages = Math.ceil(totalFilteredItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedDocuments = filteredDocuments.slice(startIndex, endIndex);

  // Reset pagination when filters change
  useEffect(() => {
    resetPagination();
  }, [searchQuery, filterType, filterStatus, filterCategory, resetPagination]);

  // Refetch when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refetch();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [refetch]);

  const handleDelete = (document: any) => {
    setDocumentToDelete(document);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (documentToDelete) {
      deleteDocument({ variables: { id: documentToDelete.id } });
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '-';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    return `${(mb / 1024).toFixed(1)} GB`;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Tài liệu nguồn
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Quản lý tài liệu, video, file dùng để tạo khóa học
          </p>
        </div>
        <Button onClick={() => router.push('/lms/admin/source-documents/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm tài liệu
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm tài liệu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-2">
          {/* Type filters */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <Button
              variant={filterType === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterType('all')}
              size="sm"
            >
              Tất cả
            </Button>
            {Object.keys(TYPE_ICONS).map((type) => {
              const Icon = TYPE_ICONS[type as keyof typeof TYPE_ICONS];
              return (
                <Button
                  key={type}
                  variant={filterType === type ? 'default' : 'outline'}
                  onClick={() => setFilterType(type)}
                  size="sm"
                >
                  <Icon className="w-3 h-3 mr-1" />
                  {type}
                </Button>
              );
            })}
          </div>

          {/* Status filters */}
          <div className="flex items-center gap-2 border-l pl-2">
            {Object.entries(STATUS_CONFIG).map(([status, config]) => (
              <Button
                key={status}
                variant={filterStatus === status ? 'default' : 'outline'}
                onClick={() => setFilterStatus(status)}
                size="sm"
              >
                {config.label}
              </Button>
            ))}
          </div>

          {/* Category filter */}
          {categories.length > 0 && (
            <div className="flex items-center gap-2 border-l pl-2">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-1 text-sm border rounded-md"
              >
                <option value="all">Tất cả danh mục</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div className="text-center py-8 sm:py-12">
          <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 mx-auto animate-spin" />
          <p className="text-sm sm:text-base text-gray-500 mt-4">
            Đang tải tài liệu...
          </p>
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-red-600">Lỗi: {error.message}</p>
          </CardContent>
        </Card>
      ) : paginatedDocuments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Không tìm thấy tài liệu nào</p>
            <Button
              className="mt-4"
              onClick={() => router.push('/lms/admin/source-documents/new')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm tài liệu đầu tiên
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedDocuments.map((document: any) => {
              const TypeIcon = TYPE_ICONS[document.type as keyof typeof TYPE_ICONS];
              const typeColor = TYPE_COLORS[document.type as keyof typeof TYPE_COLORS];
              const statusConfig = STATUS_CONFIG[document.status as keyof typeof STATUS_CONFIG];

              return (
                <Card
                  key={document.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() =>
                    router.push(`/lms/admin/source-documents/${document.id}`)
                  }
                >
                  <CardHeader className="pb-3">
                    {/* Thumbnail or type icon */}
                    {document.thumbnailUrl ? (
                      <div className="w-full h-32 mb-3 rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={document.thumbnailUrl}
                          alt={document.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        className={`w-full h-32 mb-3 rounded-lg flex items-center justify-center ${typeColor}`}
                      >
                        <TypeIcon className="w-12 h-12" />
                      </div>
                    )}

                    <CardTitle className="text-base line-clamp-2">
                      {document.title}
                    </CardTitle>

                    {document.description && (
                      <CardDescription className="line-clamp-2">
                        {document.description}
                      </CardDescription>
                    )}

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant={statusConfig.variant} className="text-xs">
                        {statusConfig.label}
                      </Badge>
                      {document.isAiAnalyzed && (
                        <Badge variant="outline" className="text-xs gap-1">
                          <Sparkles className="w-3 h-3" />
                          AI
                        </Badge>
                      )}
                      {document.category && (
                        <Badge
                          variant="outline"
                          className="text-xs"
                          style={{ color: document.category.color }}
                        >
                          {document.category.name}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* File info */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      {document.fileName && (
                        <div className="flex items-center gap-1">
                          <File className="w-3 h-3" />
                          <span className="truncate">{document.fileName}</span>
                        </div>
                      )}
                      {document.fileSize && (
                        <div className="flex items-center gap-1">
                          <span>{formatFileSize(document.fileSize)}</span>
                        </div>
                      )}
                      {document.duration && (
                        <div className="flex items-center gap-1">
                          <span>{formatDuration(document.duration)}</span>
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {document.viewCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          {document.downloadCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <LinkIcon className="w-3 h-3" />
                          {document.usageCount}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/lms/admin/source-documents/${document.id}`);
                        }}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Sửa
                      </Button>
                      {document.url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(document.url, '_blank');
                          }}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(document);
                        }}
                      >
                        <Trash2 className="w-3 h-3 text-red-600" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {totalFilteredItems > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalFilteredItems}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              loading={loading}
              showPageSize={true}
              pageSizeOptions={[12, 24, 48]}
            />
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn xóa tài liệu "{documentToDelete?.title}"?
              <br />
              <span className="text-red-600 font-medium">
                Hành động này không thể hoàn tác!
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                'Xóa'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
