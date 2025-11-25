import { MinioService } from '../minio/minio.service';
import { PrismaService } from '../prisma/prisma.service';
export interface ImageUploadResult {
    success: boolean;
    url: string;
    filename: string;
    bucket: string;
    size: number;
    width?: number;
    height?: number;
    format?: string;
    metadata?: any;
}
export interface ImageEditOptions {
    resize?: {
        width?: number;
        height?: number;
        fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
    };
    crop?: {
        left: number;
        top: number;
        width: number;
        height: number;
    };
    rotate?: number;
    flip?: boolean;
    flop?: boolean;
    blur?: number;
    sharpen?: boolean;
    greyscale?: boolean;
    quality?: number;
    format?: 'jpeg' | 'png' | 'webp' | 'avif';
}
export interface ImageMappingConfig {
    modelName: string;
    idField: string;
    imageField: string;
    recordId: string | number;
}
export declare class ImageUploadService {
    private readonly minioService;
    private readonly prisma;
    private readonly logger;
    constructor(minioService: MinioService, prisma: PrismaService);
    uploadImage(buffer: Buffer, filename: string, bucket?: string, editOptions?: ImageEditOptions): Promise<ImageUploadResult>;
    uploadAndMapImage(buffer: Buffer, filename: string, mappingConfig: ImageMappingConfig, editOptions?: ImageEditOptions): Promise<{
        uploadResult: ImageUploadResult;
        mappingResult: any;
    }>;
    uploadMultipleImages(images: Array<{
        buffer: Buffer;
        filename: string;
    }>, bucket?: string, editOptions?: ImageEditOptions): Promise<ImageUploadResult[]>;
    copyImageFromUrl(imageUrl: string, filename: string, bucket?: string, editOptions?: ImageEditOptions): Promise<ImageUploadResult>;
    generateThumbnail(buffer: Buffer, width?: number, height?: number): Promise<Buffer>;
    private getContentType;
    validateImage(buffer: Buffer): Promise<{
        valid: boolean;
        error?: string;
        metadata?: any;
    }>;
    batchUploadAndMap(items: Array<{
        buffer: Buffer;
        filename: string;
        mappingConfig: ImageMappingConfig;
        editOptions?: ImageEditOptions;
    }>): Promise<Array<{
        uploadResult: ImageUploadResult;
        mappingResult: any;
        error?: string;
    }>>;
}
