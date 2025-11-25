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
exports.UniversalDynamicResolver = exports.DynamicResolverService = void 0;
exports.createDynamicResolver = createDynamicResolver;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const dynamic_crud_service_1 = require("../../services/dynamic-crud.service");
const graphql_2 = require("graphql");
const graphql_type_json_1 = require("graphql-type-json");
const DynamicData = new graphql_2.GraphQLScalarType({
    name: 'DynamicData',
    description: 'Dynamic data object',
    serialize: (value) => value,
    parseValue: (value) => value,
    parseLiteral: (ast) => ast.value
});
function createDynamicResolver(modelName, ModelClass, options = {}) {
    const { enableAuth = true, enableBulkOps = true, enablePagination = true, customResolvers = [] } = options;
    let DynamicResolver = class DynamicResolver {
        constructor(dynamicCRUDService) {
            this.dynamicCRUDService = dynamicCRUDService;
        }
        async findAll(filter, context) {
            return await this.dynamicCRUDService.findMany(modelName, filter);
        }
        async findAllPaginated(filter, context) {
            return await this.dynamicCRUDService.findManyWithMeta(modelName, filter);
        }
        async findById(id, options, context) {
            return await this.dynamicCRUDService.findById(modelName, id, options);
        }
        async create(data, options, context) {
            console.log(`📝 Dynamic create ${modelName}:`, {
                authenticated: !!context?.req?.user,
                userId: context?.req?.user?.id,
                dataKeys: Object.keys(data || {}),
                hasOwnerId: !!data?.ownerId
            });
            if (context?.req?.user && data) {
                data.userId = data.userId || context.req.user.id;
                data.createdBy = data.createdBy || context.req.user.id;
                if (modelName === 'Project' && !data.ownerId) {
                    console.log(`🔄 Mapping userId to ownerId for Project:`, context.req.user.id);
                    data.ownerId = context.req.user.id;
                }
            }
            else if (modelName === 'Project') {
                console.error('❌ Project creation attempted without authentication', {
                    hasContext: !!context,
                    hasUser: !!context?.req?.user
                });
                throw new common_1.UnauthorizedException('Authentication required to create a project');
            }
            console.log(`✅ After context injection, data:`, {
                name: data?.name,
                ownerId: data?.ownerId,
                userId: data?.userId
            });
            return await this.dynamicCRUDService.create(modelName, data, options, context);
        }
        async createBulk(input, options, context) {
            if (context?.req?.user && input.data) {
                input.data = input.data.map(item => ({
                    ...item,
                    userId: item.userId || context.req.user.id,
                    createdBy: item.createdBy || context.req.user.id,
                    ...(modelName === 'Project' && !item.ownerId ? { ownerId: context.req.user.id } : {})
                }));
            }
            return await this.dynamicCRUDService.createBulk(modelName, input, options, context);
        }
        async update(id, data, options, context) {
            if (context?.req?.user && data) {
                data.updatedBy = data.updatedBy || context.req.user.id;
                data.updatedAt = new Date();
            }
            return await this.dynamicCRUDService.update(modelName, id, data, options);
        }
        async updateBulk(input, options, context) {
            if (context?.req?.user && input.data) {
                input.data.updatedBy = input.data.updatedBy || context.req.user.id;
                input.data.updatedAt = new Date();
            }
            return await this.dynamicCRUDService.updateBulk(modelName, input, options);
        }
        async delete(id, options, context) {
            return await this.dynamicCRUDService.delete(modelName, id, options);
        }
        async deleteBulk(input, options, context) {
            return await this.dynamicCRUDService.deleteBulk(modelName, input, options);
        }
        async upsert(where, create, update, options, context) {
            if (context?.req?.user) {
                create.userId = create.userId || context.req.user.id;
                create.createdBy = create.createdBy || context.req.user.id;
                update.updatedBy = update.updatedBy || context.req.user.id;
                update.updatedAt = new Date();
            }
            return await this.dynamicCRUDService.upsert(modelName, where, create, update, options);
        }
        async count(where, context) {
            return await this.dynamicCRUDService.count(modelName, where);
        }
        async exists(where, context) {
            return await this.dynamicCRUDService.exists(modelName, where);
        }
    };
    __decorate([
        (0, graphql_1.Query)(() => [ModelClass], { name: `get${modelName}s` }),
        (0, common_1.UseGuards)(enableAuth ? jwt_auth_guard_1.JwtAuthGuard : () => true),
        __param(0, (0, graphql_1.Args)('filter', { type: () => graphql_type_json_1.GraphQLJSONObject, nullable: true })),
        __param(1, (0, graphql_1.Context)()),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, Object]),
        __metadata("design:returntype", Promise)
    ], DynamicResolver.prototype, "findAll", null);
    __decorate([
        (0, graphql_1.Query)(() => graphql_type_json_1.GraphQLJSONObject, { name: `get${modelName}sPaginated` }),
        (0, common_1.UseGuards)(enableAuth ? jwt_auth_guard_1.JwtAuthGuard : () => true),
        __param(0, (0, graphql_1.Args)('filter', { type: () => graphql_type_json_1.GraphQLJSONObject, nullable: true })),
        __param(1, (0, graphql_1.Context)()),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, Object]),
        __metadata("design:returntype", Promise)
    ], DynamicResolver.prototype, "findAllPaginated", null);
    __decorate([
        (0, graphql_1.Query)(() => ModelClass, { name: `get${modelName}ById`, nullable: true }),
        (0, common_1.UseGuards)(enableAuth ? jwt_auth_guard_1.JwtAuthGuard : () => true),
        __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
        __param(1, (0, graphql_1.Args)('options', { type: () => graphql_type_json_1.GraphQLJSONObject, nullable: true })),
        __param(2, (0, graphql_1.Context)()),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [String, Object, Object]),
        __metadata("design:returntype", Promise)
    ], DynamicResolver.prototype, "findById", null);
    __decorate([
        (0, graphql_1.Mutation)(() => ModelClass, { name: `create${modelName}` }),
        (0, common_1.UseGuards)(enableAuth ? jwt_auth_guard_1.JwtAuthGuard : () => true),
        __param(0, (0, graphql_1.Args)('data', { type: () => graphql_type_json_1.GraphQLJSONObject })),
        __param(1, (0, graphql_1.Args)('options', { type: () => graphql_type_json_1.GraphQLJSONObject, nullable: true })),
        __param(2, (0, graphql_1.Context)()),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, Object, Object]),
        __metadata("design:returntype", Promise)
    ], DynamicResolver.prototype, "create", null);
    __decorate([
        (0, graphql_1.Mutation)(() => graphql_type_json_1.GraphQLJSONObject, { name: `create${modelName}sBulk` }),
        (0, common_1.UseGuards)(enableAuth ? jwt_auth_guard_1.JwtAuthGuard : () => true),
        __param(0, (0, graphql_1.Args)('input', { type: () => graphql_type_json_1.GraphQLJSONObject })),
        __param(1, (0, graphql_1.Args)('options', { type: () => graphql_type_json_1.GraphQLJSONObject, nullable: true })),
        __param(2, (0, graphql_1.Context)()),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, Object, Object]),
        __metadata("design:returntype", Promise)
    ], DynamicResolver.prototype, "createBulk", null);
    __decorate([
        (0, graphql_1.Mutation)(() => ModelClass, { name: `update${modelName}` }),
        (0, common_1.UseGuards)(enableAuth ? jwt_auth_guard_1.JwtAuthGuard : () => true),
        __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
        __param(1, (0, graphql_1.Args)('data', { type: () => graphql_type_json_1.GraphQLJSONObject })),
        __param(2, (0, graphql_1.Args)('options', { type: () => graphql_type_json_1.GraphQLJSONObject, nullable: true })),
        __param(3, (0, graphql_1.Context)()),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [String, Object, Object, Object]),
        __metadata("design:returntype", Promise)
    ], DynamicResolver.prototype, "update", null);
    __decorate([
        (0, graphql_1.Mutation)(() => graphql_type_json_1.GraphQLJSONObject, { name: `update${modelName}sBulk` }),
        (0, common_1.UseGuards)(enableAuth ? jwt_auth_guard_1.JwtAuthGuard : () => true),
        __param(0, (0, graphql_1.Args)('input', { type: () => graphql_type_json_1.GraphQLJSONObject })),
        __param(1, (0, graphql_1.Args)('options', { type: () => graphql_type_json_1.GraphQLJSONObject, nullable: true })),
        __param(2, (0, graphql_1.Context)()),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, Object, Object]),
        __metadata("design:returntype", Promise)
    ], DynamicResolver.prototype, "updateBulk", null);
    __decorate([
        (0, graphql_1.Mutation)(() => ModelClass, { name: `delete${modelName}` }),
        (0, common_1.UseGuards)(enableAuth ? jwt_auth_guard_1.JwtAuthGuard : () => true),
        __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
        __param(1, (0, graphql_1.Args)('options', { type: () => graphql_type_json_1.GraphQLJSONObject, nullable: true })),
        __param(2, (0, graphql_1.Context)()),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [String, Object, Object]),
        __metadata("design:returntype", Promise)
    ], DynamicResolver.prototype, "delete", null);
    __decorate([
        (0, graphql_1.Mutation)(() => graphql_type_json_1.GraphQLJSONObject, { name: `delete${modelName}sBulk` }),
        (0, common_1.UseGuards)(enableAuth ? jwt_auth_guard_1.JwtAuthGuard : () => true),
        __param(0, (0, graphql_1.Args)('input', { type: () => graphql_type_json_1.GraphQLJSONObject })),
        __param(1, (0, graphql_1.Args)('options', { type: () => graphql_type_json_1.GraphQLJSONObject, nullable: true })),
        __param(2, (0, graphql_1.Context)()),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, Object, Object]),
        __metadata("design:returntype", Promise)
    ], DynamicResolver.prototype, "deleteBulk", null);
    __decorate([
        (0, graphql_1.Mutation)(() => ModelClass, { name: `upsert${modelName}` }),
        (0, common_1.UseGuards)(enableAuth ? jwt_auth_guard_1.JwtAuthGuard : () => true),
        __param(0, (0, graphql_1.Args)('where', { type: () => graphql_type_json_1.GraphQLJSONObject })),
        __param(1, (0, graphql_1.Args)('create', { type: () => graphql_type_json_1.GraphQLJSONObject })),
        __param(2, (0, graphql_1.Args)('update', { type: () => graphql_type_json_1.GraphQLJSONObject })),
        __param(3, (0, graphql_1.Args)('options', { type: () => graphql_type_json_1.GraphQLJSONObject, nullable: true })),
        __param(4, (0, graphql_1.Context)()),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, Object, Object, Object, Object]),
        __metadata("design:returntype", Promise)
    ], DynamicResolver.prototype, "upsert", null);
    __decorate([
        (0, graphql_1.Query)(() => Number, { name: `count${modelName}s` }),
        (0, common_1.UseGuards)(enableAuth ? jwt_auth_guard_1.JwtAuthGuard : () => true),
        __param(0, (0, graphql_1.Args)('where', { type: () => graphql_type_json_1.GraphQLJSONObject, nullable: true })),
        __param(1, (0, graphql_1.Context)()),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, Object]),
        __metadata("design:returntype", Promise)
    ], DynamicResolver.prototype, "count", null);
    __decorate([
        (0, graphql_1.Query)(() => Boolean, { name: `${modelName.toLowerCase()}Exists` }),
        (0, common_1.UseGuards)(enableAuth ? jwt_auth_guard_1.JwtAuthGuard : () => true),
        __param(0, (0, graphql_1.Args)('where', { type: () => graphql_type_json_1.GraphQLJSONObject })),
        __param(1, (0, graphql_1.Context)()),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, Object]),
        __metadata("design:returntype", Promise)
    ], DynamicResolver.prototype, "exists", null);
    DynamicResolver = __decorate([
        (0, graphql_1.Resolver)(() => ModelClass),
        __metadata("design:paramtypes", [dynamic_crud_service_1.DynamicCRUDService])
    ], DynamicResolver);
    return DynamicResolver;
}
let DynamicResolverService = class DynamicResolverService {
    constructor(dynamicCRUDService) {
        this.dynamicCRUDService = dynamicCRUDService;
        this.resolvers = new Map();
    }
    registerResolver(modelName, ModelClass, options) {
        const ResolverClass = createDynamicResolver(modelName, ModelClass, options);
        this.resolvers.set(modelName, ResolverClass);
        return ResolverClass;
    }
    getResolver(modelName) {
        return this.resolvers.get(modelName);
    }
    getAllResolvers() {
        return Array.from(this.resolvers.values());
    }
};
exports.DynamicResolverService = DynamicResolverService;
exports.DynamicResolverService = DynamicResolverService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [dynamic_crud_service_1.DynamicCRUDService])
], DynamicResolverService);
let UniversalDynamicResolver = class UniversalDynamicResolver {
    constructor(dynamicCRUDService) {
        this.dynamicCRUDService = dynamicCRUDService;
    }
    async dynamicFindMany(modelName, filter, context) {
        return await this.dynamicCRUDService.findMany(modelName, filter);
    }
    async dynamicFindById(modelName, id, options, context) {
        return await this.dynamicCRUDService.findById(modelName, id, options);
    }
    async dynamicCreate(modelName, data, options, context) {
        if (context?.req?.user && data) {
            data.userId = data.userId || context.req.user.id;
            data.createdBy = data.createdBy || context.req.user.id;
        }
        return await this.dynamicCRUDService.create(modelName, data, options);
    }
    async dynamicUpdate(modelName, id, data, options, context) {
        if (context?.req?.user && data) {
            data.updatedBy = data.updatedBy || context.req.user.id;
            data.updatedAt = new Date();
        }
        return await this.dynamicCRUDService.update(modelName, id, data, options);
    }
    async dynamicDelete(modelName, id, options, context) {
        return await this.dynamicCRUDService.delete(modelName, id, options);
    }
    async dynamicCreateBulk(modelName, input, options, context) {
        if (context?.req?.user && input.data) {
            input.data = input.data.map(item => ({
                ...item,
                userId: item.userId || context.req.user.id,
                createdBy: item.createdBy || context.req.user.id
            }));
        }
        return await this.dynamicCRUDService.createBulk(modelName, input, options);
    }
    async dynamicUpdateBulk(modelName, input, options, context) {
        if (context?.req?.user && input.data) {
            input.data.updatedBy = input.data.updatedBy || context.req.user.id;
            input.data.updatedAt = new Date();
        }
        return await this.dynamicCRUDService.updateBulk(modelName, input, options);
    }
    async dynamicDeleteBulk(modelName, input, options, context) {
        return await this.dynamicCRUDService.deleteBulk(modelName, input, options);
    }
};
exports.UniversalDynamicResolver = UniversalDynamicResolver;
__decorate([
    (0, graphql_1.Query)(() => [graphql_type_json_1.GraphQLJSONObject], { name: 'dynamicFindMany' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('modelName')),
    __param(1, (0, graphql_1.Args)('filter', { type: () => graphql_type_json_1.GraphQLJSONObject, nullable: true })),
    __param(2, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], UniversalDynamicResolver.prototype, "dynamicFindMany", null);
__decorate([
    (0, graphql_1.Query)(() => graphql_type_json_1.GraphQLJSONObject, { name: 'dynamicFindById', nullable: true }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('modelName')),
    __param(1, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(2, (0, graphql_1.Args)('options', { type: () => graphql_type_json_1.GraphQLJSONObject, nullable: true })),
    __param(3, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], UniversalDynamicResolver.prototype, "dynamicFindById", null);
__decorate([
    (0, graphql_1.Mutation)(() => graphql_type_json_1.GraphQLJSONObject, { name: 'dynamicCreate' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('modelName')),
    __param(1, (0, graphql_1.Args)('data', { type: () => graphql_type_json_1.GraphQLJSONObject })),
    __param(2, (0, graphql_1.Args)('options', { type: () => graphql_type_json_1.GraphQLJSONObject, nullable: true })),
    __param(3, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], UniversalDynamicResolver.prototype, "dynamicCreate", null);
__decorate([
    (0, graphql_1.Mutation)(() => graphql_type_json_1.GraphQLJSONObject, { name: 'dynamicUpdate' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('modelName')),
    __param(1, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(2, (0, graphql_1.Args)('data', { type: () => graphql_type_json_1.GraphQLJSONObject })),
    __param(3, (0, graphql_1.Args)('options', { type: () => graphql_type_json_1.GraphQLJSONObject, nullable: true })),
    __param(4, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], UniversalDynamicResolver.prototype, "dynamicUpdate", null);
__decorate([
    (0, graphql_1.Mutation)(() => graphql_type_json_1.GraphQLJSONObject, { name: 'dynamicDelete' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('modelName')),
    __param(1, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(2, (0, graphql_1.Args)('options', { type: () => graphql_type_json_1.GraphQLJSONObject, nullable: true })),
    __param(3, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], UniversalDynamicResolver.prototype, "dynamicDelete", null);
__decorate([
    (0, graphql_1.Mutation)(() => graphql_type_json_1.GraphQLJSONObject, { name: 'dynamicCreateBulk' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('modelName')),
    __param(1, (0, graphql_1.Args)('input', { type: () => graphql_type_json_1.GraphQLJSONObject })),
    __param(2, (0, graphql_1.Args)('options', { type: () => graphql_type_json_1.GraphQLJSONObject, nullable: true })),
    __param(3, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], UniversalDynamicResolver.prototype, "dynamicCreateBulk", null);
__decorate([
    (0, graphql_1.Mutation)(() => graphql_type_json_1.GraphQLJSONObject, { name: 'dynamicUpdateBulk' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('modelName')),
    __param(1, (0, graphql_1.Args)('input', { type: () => graphql_type_json_1.GraphQLJSONObject })),
    __param(2, (0, graphql_1.Args)('options', { type: () => graphql_type_json_1.GraphQLJSONObject, nullable: true })),
    __param(3, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], UniversalDynamicResolver.prototype, "dynamicUpdateBulk", null);
__decorate([
    (0, graphql_1.Mutation)(() => graphql_type_json_1.GraphQLJSONObject, { name: 'dynamicDeleteBulk' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('modelName')),
    __param(1, (0, graphql_1.Args)('input', { type: () => graphql_type_json_1.GraphQLJSONObject })),
    __param(2, (0, graphql_1.Args)('options', { type: () => graphql_type_json_1.GraphQLJSONObject, nullable: true })),
    __param(3, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], UniversalDynamicResolver.prototype, "dynamicDeleteBulk", null);
exports.UniversalDynamicResolver = UniversalDynamicResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [dynamic_crud_service_1.DynamicCRUDService])
], UniversalDynamicResolver);
//# sourceMappingURL=dynamic.resolver.js.map