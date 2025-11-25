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
exports.ModelSecurityConfigs = exports.DynamicRateLimitService = exports.DynamicValidationService = exports.DynamicSecurityGuard = exports.DynamicSecurity = void 0;
const common_1 = require("@nestjs/common");
const graphql_1 = require("@nestjs/graphql");
const core_1 = require("@nestjs/core");
const client_1 = require("@prisma/client");
const DynamicSecurity = (config) => {
    return (target, propertyName, descriptor) => {
        Reflect.defineMetadata('dynamicSecurity', config, descriptor.value);
    };
};
exports.DynamicSecurity = DynamicSecurity;
let DynamicSecurityGuard = class DynamicSecurityGuard {
    constructor(reflector) {
        this.reflector = reflector;
    }
    async canActivate(context) {
        const gqlContext = graphql_1.GqlExecutionContext.create(context);
        const { req } = gqlContext.getContext();
        const user = req.user;
        const handler = context.getHandler();
        const securityConfig = this.reflector.get('dynamicSecurity', handler);
        if (!securityConfig) {
            return true;
        }
        if (!user) {
            throw new common_1.ForbiddenException('Authentication required');
        }
        const args = gqlContext.getArgs();
        const operation = this.detectOperation(context);
        if (securityConfig.allowedOperations && !securityConfig.allowedOperations.includes(operation)) {
            throw new common_1.ForbiddenException(`Operation ${operation} not allowed for model ${securityConfig.modelName}`);
        }
        if (securityConfig.roleRequirements?.[operation]) {
            const requiredRoles = securityConfig.roleRequirements[operation];
            if (!requiredRoles?.includes(user.role)) {
                throw new common_1.ForbiddenException(`Insufficient permissions for ${operation} on ${securityConfig.modelName}`);
            }
        }
        if (operation.includes('BULK') && securityConfig.maxBulkSize) {
            const bulkData = this.extractBulkData(args);
            if (bulkData && bulkData.length > securityConfig.maxBulkSize) {
                throw new common_1.BadRequestException(`Bulk operation exceeds maximum size of ${securityConfig.maxBulkSize}`);
            }
        }
        await this.checkFieldRestrictions(securityConfig, operation, args, user);
        if (securityConfig.ownershipCheck && ['UPDATE', 'DELETE', 'BULK_UPDATE', 'BULK_DELETE'].includes(operation)) {
            await this.checkOwnership(securityConfig.modelName, args, user);
        }
        return true;
    }
    detectOperation(context) {
        const handler = context.getHandler();
        const handlerName = handler.name;
        if (handlerName.includes('createBulk') || handlerName.includes('CreateBulk'))
            return 'BULK_CREATE';
        if (handlerName.includes('updateBulk') || handlerName.includes('UpdateBulk'))
            return 'BULK_UPDATE';
        if (handlerName.includes('deleteBulk') || handlerName.includes('DeleteBulk'))
            return 'BULK_DELETE';
        if (handlerName.includes('create') || handlerName.includes('Create'))
            return 'CREATE';
        if (handlerName.includes('update') || handlerName.includes('Update'))
            return 'UPDATE';
        if (handlerName.includes('delete') || handlerName.includes('Delete'))
            return 'DELETE';
        return 'READ';
    }
    extractBulkData(args) {
        if (args.input?.data && Array.isArray(args.input.data)) {
            return args.input.data;
        }
        return null;
    }
    async checkFieldRestrictions(config, operation, args, user) {
        const operationType = operation.toLowerCase().replace('bulk_', '');
        if (config.allowedFields?.[operationType]) {
            const data = this.extractOperationData(args, operation);
            if (data) {
                const dataFields = Object.keys(data);
                const allowedFields = config.allowedFields[operationType];
                const unauthorizedFields = dataFields.filter(field => !allowedFields.includes(field));
                if (unauthorizedFields.length > 0) {
                    throw new common_1.ForbiddenException(`Fields not allowed: ${unauthorizedFields.join(', ')}`);
                }
            }
        }
        if (config.restrictedFields?.[operationType]) {
            const data = this.extractOperationData(args, operation);
            if (data) {
                const dataFields = Object.keys(data);
                const restrictedFields = config.restrictedFields[operationType];
                const forbiddenFields = dataFields.filter(field => restrictedFields.includes(field));
                if (forbiddenFields.length > 0) {
                    throw new common_1.ForbiddenException(`Fields are restricted: ${forbiddenFields.join(', ')}`);
                }
            }
        }
    }
    extractOperationData(args, operation) {
        if (operation.includes('BULK')) {
            return args.input?.data?.[0];
        }
        return args.data || args.input?.data;
    }
    async checkOwnership(modelName, args, user) {
        if (args.id) {
        }
        if (args.input?.where) {
        }
    }
};
exports.DynamicSecurityGuard = DynamicSecurityGuard;
exports.DynamicSecurityGuard = DynamicSecurityGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], DynamicSecurityGuard);
let DynamicValidationService = class DynamicValidationService {
    validateInput(modelName, operation, data) {
        switch (modelName.toLowerCase()) {
            case 'user':
                this.validateUserInput(operation, data);
                break;
            case 'post':
                this.validatePostInput(operation, data);
                break;
            case 'task':
                this.validateTaskInput(operation, data);
                break;
            default:
                this.validateGenericInput(operation, data);
        }
    }
    validateUserInput(operation, data) {
        if (operation === 'CREATE' || operation === 'BULK_CREATE') {
            if (!data.email || !this.isValidEmail(data.email)) {
                throw new common_1.BadRequestException('Valid email is required');
            }
            if (!data.username || data.username.length < 3) {
                throw new common_1.BadRequestException('Username must be at least 3 characters long');
            }
        }
        if (data.role && !['USER', 'MODERATOR'].includes(data.role)) {
            throw new common_1.BadRequestException('Invalid role specified');
        }
    }
    validatePostInput(operation, data) {
        if (operation === 'CREATE' || operation === 'BULK_CREATE') {
            if (!data.title || data.title.length < 3) {
                throw new common_1.BadRequestException('Title must be at least 3 characters long');
            }
            if (!data.content || data.content.length < 10) {
                throw new common_1.BadRequestException('Content must be at least 10 characters long');
            }
        }
        if (data.slug && !/^[a-z0-9-]+$/.test(data.slug)) {
            throw new common_1.BadRequestException('Slug must contain only lowercase letters, numbers, and hyphens');
        }
    }
    validateTaskInput(operation, data) {
        if (operation === 'CREATE' || operation === 'BULK_CREATE') {
            if (!data.title || data.title.length < 3) {
                throw new common_1.BadRequestException('Task title must be at least 3 characters long');
            }
        }
        if (data.priority && !['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(data.priority)) {
            throw new common_1.BadRequestException('Invalid priority value');
        }
        if (data.status && !['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].includes(data.status)) {
            throw new common_1.BadRequestException('Invalid status value');
        }
        if (data.dueDate) {
            const dueDate = new Date(data.dueDate);
            if (dueDate < new Date()) {
                throw new common_1.BadRequestException('Due date cannot be in the past');
            }
        }
    }
    validateGenericInput(operation, data) {
        if (typeof data !== 'object' || data === null) {
            throw new common_1.BadRequestException('Invalid data format');
        }
        this.checkForSQLInjection(data);
        this.checkForXSS(data);
    }
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    checkForSQLInjection(data) {
        const sqlPatterns = [
            /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER)\b)/i,
            /(--|\/\*|\*\/|;|'|")/,
            /(\b(OR|AND)\b.*=.*)/i
        ];
        const dataString = JSON.stringify(data).toLowerCase();
        for (const pattern of sqlPatterns) {
            if (pattern.test(dataString)) {
                throw new common_1.BadRequestException('Potentially malicious input detected');
            }
        }
    }
    checkForXSS(data) {
        const xssPatterns = [
            /<script[^>]*>.*?<\/script>/gi,
            /<iframe[^>]*>.*?<\/iframe>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /<[^>]*on\w+\s*=.*?>/gi
        ];
        const dataString = JSON.stringify(data);
        for (const pattern of xssPatterns) {
            if (pattern.test(dataString)) {
                throw new common_1.BadRequestException('Potentially malicious script detected');
            }
        }
    }
    validateBulkInput(modelName, operation, data, maxSize = 100) {
        if (!Array.isArray(data)) {
            throw new common_1.BadRequestException('Bulk data must be an array');
        }
        if (data.length === 0) {
            throw new common_1.BadRequestException('Bulk data cannot be empty');
        }
        if (data.length > maxSize) {
            throw new common_1.BadRequestException(`Bulk operation exceeds maximum size of ${maxSize}`);
        }
        data.forEach((item, index) => {
            try {
                this.validateInput(modelName, operation, item);
            }
            catch (error) {
                throw new common_1.BadRequestException(`Item ${index}: ${error.message}`);
            }
        });
    }
};
exports.DynamicValidationService = DynamicValidationService;
exports.DynamicValidationService = DynamicValidationService = __decorate([
    (0, common_1.Injectable)()
], DynamicValidationService);
let DynamicRateLimitService = class DynamicRateLimitService {
    constructor() {
        this.requestCounts = new Map();
    }
    checkRateLimit(userId, operation, modelName) {
        const key = `${userId}:${operation}:${modelName}`;
        const now = Date.now();
        const windowMs = this.getRateLimitWindow(operation);
        const maxRequests = this.getMaxRequests(operation);
        const current = this.requestCounts.get(key);
        if (!current || now > current.resetTime) {
            this.requestCounts.set(key, {
                count: 1,
                resetTime: now + windowMs
            });
            return;
        }
        if (current.count >= maxRequests) {
            throw new common_1.BadRequestException(`Rate limit exceeded for ${operation} on ${modelName}`);
        }
        current.count++;
    }
    getRateLimitWindow(operation) {
        switch (operation) {
            case 'BULK_CREATE':
            case 'BULK_UPDATE':
            case 'BULK_DELETE':
                return 60000;
            case 'CREATE':
            case 'UPDATE':
            case 'DELETE':
                return 10000;
            default:
                return 5000;
        }
    }
    getMaxRequests(operation) {
        switch (operation) {
            case 'BULK_CREATE':
            case 'BULK_UPDATE':
            case 'BULK_DELETE':
                return 5;
            case 'CREATE':
            case 'UPDATE':
            case 'DELETE':
                return 50;
            default:
                return 100;
        }
    }
};
exports.DynamicRateLimitService = DynamicRateLimitService;
exports.DynamicRateLimitService = DynamicRateLimitService = __decorate([
    (0, common_1.Injectable)()
], DynamicRateLimitService);
exports.ModelSecurityConfigs = {
    User: {
        modelName: 'User',
        allowedOperations: ['CREATE', 'READ', 'UPDATE'],
        roleRequirements: {
            CREATE: [client_1.$Enums.UserRoleType.ADMIN],
            BULK_CREATE: [client_1.$Enums.UserRoleType.ADMIN],
            BULK_UPDATE: [client_1.$Enums.UserRoleType.ADMIN],
            BULK_DELETE: [client_1.$Enums.UserRoleType.ADMIN],
            DELETE: [client_1.$Enums.UserRoleType.ADMIN]
        },
        maxBulkSize: 50,
        restrictedFields: {
            create: ['role', 'isVerified', 'failedLoginAttempts'],
            update: ['role', 'password']
        },
        ownershipCheck: true
    },
    Post: {
        modelName: 'Post',
        allowedOperations: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'BULK_CREATE', 'BULK_UPDATE'],
        roleRequirements: {
            CREATE: [client_1.$Enums.UserRoleType.USER, client_1.$Enums.UserRoleType.ADMIN],
            UPDATE: [client_1.$Enums.UserRoleType.USER, client_1.$Enums.UserRoleType.ADMIN],
            DELETE: [client_1.$Enums.UserRoleType.USER, client_1.$Enums.UserRoleType.ADMIN],
            BULK_CREATE: [client_1.$Enums.UserRoleType.ADMIN],
            BULK_UPDATE: [client_1.$Enums.UserRoleType.ADMIN]
        },
        maxBulkSize: 20,
        ownershipCheck: true
    },
    Task: {
        modelName: 'Task',
        allowedOperations: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'BULK_CREATE', 'BULK_UPDATE', 'BULK_DELETE'],
        roleRequirements: {
            READ: [client_1.$Enums.UserRoleType.USER, client_1.$Enums.UserRoleType.ADMIN, client_1.$Enums.UserRoleType.ADMIN],
            CREATE: [client_1.$Enums.UserRoleType.USER, client_1.$Enums.UserRoleType.ADMIN, client_1.$Enums.UserRoleType.ADMIN],
            UPDATE: [client_1.$Enums.UserRoleType.USER, client_1.$Enums.UserRoleType.ADMIN, client_1.$Enums.UserRoleType.ADMIN],
            DELETE: [client_1.$Enums.UserRoleType.USER, client_1.$Enums.UserRoleType.ADMIN, client_1.$Enums.UserRoleType.ADMIN]
        },
        maxBulkSize: 100,
        ownershipCheck: true
    },
    Comment: {
        modelName: 'Comment',
        allowedOperations: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
        roleRequirements: {
            CREATE: [client_1.$Enums.UserRoleType.USER, client_1.$Enums.UserRoleType.ADMIN, client_1.$Enums.UserRoleType.ADMIN],
            UPDATE: [client_1.$Enums.UserRoleType.USER, client_1.$Enums.UserRoleType.ADMIN, client_1.$Enums.UserRoleType.ADMIN],
            DELETE: [client_1.$Enums.UserRoleType.USER, client_1.$Enums.UserRoleType.ADMIN, client_1.$Enums.UserRoleType.ADMIN]
        },
        maxBulkSize: 10,
        restrictedFields: {
            create: ['userId'],
            update: ['userId', 'postId']
        },
        ownershipCheck: true
    }
};
//# sourceMappingURL=dynamic-security.guard.js.map