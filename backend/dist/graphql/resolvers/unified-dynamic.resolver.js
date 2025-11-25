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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnifiedDynamicResolver = exports.SupportedModel = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const dynamic_crud_service_1 = require("../../services/dynamic-crud.service");
const graphql_type_json_1 = require("graphql-type-json");
const unified_dynamic_inputs_1 = require("../inputs/unified-dynamic.inputs");
var SupportedModel;
(function (SupportedModel) {
    SupportedModel["User"] = "user";
    SupportedModel["Task"] = "task";
    SupportedModel["Post"] = "post";
    SupportedModel["Comment"] = "comment";
    SupportedModel["Page"] = "page";
    SupportedModel["PageBlock"] = "pageBlock";
    SupportedModel["TaskComment"] = "taskComment";
    SupportedModel["Notification"] = "notification";
    SupportedModel["AuditLog"] = "auditLog";
    SupportedModel["Role"] = "role";
    SupportedModel["Permission"] = "permission";
})(SupportedModel || (exports.SupportedModel = SupportedModel = {}));
(0, graphql_1.registerEnumType)(SupportedModel, {
    name: 'SupportedModel',
    description: 'Supported models for dynamic operations'
});
let UnifiedDynamicResolver = class UnifiedDynamicResolver {
    constructor(dynamicCrud) {
        this.dynamicCrud = dynamicCrud;
    }
    async findMany(modelName, input, context) {
        try {
            const userId = context?.req?.user?.id;
            return await this.dynamicCrud.findMany(modelName, input);
        }
        catch (error) {
            throw new Error(`Failed to find ${modelName} records: ${error.message}`);
        }
    }
    async findManyPaginated(modelName, input, context) {
        try {
            const userId = context?.req?.user?.id;
            return await this.dynamicCrud.findManyPaginated(modelName, input);
        }
        catch (error) {
            throw new Error(`Failed to find paginated ${modelName} records: ${error.message}`);
        }
    }
    async findById(modelName, input, context) {
        try {
            const userId = context?.req?.user?.id;
            return await this.dynamicCrud.findById(modelName, input.id, {
                select: input.select,
                include: input.include
            });
        }
        catch (error) {
            throw new Error(`Failed to find ${modelName} by ID: ${error.message}`);
        }
    }
    async count(modelName, where, context) {
        try {
            return await this.dynamicCrud.count(modelName, where);
        }
        catch (error) {
            throw new Error(`Failed to count ${modelName} records: ${error.message}`);
        }
    }
    async createOne(modelName, input, context) {
        try {
            if (modelName === 'Project' && !input.data.ownerId && context?.req?.user?.id) {
                input.data.ownerId = context.req.user.id;
            }
            return await this.dynamicCrud.create(modelName, input.data, {
                select: input.select,
                include: input.include
            }, context);
        }
        catch (error) {
            throw new Error(`Failed to create ${modelName}: ${error.message}`);
        }
    }
    async updateOne(modelName, input, context) {
        try {
            return await this.dynamicCrud.update(modelName, input.id, input.data, {
                select: input.select,
                include: input.include
            });
        }
        catch (error) {
            throw new Error(`Failed to update ${modelName}: ${error.message}`);
        }
    }
    async deleteOne(modelName, input, context) {
        try {
            return await this.dynamicCrud.delete(modelName, input.id, {
                select: input.select,
                include: input.include
            });
        }
        catch (error) {
            throw new Error(`Failed to delete ${modelName}: ${error.message}`);
        }
    }
    async createMany(modelName, input, context) {
        try {
            if (modelName === 'Project' && context?.req?.user?.id) {
                input.data = input.data.map(item => ({
                    ...item,
                    ownerId: item.ownerId || context.req.user.id
                }));
            }
            return await this.dynamicCrud.bulkCreate(modelName, input.data, {
                skipDuplicates: input.skipDuplicates,
                select: input.select,
                include: input.include
            }, context);
        }
        catch (error) {
            throw new Error(`Failed to bulk create ${modelName}: ${error.message}`);
        }
    }
    async updateMany(modelName, input, context) {
        try {
            return await this.dynamicCrud.bulkUpdate(modelName, input.where, input.data, {
                select: input.select,
                include: input.include
            });
        }
        catch (error) {
            throw new Error(`Failed to bulk update ${modelName}: ${error.message}`);
        }
    }
    async deleteMany(modelName, input, context) {
        try {
            return await this.dynamicCrud.bulkDelete(modelName, input.where, {
                select: input.select,
                include: input.include
            });
        }
        catch (error) {
            throw new Error(`Failed to bulk delete ${modelName}: ${error.message}`);
        }
    }
    async exists(modelName, where, context) {
        try {
            return await this.dynamicCrud.exists(modelName, where);
        }
        catch (error) {
            throw new Error(`Failed to check if ${modelName} exists: ${error.message}`);
        }
    }
    async upsert(modelName, where, create, update, select, include, context) {
        try {
            return await this.dynamicCrud.upsert(modelName, where, create, update, {
                select,
                include
            });
        }
        catch (error) {
            throw new Error(`Failed to upsert ${modelName}: ${error.message}`);
        }
    }
};
exports.UnifiedDynamicResolver = UnifiedDynamicResolver;
__decorate([
    (0, graphql_1.Query)(() => [graphql_type_json_1.GraphQLJSONObject], {
        name: 'findMany',
        description: 'Find all records for a model with Prisma-like syntax'
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('modelName', { type: () => String })),
    __param(1, (0, graphql_1.Args)('input', { type: () => unified_dynamic_inputs_1.UnifiedFindManyInput, nullable: true })),
    __param(2, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, unified_dynamic_inputs_1.UnifiedFindManyInput, Object]),
    __metadata("design:returntype", Promise)
], UnifiedDynamicResolver.prototype, "findMany", null);
__decorate([
    (0, graphql_1.Query)(() => graphql_type_json_1.GraphQLJSONObject, {
        name: 'findManyPaginated',
        description: 'Find records with pagination'
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('modelName', { type: () => String })),
    __param(1, (0, graphql_1.Args)('input', { type: () => unified_dynamic_inputs_1.UnifiedPaginatedInput, nullable: true })),
    __param(2, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, unified_dynamic_inputs_1.UnifiedPaginatedInput, Object]),
    __metadata("design:returntype", Promise)
], UnifiedDynamicResolver.prototype, "findManyPaginated", null);
__decorate([
    (0, graphql_1.Query)(() => graphql_type_json_1.GraphQLJSONObject, {
        name: 'findById',
        description: 'Find a unique record by ID'
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('modelName', { type: () => String })),
    __param(1, (0, graphql_1.Args)('input', { type: () => unified_dynamic_inputs_1.UnifiedFindByIdInput })),
    __param(2, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, unified_dynamic_inputs_1.UnifiedFindByIdInput, Object]),
    __metadata("design:returntype", Promise)
], UnifiedDynamicResolver.prototype, "findById", null);
__decorate([
    (0, graphql_1.Query)(() => Number, {
        name: 'count',
        description: 'Count records matching the criteria'
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('modelName', { type: () => String })),
    __param(1, (0, graphql_1.Args)('where', { type: () => graphql_type_json_1.GraphQLJSONObject, nullable: true })),
    __param(2, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], UnifiedDynamicResolver.prototype, "count", null);
__decorate([
    (0, graphql_1.Mutation)(() => graphql_type_json_1.GraphQLJSONObject, {
        name: 'createOne',
        description: 'Create a single record with Prisma-like syntax'
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('modelName', { type: () => String })),
    __param(1, (0, graphql_1.Args)('input', { type: () => unified_dynamic_inputs_1.UnifiedCreateInput })),
    __param(2, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, unified_dynamic_inputs_1.UnifiedCreateInput, Object]),
    __metadata("design:returntype", Promise)
], UnifiedDynamicResolver.prototype, "createOne", null);
__decorate([
    (0, graphql_1.Mutation)(() => graphql_type_json_1.GraphQLJSONObject, {
        name: 'updateOne',
        description: 'Update a single record by ID'
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('modelName', { type: () => String })),
    __param(1, (0, graphql_1.Args)('input', { type: () => unified_dynamic_inputs_1.UnifiedUpdateInput })),
    __param(2, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, unified_dynamic_inputs_1.UnifiedUpdateInput, Object]),
    __metadata("design:returntype", Promise)
], UnifiedDynamicResolver.prototype, "updateOne", null);
__decorate([
    (0, graphql_1.Mutation)(() => graphql_type_json_1.GraphQLJSONObject, {
        name: 'deleteOne',
        description: 'Delete a single record by ID'
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('modelName', { type: () => String })),
    __param(1, (0, graphql_1.Args)('input', { type: () => unified_dynamic_inputs_1.UnifiedDeleteInput })),
    __param(2, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, unified_dynamic_inputs_1.UnifiedDeleteInput, Object]),
    __metadata("design:returntype", Promise)
], UnifiedDynamicResolver.prototype, "deleteOne", null);
__decorate([
    (0, graphql_1.Mutation)(() => graphql_type_json_1.GraphQLJSONObject, {
        name: 'createMany',
        description: 'Create multiple records in a single operation'
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('modelName', { type: () => String })),
    __param(1, (0, graphql_1.Args)('input', { type: () => unified_dynamic_inputs_1.UnifiedBulkCreateInput })),
    __param(2, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, unified_dynamic_inputs_1.UnifiedBulkCreateInput, Object]),
    __metadata("design:returntype", Promise)
], UnifiedDynamicResolver.prototype, "createMany", null);
__decorate([
    (0, graphql_1.Mutation)(() => graphql_type_json_1.GraphQLJSONObject, {
        name: 'updateMany',
        description: 'Update multiple records matching criteria'
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('modelName', { type: () => String })),
    __param(1, (0, graphql_1.Args)('input', { type: () => unified_dynamic_inputs_1.UnifiedBulkUpdateInput })),
    __param(2, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, unified_dynamic_inputs_1.UnifiedBulkUpdateInput, Object]),
    __metadata("design:returntype", Promise)
], UnifiedDynamicResolver.prototype, "updateMany", null);
__decorate([
    (0, graphql_1.Mutation)(() => graphql_type_json_1.GraphQLJSONObject, {
        name: 'deleteMany',
        description: 'Delete multiple records matching criteria'
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('modelName', { type: () => String })),
    __param(1, (0, graphql_1.Args)('input', { type: () => unified_dynamic_inputs_1.UnifiedBulkDeleteInput })),
    __param(2, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, unified_dynamic_inputs_1.UnifiedBulkDeleteInput, Object]),
    __metadata("design:returntype", Promise)
], UnifiedDynamicResolver.prototype, "deleteMany", null);
__decorate([
    (0, graphql_1.Query)(() => Boolean, {
        name: 'exists',
        description: 'Check if a record exists matching the criteria'
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('modelName', { type: () => String })),
    __param(1, (0, graphql_1.Args)('where', { type: () => graphql_type_json_1.GraphQLJSONObject })),
    __param(2, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], UnifiedDynamicResolver.prototype, "exists", null);
__decorate([
    (0, graphql_1.Mutation)(() => graphql_type_json_1.GraphQLJSONObject, {
        name: 'upsert',
        description: 'Create or update a record based on criteria'
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('modelName', { type: () => String })),
    __param(1, (0, graphql_1.Args)('where', { type: () => graphql_type_json_1.GraphQLJSONObject })),
    __param(2, (0, graphql_1.Args)('create', { type: () => graphql_type_json_1.GraphQLJSONObject })),
    __param(3, (0, graphql_1.Args)('update', { type: () => graphql_type_json_1.GraphQLJSONObject })),
    __param(4, (0, graphql_1.Args)('select', { type: () => graphql_type_json_1.GraphQLJSONObject, nullable: true })),
    __param(5, (0, graphql_1.Args)('include', { type: () => graphql_type_json_1.GraphQLJSONObject, nullable: true })),
    __param(6, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], UnifiedDynamicResolver.prototype, "upsert", null);
exports.UnifiedDynamicResolver = UnifiedDynamicResolver = __decorate([
    (0, graphql_1.Resolver)(),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [dynamic_crud_service_1.DynamicCRUDService])
], UnifiedDynamicResolver);
//# sourceMappingURL=unified-dynamic.resolver.js.map