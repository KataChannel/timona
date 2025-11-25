import { EnvConfigService } from '../config/env-config.service';
export declare class EnvironmentService {
    private readonly envConfig;
    constructor(envConfig: EnvConfigService);
    getEnvironmentInfo(): {
        application: {
            nodeEnv: string;
            port: number;
            frontendUrl: string;
            isProduction: boolean;
            isDevelopment: boolean;
        };
        database: {
            hasUrl: boolean;
            url: string;
        };
        redis: {
            host: string;
            port: number;
            hasPassword: boolean;
        };
        jwt: {
            hasSecret: boolean;
            expiresIn: string;
        };
        minio: {
            endpoint: string;
            port: number;
            bucketName: string;
            useSSL: boolean;
            hasCredentials: boolean;
        };
    };
    validateEnvironment(): {
        isValid: boolean;
        missingVars: string[];
    };
}
