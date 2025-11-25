import { FileService } from '../../services/file.service';
import { File, FileUploadResponse, PaginatedFiles, FileStorageStats, FileShare } from '../models/file.model';
import { UpdateFileInput, GetFilesInput, CreateFileShareInput, MoveFilesInput, BulkDeleteFilesInput, BulkUpdateFilesInput } from '../inputs/file.input';
export declare class FileResolver {
    private fileService;
    constructor(fileService: FileService);
    uploadFile(file: any, folderId: string, metadata: any, context: any): Promise<FileUploadResponse>;
    getFile(id: string, context: any): Promise<File>;
    getFiles(input: GetFilesInput, context: any): Promise<PaginatedFiles>;
    updateFile(input: UpdateFileInput, context: any): Promise<File>;
    deleteFile(id: string, context: any): Promise<boolean>;
    moveFiles(input: MoveFilesInput, context: any): Promise<File[]>;
    bulkDeleteFiles(input: BulkDeleteFilesInput, context: any): Promise<number>;
    bulkUpdateFiles(input: BulkUpdateFilesInput, context: any): Promise<File[]>;
    getStorageStats(context: any): Promise<FileStorageStats>;
    createFileShare(input: CreateFileShareInput, context: any): Promise<FileShare>;
}
