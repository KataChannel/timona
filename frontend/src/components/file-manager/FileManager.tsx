'use client';

import React, { useState, useCallback } from 'react';
import { useFiles, useFileUpload, useDeleteFile, useBulkDeleteFiles } from '@/hooks/useFiles';
import type { File } from '@/types/file';
import { FileType, GetFilesInput } from '@/types/file';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { UploadDialog } from '@/components/file-manager/UploadDialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Upload,
  Grid3x3,
  List,
  Search,
  Folder,
  File as FileIcon,
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  Archive,
  Trash2,
  Download,
  Eye,
  MoreVertical,
  FolderPlus,
  RefreshCw,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

type ViewMode = 'grid' | 'list';

interface SortOption {
  field: 'name' | 'date' | 'size' | 'type';
  order: 'asc' | 'desc';
}

interface FilterOption {
  type?: FileType;
}

interface FileManagerProps {
  onSelect?: (file: File) => void;
  allowMultiple?: boolean;
  folderId?: string;
  fileTypes?: FileType[];
  // New props for enhanced version
  viewMode?: ViewMode;
  sortBy?: SortOption;
  searchQuery?: string;
  filter?: FilterOption;
  limit?: number;
}

export function FileManager({
  onSelect,
  allowMultiple = false,
  folderId,
  fileTypes,
  viewMode: externalViewMode,
  sortBy: externalSortBy,
  searchQuery: externalSearchQuery,
  filter,
  limit = 20,
}: FileManagerProps) {
  const [internalViewMode, setInternalViewMode] = useState<ViewMode>('grid');
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  // Use external props if provided, otherwise use internal state
  const viewMode = externalViewMode || internalViewMode;
  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;
  const sortBy = externalSortBy || { field: 'date' as const, order: 'desc' as const };

  // Build query input
  const queryInput = {
    page: page,
    limit: limit,
    filters: {
      search: searchQuery || undefined,
      // Ưu tiên fileTypes prop (từ FilePicker), sau đó mới đến filter
      ...(fileTypes && fileTypes.length > 0 
        ? { fileType: fileTypes[0] } 
        : filter?.type && { fileType: filter.type }
      ),
      ...(folderId && { folderId }),
    },
    sortBy: sortBy.field === 'name' ? 'filename' : sortBy.field === 'date' ? 'createdAt' : 'size',
    sortOrder: sortBy.order,
    allUsers: true, // Hiển thị tất cả file không phân biệt user
  };

  const { files, loading, refetch } = useFiles(queryInput);
  const { uploadFile, uploadFiles, uploading } = useFileUpload();
  const { deleteFile } = useDeleteFile();
  const { bulkDeleteFiles } = useBulkDeleteFiles();

  // File upload handler
  const handleFileUpload = useCallback(
    async (uploadedFiles: FileList | globalThis.File[]) => {
      try {
        const fileArray = Array.from(uploadedFiles);
        
        if (fileArray.length === 1) {
          await uploadFile(fileArray[0] as any, folderId);
        } else {
          await uploadFiles(fileArray as any, folderId);
        }

        toast({
          type: 'success',
          title: 'Success',
          description: `${fileArray.length} file(s) uploaded successfully`,
        });
        
        refetch();
        setUploadDialogOpen(false);
      } catch (error: any) {
        toast({
          type: 'error',
          title: 'Error',
          description: error.message || 'Failed to upload files',
          variant: 'destructive',
        });
      }
    },
    [uploadFile, uploadFiles, folderId, refetch, toast],
  );

  // Drag and drop handler
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const droppedFiles = e.dataTransfer.files;
      if (droppedFiles.length > 0) {
        handleFileUpload(droppedFiles);
      }
    },
    [handleFileUpload],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // File selection
  const toggleFileSelection = (fileId: string) => {
    const newSelection = new Set(selectedFiles);
    if (newSelection.has(fileId)) {
      newSelection.delete(fileId);
    } else {
      if (!allowMultiple) {
        newSelection.clear();
      }
      newSelection.add(fileId);
    }
    setSelectedFiles(newSelection);
  };

  // Handle file click - for FilePicker mode
  const handleFileClick = (file: File) => {
    if (onSelect) {
      // FilePicker mode: call onSelect immediately
      console.log('FileManager: Calling onSelect with file', file);
      onSelect(file);
    } else {
      // Normal mode: toggle selection for bulk operations
      toggleFileSelection(file.id);
    }
  };

  // Delete file
  const handleDeleteFile = async (fileId: string) => {
    if (confirm('Are you sure you want to delete this file?')) {
      try {
        await deleteFile(fileId);
        toast({
          type: 'success',
          title: 'Success',
          description: 'File deleted successfully',
        });
        refetch();
      } catch (error: any) {
        toast({
          type: 'error',
          title: 'Error',
          description: error.message || 'Failed to delete file',
          variant: 'destructive',
        });
      }
    }
  };

  // Open delete confirmation dialog
  const openDeleteDialog = () => {
    if (selectedFiles.size === 0) return;
    setDeleteDialogOpen(true);
  };

  // Confirm and execute bulk delete
  const confirmBulkDelete = async () => {
    if (selectedFiles.size === 0) return;
    
    setIsDeleting(true);
    try {
      await bulkDeleteFiles({ fileIds: Array.from(selectedFiles) });
      toast({
        type: 'success',
        title: 'Xóa thành công',
        description: `Đã xóa ${selectedFiles.size} file`,
      });
      setSelectedFiles(new Set());
      setDeleteDialogOpen(false);
      refetch();
    } catch (error: any) {
      toast({
        type: 'error',
        title: 'Lỗi xóa file',
        description: error.message || 'Không thể xóa file',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Get file icon
  const getFileIcon = (fileType: FileType) => {
    switch (fileType) {
      case FileType.IMAGE:
        return <ImageIcon className="w-5 h-5" />;
      case FileType.VIDEO:
        return <Video className="w-5 h-5" />;
      case FileType.AUDIO:
        return <Music className="w-5 h-5" />;
      case FileType.DOCUMENT:
        return <FileText className="w-5 h-5" />;
      case FileType.ARCHIVE:
        return <Archive className="w-5 h-5" />;
      default:
        return <FileIcon className="w-5 h-5" />;
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Bulk Delete Button - Always show when files selected and not in picker mode */}
      {!onSelect && selectedFiles.size > 0 && (
        <div className="mb-3 flex justify-end">
          <Button
            variant="destructive"
            size="sm"
            onClick={openDeleteDialog}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Xóa ({selectedFiles.size})
          </Button>
        </div>
      )}
      
      {/* Toolbar - only show if not controlled externally */}
      {externalViewMode === undefined && externalSearchQuery === undefined && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search files..."
                    value={internalSearchQuery}
                    onChange={(e) => setInternalSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {/* Upload */}
                <Button variant="default" size="sm" disabled={uploading} onClick={() => setUploadDialogOpen(true)}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </Button>
                {/* Refresh */}
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
                {/* View Mode */}
                <div className="flex border rounded-md">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setInternalViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setInternalViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Dialog */}
      <UploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUpload={handleFileUpload}
        onUploadSuccess={() => { refetch(); setUploadDialogOpen(false); }}
        folderId={folderId}
      />
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 dark:bg-gray-900"
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : files && files.items.length > 0 ? (
          <>
            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {files.items.map((file) => (
                  <Card
                    key={file.id}
                    className={`cursor-pointer hover:shadow-lg transition-shadow ${
                      selectedFiles.has(file.id) ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => handleFileClick(file)}
                  >
                    <CardContent className="p-4">
                      {/* Thumbnail */}
                      <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-md mb-3 flex items-center justify-center overflow-hidden">
                        {file.fileType === FileType.IMAGE ? (
                          <img
                            src={file.url}
                            alt={file.originalName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-gray-400">
                            {getFileIcon(file.fileType)}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="space-y-1">
                        <p className="text-sm font-medium truncate" title={file.originalName}>
                          {file.originalName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between mt-3">
                        <Badge variant="secondary" className="text-xs">
                          {file.fileType}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              window.open(file.url, '_blank');
                            }}>
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              window.open(file.url, '_blank');
                            }}>
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteFile(file.id);
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="space-y-2">
                {files.items.map((file) => (
                  <Card
                    key={file.id}
                    className={`cursor-pointer hover:shadow-md transition-shadow ${
                      selectedFiles.has(file.id) ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => handleFileClick(file)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          {/* Icon */}
                          <div className="text-gray-400">
                            {getFileIcon(file.fileType)}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{file.originalName}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>{formatFileSize(file.size)}</span>
                              <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                              <Badge variant="secondary">{file.fileType}</Badge>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              window.open(file.url, '_blank');
                            }}>
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              window.open(file.url, '_blank');
                            }}>
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteFile(file.id);
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {files.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!files.hasPreviousPage}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {files.page} of {files.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!files.hasNextPage}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Upload className="w-16 h-16 mb-4" />
            <p className="text-lg font-medium mb-2">No files yet</p>
            <p className="text-sm mb-4">Drop files here or click upload button</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-full bg-red-100 dark:bg-red-900">
                <Trash2 className="h-5 w-5 text-red-600 dark:text-red-300" />
              </div>
              <div>
                <DialogTitle>Xác nhận xóa file</DialogTitle>
                <DialogDescription>
                  Hành động này không thể hoàn tác
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                    Cảnh báo
                  </h4>
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    Bạn đang xóa <strong>{selectedFiles.size} file</strong>. 
                    Dữ liệu sẽ bị xóa vĩnh viễn khỏi hệ thống.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-sm">
              <p className="font-medium mb-2">File sẽ bị xóa:</p>
              <div className="max-h-[200px] overflow-y-auto bg-muted/30 rounded-md p-3">
                <ul className="space-y-1.5">
                  {Array.from(selectedFiles).slice(0, 5).map((id) => {
                    const file = files?.items?.find(f => f.id === id);
                    return file ? (
                      <li key={id} className="flex items-center gap-2 text-sm">
                        <FileIcon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                        <span className="truncate">{file.originalName}</span>
                      </li>
                    ) : null;
                  })}
                  {selectedFiles.size > 5 && (
                    <li className="text-muted-foreground italic text-sm pl-6">
                      ... và {selectedFiles.size - 5} file khác
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={confirmBulkDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
