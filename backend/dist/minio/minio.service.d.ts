import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class MinioService implements OnModuleInit {
    private readonly configService;
    private readonly logger;
    private minioClient;
    private isReady;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    private initializeWithRetry;
    private testConnection;
    private ensureReady;
    private initializeBuckets;
    uploadFile(bucket: string, fileName: string, buffer: Buffer, contentType: string): Promise<string>;
    deleteFile(bucket: string, fileName: string): Promise<void>;
    getPresignedUrl(bucket: string, fileName: string, expires?: number): Promise<string>;
    getPublicUrl(bucket: string, fileName: string): string;
    uploadAvatar(userId: string, buffer: Buffer, contentType: string): Promise<string>;
    uploadPostImage(postId: string, buffer: Buffer, contentType: string): Promise<string>;
    private getFileExtension;
    uploadSourceDocument(documentId: string, buffer: Buffer, fileName: string, contentType: string): Promise<string>;
    uploadDocumentThumbnail(documentId: string, buffer: Buffer, contentType: string): Promise<string>;
    deleteSourceDocument(fileName: string): Promise<void>;
    getSourceDocumentUrl(fileName: string): Promise<string>;
    private sanitizeFileName;
    generateThumbnailFromVideo(videoBuffer: Buffer): Promise<Buffer>;
    generateThumbnailFromPDF(pdfBuffer: Buffer): Promise<Buffer>;
}
