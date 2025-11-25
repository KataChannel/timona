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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var UniversalDynamicResolver_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniversalDynamicResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const dynamic_graphql_engine_1 = require("../core/dynamic-graphql.engine");
const graphql_type_json_1 = __importDefault(require("graphql-type-json"));
let UniversalDynamicResolver = UniversalDynamicResolver_1 = class UniversalDynamicResolver {
    constructor(engine) {
        this.engine = engine;
        this.logger = new common_1.Logger(UniversalDynamicResolver_1.name);
        this.logger.log('🎯 Universal Dynamic Resolver ready');
    }
    async findMany(model, where, orderBy, skip, take, select, include, distinct, context) {
        return this.engine.findMany(model, {
            where,
            orderBy,
            skip,
            take,
            select,
            include,
            distinct,
        });
    }
    async findUnique(model, where, select, include, context) {
        return this.engine.findUnique(model, where, { select, include });
    }
    async findFirst(model, where, orderBy, select, include, context) {
        return this.engine.findFirst(model, {
            where,
            orderBy,
            select,
            include,
        });
    }
    async findManyPaginated(model, page, limit, where, orderBy, select, include, context) {
        return this.engine.findManyPaginated(model, page, limit, {
            where,
            orderBy,
            select,
            include,
        });
    }
    async count(model, where, context) {
        return this.engine.count(model, where);
    }
    async aggregate(model, options, context) {
        return this.engine.aggregate(model, options);
    }
    async groupBy(model, options, context) {
        return this.engine.groupBy(model, options);
    }
    async createOne(model, data, select, include, context) {
        return this.engine.create(model, { data, select, include });
    }
    async createMany(model, data, skipDuplicates, context) {
        return this.engine.createMany(model, { data, skipDuplicates });
    }
    async updateOne(model, where, data, select, include, context) {
        return this.engine.update(model, { where, data, select, include });
    }
    async updateMany(model, where, data, context) {
        return this.engine.updateMany(model, { where, data });
    }
    async deleteOne(model, where, select, context) {
        return this.engine.delete(model, where, { select });
    }
    async deleteMany(model, where, context) {
        return this.engine.deleteMany(model, where);
    }
    async upsert(model, where, create, update, select, include, context) {
        return this.engine.upsert(model, { where, create, update, select, include });
    }
    async getAvailableModels() {
        return this.engine.getAvailableModels();
    }
    async clearCache() {
        this.engine.clearAllCache();
        return true;
    }
};
exports.UniversalDynamicResolver = UniversalDynamicResolver;
__decorate([
    (0, graphql_1.Query)(() => [graphql_type_json_1.default], {
        name: 'findMany',
        description: 'Find many records with Prisma-like syntax',
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('model', { type: () => String })),
    __param(1, (0, graphql_1.Args)('where', { type: () => graphql_type_json_1.default, nullable: true })),
    __param(2, (0, graphql_1.Args)('orderBy', { type: () => graphql_type_json_1.default, nullable: true })),
    __param(3, (0, graphql_1.Args)('skip', { type: () => graphql_1.Int, nullable: true })),
    __param(4, (0, graphql_1.Args)('take', { type: () => graphql_1.Int, nullable: true })),
    __param(5, (0, graphql_1.Args)('select', { type: () => graphql_type_json_1.default, nullable: true })),
    __param(6, (0, graphql_1.Args)('include', { type: () => graphql_type_json_1.default, nullable: true })),
    __param(7, (0, graphql_1.Args)('distinct', { type: () => graphql_type_json_1.default, nullable: true })),
    __param(8, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Number, Number, Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], UniversalDynamicResolver.prototype, "findMany", null);
__decorate([
    (0, graphql_1.Query)(() => graphql_type_json_1.default, {
        name: 'findUnique',
        description: 'Find a unique record',
        nullable: true,
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('model', { type: () => String })),
    __param(1, (0, graphql_1.Args)('where', { type: () => graphql_type_json_1.default })),
    __param(2, (0, graphql_1.Args)('select', { type: () => graphql_type_json_1.default, nullable: true })),
    __param(3, (0, graphql_1.Args)('include', { type: () => graphql_type_json_1.default, nullable: true })),
    __param(4, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], UniversalDynamicResolver.prototype, "findUnique", null);
__decorate([
    (0, graphql_1.Query)(() => graphql_type_json_1.default, {
        name: 'findFirst',
        description: 'Find first matching record',
        nullable: true,
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('model', { type: () => String })),
    __param(1, (0, graphql_1.Args)('where', { type: () => graphql_type_json_1.default, nullable: true })),
    __param(2, (0, graphql_1.Args)('orderBy', { type: () => graphql_type_json_1.default, nullable: true })),
    __param(3, (0, graphql_1.Args)('select', { type: () => graphql_type_json_1.default, nullable: true })),
    __param(4, (0, graphql_1.Args)('include', { type: () => graphql_type_json_1.default, nullable: true })),
    __param(5, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], UniversalDynamicResolver.prototype, "findFirst", null);
__decorate([
    (0, graphql_1.Query)(() => graphql_type_json_1.default, {
        name: 'findManyPaginated',
        description: 'Find records with pagination',
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('model', { type: () => String })),
    __param(1, (0, graphql_1.Args)('page', { type: () => graphql_1.Int, defaultValue: 1 })),
    __param(2, (0, graphql_1.Args)('limit', { type: () => graphql_1.Int, defaultValue: 10 })),
    __param(3, (0, graphql_1.Args)('where', { type: () => graphql_type_json_1.default, nullable: true })),
    __param(4, (0, graphql_1.Args)('orderBy', { type: () => graphql_type_json_1.default, nullable: true })),
    __param(5, (0, graphql_1.Args)('select', { type: () => graphql_type_json_1.default, nullable: true })),
    __param(6, (0, graphql_1.Args)('include', { type: () => graphql_type_json_1.default, nullable: true })),
    __param(7, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, Object, Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], UniversalDynamicResolver.prototype, "findManyPaginated", null);
__decorate([
    (0, graphql_1.Query)(() => graphql_1.Int, {
        name: 'count',
        description: 'Count records matching criteria',
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('model', { type: () => String })),
    __param(1, (0, graphql_1.Args)('where', { type: () => graphql_type_json_1.default, nullable: true })),
    __param(2, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], UniversalDynamicResolver.prototype, "count", null);
__decorate([
    (0, graphql_1.Query)(() => graphql_type_json_1.default, {
        name: 'aggregate',
        description: 'Aggregate operations (count, sum, avg, min, max)',
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('model', { type: () => String })),
    __param(1, (0, graphql_1.Args)('options', { type: () => graphql_type_json_1.default })),
    __param(2, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], UniversalDynamicResolver.prototype, "aggregate", null);
__decorate([
    (0, graphql_1.Query)(() => [graphql_type_json_1.default], {
        name: 'groupBy',
        description: 'Group records by field(s)',
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('model', { type: () => String })),
    __param(1, (0, graphql_1.Args)('options', { type: () => graphql_type_json_1.default })),
    __param(2, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], UniversalDynamicResolver.prototype, "groupBy", null);
__decorate([
    (0, graphql_1.Mutation)(() => graphql_type_json_1.default, {
        name: 'createOne',
        description: 'Create a single record',
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('model', { type: () => String })),
    __param(1, (0, graphql_1.Args)('data', { type: () => graphql_type_json_1.default })),
    __param(2, (0, graphql_1.Args)('select', { type: () => graphql_type_json_1.default, nullable: true })),
    __param(3, (0, graphql_1.Args)('include', { type: () => graphql_type_json_1.default, nullable: true })),
    __param(4, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], UniversalDynamicResolver.prototype, "createOne", null);
__decorate([
    (0, graphql_1.Mutation)(() => graphql_type_json_1.default, {
        name: 'createMany',
        description: 'Create multiple records (bulk insert)',
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('model', { type: () => String })),
    __param(1, (0, graphql_1.Args)('data', { type: () => [graphql_type_json_1.default] })),
    __param(2, (0, graphql_1.Args)('skipDuplicates', { type: () => Boolean, nullable: true })),
    __param(3, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array, Boolean, Object]),
    __metadata("design:returntype", Promise)
], UniversalDynamicResolver.prototype, "createMany", null);
__decorate([
    (0, graphql_1.Mutation)(() => graphql_type_json_1.default, {
        name: 'updateOne',
        description: 'Update a single record',
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('model', { type: () => String })),
    __param(1, (0, graphql_1.Args)('where', { type: () => graphql_type_json_1.default })),
    __param(2, (0, graphql_1.Args)('data', { type: () => graphql_type_json_1.default })),
    __param(3, (0, graphql_1.Args)('select', { type: () => graphql_type_json_1.default, nullable: true })),
    __param(4, (0, graphql_1.Args)('include', { type: () => graphql_type_json_1.default, nullable: true })),
    __param(5, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], UniversalDynamicResolver.prototype, "updateOne", null);
__decorate([
    (0, graphql_1.Mutation)(() => graphql_type_json_1.default, {
        name: 'updateMany',
        description: 'Update multiple records (bulk update)',
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('model', { type: () => String })),
    __param(1, (0, graphql_1.Args)('where', { type: () => graphql_type_json_1.default, nullable: true })),
    __param(2, (0, graphql_1.Args)('data', { type: () => graphql_type_json_1.default })),
    __param(3, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], UniversalDynamicResolver.prototype, "updateMany", null);
__decorate([
    (0, graphql_1.Mutation)(() => graphql_type_json_1.default, {
        name: 'deleteOne',
        description: 'Delete a single record',
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('model', { type: () => String })),
    __param(1, (0, graphql_1.Args)('where', { type: () => graphql_type_json_1.default })),
    __param(2, (0, graphql_1.Args)('select', { type: () => graphql_type_json_1.default, nullable: true })),
    __param(3, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], UniversalDynamicResolver.prototype, "deleteOne", null);
__decorate([
    (0, graphql_1.Mutation)(() => graphql_type_json_1.default, {
        name: 'deleteMany',
        description: 'Delete multiple records (bulk delete)',
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('model', { type: () => String })),
    __param(1, (0, graphql_1.Args)('where', { type: () => graphql_type_json_1.default, nullable: true })),
    __param(2, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], UniversalDynamicResolver.prototype, "deleteMany", null);
__decorate([
    (0, graphql_1.Mutation)(() => graphql_type_json_1.default, {
        name: 'upsert',
        description: 'Update existing or create new record',
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('model', { type: () => String })),
    __param(1, (0, graphql_1.Args)('where', { type: () => graphql_type_json_1.default })),
    __param(2, (0, graphql_1.Args)('create', { type: () => graphql_type_json_1.default })),
    __param(3, (0, graphql_1.Args)('update', { type: () => graphql_type_json_1.default })),
    __param(4, (0, graphql_1.Args)('select', { type: () => graphql_type_json_1.default, nullable: true })),
    __param(5, (0, graphql_1.Args)('include', { type: () => graphql_type_json_1.default, nullable: true })),
    __param(6, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], UniversalDynamicResolver.prototype, "upsert", null);
__decorate([
    (0, graphql_1.Query)(() => [String], {
        name: 'getAvailableModels',
        description: 'Get list of all available Prisma models',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UniversalDynamicResolver.prototype, "getAvailableModels", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean, {
        name: 'clearCache',
        description: 'Clear all cached data',
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UniversalDynamicResolver.prototype, "clearCache", null);
exports.UniversalDynamicResolver = UniversalDynamicResolver = UniversalDynamicResolver_1 = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [dynamic_graphql_engine_1.DynamicGraphQLEngine])
], UniversalDynamicResolver);
//# sourceMappingURL=universal-dynamic.resolver.js.map