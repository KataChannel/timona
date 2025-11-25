"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var BackendConfigService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackendConfigService = void 0;
const common_1 = require("@nestjs/common");
let BackendConfigService = BackendConfigService_1 = class BackendConfigService {
    constructor() {
        this.logger = new common_1.Logger(BackendConfigService_1.name);
    }
    getInvoiceConfig() {
        const bearerToken = this.getBearerTokenSafe();
        const apiBaseUrl = process.env.INVOICE_API_BASE_URL || 'https://hoadon.vanban.vn';
        const timeout = parseInt(process.env.INVOICE_API_TIMEOUT || '30000', 10);
        const sslVerification = process.env.INVOICE_SSL_VERIFICATION !== 'false';
        const brandname = process.env.INVOICE_BRANDNAME || '';
        const batchSize = parseInt(process.env.INVOICE_BATCH_SIZE || '3', 10);
        const delayBetweenBatches = parseInt(process.env.INVOICE_DELAY_BETWEEN_BATCHES || '3000', 10);
        const delayBetweenDetailCalls = parseInt(process.env.INVOICE_DELAY_BETWEEN_DETAIL_CALLS || '2000', 10);
        const maxRetries = parseInt(process.env.INVOICE_MAX_RETRIES || '5', 10);
        return {
            bearerToken,
            apiBaseUrl,
            timeout,
            sslVerification,
            brandname,
            batchSize,
            delayBetweenBatches,
            delayBetweenDetailCalls,
            maxRetries
        };
    }
    getBearerToken() {
        const token = process.env.INVOICE_BEARER_TOKEN;
        if (!token) {
            throw new Error('INVOICE_BEARER_TOKEN environment variable is required');
        }
        return token;
    }
    getBearerTokenSafe() {
        return process.env.INVOICE_BEARER_TOKEN || '';
    }
    getBrandname() {
        return process.env.INVOICE_BRANDNAME || '';
    }
    isTokenConfigured() {
        const token = this.getBearerTokenSafe();
        return token.length > 0 &&
            token !== 'your-actual-bearer-token-here' &&
            token !== 'your-default-bearer-token-here';
    }
    getDetailApiEndpoint() {
        const config = this.getInvoiceConfig();
        return `${config.apiBaseUrl}/query/invoices/detail`;
    }
    validateConfiguration() {
        try {
            const config = this.getInvoiceConfig();
            const hasValidToken = config.bearerToken.length > 0;
            const hasValidTimeout = config.timeout > 0;
            const hasValidBrandname = config.brandname !== undefined;
            return hasValidToken && hasValidTimeout && hasValidBrandname;
        }
        catch (error) {
            console.error('Configuration validation failed:', error);
            return false;
        }
    }
};
exports.BackendConfigService = BackendConfigService;
exports.BackendConfigService = BackendConfigService = BackendConfigService_1 = __decorate([
    (0, common_1.Injectable)()
], BackendConfigService);
//# sourceMappingURL=backend-config.service.js.map