import { FileType, FileVisibility } from '@prisma/client';
export declare class CreateFolderInput {
    name: string;
    description?: string;
    parentId?: string;
    color?: string;
    icon?: string;
}
export declare class UpdateFolderInput {
    id: string;
    name?: string;
    description?: string;
    parentId?: string;
    color?: string;
    icon?: string;
}
export declare class UpdateFileInput {
    id: string;
    title?: string;
    description?: string;
    alt?: string;
    tags?: string[];
    folderId?: string;
    visibility?: FileVisibility;
    metadata?: any;
}
export declare class FileFiltersInput {
    fileType?: FileType;
    folderId?: string;
    visibility?: FileVisibility;
    search?: string;
    tags?: string[];
    mimeType?: string;
}
export declare class CreateFileShareInput {
    fileId: string;
    sharedWith?: string;
    expiresAt?: Date;
    password?: string;
    canDownload?: boolean;
    canView?: boolean;
}
export declare class MoveFilesInput {
    fileIds: string[];
    targetFolderId?: string;
}
export declare class BulkDeleteFilesInput {
    fileIds: string[];
}
export declare class BulkUpdateFilesInput {
    fileIds: string[];
    visibility?: FileVisibility;
    tags?: string[];
    folderId?: string;
}
export declare class GetFilesInput {
    page?: number;
    limit?: number;
    filters?: FileFiltersInput;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    allUsers?: boolean;
}
