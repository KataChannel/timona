import { MinioService } from '../../minio/minio.service';
import { PrismaService } from '../../prisma/prisma.service';
import { FileUpload } from 'graphql-upload-ts';
export interface UploadResult {
    id: string;
    url: string;
    filename: string;
    mimetype: string;
    size: number;
    bucket: string;
}
export declare class FilesService {
    private readonly minioService;
    private readonly prisma;
    private readonly logger;
    private readonly ALLOWED_IMAGE_TYPES;
    private readonly ALLOWED_VIDEO_TYPES;
    private readonly ALLOWED_DOCUMENT_TYPES;
    private readonly MAX_FILE_SIZE;
    constructor(minioService: MinioService, prisma: PrismaService);
    uploadFile(file: FileUpload, userId: string, type: 'image' | 'video' | 'document'): Promise<UploadResult>;
    uploadLessonVideo(file: FileUpload, userId: string, courseId: string): Promise<UploadResult>;
    uploadCourseThumbnail(file: FileUpload, userId: string, courseId?: string): Promise<UploadResult>;
    uploadCourseMaterial(file: FileUpload, userId: string, courseId: string): Promise<UploadResult>;
    deleteFile(fileId: string, bucket: string, userId: string): Promise<boolean>;
    getPresignedUrl(fileId: string, bucket: string, expiresIn?: number): Promise<string>;
    private validateFileType;
    private validateFileSize;
    private getFileExtension;
    private getBucketName;
}
