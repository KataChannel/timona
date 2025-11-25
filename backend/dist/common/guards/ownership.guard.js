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
exports.OwnershipGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const prisma_service_1 = require("../../prisma/prisma.service");
const rbac_service_1 = require("../services/rbac.service");
const ownership_decorator_1 = require("../decorators/ownership.decorator");
const rbac_constants_1 = require("../constants/rbac.constants");
let OwnershipGuard = class OwnershipGuard {
    constructor(reflector, prisma, rbacService) {
        this.reflector = reflector;
        this.prisma = prisma;
        this.rbacService = rbacService;
    }
    async canActivate(context) {
        const ownershipReq = this.reflector.getAllAndOverride(ownership_decorator_1.OWNERSHIP_KEY, [context.getHandler(), context.getClass()]);
        if (!ownershipReq) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            throw new common_1.ForbiddenException('User not authenticated');
        }
        if (user.roleType === 'ADMIN') {
            return true;
        }
        const resourceId = request.params[ownershipReq.paramName];
        if (!resourceId) {
            throw new common_1.NotFoundException(`Resource ID not found in params.${ownershipReq.paramName}`);
        }
        if (ownershipReq.allowWithAllScope) {
            const hasAllScope = await this.checkAllScopePermission(user.id, ownershipReq.resource, request.method);
            if (hasAllScope) {
                return true;
            }
        }
        const resource = await this.fetchResource(ownershipReq.resource, resourceId);
        if (!resource) {
            throw new common_1.NotFoundException(`${ownershipReq.resource} with ID ${resourceId} not found`);
        }
        const isOwner = this.checkOwnership(resource, user.id, ownershipReq.ownershipField);
        if (!isOwner) {
            throw new common_1.ForbiddenException(rbac_constants_1.RBAC_ERROR_MESSAGES.OWNERSHIP_REQUIRED);
        }
        return true;
    }
    async checkAllScopePermission(userId, resource, method) {
        const action = this.methodToAction(method);
        return this.rbacService.userHasPermission(userId, resource, action, 'all');
    }
    methodToAction(method) {
        const methodMap = {
            GET: 'read',
            POST: 'create',
            PUT: 'update',
            PATCH: 'update',
            DELETE: 'delete',
        };
        return methodMap[method.toUpperCase()] || 'access';
    }
    async fetchResource(resourceType, resourceId) {
        const modelMap = {
            blog: this.prisma.post,
            post: this.prisma.post,
            product: this.prisma.product,
            page: this.prisma.page,
            template: this.prisma.customTemplate,
            order: this.prisma.order,
            task: this.prisma.task,
            comment: this.prisma.comment,
        };
        const model = modelMap[resourceType.toLowerCase()];
        if (!model) {
            throw new Error(`Unknown resource type: ${resourceType}`);
        }
        return model.findUnique({ where: { id: resourceId } });
    }
    checkOwnership(resource, userId, ownershipField) {
        const fields = Array.isArray(ownershipField)
            ? ownershipField
            : [ownershipField];
        return fields.some((field) => {
            const ownerValue = this.getNestedProperty(resource, field);
            return ownerValue === userId;
        });
    }
    getNestedProperty(obj, path) {
        return path.split('.').reduce((current, prop) => {
            return current?.[prop];
        }, obj);
    }
};
exports.OwnershipGuard = OwnershipGuard;
exports.OwnershipGuard = OwnershipGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        prisma_service_1.PrismaService,
        rbac_service_1.RBACService])
], OwnershipGuard);
//# sourceMappingURL=ownership.guard.js.map