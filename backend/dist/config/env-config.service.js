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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvConfigService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let EnvConfigService = class EnvConfigService {
    constructor(configService) {
        this.configService = configService;
    }
    get nodeEnv() {
        return this.configService.get('NODE_ENV', 'development');
    }
    get port() {
        return this.configService.get('PORT', 4000);
    }
    get frontendUrl() {
        return this.configService.get('FRONTEND_URL', 'http://localhost:3000');
    }
    get databaseUrl() {
        return this.configService.get('DATABASE_URL') || '';
    }
    get redisHost() {
        return this.configService.get('REDIS_HOST', 'localhost');
    }
    get redisPort() {
        return this.configService.get('REDIS_PORT', 6379);
    }
    get redisPassword() {
        return this.configService.get('REDIS_PASSWORD', '');
    }
    get jwtSecret() {
        return this.configService.get('JWT_SECRET') || 'default-secret-key';
    }
    get jwtExpiresIn() {
        return this.configService.get('JWT_EXPIRES_IN', '7d');
    }
    get minioEndpoint() {
        return this.configService.get('MINIO_ENDPOINT', 'localhost');
    }
    get minioPort() {
        return this.configService.get('MINIO_PORT', 9000);
    }
    get minioAccessKey() {
        return this.configService.get('MINIO_ACCESS_KEY') || 'minioadmin';
    }
    get minioSecretKey() {
        return this.configService.get('MINIO_SECRET_KEY') || 'minioadmin';
    }
    get minioUseSSL() {
        return this.configService.get('MINIO_USE_SSL', false);
    }
    get minioBucketName() {
        return this.configService.get('MINIO_BUCKET_NAME', 'uploads');
    }
    get isProduction() {
        return this.nodeEnv === 'production';
    }
    get isDevelopment() {
        return this.nodeEnv === 'development';
    }
    logConfiguration() {
        console.log('🔧 Environment Configuration:');
        console.log(`   NODE_ENV: ${this.nodeEnv}`);
        console.log(`   PORT: ${this.port}`);
        console.log(`   FRONTEND_URL: ${this.frontendUrl}`);
        console.log(`   REDIS_HOST: ${this.redisHost}:${this.redisPort}`);
        console.log(`   MINIO_ENDPOINT: ${this.minioEndpoint}:${this.minioPort}`);
        console.log(`   MINIO_BUCKET: ${this.minioBucketName}`);
        console.log(`   JWT_EXPIRES_IN: ${this.jwtExpiresIn}`);
    }
};
exports.EnvConfigService = EnvConfigService;
exports.EnvConfigService = EnvConfigService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EnvConfigService);
//# sourceMappingURL=env-config.service.js.map