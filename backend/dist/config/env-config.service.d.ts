import { ConfigService } from '@nestjs/config';
export declare class EnvConfigService {
    private readonly configService;
    constructor(configService: ConfigService);
    get nodeEnv(): string;
    get port(): number;
    get frontendUrl(): string;
    get databaseUrl(): string;
    get redisHost(): string;
    get redisPort(): number;
    get redisPassword(): string;
    get jwtSecret(): string;
    get jwtExpiresIn(): string;
    get minioEndpoint(): string;
    get minioPort(): number;
    get minioAccessKey(): string;
    get minioSecretKey(): string;
    get minioUseSSL(): boolean;
    get minioBucketName(): string;
    get isProduction(): boolean;
    get isDevelopment(): boolean;
    logConfiguration(): void;
}
