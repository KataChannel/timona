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
var AuditInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditInterceptor = void 0;
const common_1 = require("@nestjs/common");
const graphql_1 = require("@nestjs/graphql");
const operators_1 = require("rxjs/operators");
const enhanced_audit_service_1 = require("../services/enhanced-audit.service");
let AuditInterceptor = AuditInterceptor_1 = class AuditInterceptor {
    constructor(auditService) {
        this.auditService = auditService;
        this.logger = new common_1.Logger(AuditInterceptor_1.name);
    }
    intercept(context, next) {
        const startTime = Date.now();
        const gqlContext = graphql_1.GqlExecutionContext.create(context);
        const info = gqlContext.getInfo();
        const args = gqlContext.getArgs();
        const contextValue = gqlContext.getContext();
        const request = contextValue.req;
        const userId = contextValue.user?.id || contextValue.userId;
        const sessionId = request?.headers?.['x-session-id'] || contextValue.sessionId;
        const operation = this.analyzeOperation(info, args);
        if (this.shouldSkipAudit(operation, info)) {
            return next.handle();
        }
        const auditContext = {
            userId,
            sessionId: sessionId,
            request,
            correlationId: request?.headers?.['x-correlation-id'],
        };
        return next.handle().pipe((0, operators_1.tap)(async (result) => {
            const responseTime = Date.now() - startTime;
            try {
                await this.auditService.logOperation({
                    ...operation,
                    resourceId: this.extractResourceId(result, args),
                    entityName: this.extractEntityName(result, args),
                    newValues: this.shouldCaptureResult(operation) ? this.sanitizeResult(result) : undefined,
                    details: {
                        operationName: info.operation.name?.value,
                        selectionSet: this.extractSelectionSet(info),
                        variables: this.sanitizeVariables(args)
                    }
                }, auditContext, { responseTime });
            }
            catch (error) {
                this.logger.error('Failed to log audit entry', error);
            }
        }), (0, operators_1.catchError)(async (error) => {
            const responseTime = Date.now() - startTime;
            try {
                await this.auditService.logFailure({
                    ...operation,
                    details: {
                        operationName: info.operation.name?.value,
                        variables: this.sanitizeVariables(args),
                        error: {
                            message: error.message,
                            stack: error.stack
                        }
                    }
                }, auditContext, error);
            }
            catch (auditError) {
                this.logger.error('Failed to log audit failure', auditError);
            }
            throw error;
        }));
    }
    analyzeOperation(info, args) {
        const fieldName = info.fieldName;
        const typeName = info.parentType.name;
        let action = fieldName;
        let operationType = 'CRUD';
        let severity = 'info';
        let tags = [];
        let sensitiveData = false;
        let requiresReview = false;
        if (fieldName.startsWith('create')) {
            action = 'CREATE';
            tags.push('create');
        }
        else if (fieldName.startsWith('update')) {
            action = 'UPDATE';
            tags.push('update');
        }
        else if (fieldName.startsWith('delete') || fieldName.startsWith('remove')) {
            action = 'DELETE';
            severity = 'warn';
            tags.push('delete');
            requiresReview = true;
        }
        else if (fieldName.startsWith('login') || fieldName.startsWith('auth')) {
            action = 'LOGIN';
            operationType = 'AUTH';
            sensitiveData = true;
            tags.push('authentication');
        }
        else if (fieldName.startsWith('logout')) {
            action = 'LOGOUT';
            operationType = 'AUTH';
            tags.push('authentication');
        }
        else if (fieldName.includes('password') || fieldName.includes('token')) {
            operationType = 'SECURITY';
            sensitiveData = true;
            severity = 'warn';
            tags.push('security');
        }
        else if (fieldName.includes('permission') || fieldName.includes('role')) {
            operationType = 'PERMISSION';
            severity = 'warn';
            requiresReview = true;
            tags.push('permission');
        }
        else if (fieldName.startsWith('get') || fieldName.startsWith('find') || fieldName.startsWith('list')) {
            action = 'READ';
            tags.push('read');
        }
        let resourceType = this.extractResourceType(fieldName, info);
        if (fieldName.includes('bulk') || fieldName.includes('many') || Array.isArray(args.data)) {
            tags.push('bulk');
        }
        return {
            action,
            resourceType,
            operationType,
            severity,
            tags,
            sensitiveData,
            requiresReview
        };
    }
    extractResourceType(fieldName, info) {
        const patterns = [
            /^(create|update|delete|get|find|list)([A-Z][a-zA-Z]*)/,
            /^([a-z]+)(Create|Update|Delete|Get|Find|List)/,
        ];
        for (const pattern of patterns) {
            const match = fieldName.match(pattern);
            if (match) {
                return match[2] || match[1];
            }
        }
        const returnType = info.returnType.toString().replace(/[\[\]!]/g, '');
        return returnType || 'Unknown';
    }
    extractResourceId(result, args) {
        if (result?.id)
            return result.id;
        if (args?.id)
            return args.id;
        if (args?.where?.id)
            return args.where.id;
        if (args?.data?.id)
            return args.data.id;
        return undefined;
    }
    extractEntityName(result, args) {
        const nameFields = ['name', 'title', 'displayName', 'username', 'email', 'firstName'];
        for (const field of nameFields) {
            if (result?.[field])
                return result[field];
            if (args?.data?.[field])
                return args.data[field];
        }
        return undefined;
    }
    shouldSkipAudit(operation, info) {
        if (operation.action === 'READ' && !operation.sensitiveData) {
            return true;
        }
        if (info.fieldName.startsWith('__')) {
            return true;
        }
        const skipPatterns = ['ping', 'health', 'version', 'status'];
        if (skipPatterns.some(pattern => info.fieldName.toLowerCase().includes(pattern))) {
            return true;
        }
        return false;
    }
    shouldCaptureResult(operation) {
        return ['CREATE', 'UPDATE'].includes(operation.action) && !operation.sensitiveData;
    }
    sanitizeResult(result) {
        if (!result)
            return result;
        const sensitiveFields = ['password', 'token', 'secret', 'key', 'hash'];
        if (typeof result === 'object') {
            const sanitized = { ...result };
            sensitiveFields.forEach(field => {
                if (sanitized[field]) {
                    sanitized[field] = '[REDACTED]';
                }
            });
            return sanitized;
        }
        return result;
    }
    sanitizeVariables(args) {
        if (!args)
            return args;
        const sensitiveFields = ['password', 'token', 'secret', 'key', 'hash'];
        const sanitized = JSON.parse(JSON.stringify(args));
        const sanitizeObject = (obj) => {
            if (typeof obj === 'object' && obj !== null) {
                Object.keys(obj).forEach(key => {
                    if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
                        obj[key] = '[REDACTED]';
                    }
                    else if (typeof obj[key] === 'object') {
                        sanitizeObject(obj[key]);
                    }
                });
            }
        };
        sanitizeObject(sanitized);
        return sanitized;
    }
    extractSelectionSet(info) {
        const selections = info.fieldNodes[0]?.selectionSet?.selections || [];
        return selections.map((selection) => selection.name?.value).filter(Boolean);
    }
};
exports.AuditInterceptor = AuditInterceptor;
exports.AuditInterceptor = AuditInterceptor = AuditInterceptor_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [enhanced_audit_service_1.EnhancedAuditService])
], AuditInterceptor);
//# sourceMappingURL=audit.interceptor.js.map