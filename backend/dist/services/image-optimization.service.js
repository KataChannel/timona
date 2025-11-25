"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var ImageOptimizationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageOptimizationService = void 0;
const common_1 = require("@nestjs/common");
const sharp_1 = __importDefault(require("sharp"));
let ImageOptimizationService = ImageOptimizationService_1 = class ImageOptimizationService {
    constructor() {
        this.logger = new common_1.Logger(ImageOptimizationService_1.name);
        this.DEFAULT_OPTIONS = {
            maxWidth: 2048,
            maxHeight: 2048,
            quality: 85,
            format: 'webp',
            progressive: true,
        };
    }
    async optimizeImage(buffer, options = {}) {
        const opts = { ...this.DEFAULT_OPTIONS, ...options };
        try {
            let pipeline = (0, sharp_1.default)(buffer);
            const metadata = await pipeline.metadata();
            this.logger.debug(`Original image: ${metadata.width}x${metadata.height}, format: ${metadata.format}, size: ${buffer.length} bytes`);
            if (opts.maxWidth || opts.maxHeight) {
                pipeline = pipeline.resize({
                    width: opts.maxWidth,
                    height: opts.maxHeight,
                    fit: 'inside',
                    withoutEnlargement: true,
                });
            }
            const targetFormat = opts.format === 'auto'
                ? this.selectBestFormat(metadata.format)
                : opts.format;
            switch (targetFormat) {
                case 'webp':
                    pipeline = pipeline.webp({
                        quality: opts.quality,
                        effort: 4,
                    });
                    break;
                case 'jpeg':
                    pipeline = pipeline.jpeg({
                        quality: opts.quality,
                        progressive: opts.progressive,
                        mozjpeg: true,
                    });
                    break;
                case 'png':
                    pipeline = pipeline.png({
                        quality: opts.quality,
                        compressionLevel: 9,
                        progressive: opts.progressive,
                    });
                    break;
            }
            const optimizedBuffer = await pipeline.toBuffer();
            const optimizedMetadata = await (0, sharp_1.default)(optimizedBuffer).metadata();
            const result = {
                buffer: optimizedBuffer,
                format: targetFormat,
                width: optimizedMetadata.width,
                height: optimizedMetadata.height,
                size: optimizedBuffer.length,
            };
            const compressionRatio = ((1 - optimizedBuffer.length / buffer.length) * 100).toFixed(2);
            this.logger.log(`Image optimized: ${metadata.width}x${metadata.height} -> ${result.width}x${result.height}, ` +
                `${this.formatBytes(buffer.length)} -> ${this.formatBytes(result.size)} (${compressionRatio}% saved)`);
            return result;
        }
        catch (error) {
            this.logger.error('Failed to optimize image:', error);
            throw error;
        }
    }
    async generateResponsiveImages(buffer, sizes = [
        { name: 'thumbnail', width: 150 },
        { name: 'small', width: 320 },
        { name: 'medium', width: 640 },
        { name: 'large', width: 1280 },
        { name: 'xlarge', width: 1920 },
    ]) {
        const results = new Map();
        for (const size of sizes) {
            try {
                const optimized = await this.optimizeImage(buffer, {
                    maxWidth: size.width,
                    format: 'webp',
                });
                results.set(size.name, optimized);
            }
            catch (error) {
                this.logger.error(`Failed to generate ${size.name} size:`, error);
            }
        }
        return results;
    }
    selectBestFormat(originalFormat) {
        if (originalFormat === 'png') {
            return 'webp';
        }
        if (originalFormat === 'gif') {
            return 'webp';
        }
        return 'webp';
    }
    formatBytes(bytes) {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }
    isImage(mimeType) {
        return mimeType.startsWith('image/');
    }
    getExtensionForFormat(format) {
        const extensions = {
            webp: 'webp',
            jpeg: 'jpg',
            png: 'png',
        };
        return extensions[format];
    }
};
exports.ImageOptimizationService = ImageOptimizationService;
exports.ImageOptimizationService = ImageOptimizationService = ImageOptimizationService_1 = __decorate([
    (0, common_1.Injectable)()
], ImageOptimizationService);
//# sourceMappingURL=image-optimization.service.js.map