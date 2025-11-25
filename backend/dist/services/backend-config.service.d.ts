export interface BackendInvoiceConfig {
    bearerToken: string;
    apiBaseUrl: string;
    timeout: number;
    sslVerification: boolean;
    brandname?: string;
    batchSize: number;
    delayBetweenBatches: number;
    delayBetweenDetailCalls: number;
    maxRetries: number;
}
export declare class BackendConfigService {
    private readonly logger;
    getInvoiceConfig(): BackendInvoiceConfig;
    getBearerToken(): string;
    getBearerTokenSafe(): string;
    getBrandname(): string;
    isTokenConfigured(): boolean;
    getDetailApiEndpoint(): string;
    validateConfiguration(): boolean;
}
