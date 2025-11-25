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
var EnhancedAuditService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedAuditService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let EnhancedAuditService = EnhancedAuditService_1 = class EnhancedAuditService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(EnhancedAuditService_1.name);
    }
    async logOperation(operation, context = {}, performance) {
        try {
            const auditData = {
                action: operation.action,
                resourceType: operation.resourceType,
                resourceId: operation.resourceId,
                entityName: operation.entityName,
                operationType: operation.operationType || 'CRUD',
                severity: operation.severity || 'info',
                tags: operation.tags || [],
                oldValues: operation.oldValues,
                newValues: operation.newValues,
                details: operation.details,
                user: context.userId ? { connect: { id: context.userId } } : undefined,
                sessionId: context.sessionId,
                correlationId: context.correlationId || this.generateCorrelationId(),
                batchId: context.batchId,
                parentResourceType: context.parentResource?.type,
                parentResourceId: context.parentResource?.id,
                sensitiveData: operation.sensitiveData || false,
                requiresReview: operation.requiresReview || false,
                ipAddress: context.request?.ip,
                userAgent: context.request?.get('user-agent'),
                method: context.request?.method,
                endpoint: context.request?.url,
                responseTime: performance?.responseTime,
                dbQueryTime: performance?.dbQueryTime,
                dbQueryCount: performance?.dbQueryCount,
                memoryUsage: performance?.memoryUsage,
                cpuUsage: performance?.cpuUsage,
                sessionInfo: context.request ? {
                    headers: this.sanitizeHeaders(context.request.headers),
                    query: context.request.query,
                    body: operation.sensitiveData ? '[REDACTED]' : context.request.body
                } : undefined,
                success: true
            };
            await this.prisma.auditLog.create({ data: auditData });
        }
        catch (error) {
            this.logger.error('Failed to create audit log entry', error);
        }
    }
    async logFailure(operation, context, error, statusCode) {
        await this.logOperation({
            ...operation,
            severity: 'error',
            details: {
                ...operation.details,
                error: {
                    message: error.message,
                    stack: error.stack,
                    name: error.name
                }
            }
        }, context);
    }
    async logBatchOperation(operations, context) {
        const batchId = this.generateBatchId();
        for (let i = 0; i < operations.length; i++) {
            await this.logOperation({
                ...operations[i],
                tags: [...(operations[i].tags || []), 'batch']
            }, {
                ...context,
                batchId,
            });
        }
    }
    createAuditDecorator(operation, options = {}) {
        return (target, propertyName, descriptor) => {
            const method = descriptor.value;
            descriptor.value = async function (...args) {
                const startTime = Date.now();
                const context = {
                    correlationId: this.generateCorrelationId()
                };
                try {
                    let oldValues = null;
                    if (operation.action.includes('update') && args[1]?.id) {
                        try {
                            const currentRecord = await this.prisma[operation.resourceType.toLowerCase()]?.findUnique({
                                where: { id: args[1].id }
                            });
                            oldValues = currentRecord;
                        }
                        catch (e) {
                        }
                    }
                    const result = await method.apply(this, args);
                    const responseTime = Date.now() - startTime;
                    await this.logOperation({
                        ...operation,
                        resourceId: result?.id || args[1]?.id,
                        entityName: result?.title || result?.name || result?.email,
                        oldValues: options.captureArgs ? this.sanitizeData(oldValues, options.sensitiveFields) : undefined,
                        newValues: options.captureResult ? this.sanitizeData(result, options.sensitiveFields) : undefined,
                        details: options.captureArgs ? {
                            args: this.sanitizeData(args, options.sensitiveFields)
                        } : undefined
                    }, context, { responseTime });
                    return result;
                }
                catch (error) {
                    const responseTime = Date.now() - startTime;
                    await this.logFailure({
                        ...operation,
                        details: options.captureArgs ? {
                            args: this.sanitizeData(args, options.sensitiveFields)
                        } : undefined
                    }, context, error);
                    throw error;
                }
            };
        };
    }
    async getAuditLogs(filters) {
        const where = {
            ...(filters.userId && { userId: filters.userId }),
            ...(filters.resourceType && { resourceType: filters.resourceType }),
            ...(filters.resourceId && { resourceId: filters.resourceId }),
            ...(filters.action && { action: { contains: filters.action, mode: 'insensitive' } }),
            ...(filters.operationType && { operationType: filters.operationType }),
            ...(filters.severity && { severity: filters.severity }),
            ...(filters.tags?.length && { tags: { hasSome: filters.tags } }),
            ...(filters.correlationId && { correlationId: filters.correlationId }),
            ...(filters.batchId && { batchId: filters.batchId }),
            ...(filters.sensitiveData !== undefined && { sensitiveData: filters.sensitiveData }),
            ...(filters.requiresReview !== undefined && { requiresReview: filters.requiresReview }),
            ...((filters.dateFrom || filters.dateTo) && {
                timestamp: {
                    ...(filters.dateFrom && { gte: filters.dateFrom }),
                    ...(filters.dateTo && { lte: filters.dateTo })
                }
            })
        };
        const page = filters.page || 1;
        const limit = Math.min(filters.limit || 50, 100);
        const skip = (page - 1) * limit;
        const [logs, total] = await Promise.all([
            this.prisma.auditLog.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                            firstName: true,
                            lastName: true
                        }
                    }
                },
                orderBy: { timestamp: 'desc' },
                skip,
                take: limit
            }),
            this.prisma.auditLog.count({ where })
        ]);
        return {
            logs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    async getAuditStats(filters) {
        const where = {
            ...(filters.userId && { userId: filters.userId }),
            ...((filters.dateFrom || filters.dateTo) && {
                timestamp: {
                    ...(filters.dateFrom && { gte: filters.dateFrom }),
                    ...(filters.dateTo && { lte: filters.dateTo })
                }
            })
        };
        const [totalLogs, successRate, operationsByType, severityBreakdown, topResources, averageResponseTime] = await Promise.all([
            this.prisma.auditLog.count({ where }),
            this.prisma.auditLog.count({
                where: { ...where, success: true }
            }).then(successCount => this.prisma.auditLog.count({ where }).then(total => total > 0 ? (successCount / total) * 100 : 0)),
            this.prisma.auditLog.groupBy({
                by: ['operationType'],
                where,
                _count: {
                    operationType: true
                }
            }),
            this.prisma.auditLog.groupBy({
                by: ['severity'],
                where,
                _count: {
                    severity: true
                }
            }),
            this.prisma.auditLog.groupBy({
                by: ['resourceType'],
                where,
                _count: {
                    resourceType: true
                },
                orderBy: {
                    _count: {
                        resourceType: 'desc'
                    }
                },
                take: 10
            }),
            this.prisma.auditLog.aggregate({
                where: { ...where, responseTime: { not: null } },
                _avg: { responseTime: true }
            })
        ]);
        return {
            totalLogs,
            successRate,
            operationsByType,
            severityBreakdown,
            topResources,
            averageResponseTime: averageResponseTime._avg.responseTime
        };
    }
    generateCorrelationId() {
        return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    generateBatchId() {
        return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    sanitizeHeaders(headers) {
        const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
        const sanitized = { ...headers };
        sensitiveHeaders.forEach(header => {
            if (sanitized[header]) {
                sanitized[header] = '[REDACTED]';
            }
        });
        return sanitized;
    }
    sanitizeData(data, sensitiveFields = []) {
        if (!data)
            return data;
        const defaultSensitiveFields = ['password', 'token', 'secret', 'key', 'auth'];
        const allSensitiveFields = [...defaultSensitiveFields, ...sensitiveFields];
        if (typeof data === 'object') {
            const sanitized = { ...data };
            allSensitiveFields.forEach(field => {
                if (sanitized[field]) {
                    sanitized[field] = '[REDACTED]';
                }
            });
            return sanitized;
        }
        return data;
    }
};
exports.EnhancedAuditService = EnhancedAuditService;
exports.EnhancedAuditService = EnhancedAuditService = EnhancedAuditService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EnhancedAuditService);
//# sourceMappingURL=enhanced-audit.service.js.map