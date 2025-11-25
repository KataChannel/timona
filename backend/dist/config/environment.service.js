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
exports.EnvironmentService = void 0;
const common_1 = require("@nestjs/common");
const env_config_service_1 = require("../config/env-config.service");
let EnvironmentService = class EnvironmentService {
    constructor(envConfig) {
        this.envConfig = envConfig;
    }
    getEnvironmentInfo() {
        return {
            application: {
                nodeEnv: this.envConfig.nodeEnv,
                port: this.envConfig.port,
                frontendUrl: this.envConfig.frontendUrl,
                isProduction: this.envConfig.isProduction,
                isDevelopment: this.envConfig.isDevelopment,
            },
            database: {
                hasUrl: !!this.envConfig.databaseUrl,
                url: this.envConfig.databaseUrl ?
                    this.envConfig.databaseUrl.replace(/:[^:@]*@/, ':***@') : 'Not configured',
            },
            redis: {
                host: this.envConfig.redisHost,
                port: this.envConfig.redisPort,
                hasPassword: !!this.envConfig.redisPassword,
            },
            jwt: {
                hasSecret: !!this.envConfig.jwtSecret,
                expiresIn: this.envConfig.jwtExpiresIn,
            },
            minio: {
                endpoint: this.envConfig.minioEndpoint,
                port: this.envConfig.minioPort,
                bucketName: this.envConfig.minioBucketName,
                useSSL: this.envConfig.minioUseSSL,
                hasCredentials: !!(this.envConfig.minioAccessKey && this.envConfig.minioSecretKey),
            },
        };
    }
    validateEnvironment() {
        const missingVars = [];
        if (!this.envConfig.databaseUrl) {
            missingVars.push('DATABASE_URL');
        }
        if (!this.envConfig.jwtSecret || this.envConfig.jwtSecret === 'default-secret-key') {
            missingVars.push('JWT_SECRET');
        }
        if (!this.envConfig.minioAccessKey || this.envConfig.minioAccessKey === 'minioadmin') {
            missingVars.push('MINIO_ACCESS_KEY');
        }
        if (!this.envConfig.minioSecretKey || this.envConfig.minioSecretKey === 'minioadmin') {
            missingVars.push('MINIO_SECRET_KEY');
        }
        return {
            isValid: missingVars.length === 0,
            missingVars,
        };
    }
};
exports.EnvironmentService = EnvironmentService;
exports.EnvironmentService = EnvironmentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [env_config_service_1.EnvConfigService])
], EnvironmentService);
//# sourceMappingURL=environment.service.js.map