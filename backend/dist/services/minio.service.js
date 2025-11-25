"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var MinioService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MinioService = void 0;
const common_1 = require("@nestjs/common");
const Minio = __importStar(require("minio"));
const config_1 = require("@nestjs/config");
const sharp_1 = __importDefault(require("sharp"));
let MinioService = MinioService_1 = class MinioService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(MinioService_1.name);
        const isDocker = process.env.DOCKER_NETWORK_NAME !== undefined;
        const internalEndpoint = isDocker
            ? this.configService.get('DOCKER_MINIO_ENDPOINT', 'minio')
            : this.configService.get('MINIO_INTERNAL_ENDPOINT') || this.configService.get('MINIO_ENDPOINT', '116.118.49.243');
        const internalPort = isDocker
            ? this.configService.get('DOCKER_MINIO_PORT', '9000')
            : this.configService.get('MINIO_INTERNAL_PORT') || this.configService.get('MINIO_PORT', '12007');
        const internalSSL = this.configService.get('MINIO_INTERNAL_SSL', 'false') === 'true';
        this.endpoint = internalEndpoint;
        this.port = typeof internalPort === 'string' ? parseInt(internalPort, 10) : internalPort;
        this.useSSL = internalSSL;
        this.bucketName = this.configService.get('MINIO_BUCKET_NAME', 'uploads');
        const isProduction = this.configService.get('NODE_ENV') === 'production';
        const forceHttps = this.configService.get('MINIO_FORCE_HTTPS', 'false') === 'true';
        const publicEndpoint = this.configService.get('MINIO_PUBLIC_ENDPOINT', this.endpoint);
        const publicPort = this.configService.get('MINIO_PUBLIC_PORT', String(this.port));
        const publicSSL = this.configService.get('MINIO_PUBLIC_SSL') === 'true' ||
            this.configService.get('MINIO_USE_SSL', 'false') === 'true';
        const protocol = (publicSSL || isProduction || forceHttps) ? 'https' : 'http';
        const isDefaultPort = (protocol === 'https' && publicPort === '443') || (protocol === 'http' && publicPort === '80');
        this.publicUrl = isDefaultPort
            ? `${protocol}://${publicEndpoint}`
            : `${protocol}://${publicEndpoint}:${publicPort}`;
        this.logger.log(`MinIO Internal Connection: ${this.endpoint}:${this.port} (SSL: ${this.useSSL})`);
        this.logger.log(`MinIO Public URL: ${this.publicUrl}`);
        this.minioClient = new Minio.Client({
            endPoint: this.endpoint,
            port: this.port,
            useSSL: this.useSSL,
            accessKey: this.configService.get('MINIO_ACCESS_KEY', 'minioadmin'),
            secretKey: this.configService.get('MINIO_SECRET_KEY', 'minioadmin'),
        });
    }
    async onModuleInit() {
        await this.ensureBucketExists();
    }
    async ensureBucketExists() {
        try {
            const exists = await this.minioClient.bucketExists(this.bucketName);
            if (!exists) {
                await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
                this.logger.log(`Bucket '${this.bucketName}' created successfully`);
                const policy = {
                    Version: '2012-10-17',
                    Statement: [
                        {
                            Effect: 'Allow',
                            Principal: { AWS: ['*'] },
                            Action: ['s3:GetObject'],
                            Resource: [`arn:aws:s3:::${this.bucketName}/*`],
                        },
                    ],
                };
                await this.minioClient.setBucketPolicy(this.bucketName, JSON.stringify(policy));
                this.logger.log(`Bucket '${this.bucketName}' policy set to public read`);
            }
            else {
                this.logger.log(`Bucket '${this.bucketName}' already exists`);
            }
        }
        catch (error) {
            this.logger.error(`Error ensuring bucket exists: ${error.message}`, error.stack);
            throw error;
        }
    }
    async uploadFile(file, folder = 'general') {
        try {
            let processedBuffer = file.buffer;
            let processedSize = file.size;
            let processedMimeType = file.mimetype;
            let ext = file.originalname.split('.').pop();
            const originalSize = file.size;
            if (file.mimetype.startsWith('image/') && !file.mimetype.includes('svg')) {
                try {
                    this.logger.log(`Optimizing image: ${file.originalname} (${file.size} bytes)`);
                    processedBuffer = await (0, sharp_1.default)(file.buffer)
                        .webp({
                        quality: 90,
                        effort: 6,
                        lossless: false,
                        nearLossless: false,
                        smartSubsample: true,
                    })
                        .toBuffer();
                    processedSize = processedBuffer.length;
                    processedMimeType = 'image/webp';
                    ext = 'webp';
                    const savedBytes = originalSize - processedSize;
                    const savedPercent = ((savedBytes / originalSize) * 100).toFixed(1);
                    this.logger.log(`Image optimized: ${file.originalname} | ` +
                        `Original: ${this.formatBytes(originalSize)} → ` +
                        `WebP: ${this.formatBytes(processedSize)} | ` +
                        `Saved: ${this.formatBytes(savedBytes)} (${savedPercent}%)`);
                }
                catch (error) {
                    this.logger.warn(`Failed to optimize image, using original: ${error.message}`);
                    processedBuffer = file.buffer;
                    processedSize = file.size;
                    processedMimeType = file.mimetype;
                }
            }
            const timestamp = Date.now();
            const randomStr = Math.random().toString(36).substring(2, 15);
            const filename = `${timestamp}-${randomStr}.${ext}`;
            const objectPath = `${folder}/${filename}`;
            const metaData = {
                'Content-Type': processedMimeType,
                'X-Original-Name': file.originalname,
                'X-Original-Size': originalSize.toString(),
                'X-Optimized': file.mimetype.startsWith('image/') ? 'true' : 'false',
            };
            const result = await this.minioClient.putObject(this.bucketName, objectPath, processedBuffer, processedSize, metaData);
            const url = `${this.publicUrl}/${this.bucketName}/${objectPath}`;
            this.logger.log(`File uploaded: ${objectPath} (${processedSize} bytes)`);
            return {
                filename,
                url,
                size: processedSize,
                mimeType: processedMimeType,
                bucket: this.bucketName,
                path: objectPath,
                etag: result.etag,
            };
        }
        catch (error) {
            this.logger.error(`Error uploading file: ${error.message}`, error.stack);
            throw error;
        }
    }
    formatBytes(bytes) {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }
    async uploadStream(stream, filename, mimeType, size, folder = 'general') {
        try {
            const timestamp = Date.now();
            const randomStr = Math.random().toString(36).substring(2, 15);
            const ext = filename.split('.').pop();
            const newFilename = `${timestamp}-${randomStr}.${ext}`;
            const objectPath = `${folder}/${newFilename}`;
            const metaData = {
                'Content-Type': mimeType,
                'X-Original-Name': filename,
            };
            const result = await this.minioClient.putObject(this.bucketName, objectPath, stream, size, metaData);
            const url = `${this.publicUrl}/${this.bucketName}/${objectPath}`;
            this.logger.log(`Stream uploaded: ${objectPath} (${size} bytes)`);
            return {
                filename: newFilename,
                url,
                size,
                mimeType,
                bucket: this.bucketName,
                path: objectPath,
                etag: result.etag,
            };
        }
        catch (error) {
            this.logger.error(`Error uploading stream: ${error.message}`, error.stack);
            throw error;
        }
    }
    async deleteFile(objectPath) {
        try {
            await this.minioClient.removeObject(this.bucketName, objectPath);
            this.logger.log(`File deleted: ${objectPath}`);
        }
        catch (error) {
            this.logger.error(`Error deleting file: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getFile(objectPath) {
        try {
            const stream = await this.minioClient.getObject(this.bucketName, objectPath);
            const chunks = [];
            return new Promise((resolve, reject) => {
                stream.on('data', (chunk) => chunks.push(chunk));
                stream.on('end', () => resolve(Buffer.concat(chunks)));
                stream.on('error', reject);
            });
        }
        catch (error) {
            this.logger.error(`Error getting file: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getPresignedUrl(objectPath, expirySeconds = 3600) {
        try {
            return await this.minioClient.presignedGetObject(this.bucketName, objectPath, expirySeconds);
        }
        catch (error) {
            this.logger.error(`Error generating presigned URL: ${error.message}`, error.stack);
            throw error;
        }
    }
    async listFiles(folder = '') {
        try {
            const objectsStream = this.minioClient.listObjectsV2(this.bucketName, folder, true);
            const objects = [];
            return new Promise((resolve, reject) => {
                objectsStream.on('data', (obj) => objects.push(obj));
                objectsStream.on('end', () => resolve(objects));
                objectsStream.on('error', reject);
            });
        }
        catch (error) {
            this.logger.error(`Error listing files: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getFileStat(objectPath) {
        try {
            return await this.minioClient.statObject(this.bucketName, objectPath);
        }
        catch (error) {
            this.logger.error(`Error getting file stat: ${error.message}`, error.stack);
            throw error;
        }
    }
    async copyFile(sourcePath, destPath) {
        try {
            await this.minioClient.copyObject(this.bucketName, destPath, `/${this.bucketName}/${sourcePath}`, null);
            this.logger.log(`File copied: ${sourcePath} -> ${destPath}`);
        }
        catch (error) {
            this.logger.error(`Error copying file: ${error.message}`, error.stack);
            throw error;
        }
    }
    async createBucket(bucketName) {
        try {
            await this.minioClient.makeBucket(bucketName, 'us-east-1');
            this.logger.log(`Bucket '${bucketName}' created`);
        }
        catch (error) {
            this.logger.error(`Error creating bucket: ${error.message}`, error.stack);
            throw error;
        }
    }
    getClient() {
        return this.minioClient;
    }
    getBucketName() {
        return this.bucketName;
    }
    getPublicUrl() {
        return this.publicUrl;
    }
};
exports.MinioService = MinioService;
exports.MinioService = MinioService = MinioService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MinioService);
//# sourceMappingURL=minio.service.js.map