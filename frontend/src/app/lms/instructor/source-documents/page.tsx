'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation } from '@apollo/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  ExternalLink,
  Eye,
  Download,
  BookOpen,
  File,
  Video,
  FileText,
  Music,
  Link as LinkIcon,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Pagination, { usePagination } from '@/components/ui/pagination';
import {
  GET_SOURCE_DOCUMENTS,
  GET_SOURCE_DOCUMENT_CATEGORIES,
  DELETE_SOURCE_DOCUMENT,
} from '@/graphql/lms/source-documents';

const TYPE_ICONS = {
  FILE: File,
  VIDEO: Video,
  TEXT: FileText,
  AUDIO: Music,
  LINK: LinkIcon,
  IMAGE: ImageIcon,
};

const TYPE_COLORS = {
  FILE: 'text-blue-600 bg-blue-50',
  VIDEO: 'text-purple-600 bg-purple-50',
  TEXT: 'text-green-600 bg-green-50',
  AUDIO: 'text-orange-600 bg-orange-50',
  LINK: 'text-cyan-600 bg-cyan-50',
  IMAGE: 'text-pink-600 bg-pink-50',
};

const STATUS_CONFIG = {
  DRAFT: { label: 'Nháp', variant: 'secondary' as const },
  PROCESSING: { label: 'Đang xử lý', variant: 'default' as const },
  PUBLISHED: { label: 'Đã xuất bản', variant: 'default' as const },
  ARCHIVED: { label: 'Lưu trữ', variant: 'outline' as const },
};

export default function InstructorSourceDocumentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);

  const {
    currentPage,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    resetPagination,
  } = usePagination(12); // 12 items per page

  // Queries - Get all documents, will filter by current user on client side
  const { data, loading, error, refetch } = useQuery(GET_SOURCE_DOCUMENTS, {
    variables: {
      filter: {
        title: searchQuery || undefined,
        type: typeFilter !== 'ALL' ? typeFilter : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        categoryId: categoryFilter !== 'ALL' ? categoryFilter : undefined,
      },
      page: currentPage,
      limit: pageSize,
    },
    fetchPolicy: 'cache-and-network',
  });

  const { data: categoriesData } = useQuery(GET_SOURCE_DOCUMENT_CATEGORIES);

  const [deleteDocument, { loading: deleting }] = useMutation(DELETE_SOURCE_DOCUMENT, {
    onCompleted: () => {
      toast({ type: 'success', title: 'Thành công', description: 'Đã xóa tài liệu' });
      setDeleteDialogOpen(false);
      setSelectedDocument(null);
      refetch();
    },
    onError: (error) => {
      toast({ type: 'error', title: 'Lỗi', description: error.message });
    },
  });

  const allDocuments = data?.sourceDocuments || [];
  const categories = categoriesData?.sourceDocumentCategories || [];

  // Filter documents by current user (instructor can only see their own documents)
  const documents = allDocuments.filter((doc: any) => doc.userId === user?.id);
  const total = documents.length;

  // Auto-reset pagination when filters change
  useEffect(() => {
    resetPagination();
  }, [searchQuery, typeFilter, statusFilter, categoryFilter, resetPagination]);

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

  const handleDelete = (doc: any) => {
    setSelectedDocument(doc);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedDocument) {
      deleteDocument({ variables: { id: selectedDocument.id } });
    }
  };

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return null;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return null;
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
            Tài liệu nguồn của tôi
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Quản lý tài liệu giảng dạy của bạn
          </p>
        </div>
        <Link href="/lms/instructor/source-documents/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Thêm tài liệu
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm..."
                className="pl-10"
              />
            </div>

            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Loại tài liệu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả</SelectItem>
                <SelectItem value="FILE">📄 File</SelectItem>
                <SelectItem value="VIDEO">🎥 Video</SelectItem>
                <SelectItem value="TEXT">📝 Văn bản</SelectItem>
                <SelectItem value="AUDIO">🎵 Audio</SelectItem>
                <SelectItem value="LINK">🔗 Liên kết</SelectItem>
                <SelectItem value="IMAGE">🖼️ Hình ảnh</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả</SelectItem>
                <SelectItem value="DRAFT">Nháp</SelectItem>
                <SelectItem value="PROCESSING">Đang xử lý</SelectItem>
                <SelectItem value="PUBLISHED">Đã xuất bản</SelectItem>
                <SelectItem value="ARCHIVED">Lưu trữ</SelectItem>
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả danh mục</SelectItem>
                {categories.map((cat: any) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Documents Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-12 text-center text-red-600">
            Lỗi: {error.message}
          </CardContent>
        </Card>
      ) : documents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Không tìm thấy tài liệu</p>
            <Link href="/lms/instructor/source-documents/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Tạo tài liệu đầu tiên
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {documents.map((doc: any) => {
              const TypeIcon = TYPE_ICONS[doc.type as keyof typeof TYPE_ICONS];
              const typeColorClass = TYPE_COLORS[doc.type as keyof typeof TYPE_COLORS];

              return (
                <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 space-y-3">
                    {/* Thumbnail or Icon */}
                    {doc.thumbnailUrl ? (
                      <img
                        src={doc.thumbnailUrl}
                        alt={doc.title}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ) : (
                      <div className={`w-full h-32 flex items-center justify-center rounded-lg ${typeColorClass}`}>
                        <TypeIcon className="w-12 h-12" />
                      </div>
                    )}

                    {/* Title */}
                    <h3 className="font-semibold text-sm sm:text-base line-clamp-2">
                      {doc.title}
                    </h3>

                    {/* Description */}
                    {doc.description && (
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                        {doc.description}
                      </p>
                    )}

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={STATUS_CONFIG[doc.status as keyof typeof STATUS_CONFIG].variant} className="text-xs">
                        {STATUS_CONFIG[doc.status as keyof typeof STATUS_CONFIG].label}
                      </Badge>
                      {doc.isAiAnalyzed && (
                        <Badge className="text-xs bg-purple-100 text-purple-700">
                          <Sparkles className="w-3 h-3 mr-1" />
                          AI
                        </Badge>
                      )}
                      {doc.category && (
                        <Badge variant="outline" className="text-xs" style={{ color: doc.category.color }}>
                          {doc.category.icon} {doc.category.name}
                        </Badge>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {doc.viewCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        {doc.downloadCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {doc.usageCount}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t">
                      <Link href={`/lms/instructor/source-documents/${doc.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Edit className="w-4 h-4 mr-2" />
                          Chỉnh sửa
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(doc)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalPages={Math.ceil(total / pageSize)}
            totalItems={total}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            pageSizeOptions={[12, 24, 48]}
          />
        </>
      )}

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn xóa tài liệu "{selectedDocument?.title}"?
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
            <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
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
