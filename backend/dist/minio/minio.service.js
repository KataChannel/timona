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
var MinioService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MinioService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const Minio = __importStar(require("minio"));
let MinioService = MinioService_1 = class MinioService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(MinioService_1.name);
        this.isReady = false;
    }
    async onModuleInit() {
        await this.initializeWithRetry();
    }
    async initializeWithRetry(retries = 10) {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const isDockerEnv = process.env.DOCKER_NETWORK_NAME !== undefined;
                const endpoint = isDockerEnv
                    ? this.configService.get('DOCKER_MINIO_ENDPOINT', 'minio')
                    : this.configService.get('MINIO_INTERNAL_ENDPOINT') || this.configService.get('MINIO_ENDPOINT', '116.118.49.243');
                const portConfig = isDockerEnv
                    ? this.configService.get('DOCKER_MINIO_PORT', '9000')
                    : this.configService.get('MINIO_INTERNAL_PORT') || this.configService.get('MINIO_PORT', '12007');
                const port = typeof portConfig === 'string' ? parseInt(portConfig, 10) : portConfig;
                const useSSL = this.configService.get('MINIO_INTERNAL_SSL', 'false') === 'true';
                const accessKey = this.configService.get('MINIO_ACCESS_KEY', 'minioadmin');
                const secretKey = this.configService.get('MINIO_SECRET_KEY', 'minioadmin');
                this.logger.log(`[Minio] Connection attempt ${attempt}/${retries}: endpoint=${endpoint}, port=${port}, SSL=${useSSL}, dockerEnv=${isDockerEnv}`);
                this.minioClient = new Minio.Client({
                    endPoint: endpoint,
                    port: port,
                    useSSL: useSSL,
                    accessKey: accessKey,
                    secretKey: secretKey,
                    region: 'us-east-1',
                });
                await this.testConnection();
                this.isReady = true;
                this.logger.log(`✅ Minio connected successfully`);
                await this.initializeBuckets();
                return;
            }
            catch (error) {
                this.logger.warn(`[Minio] Attempt ${attempt}/${retries} failed: ${error?.message || error}`);
                if (attempt === retries) {
                    this.logger.error(`❌ Failed to connect to Minio after ${retries} attempts: ${error?.message || error}`);
                    this.isReady = false;
                    return;
                }
                const delay = Math.min(500 * Math.pow(2, attempt - 1), 8000);
                this.logger.log(`⏳ Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    async testConnection() {
        await Promise.race([
            this.minioClient.listBuckets(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Minio connection timeout (5s)')), 5000)),
        ]);
    }
    async ensureReady() {
        if (!this.isReady) {
            this.logger.warn('⚠️  Minio not ready, attempting re-initialization...');
            await this.initializeWithRetry(3);
        }
    }
    async initializeBuckets() {
        const buckets = ['avatars', 'posts', 'uploads', 'source-documents'];
        for (const bucket of buckets) {
            try {
                const bucketExists = await this.minioClient.bucketExists(bucket);
                if (!bucketExists) {
                    await this.minioClient.makeBucket(bucket);
                    this.logger.log(`Created bucket: ${bucket}`);
                    const policy = {
                        Version: '2012-10-17',
                        Statement: [
                            {
                                Effect: 'Allow',
                                Principal: { AWS: ['*'] },
                                Action: ['s3:GetObject'],
                                Resource: [`arn:aws:s3:::${bucket}/*`],
                            },
                        ],
                    };
                    await this.minioClient.setBucketPolicy(bucket, JSON.stringify(policy));
                    this.logger.log(`Set public read policy for bucket: ${bucket}`);
                }
            }
            catch (error) {
                this.logger.error(`Error initializing bucket ${bucket}:`, error);
            }
        }
    }
    async uploadFile(bucket, fileName, buffer, contentType) {
        try {
            const uploadInfo = await this.minioClient.putObject(bucket, fileName, buffer, buffer.length, {
                'Content-Type': contentType,
            });
            this.logger.log(`File uploaded successfully: ${fileName}`);
            return this.getPublicUrl(bucket, fileName);
        }
        catch (error) {
            this.logger.error('Error uploading file:', error);
            throw error;
        }
    }
    async deleteFile(bucket, fileName) {
        try {
            await this.minioClient.removeObject(bucket, fileName);
            this.logger.log(`File deleted successfully: ${fileName}`);
        }
        catch (error) {
            this.logger.error('Error deleting file:', error);
            throw error;
        }
    }
    async getPresignedUrl(bucket, fileName, expires = 24 * 60 * 60) {
        try {
            return await this.minioClient.presignedUrl('GET', bucket, fileName, expires);
        }
        catch (error) {
            this.logger.error('Error generating presigned URL:', error);
            throw error;
        }
    }
    getPublicUrl(bucket, fileName) {
        const publicEndpoint = this.configService.get('MINIO_PUBLIC_ENDPOINT') ||
            this.configService.get('MINIO_ENDPOINT', 'localhost');
        const publicPortStr = this.configService.get('MINIO_PUBLIC_PORT') ||
            this.configService.get('MINIO_PORT', '9000');
        const publicPort = typeof publicPortStr === 'string' ? publicPortStr : String(publicPortStr);
        const publicSSL = this.configService.get('MINIO_PUBLIC_SSL') === 'true' ||
            this.configService.get('MINIO_USE_SSL', 'false') === 'true';
        const isProduction = this.configService.get('NODE_ENV') === 'production';
        const forceHttps = this.configService.get('MINIO_FORCE_HTTPS', 'false') === 'true';
        const protocol = (publicSSL || isProduction || forceHttps) ? 'https' : 'http';
        const isDefaultPort = (protocol === 'https' && publicPort === '443') ||
            (protocol === 'http' && publicPort === '80');
        const urlBase = isDefaultPort
            ? `${protocol}://${publicEndpoint}`
            : `${protocol}://${publicEndpoint}:${publicPort}`;
        this.logger.debug(`[getPublicUrl] Generated URL: ${urlBase}/${bucket}/${fileName} (protocol=${protocol}, endpoint=${publicEndpoint}, port=${publicPort}, isDefault=${isDefaultPort})`);
        return `${urlBase}/${bucket}/${fileName}`;
    }
    async uploadAvatar(userId, buffer, contentType) {
        const fileName = `${userId}-${Date.now()}.${this.getFileExtension(contentType)}`;
        return this.uploadFile('avatars', fileName, buffer, contentType);
    }
    async uploadPostImage(postId, buffer, contentType) {
        const fileName = `${postId}-${Date.now()}.${this.getFileExtension(contentType)}`;
        return this.uploadFile('posts', fileName, buffer, contentType);
    }
    getFileExtension(contentType) {
        const mimeTypes = {
            'image/jpeg': 'jpg',
            'image/jpg': 'jpg',
            'image/png': 'png',
            'image/gif': 'gif',
            'image/webp': 'webp',
            'image/svg+xml': 'svg',
        };
        return mimeTypes[contentType] || 'jpg';
    }
    async uploadSourceDocument(documentId, buffer, fileName, contentType) {
        const sanitizedFileName = this.sanitizeFileName(fileName);
        const uniqueFileName = `${documentId}/${Date.now()}-${sanitizedFileName}`;
        return this.uploadFile('source-documents', uniqueFileName, buffer, contentType);
    }
    async uploadDocumentThumbnail(documentId, buffer, contentType) {
        const ext = this.getFileExtension(contentType);
        const fileName = `${documentId}/thumbnail-${Date.now()}.${ext}`;
        return this.uploadFile('source-documents', fileName, buffer, contentType);
    }
    async deleteSourceDocument(fileName) {
        return this.deleteFile('source-documents', fileName);
    }
    async getSourceDocumentUrl(fileName) {
        return this.getPresignedUrl('source-documents', fileName);
    }
    sanitizeFileName(fileName) {
        return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    }
    async generateThumbnailFromVideo(videoBuffer) {
        throw new Error('Video thumbnail generation not implemented yet');
    }
    async generateThumbnailFromPDF(pdfBuffer) {
        throw new Error('PDF thumbnail generation not implemented yet');
    }
};
exports.MinioService = MinioService;
exports.MinioService = MinioService = MinioService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MinioService);
//# sourceMappingURL=minio.service.js.map