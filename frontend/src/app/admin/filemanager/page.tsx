'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileManager } from '@/components/file-manager/FileManager';
import { StorageAnalytics } from '@/components/file-manager/StorageAnalytics';
import { RecentActivity } from '@/components/file-manager/RecentActivity';
import { useStorageStats } from '@/hooks/useFiles';
import { FileType } from '@/types/file';
import { useToast } from '@/hooks/use-toast';
import { getBulkFileUploadUrl } from '@/lib/api-config';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Files, 
  FolderOpen, 
  Image, 
  Video, 
  FileText,
  Upload,
  Trash2,
  Search,
  Filter,
  Grid3x3,
  List,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
  FileIcon,
  Sparkles,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface UploadedFile {
  file: File;
  id: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  result?: {
    url: string;
    filename: string;
    size: number;
    originalSize: number;
    optimized: boolean;
  };
}

export default function FileManagerPage() {
  const { stats, loading, refetch } = useStorageStats();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map((file) => ({
      file,
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      status: 'pending',
      progress: 0,
    }));
    setUploadingFiles(newFiles);
    setUploadDialogOpen(true);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
  });

  const handleUpload = async () => {
    if (uploadingFiles.length === 0) return;
    
    setIsUploading(true);
    const formData = new FormData();
    
    uploadingFiles.forEach((uploadFile) => {
      formData.append('files', uploadFile.file);
    });

    try {
      const uploadUrl = getBulkFileUploadUrl();
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      console.log('📤 Uploading to:', uploadUrl); // Debug log

      setUploadingFiles(prev => prev.map(f => ({ ...f, status: 'uploading' as const, progress: 50 })));
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers,
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Upload thất bại với status ${response.status}`);
      }

      const responseData = await response.json();
      console.log('Upload response:', responseData, 'Type:', typeof responseData, 'IsArray:', Array.isArray(responseData));
      // Handle cả object wrapper và array trực tiếp
      const results = Array.isArray(responseData) ? responseData : (responseData.data || []);

      setUploadingFiles(prev => prev.map((f, index) => ({
        ...f,
        status: results[index]?.url ? 'success' as const : 'error' as const,
        progress: 100,
        result: results[index],
        error: results[index]?.url ? undefined : 'Upload thất bại',
      })));

      const successCount = results.filter((r: any) => r.url).length;
      
      toast({
        type: 'success',
        title: 'Upload thành công',
        description: `${successCount}/${uploadingFiles.length} file đã được upload và tối ưu hóa`,
      });

      refetch?.();

      setTimeout(() => {
        setUploadDialogOpen(false);
        setUploadingFiles([]);
      }, 2000);
    } catch (error) {
      toast({
        type: 'error',
        title: 'Upload thất bại',
        description: error instanceof Error ? error.message : 'Đã xảy ra lỗi khi upload',
      });

      setUploadingFiles(prev => prev.map(f => ({
        ...f,
        status: 'error' as const,
        error: error instanceof Error ? error.message : 'Upload thất bại',
      })));
    } finally {
      setIsUploading(false);
    }
  };

  const handleRefresh = () => {
    refetch?.();
    toast({
      type: 'success',
      title: 'Đã làm mới',
      description: 'Danh sách file đã được cập nhật',
    });
  };

  const removeFile = (fileId: string) => {
    setUploadingFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'uploading':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <FileIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        setUploadDialogOpen(true);
      }
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>('input[placeholder*="Tìm kiếm"]');
        searchInput?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div {...getRootProps()} className="flex flex-col h-full min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-slate-950 dark:via-gray-950 dark:to-slate-900">
      <input {...getInputProps()} />
      
      {isDragActive && (
        <div className="fixed inset-0 z-50 bg-blue-500/20 backdrop-blur-sm flex items-center justify-center">
          <Card className="p-8 shadow-2xl border-2 border-dashed border-blue-500">
            <CardContent className="text-center space-y-4 pt-6">
              <Upload className="h-16 w-16 text-blue-500 mx-auto" />
              <p className="text-2xl font-bold">Thả file vào đây</p>
              <p className="text-sm text-muted-foreground">
                File sẽ được tự động tối ưu hóa và chuyển sang WebP
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="px-4 md:px-6 py-4 md:py-6 border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <FolderOpen className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Quản Lý File
              </h1>
            </div>
            <p className="text-sm text-muted-foreground hidden md:block">
              Upload, quản lý và tối ưu hóa file của bạn
            </p>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              className="flex-1 md:flex-none"
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
              <span className="hidden sm:inline">Làm mới</span>
            </Button>
            <Button 
              size="sm"
              onClick={() => setUploadDialogOpen(true)}
              className="flex-1 md:flex-none bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload File
            </Button>
          </div>
        </div>
      </div>

      {!loading && stats && (
        <div className="px-4 md:px-6 py-4 md:py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              <StorageAnalytics
                totalSize={stats.totalSize}
                totalFiles={stats.totalFiles}
                storageLimit={10 * 1024 * 1024 * 1024}
                filesByType={stats.filesByType}
              />
            </div>
            <div className="lg:col-span-1">
              <RecentActivity limit={6} />
            </div>
          </div>
        </div>
      )}

      <div className="px-4 md:px-6 py-3 md:py-4 border-b bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm sticky top-[73px] md:top-[89px] z-10">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm file..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Select value="all">
              <SelectTrigger className="w-[120px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Lọc" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="images">Hình ảnh</SelectItem>
                <SelectItem value="videos">Video</SelectItem>
                <SelectItem value="documents">Tài liệu</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1 border rounded-md p-1 bg-white dark:bg-gray-900">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-8 w-8 p-0"
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8 w-8 p-0"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="h-full flex flex-col">
          <div className="px-4 md:px-6 border-b bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm overflow-x-auto">
            <ScrollArea className="w-full">
              <TabsList className="h-12 inline-flex w-auto">
                <TabsTrigger value="all" className="gap-2 whitespace-nowrap">
                  <Files className="h-4 w-4" />
                  <span className="hidden sm:inline">Tất cả</span>
                </TabsTrigger>
                <TabsTrigger value="recent" className="gap-2 whitespace-nowrap">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Gần đây</span>
                </TabsTrigger>
                <TabsTrigger value="images" className="gap-2 whitespace-nowrap">
                  <Image className="h-4 w-4" />
                  <span className="hidden sm:inline">Hình ảnh</span>
                </TabsTrigger>
                <TabsTrigger value="videos" className="gap-2 whitespace-nowrap">
                  <Video className="h-4 w-4" />
                  <span className="hidden sm:inline">Video</span>
                </TabsTrigger>
                <TabsTrigger value="trash" className="gap-2 whitespace-nowrap">
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Thùng rác</span>
                </TabsTrigger>
              </TabsList>
            </ScrollArea>
          </div>

          <TabsContent value="all" className="flex-1 mt-0 p-4 md:p-6 overflow-auto">
            <FileManager viewMode={viewMode} sortBy={{ field: 'name', order: 'asc' }} searchQuery={searchQuery} allowMultiple={true} />
          </TabsContent>

          <TabsContent value="recent" className="flex-1 mt-0 p-4 md:p-6 overflow-auto">
            <FileManager 
              viewMode={viewMode} 
              sortBy={{ field: 'date', order: 'desc' }} 
              searchQuery={searchQuery}
              limit={50}
              allowMultiple={true}
            />
          </TabsContent>

          <TabsContent value="images" className="flex-1 mt-0 p-4 md:p-6 overflow-auto">
            <FileManager 
              viewMode={viewMode} 
              sortBy={{ field: 'name', order: 'asc' }} 
              searchQuery={searchQuery}
              filter={{ type: FileType.IMAGE }}
              allowMultiple={true}
            />
          </TabsContent>

          <TabsContent value="videos" className="flex-1 mt-0 p-4 md:p-6 overflow-auto">
            <FileManager 
              viewMode={viewMode} 
              sortBy={{ field: 'name', order: 'asc' }} 
              searchQuery={searchQuery}
              filter={{ type: FileType.VIDEO }}
              allowMultiple={true}
            />
          </TabsContent>

          <TabsContent value="trash" className="flex-1 mt-0 p-4 md:p-6 overflow-auto">
            <div className="text-center py-12">
              <Trash2 className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Thùng rác trống</h3>
              <p className="text-sm text-muted-foreground">
                File đã xóa sẽ xuất hiện ở đây
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] md:max-h-[80vh] flex flex-col p-0">
          <DialogHeader className="px-4 md:px-6 pt-4 md:pt-6 pb-4 border-b">
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload File
              {uploadingFiles.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {uploadingFiles.length} file
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription className="flex items-center gap-1 text-sm">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              Hình ảnh sẽ tự động được tối ưu hóa và chuyển sang WebP
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4">
            {uploadingFiles.length === 0 ? (
              <div
                onClick={() => document.getElementById('file-upload')?.click()}
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/50 transition-colors"
              >
                <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium mb-2">
                  Chọn file để upload
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  hoặc kéo thả file vào đây
                </p>
                <Button variant="outline" size="sm">
                  Chọn File
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) {
                      onDrop(Array.from(e.target.files));
                    }
                  }}
                />
              </div>
            ) : (
              <div className="space-y-2">
                {uploadingFiles.map((fileItem) => (
                  <div
                    key={fileItem.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                  >
                    {getStatusIcon(fileItem.status)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{fileItem.file.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(fileItem.file.size)}
                        </p>
                        {fileItem.result?.optimized && (
                          <Badge variant="secondary" className="text-xs">
                            <Sparkles className="h-3 w-3 mr-1" />
                            Đã tối ưu: {formatFileSize(fileItem.result.size)}
                          </Badge>
                        )}
                      </div>
                      {fileItem.status === 'uploading' && (
                        <Progress value={fileItem.progress} className="h-1 mt-2" />
                      )}
                      {fileItem.error && (
                        <p className="text-xs text-red-500 mt-1">{fileItem.error}</p>
                      )}
                    </div>
                    {fileItem.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(fileItem.id)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="px-4 md:px-6 py-4 border-t gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setUploadDialogOpen(false);
                setUploadingFiles([]);
              }}
              disabled={isUploading}
            >
              Hủy
            </Button>
            {uploadingFiles.length > 0 && (
              <Button
                onClick={handleUpload}
                disabled={isUploading || uploadingFiles.every(f => f.status === 'success')}
                className="bg-gradient-to-r from-blue-500 to-purple-600"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang upload...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload {uploadingFiles.length} file
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
