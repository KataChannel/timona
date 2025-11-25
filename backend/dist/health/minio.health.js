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
var MinioHealthIndicator_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MinioHealthIndicator = void 0;
const common_1 = require("@nestjs/common");
const terminus_1 = require("@nestjs/terminus");
const config_1 = require("@nestjs/config");
const minio_1 = require("minio");
let MinioHealthIndicator = MinioHealthIndicator_1 = class MinioHealthIndicator extends terminus_1.HealthIndicator {
    constructor(configService) {
        super();
        this.configService = configService;
        this.logger = new common_1.Logger(MinioHealthIndicator_1.name);
        const endpoint = this.configService.get('MINIO_ENDPOINT', 'localhost');
        const port = parseInt(this.configService.get('MINIO_PORT', '9000'));
        const useSSL = this.configService.get('MINIO_USE_SSL') === 'true';
        this.logger.log(`MinIO Health Check Config: endpoint=${endpoint}, port=${port}, useSSL=${useSSL}`);
        this.minioClient = new minio_1.Client({
            endPoint: endpoint,
            port: port,
            useSSL: useSSL,
            accessKey: this.configService.get('MINIO_ACCESS_KEY', 'minioadmin'),
            secretKey: this.configService.get('MINIO_SECRET_KEY', 'minioadmin'),
        });
    }
    async isHealthy(key) {
        try {
            const buckets = await this.minioClient.listBuckets();
            this.logger.log(`MinIO health check passed. Found ${buckets.length} buckets`);
            return this.getStatus(key, true, {
                minio: 'up',
                message: 'MinIO connection is healthy',
                bucketsCount: buckets.length,
                buckets: buckets.map(bucket => bucket.name),
            });
        }
        catch (error) {
            this.logger.error(`MinIO health check failed: ${error.message}`, error);
            const result = this.getStatus(key, false, {
                minio: 'down',
                message: error.message,
            });
            throw new terminus_1.HealthCheckError('MinIO health check failed', result);
        }
    }
};
exports.MinioHealthIndicator = MinioHealthIndicator;
exports.MinioHealthIndicator = MinioHealthIndicator = MinioHealthIndicator_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MinioHealthIndicator);
//# sourceMappingURL=minio.health.js.map