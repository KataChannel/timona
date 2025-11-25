'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  ArrowLeft,
  Edit,
  Save,
  Trash2,
  X,
  Loader2,
  ExternalLink,
  Download,
  Eye,
  BookOpen,
  Sparkles,
  TrendingUp,
  File,
  Video,
  FileText,
  Music,
  Link as LinkIcon,
  Image as ImageIcon,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  GET_SOURCE_DOCUMENT,
  GET_SOURCE_DOCUMENT_CATEGORIES,
  UPDATE_SOURCE_DOCUMENT,
  DELETE_SOURCE_DOCUMENT,
  INCREMENT_DOCUMENT_DOWNLOAD,
} from '@/graphql/lms/source-documents';

const TYPE_ICONS = {
  FILE: File,
  VIDEO: Video,
  TEXT: FileText,
  AUDIO: Music,
  LINK: LinkIcon,
  IMAGE: ImageIcon,
};

const STATUS_CONFIG = {
  DRAFT: { label: 'Nháp', variant: 'secondary' as const },
  PROCESSING: { label: 'Đang xử lý', variant: 'default' as const },
  PUBLISHED: { label: 'Đã xuất bản', variant: 'default' as const },
  ARCHIVED: { label: 'Lưu trữ', variant: 'outline' as const },
};

