"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var ImageUploadService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageUploadService = void 0;
const common_1 = require("@nestjs/common");
const minio_service_1 = require("../minio/minio.service");
const sharp_1 = __importDefault(require("sharp"));
const prisma_service_1 = require("../prisma/prisma.service");
let ImageUploadService = ImageUploadService_1 = class ImageUploadService {
    constructor(minioService, prisma) {
        this.minioService = minioService;
        this.prisma = prisma;
        this.logger = new common_1.Logger(ImageUploadService_1.name);
    }
    async uploadImage(buffer, filename, bucket = 'images', editOptions) {
        try {
            let imageBuffer = buffer;
            let metadata = {};
            if (editOptions) {
                let sharpInstance = (0, sharp_1.default)(buffer);
                if (editOptions.resize) {
                    sharpInstance = sharpInstance.resize({
                        width: editOptions.resize.width,
                        height: editOptions.resize.height,
                        fit: editOptions.resize.fit || 'cover',
                    });
                }
                if (editOptions.crop) {
                    sharpInstance = sharpInstance.extract(editOptions.crop);
                }
                if (editOptions.rotate) {
                    sharpInstance = sharpInstance.rotate(editOptions.rotate);
                }
                if (editOptions.flip) {
                    sharpInstance = sharpInstance.flip();
                }
                if (editOptions.flop) {
                    sharpInstance = sharpInstance.flop();
                }
                if (editOptions.blur) {
                    sharpInstance = sharpInstance.blur(editOptions.blur);
                }
                if (editOptions.sharpen) {
                    sharpInstance = sharpInstance.sharpen();
                }
                if (editOptions.greyscale) {
                    sharpInstance = sharpInstance.greyscale();
                }
                const format = editOptions.format || 'jpeg';
                const quality = editOptions.quality || 80;
                switch (format) {
                    case 'jpeg':
                        sharpInstance = sharpInstance.jpeg({ quality });
                        break;
                    case 'png':
                        sharpInstance = sharpInstance.png({ quality });
                        break;
                    case 'webp':
                        sharpInstance = sharpInstance.webp({ quality });
                        break;
                    case 'avif':
                        sharpInstance = sharpInstance.avif({ quality });
                        break;
                }
                imageBuffer = await sharpInstance.toBuffer();
                metadata = await (0, sharp_1.default)(imageBuffer).metadata();
            }
            else {
                metadata = await (0, sharp_1.default)(buffer).metadata();
            }
            const contentType = this.getContentType(editOptions?.format || metadata.format || 'jpeg');
            const uploadResult = await this.minioService.uploadFile(bucket, filename, imageBuffer, contentType);
            this.logger.log(`Image uploaded successfully: ${filename}`);
            return {
                success: true,
                url: uploadResult,
                filename,
                bucket,
                size: imageBuffer.length,
                width: metadata.width,
                height: metadata.height,
                format: metadata.format,
                metadata,
            };
        }
        catch (error) {
            this.logger.error('Error uploading image:', error);
            throw new Error(`Failed to upload image: ${error.message}`);
        }
    }
    async uploadAndMapImage(buffer, filename, mappingConfig, editOptions) {
        try {
            const uploadResult = await this.uploadImage(buffer, filename, 'images', editOptions);
            const model = this.prisma[mappingConfig.modelName];
            if (!model) {
                throw new Error(`Model ${mappingConfig.modelName} not found`);
            }
            const updateData = {};
            updateData[mappingConfig.imageField] = uploadResult.url;
            const whereCondition = {};
            whereCondition[mappingConfig.idField] = mappingConfig.recordId;
            const mappingResult = await model.update({
                where: whereCondition,
                data: updateData,
            });
            this.logger.log(`Image mapped to ${mappingConfig.modelName}[${mappingConfig.recordId}]`);
            return { uploadResult, mappingResult };
        }
        catch (error) {
            this.logger.error('Error uploading and mapping image:', error);
            throw error;
        }
    }
    async uploadMultipleImages(images, bucket = 'images', editOptions) {
        const results = [];
        for (const image of images) {
            try {
                const result = await this.uploadImage(image.buffer, image.filename, bucket, editOptions);
                results.push(result);
            }
            catch (error) {
                this.logger.error(`Error uploading ${image.filename}:`, error);
                results.push({
                    success: false,
                    url: '',
                    filename: image.filename,
                    bucket,
                    size: 0,
                });
            }
        }
        return results;
    }
    async copyImageFromUrl(imageUrl, filename, bucket = 'images', editOptions) {
        try {
            const response = await fetch(imageUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch image: ${response.statusText}`);
            }
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            return await this.uploadImage(buffer, filename, bucket, editOptions);
        }
        catch (error) {
            this.logger.error('Error copying image from URL:', error);
            throw error;
        }
    }
    async generateThumbnail(buffer, width = 200, height = 200) {
        try {
            return await (0, sharp_1.default)(buffer)
                .resize(width, height, {
                fit: 'cover',
            })
                .jpeg({ quality: 70 })
                .toBuffer();
        }
        catch (error) {
            this.logger.error('Error generating thumbnail:', error);
            throw error;
        }
    }
    getContentType(format) {
        const contentTypes = {
            jpeg: 'image/jpeg',
            jpg: 'image/jpeg',
            png: 'image/png',
            webp: 'image/webp',
            avif: 'image/avif',
            gif: 'image/gif',
            svg: 'image/svg+xml',
        };
        return contentTypes[format.toLowerCase()] || 'image/jpeg';
    }
    async validateImage(buffer) {
        try {
            const metadata = await (0, sharp_1.default)(buffer).metadata();
            const allowedFormats = ['jpeg', 'png', 'webp', 'avif', 'gif'];
            if (!allowedFormats.includes(metadata.format || '')) {
                return {
                    valid: false,
                    error: `Invalid image format: ${metadata.format}`,
                };
            }
            if (buffer.length > 10 * 1024 * 1024) {
                return {
                    valid: false,
                    error: 'Image size exceeds 10MB',
                };
            }
            return {
                valid: true,
                metadata,
            };
        }
        catch (error) {
            return {
                valid: false,
                error: `Invalid image: ${error.message}`,
            };
        }
    }
    async batchUploadAndMap(items) {
        const results = [];
        for (const item of items) {
            try {
                const result = await this.uploadAndMapImage(item.buffer, item.filename, item.mappingConfig, item.editOptions);
                results.push(result);
            }
            catch (error) {
                this.logger.error(`Error processing ${item.filename}:`, error);
                results.push({
                    uploadResult: {
                        success: false,
                        url: '',
                        filename: item.filename,
                        bucket: 'images',
                        size: 0,
                    },
                    mappingResult: null,
                    error: error.message,
                });
            }
        }
        return results;
    }
};
exports.ImageUploadService = ImageUploadService;
exports.ImageUploadService = ImageUploadService = ImageUploadService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [minio_service_1.MinioService,
        prisma_service_1.PrismaService])
], ImageUploadService);
//# sourceMappingURL=image-upload.service.js.map