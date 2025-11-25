import { FileType, FileVisibility } from '@prisma/client';
export declare class FileFolder {
    id: string;
    name: string;
    description?: string;
    parentId?: string;
    parent?: FileFolder;
    children: FileFolder[];
    path: string;
    userId: string;
    files: File[];
    color?: string;
    icon?: string;
    isSystem: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare class File {
    id: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    fileType: FileType;
    url: string;
    bucket: string;
    path: string;
    etag?: string;
    folderId?: string;
    folder?: FileFolder;
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
    shares: FileShare[];
    createdAt: Date;
    updatedAt: Date;
}
export declare class FileShare {
    id: string;
    fileId: string;
    file: File;
    sharedBy: string;
    sharedWith?: string;
    token: string;
    expiresAt?: Date;
    password?: string;
    canDownload: boolean;
    canView: boolean;
    accessCount: number;
    lastAccess?: Date;
    createdAt: Date;
}
export declare class PaginatedFiles {
    items: File[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}
export declare class PaginatedFolders {
    items: FileFolder[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}
export declare class FileUploadResponse {
    file: File;
    success: boolean;
    message?: string;
}
export declare class FileStorageStats {
    totalFiles: number;
    totalSize: number;
    totalFolders: number;
    filesByType: FileTypeCount[];
    filesByVisibility: VisibilityCount[];
}
export declare class FileTypeCount {
    type: FileType;
    count: number;
    totalSize: number;
}
export declare class VisibilityCount {
    visibility: FileVisibility;
    count: number;
}
