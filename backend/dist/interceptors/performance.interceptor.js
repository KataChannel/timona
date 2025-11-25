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
var PerformanceInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const security_audit_service_1 = require("../security/services/security-audit.service");
let PerformanceInterceptor = PerformanceInterceptor_1 = class PerformanceInterceptor {
    constructor(auditService) {
        this.auditService = auditService;
        this.logger = new common_1.Logger(PerformanceInterceptor_1.name);
    }
    intercept(context, next) {
        let request;
        let response;
        let endpoint;
        if (context.getType() === 'http') {
            request = context.switchToHttp().getRequest();
            response = context.switchToHttp().getResponse();
            endpoint = request.path;
        }
        else if (context.getType() === 'graphql') {
            const gqlContext = context.getArgs()[2];
            request = gqlContext?.req || {};
            response = gqlContext?.res || {};
            endpoint = request.body?.operationName || 'GraphQL';
        }
        else {
            return next.handle();
        }
        if (this.shouldSkipLogging(endpoint)) {
            return next.handle();
        }
        const startTime = process.hrtime();
        const startMemory = process.memoryUsage();
        const requestSize = this.calculateRequestSize(request);
        const metrics = {
            startTime,
            startMemory,
            requestSize,
            dbQueryStartTime: Date.now(),
            dbQueryCount: 0,
        };
        request.performanceMetrics = metrics;
        return next.handle().pipe((0, operators_1.tap)(data => {
            const [seconds, nanoseconds] = process.hrtime(startTime);
            const responseTime = seconds * 1000 + nanoseconds / 1000000;
            const endMemory = process.memoryUsage();
            const responseSize = this.calculateResponseSize(data);
            const finalMetrics = {
                ...metrics,
                responseTime,
                responseSize,
                memoryUsage: {
                    heapUsed: endMemory.heapUsed - startMemory.heapUsed,
                    heapTotal: endMemory.heapTotal - startMemory.heapTotal,
                    external: endMemory.external - startMemory.external,
                    rss: endMemory.rss - startMemory.rss,
                },
            };
            this.logPerformanceMetrics(request, response, finalMetrics, data, null, endpoint);
        }), (0, operators_1.catchError)(error => {
            const [seconds, nanoseconds] = process.hrtime(startTime);
            const responseTime = seconds * 1000 + nanoseconds / 1000000;
            const endMemory = process.memoryUsage();
            const finalMetrics = {
                ...metrics,
                responseTime,
                responseSize: 0,
                memoryUsage: {
                    heapUsed: endMemory.heapUsed - startMemory.heapUsed,
                    heapTotal: endMemory.heapTotal - startMemory.heapTotal,
                    external: endMemory.external - startMemory.external,
                    rss: endMemory.rss - startMemory.rss,
                },
            };
            this.logPerformanceMetrics(request, response, finalMetrics, null, error, endpoint);
            throw error;
        }));
    }
    shouldSkipLogging(path) {
        const skipPaths = [
            '/health',
            '/favicon.ico',
            '/metrics',
            '/.well-known',
            '/static',
            '/assets',
        ];
        return skipPaths.some(skipPath => path.startsWith(skipPath));
    }
    calculateRequestSize(request) {
        let size = 0;
        const headers = request.headers || {};
        Object.keys(headers).forEach(key => {
            size += key.length + (headers[key]?.toString().length || 0);
        });
        if (request.body) {
            try {
                size += JSON.stringify(request.body).length;
            }
            catch (error) {
                size += 100;
            }
        }
        if (request.query) {
            try {
                size += JSON.stringify(request.query).length;
            }
            catch (error) {
                size += 50;
            }
        }
        return size;
    }
    calculateResponseSize(data) {
        if (!data)
            return 0;
        try {
            return JSON.stringify(data).length;
        }
        catch (error) {
            return 0;
        }
    }
    async logPerformanceMetrics(request, response, metrics, responseData, error, endpoint) {
        try {
            const endTime = process.hrtime(metrics.startTime);
            const responseTime = Math.round((endTime[0] * 1000) + (endTime[1] * 1e-6));
            const endMemory = process.memoryUsage();
            const memoryUsage = (endMemory.heapUsed - metrics.startMemory.heapUsed) / 1024 / 1024;
            const responseSize = this.calculateResponseSize(responseData);
            const statusCode = response.statusCode || 200;
            const user = request.user;
            const userId = user?.id || user?.sub;
            const method = request.method || 'POST';
            const url = request.url || endpoint || 'GraphQL';
            const path = request.path || endpoint || 'GraphQL';
            const performanceData = {
                heap: {
                    used: endMemory.heapUsed,
                    total: endMemory.heapTotal,
                    external: endMemory.external,
                },
                timing: {
                    responseTime,
                    requestTime: new Date().toISOString(),
                },
                request: {
                    method,
                    url,
                    headers: this.sanitizeHeaders(request.headers || {}),
                    query: request.query || {},
                },
                response: {
                    statusCode,
                    headers: this.sanitizeHeaders(response.getHeaders ? response.getHeaders() : {}),
                },
                error: error ? {
                    message: error.message,
                    stack: error.stack?.split('\n').slice(0, 5).join('\n'),
                } : null,
            };
            await this.auditService.logAuditWithPerformance({
                userId: userId || 'anonymous',
                action: `${method}_${path}`,
                resourceType: 'api_call',
                resourceId: path,
                method: request.method,
                endpoint: request.path,
                success: !error && statusCode < 400,
                errorMessage: error?.message,
                statusCode,
                responseTime,
                requestSize: metrics.requestSize,
                responseSize,
                memoryUsage: Math.round(memoryUsage * 100) / 100,
                dbQueryCount: request.dbQueryCount || 0,
                dbQueryTime: request.dbQueryTime || 0,
                performanceData,
                ipAddress: request.ip || request.connection.remoteAddress,
                userAgent: request.get('User-Agent'),
                sessionId: request.sessionId,
                correlationId: request.get('X-Correlation-ID') || request.get('X-Request-ID'),
            });
            if (responseTime > 1000) {
                this.logger.warn(`Slow API request detected`, {
                    method: request.method,
                    path: request.path,
                    responseTime: `${responseTime}ms`,
                    statusCode,
                    userId,
                    memoryUsage: `${memoryUsage.toFixed(2)}MB`,
                });
            }
            if (memoryUsage > 50) {
                this.logger.warn(`High memory usage detected`, {
                    method,
                    path,
                    memoryUsage: `${memoryUsage.toFixed(2)}MB`,
                    responseTime: `${responseTime}ms`,
                    userId,
                });
            }
        }
        catch (logError) {
            this.logger.error(`Failed to log performance metrics: ${logError.message}`);
        }
    }
    sanitizeHeaders(headers) {
        const sanitized = { ...headers };
        const sensitiveHeaders = [
            'authorization',
            'cookie',
            'x-api-key',
            'x-auth-token',
            'password',
            'secret',
        ];
        sensitiveHeaders.forEach(header => {
            if (sanitized[header]) {
                sanitized[header] = '[REDACTED]';
            }
        });
        return sanitized;
    }
};
exports.PerformanceInterceptor = PerformanceInterceptor;
exports.PerformanceInterceptor = PerformanceInterceptor = PerformanceInterceptor_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [security_audit_service_1.SecurityAuditService])
], PerformanceInterceptor);
//# sourceMappingURL=performance.interceptor.js.map