export default function DocumentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    status: '',
    url: '',
    content: '',
    fileName: '',
    thumbnailUrl: '',
    categoryId: '',
    tags: '',
  });

  // Queries
  const { data, loading, error, refetch } = useQuery(GET_SOURCE_DOCUMENT, {
    variables: { id: params.id },
    fetchPolicy: 'cache-and-network',
    onCompleted: (data) => {
      if (data.sourceDocument) {
        const doc = data.sourceDocument;
        setFormData({
          title: doc.title || '',
          description: doc.description || '',
          type: doc.type || '',
          status: doc.status || '',
          url: doc.url || '',
          content: doc.content || '',
          fileName: doc.fileName || '',
          thumbnailUrl: doc.thumbnailUrl || '',
          categoryId: doc.category?.id || '',
          tags: doc.tags?.join(', ') || '',
        });
      }
    },
  });

  const { data: categoriesData } = useQuery(GET_SOURCE_DOCUMENT_CATEGORIES);

  // Mutations
  const [updateDocument, { loading: updating }] = useMutation(UPDATE_SOURCE_DOCUMENT, {
    onCompleted: () => {
      toast({ type: 'success', title: 'Thành công', description: 'Đã cập nhật tài liệu' });
      setIsEditing(false);
      refetch();
    },
    onError: (error) => {
      toast({ type: 'error', title: 'Lỗi', description: error.message });
    },
  });

  const [deleteDocument, { loading: deleting }] = useMutation(DELETE_SOURCE_DOCUMENT, {
    onCompleted: () => {
      toast({ type: 'success', title: 'Thành công', description: 'Đã xóa tài liệu' });
      router.push('/lms/instructor/source-documents');
    },
    onError: (error) => {
      toast({ type: 'error', title: 'Lỗi', description: error.message });
    },
  });

  const [incrementDownload] = useMutation(INCREMENT_DOCUMENT_DOWNLOAD);

  const document = data?.sourceDocument;
  const categories = categoriesData?.sourceDocumentCategories || [];

  const handleUpdate = () => {
    if (!formData.title.trim()) {
      toast({ type: 'error', title: 'Lỗi', description: 'Vui lòng nhập tiêu đề' });
      return;
    }

    const tags = formData.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag);

    updateDocument({
      variables: {
        id: params.id,
        input: {
          title: formData.title,
          description: formData.description || null,
          type: formData.type,
          status: formData.status,
          url: formData.url || null,
          content: formData.content || null,
          fileName: formData.fileName || null,
          thumbnailUrl: formData.thumbnailUrl || null,
          categoryId: formData.categoryId || null,
          tags,
        },
      },
    });
  };

  const handleDelete = () => {
    deleteDocument({ variables: { id: params.id } });
  };

  const handleDownload = () => {
    if (document?.url) {
      incrementDownload({ variables: { id: params.id } });
      window.open(document.url, '_blank');
    }
  };

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return 'N/A';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return 'N/A';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-red-600">Không tìm thấy tài liệu</p>
            <Button onClick={() => router.back()} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const TypeIcon = TYPE_ICONS[document.type as keyof typeof TYPE_ICONS];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {document.title}
            </h1>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge variant={STATUS_CONFIG[document.status as keyof typeof STATUS_CONFIG].variant}>
                {STATUS_CONFIG[document.status as keyof typeof STATUS_CONFIG].label}
              </Badge>
              {document.isAiAnalyzed && (
                <Badge className="bg-purple-100 text-purple-700">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI đã phân tích
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Chỉnh sửa
              </Button>
              <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
                <Trash2 className="w-4 h-4 mr-2" />
                Xóa
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                <X className="w-4 h-4 mr-2" />
                Hủy
              </Button>
              <Button onClick={handleUpdate} disabled={updating}>
                {updating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Lưu
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="title">Tiêu đề *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Mô tả</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Loại tài liệu</Label>
                      <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                        <SelectTrigger id="type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FILE">📄 File</SelectItem>
                          <SelectItem value="VIDEO">🎥 Video</SelectItem>
                          <SelectItem value="TEXT">📝 Văn bản</SelectItem>
                          <SelectItem value="AUDIO">🎵 Audio</SelectItem>
                          <SelectItem value="LINK">🔗 Liên kết</SelectItem>
                          <SelectItem value="IMAGE">🖼️ Hình ảnh</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Trạng thái</Label>
                      <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                        <SelectTrigger id="status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DRAFT">Nháp</SelectItem>
                          <SelectItem value="PUBLISHED">Xuất bản</SelectItem>
                          <SelectItem value="ARCHIVED">Lưu trữ</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Danh mục</Label>
                    <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Chọn danh mục..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat: any) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.icon} {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="tag1, tag2, tag3"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-sm text-gray-500">Mô tả</p>
                    <p className="text-gray-900 mt-1">{document.description || 'Không có mô tả'}</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Loại</p>
                      <div className="flex items-center gap-2 mt-1">
                        {TypeIcon && <TypeIcon className="w-4 h-4 text-blue-600" />}
                        <span className="font-medium">{document.type}</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Danh mục</p>
                      <p className="mt-1">
                        {document.category ? (
                          <span>
                            {document.category.icon} {document.category.name}
                          </span>
                        ) : (
                          'Chưa phân loại'
                        )}
                      </p>
                    </div>

                    {document.fileName && (
                      <div>
                        <p className="text-sm text-gray-500">Tên file</p>
                        <p className="font-mono text-sm mt-1">{document.fileName}</p>
                      </div>
                    )}
                  </div>

                  {document.tags && document.tags.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {document.tags.map((tag: string) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Content Section */}
          <Card>
            <CardHeader>
              <CardTitle>Nội dung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  {formData.type === 'TEXT' ? (
                    <div className="space-y-2">
                      <Label htmlFor="content">Nội dung</Label>
                      <Textarea
                        id="content"
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        rows={10}
                        className="font-mono"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="url">URL</Label>
                        <Input
                          id="url"
                          type="url"
                          value={formData.url}
                          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                          placeholder="https://..."
                        />
                      </div>

                      {(formData.type === 'FILE' || formData.type === 'AUDIO') && (
                        <div className="space-y-2">
                          <Label htmlFor="fileName">Tên file</Label>
                          <Input
                            id="fileName"
                            value={formData.fileName}
                            onChange={(e) => setFormData({ ...formData, fileName: e.target.value })}
                          />
                        </div>
                      )}
                    </>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="thumbnailUrl">URL hình thu nhỏ</Label>
                    <Input
                      id="thumbnailUrl"
                      type="url"
                      value={formData.thumbnailUrl}
                      onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </>
              ) : (
                <>
                  {document.type === 'TEXT' && document.content && (
                    <div className="p-4 bg-gray-50 rounded-lg max-h-96 overflow-y-auto">
                      <pre className="text-sm whitespace-pre-wrap font-mono">
                        {document.content}
                      </pre>
                    </div>
                  )}

                  {document.url && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">URL</p>
                      <div className="flex items-center gap-2">
                        <a
                          href={document.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline truncate"
                        >
                          {document.url}
                        </a>
                        <Button size="sm" variant="outline" onClick={handleDownload}>
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {document.thumbnailUrl && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Hình thu nhỏ</p>
                      <img
                        src={document.thumbnailUrl}
                        alt={document.title}
                        className="w-full max-w-md rounded-lg"
                      />
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* AI Analysis */}
          {document.isAiAnalyzed && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <CardTitle>Phân tích AI</CardTitle>
                </div>
                <CardDescription>
                  Phân tích lần cuối: {new Date(document.aiAnalyzedAt).toLocaleDateString('vi-VN')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {document.aiSummary && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Tóm tắt</p>
                    <p className="text-gray-900">{document.aiSummary}</p>
                  </div>
                )}

                {document.aiKeywords && document.aiKeywords.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Từ khóa</p>
                    <div className="flex flex-wrap gap-2">
                      {document.aiKeywords.map((keyword: string) => (
                        <Badge key={keyword} className="bg-purple-100 text-purple-700">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {document.aiTopics && document.aiTopics.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Chủ đề</p>
                    <div className="flex flex-wrap gap-2">
                      {document.aiTopics.map((topic: string) => (
                        <Badge key={topic} variant="outline">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thống kê</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm">Lượt xem</span>
                </div>
                <span className="font-semibold">{document.viewCount || 0}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <Download className="w-4 h-4" />
                  <span className="text-sm">Tải xuống</span>
                </div>
                <span className="font-semibold">{document.downloadCount || 0}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-sm">Đang sử dụng</span>
                </div>
                <span className="font-semibold">{document.usageCount || 0} khóa học</span>
              </div>

              {document.fileSize && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Kích thước</span>
                  <span className="font-mono text-sm">{formatFileSize(document.fileSize)}</span>
                </div>
              )}

              {document.duration && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Thời lượng</span>
                  <span className="font-mono text-sm">{formatDuration(document.duration)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thông tin khác</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Người tạo</p>
                <p className="font-medium mt-1">{document.user?.email || 'N/A'}</p>
              </div>

              <div>
                <p className="text-gray-500">Ngày tạo</p>
                <p className="mt-1">{new Date(document.createdAt).toLocaleDateString('vi-VN')}</p>
              </div>

              <div>
                <p className="text-gray-500">Cập nhật</p>
                <p className="mt-1">{new Date(document.updatedAt).toLocaleDateString('vi-VN')}</p>
              </div>

              {document.publishedAt && (
                <div>
                  <p className="text-gray-500">Xuất bản</p>
                  <p className="mt-1">{new Date(document.publishedAt).toLocaleDateString('vi-VN')}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thao tác nhanh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {document.url && (
                <Button variant="outline" className="w-full" onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-2" />
                  Tải xuống
                </Button>
              )}

              <Link href="/lms/instructor/source-documents">
                <Button variant="outline" className="w-full">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Xem tất cả tài liệu
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn xóa tài liệu "{document.title}"?
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
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
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
