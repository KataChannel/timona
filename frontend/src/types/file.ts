// File types matching backend enums
export enum FileType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  DOCUMENT = 'DOCUMENT',
  ARCHIVE = 'ARCHIVE',
  OTHER = 'OTHER',
}

export enum FileVisibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  SHARED = 'SHARED',
}

// File interface
export interface File {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  fileType: FileType;
  url: string;
  bucket: string;
  path: string;
  folderId?: string;
  userId: string;
  visibility: FileVisibility;
  title?: string;
  description?: string;
  alt?: string;
  tags: string[];
  metadata?: any;
  width?: number;
  height?: number;
  thumbnailUrl?: string;
  downloadCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  folder?: FileFolder;
}

// FileFolder interface
export interface FileFolder {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  parent?: FileFolder;
  children: FileFolder[];
  path: string;
  userId: string;
  files?: File[];
  color?: string;
  icon?: string;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

// Paginated files response
export interface PaginatedFiles {
  items: File[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Input types
export interface FileFiltersInput {
  fileType?: FileType;
  folderId?: string;
  visibility?: FileVisibility;
  search?: string;
  tags?: string[];
  mimeType?: string;
}

export interface GetFilesInput {
  page?: number;
  limit?: number;
  filters?: FileFiltersInput;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  allUsers?: boolean;
}

export interface UpdateFileInput {
  id: string;
  title?: string;
  description?: string;
  alt?: string;
  tags?: string[];
  folderId?: string;
  visibility?: FileVisibility;
  metadata?: any;
}

export interface CreateFolderInput {
  name: string;
  description?: string;
  parentId?: string;
  color?: string;
  icon?: string;
}

export interface UpdateFolderInput {
  id: string;
  name?: string;
  description?: string;
  parentId?: string;
  color?: string;
  icon?: string;
}

export interface MoveFilesInput {
  fileIds: string[];
  targetFolderId?: string;
}

export interface BulkDeleteFilesInput {
  fileIds: string[];
}

export interface BulkUpdateFilesInput {
  fileIds: string[];
  visibility?: FileVisibility;
  tags?: string[];
  folderId?: string;
}

export interface CreateFileShareInput {
  fileId: string;
  sharedWith?: string;
  expiresAt?: Date;
  password?: string;
  canDownload?: boolean;
  canView?: boolean;
}

// Storage statistics
export interface FileStorageStats {
  totalFiles: number;
  totalSize: number;
  totalFolders: number;
  filesByType: FileTypeCount[];
  filesByVisibility: VisibilityCount[];
}

export interface FileTypeCount {
  type: FileType;
  count: number;
  totalSize: number;
}

export interface VisibilityCount {
  visibility: FileVisibility;
  count: number;
}

// Upload response
export interface UploadResponse {
  success: boolean;
  data: File;
  message?: string;
}

export interface BulkUploadResponse {
  success: boolean;
  data: File[];
  message?: string;
}
