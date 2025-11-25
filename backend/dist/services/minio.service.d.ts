import { OnModuleInit } from '@nestjs/common';
import * as Minio from 'minio';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';
export interface UploadResult {
    filename: string;
    url: string;
    size: number;
    mimeType: string;
    bucket: string;
    path: string;
    etag: string;
}
export declare class MinioService implements OnModuleInit {
    private configService;
    private readonly logger;
    private minioClient;
    private readonly bucketName;
    private readonly endpoint;
    private readonly port;
    private readonly useSSL;
    private readonly publicUrl;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    private ensureBucketExists;
    uploadFile(file: Express.Multer.File, folder?: string): Promise<UploadResult>;
    private formatBytes;
    uploadStream(stream: Readable, filename: string, mimeType: string, size: number, folder?: string): Promise<UploadResult>;
    deleteFile(objectPath: string): Promise<void>;
    getFile(objectPath: string): Promise<Buffer>;
    getPresignedUrl(objectPath: string, expirySeconds?: number): Promise<string>;
    listFiles(folder?: string): Promise<Minio.BucketItem[]>;
    getFileStat(objectPath: string): Promise<Minio.BucketItemStat>;
    copyFile(sourcePath: string, destPath: string): Promise<void>;
    createBucket(bucketName: string): Promise<void>;
    getClient(): Minio.Client;
    getBucketName(): string;
    getPublicUrl(): string;
}
