'use client';

import { useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useEmployeeDocuments, useCreateEmployeeDocument, useUpdateEmployeeDocument, useDeleteEmployeeDocument, useEmployeeProfile } from '@/hooks/useHR';
import { DocumentType } from '@/types/hr';
import { getBulkFileUploadUrl } from '@/lib/api-config';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  FileText,
  Upload,
  Download,
  Trash2,
  MoreVertical,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  FileIcon,
  Image,
  File,
  ArrowLeft,
  Filter,
  Search,
  Eye,
  Edit,
  Shield,
} from 'lucide-react';

export default function EmployeeDocumentsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const employeeId = params.id as string;

  const { employeeProfile, loading: loadingProfile } = useEmployeeProfile(employeeId);
  const { documents, loading: loadingDocs, refetch } = useEmployeeDocuments(employeeId);
  const { createDocument } = useCreateEmployeeDocument();
  const { updateDocument } = useUpdateEmployeeDocument();
  const { deleteDocument } = useDeleteEmployeeDocument();

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<DocumentType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Upload form state
  const [uploadData, setUploadData] = useState({
    documentType: DocumentType.OTHER,
    title: '',
    description: '',
    documentNumber: '',
    issueDate: '',
    expiryDate: '',
    issuingAuthority: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn tệp tin để tải lên.',
        type: 'error',
      });
      return;
    }

    setUploading(true);
    try {
      // Upload file to MinIO first
      const formData = new FormData();
      formData.append('files', selectedFile);

      const uploadUrl = getBulkFileUploadUrl();
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

      console.log('📤 Uploading HR document to:', uploadUrl); // Debug log

      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
        credentials: 'include',
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      const uploadResult = await uploadResponse.json();
      const uploadedFile = uploadResult.data?.[0];

      if (!uploadedFile) {
        throw new Error('No file returned from upload');
      }

      // Create document record
      await createDocument({
        employeeProfileId: employeeId,
        documentType: uploadData.documentType,
        title: uploadData.title,
        description: uploadData.description,
        fileId: uploadedFile.id,
        fileName: uploadedFile.name,
        fileUrl: uploadedFile.url,
        fileSize: uploadedFile.size,
        fileMimeType: uploadedFile.mimeType,
        documentNumber: uploadData.documentNumber || undefined,
        issueDate: uploadData.issueDate || undefined,
        expiryDate: uploadData.expiryDate || undefined,
        issuingAuthority: uploadData.issuingAuthority || undefined,
      });

      toast({
        title: 'Thành công',
        description: 'Tài liệu đã được tải lên.',
        type: 'success',
      });

      setUploadDialogOpen(false);
      resetUploadForm();
      refetch();
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải lên tài liệu.',
        type: 'error',
      });
    } finally {
      setUploading(false);
    }
  };

  const resetUploadForm = () => {
    setUploadData({
      documentType: DocumentType.OTHER,
      title: '',
      description: '',
      documentNumber: '',
      issueDate: '',
      expiryDate: '',
      issuingAuthority: '',
    });
    setSelectedFile(null);
  };

  const handleVerify = async () => {
    if (!selectedDocument) return;

    try {
      await updateDocument(selectedDocument, { isVerified: true });
      toast({
        title: 'Thành công',
        description: 'Tài liệu đã được xác minh.',
        type: 'success',
      });
      setVerifyDialogOpen(false);
      setSelectedDocument(null);
      refetch();
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể xác minh tài liệu.',
        type: 'error',
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedDocument) return;

    try {
      await deleteDocument(selectedDocument);
      toast({
        title: 'Thành công',
        description: 'Tài liệu đã được xóa.',
        type: 'success',
      });
      setDeleteDialogOpen(false);
      setSelectedDocument(null);
      refetch();
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa tài liệu.',
        type: 'error',
      });
    }
  };

  const handleDownload = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getDocumentTypeLabel = (type: DocumentType) => {
    const labels: Record<DocumentType, string> = {
      [DocumentType.CV]: 'Hồ sơ xin việc',
      [DocumentType.CONTRACT]: 'Hợp đồng',
      [DocumentType.ID_CARD]: 'CMND/CCCD',
      [DocumentType.PASSPORT]: 'Hộ chiếu',
      [DocumentType.DEGREE]: 'Bằng cấp',
      [DocumentType.CERTIFICATE]: 'Chứng chỉ',
      [DocumentType.PHOTO]: 'Ảnh',
      [DocumentType.BANK_INFO]: 'Thông tin ngân hàng',
      [DocumentType.HEALTH_CERTIFICATE]: 'Giấy khám sức khỏe',
      [DocumentType.OTHER]: 'Khác',
    };
    return labels[type];
  };

  const getDocumentIcon = (mimeType?: string) => {
    if (mimeType?.startsWith('image/')) return Image;
    if (mimeType?.startsWith('application/pdf')) return FileText;
    return File;
  };

  const filteredDocuments = useMemo(() => {
    let filtered = documents;

    if (filterType !== 'ALL') {
      filtered = filtered.filter((doc) => doc.documentType === filterType);
    }

    if (searchQuery) {
      filtered = filtered.filter((doc) =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [documents, filterType, searchQuery]);

  const documentsByType = useMemo(() => {
    const grouped = new Map<DocumentType, number>();
    documents.forEach((doc) => {
      grouped.set(doc.documentType, (grouped.get(doc.documentType) || 0) + 1);
    });
    return grouped;
  }, [documents]);

  const loading = loadingProfile || loadingDocs;

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold tracking-tight flex items-center">
              <FileText className="mr-3 h-8 w-8" />
              Tài liệu nhân viên
            </h1>
          </div>
          {employeeProfile && (
            <p className="text-muted-foreground ml-12">
              {employeeProfile.fullName} ({employeeProfile.employeeCode})
            </p>
          )}
        </div>
        <Button onClick={() => setUploadDialogOpen(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Tải lên tài liệu
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng tài liệu</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã xác minh</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {documents.filter((d) => d.isVerified).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chưa xác minh</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {documents.filter((d) => !d.isVerified).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Loại tài liệu</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documentsByType.size}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm tài liệu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={(value) => setFilterType(value as DocumentType | 'ALL')}>
              <SelectTrigger className="w-full md:w-[250px]">
                <SelectValue placeholder="Lọc theo loại" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả loại</SelectItem>
                {Object.values(DocumentType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {getDocumentTypeLabel(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Documents Grid */}
      {filteredDocuments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchQuery || filterType !== 'ALL'
                ? 'Không tìm thấy tài liệu phù hợp.'
                : 'Chưa có tài liệu nào. Nhấn "Tải lên tài liệu" để thêm.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((doc) => {
            const Icon = getDocumentIcon(doc.fileMimeType);
            return (
              <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base line-clamp-1">{doc.title}</CardTitle>
                        <CardDescription className="text-xs">
                          {getDocumentTypeLabel(doc.documentType)}
                        </CardDescription>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDownload(doc.fileUrl, doc.fileName)}>
                          <Download className="mr-2 h-4 w-4" />
                          Tải xuống
                        </DropdownMenuItem>
                        {!doc.isVerified && (
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedDocument(doc.id);
                              setVerifyDialogOpen(true);
                            }}
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            Xác minh
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            setSelectedDocument(doc.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {doc.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{doc.description}</p>
                  )}

                  <div className="flex items-center justify-between">
                    <Badge variant={doc.isVerified ? 'default' : 'secondary'} className={doc.isVerified ? 'bg-green-500' : ''}>
                      {doc.isVerified ? (
                        <>
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Đã xác minh
                        </>
                      ) : (
                        <>
                          <XCircle className="mr-1 h-3 w-3" />
                          Chưa xác minh
                        </>
                      )}
                    </Badge>
                    {doc.fileSize && (
                      <span className="text-xs text-muted-foreground">
                        {(doc.fileSize / 1024).toFixed(1)} KB
                      </span>
                    )}
                  </div>

                  {doc.documentNumber && (
                    <div className="text-xs">
                      <span className="text-muted-foreground">Số:</span> {doc.documentNumber}
                    </div>
                  )}

                  {(doc.issueDate || doc.expiryDate) && (
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {doc.issueDate && new Date(doc.issueDate).toLocaleDateString('vi-VN')}
                        {doc.issueDate && doc.expiryDate && ' - '}
                        {doc.expiryDate && new Date(doc.expiryDate).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  )}

                  {doc.verifiedBy && (
                    <div className="flex items-center space-x-2 text-xs text-green-600">
                      <User className="h-3 w-3" />
                      <span>Xác minh bởi: {doc.verifiedBy}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tải lên tài liệu mới</DialogTitle>
            <DialogDescription>Thêm tài liệu cho nhân viên này</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="documentType">
                  Loại tài liệu <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={uploadData.documentType}
                  onValueChange={(value) =>
                    setUploadData({ ...uploadData, documentType: value as DocumentType })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(DocumentType).map((type) => (
                      <SelectItem key={type} value={type}>
                        {getDocumentTypeLabel(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">
                  Tiêu đề <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={uploadData.title}
                  onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                  placeholder="Nhập tiêu đề tài liệu"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={uploadData.description}
                onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                placeholder="Mô tả chi tiết về tài liệu"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="documentNumber">Số tài liệu</Label>
                <Input
                  id="documentNumber"
                  value={uploadData.documentNumber}
                  onChange={(e) => setUploadData({ ...uploadData, documentNumber: e.target.value })}
                  placeholder="VD: 123456789"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="issuingAuthority">Cơ quan cấp</Label>
                <Input
                  id="issuingAuthority"
                  value={uploadData.issuingAuthority}
                  onChange={(e) => setUploadData({ ...uploadData, issuingAuthority: e.target.value })}
                  placeholder="VD: Công an TP.HCM"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="issueDate">Ngày cấp</Label>
                <Input
                  id="issueDate"
                  type="date"
                  value={uploadData.issueDate}
                  onChange={(e) => setUploadData({ ...uploadData, issueDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiryDate">Ngày hết hạn</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={uploadData.expiryDate}
                  onChange={(e) => setUploadData({ ...uploadData, expiryDate: e.target.value })}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="file">
                Tệp tin <span className="text-red-500">*</span>
              </Label>
              <Input id="file" type="file" onChange={handleFileSelect} />
              {selectedFile && (
                <p className="text-sm text-muted-foreground">
                  Đã chọn: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)} disabled={uploading}>
              Hủy
            </Button>
            <Button onClick={handleUpload} disabled={uploading || !selectedFile || !uploadData.title}>
              {uploading ? 'Đang tải lên...' : 'Tải lên'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Verify Dialog */}
      <AlertDialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác minh tài liệu</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xác minh tài liệu này? Hành động này sẽ đánh dấu tài liệu là đã được kiểm tra và xác nhận.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleVerify}>Xác minh</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa tài liệu</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa tài liệu này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
