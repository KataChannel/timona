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
var UniversalQueryResolver_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniversalQueryResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const graphql_type_json_1 = require("graphql-type-json");
const dynamic_query_generator_service_1 = require("../services/dynamic-query-generator.service");
const universal_query_input_1 = require("../inputs/universal-query.input");
let UniversalQueryResolver = UniversalQueryResolver_1 = class UniversalQueryResolver {
    constructor(dynamicQueryService) {
        this.dynamicQueryService = dynamicQueryService;
        this.logger = new common_1.Logger(UniversalQueryResolver_1.name);
    }
    async universalQuery(input) {
        this.logger.log(`Universal Query: ${input.model}.${input.operation}`);
        const { model, operation } = input;
        switch (operation) {
            case 'findMany':
                return this.dynamicQueryService.findMany(model, {
                    where: input.where,
                    select: input.select,
                    include: input.include,
                    orderBy: input.orderBy,
                    skip: input.skip,
                    take: input.take,
                    distinct: input.distinct,
                });
            case 'findUnique':
                return this.dynamicQueryService.findUnique(model, input.where, {
                    select: input.select,
                    include: input.include,
                });
            case 'findFirst':
                return this.dynamicQueryService.findFirst(model, {
                    where: input.where,
                    select: input.select,
                    include: input.include,
                    orderBy: input.orderBy,
                });
            case 'count':
                return this.dynamicQueryService.count(model, {
                    where: input.where,
                });
            case 'aggregate':
                return this.dynamicQueryService.aggregate(model, input);
            case 'groupBy':
                if (!input.by) {
                    throw new Error('groupBy operation requires "by" parameter');
                }
                return this.dynamicQueryService.groupBy(model, input);
            default:
                throw new Error(`Unsupported query operation: ${operation}`);
        }
    }
    async universalMutation(input) {
        this.logger.log(`Universal Mutation: ${input.model}.${input.operation}`);
        const { model, operation } = input;
        switch (operation) {
            case 'create':
                return this.dynamicQueryService.create(model, input.data, {
                    select: input.select,
                    include: input.include,
                });
            case 'createMany':
                return this.dynamicQueryService.createMany(model, input.data, false);
            case 'update':
                return this.dynamicQueryService.update(model, input.where, input.data, {
                    select: input.select,
                    include: input.include,
                });
            case 'updateMany':
                return this.dynamicQueryService.updateMany(model, input.where, input.data);
            case 'upsert':
                return this.dynamicQueryService.upsert(model, input.where, input.data, input.data, {
                    select: input.select,
                    include: input.include,
                });
            case 'delete':
                return this.dynamicQueryService.delete(model, input.where, {
                    select: input.select,
                    include: input.include,
                });
            case 'deleteMany':
                return this.dynamicQueryService.deleteMany(model, input.where);
            default:
                throw new Error(`Unsupported mutation operation: ${operation}`);
        }
    }
    async dynamicFindMany(input) {
        this.logger.log(`Dynamic Find Many: ${input.model}`);
        const params = {
            where: input.where,
            select: input.select,
            include: input.include,
            orderBy: input.orderBy,
        };
        if (input.pagination) {
            const { page, limit, sortBy, sortOrder } = input.pagination;
            params.skip = page * limit;
            params.take = limit;
            if (sortBy) {
                params.orderBy = { [sortBy]: sortOrder };
            }
        }
        return this.dynamicQueryService.findMany(input.model, params);
    }
    async dynamicFindUnique(input) {
        this.logger.log(`Dynamic Find Unique: ${input.model}`);
        return this.dynamicQueryService.findUnique(input.model, input);
    }
    async dynamicFindFirst(input) {
        this.logger.log(`Dynamic Find First: ${input.model}`);
        return this.dynamicQueryService.findFirst(input.model, input);
    }
    async dynamicCreate(input) {
        this.logger.log(`Dynamic Create: ${input.model}`);
        return this.dynamicQueryService.create(input.model, input.data, {
            select: input.select,
            include: input.include,
        });
    }
    async dynamicCreateMany(input) {
        this.logger.log(`Dynamic Create Many: ${input.model} (${input.data.length} records)`);
        return this.dynamicQueryService.createMany(input.model, input.data, input.skipDuplicates);
    }
    async dynamicUpdate(input) {
        this.logger.log(`Dynamic Update: ${input.model}`);
        return this.dynamicQueryService.update(input.model, input.where, input.data, {
            select: input.select,
            include: input.include,
        });
    }
    async dynamicUpdateMany(input) {
        this.logger.log(`Dynamic Update Many: ${input.model}`);
        return this.dynamicQueryService.updateMany(input.model, input.where, input.data);
    }
    async dynamicUpsert(input) {
        this.logger.log(`Dynamic Upsert: ${input.model}`);
        return this.dynamicQueryService.upsert(input.model, input.where, input.create, input.update, {
            select: input.select,
            include: input.include,
        });
    }
    async dynamicDelete(input) {
        this.logger.log(`Dynamic Delete: ${input.model}`);
        return this.dynamicQueryService.delete(input.model, input.where, {
            select: input.select,
            include: input.include,
        });
    }
    async dynamicDeleteMany(input) {
        this.logger.log(`Dynamic Delete Many: ${input.model}`);
        return this.dynamicQueryService.deleteMany(input.model, input.where);
    }
    async dynamicCount(input) {
        this.logger.log(`Dynamic Count: ${input.model}`);
        const count = await this.dynamicQueryService.count(input.model, input.where);
        return { data: count };
    }
    async dynamicAggregate(input) {
        this.logger.log(`Dynamic Aggregate: ${input.model}`);
        return this.dynamicQueryService.aggregate(input.model, input);
    }
    async dynamicGroupBy(input) {
        this.logger.log(`Dynamic Group By: ${input.model}`);
        return this.dynamicQueryService.groupBy(input.model, input);
    }
    async listAvailableModels() {
        return [
            'user',
            'post',
            'comment',
            'task',
            'tag',
            'category',
            'file',
            'userRole',
            'permission',
            'rolePermission',
            'auditLog',
            'notification',
            'affCampaign',
            'affLink',
            'affClick',
            'affConversion',
            'affPayout',
            'affCommissionRule',
            'invoice',
            'invoiceItem',
            'invoicePayment',
            'invoiceReminder',
            'oramaIndex',
            'oramaDocument',
            'savedSearch',
            'searchHistory',
            'ext_listhoadon',
            'ext_detailhoadon',
            'ext_dmhanghoa',
            'ext_dmkhachhang',
            'ext_vattukho',
            'ext_dmdonvi',
            'ext_dmsodo',
            'ext_trungtamcp',
            'ext_tieude',
            'ext_sanphamhoadon',
            'customerManagement',
            'productInventory',
            'warehouseManagement',
            'salesOrderTracking',
            'purchaseOrderManagement',
            'invoiceManagement',
            'paymentTracking',
            'analyticsReport',
        ];
    }
};
exports.UniversalQueryResolver = UniversalQueryResolver;
__decorate([
    (0, graphql_1.Query)(() => graphql_type_json_1.GraphQLJSONObject, {
        name: 'universalQuery',
        description: 'Execute any Prisma query operation dynamically',
    }),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [universal_query_input_1.UniversalQueryInput]),
    __metadata("design:returntype", Promise)
], UniversalQueryResolver.prototype, "universalQuery", null);
__decorate([
    (0, graphql_1.Mutation)(() => graphql_type_json_1.GraphQLJSONObject, {
        name: 'universalMutation',
        description: 'Execute any Prisma mutation operation dynamically',
    }),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [universal_query_input_1.UniversalQueryInput]),
    __metadata("design:returntype", Promise)
], UniversalQueryResolver.prototype, "universalMutation", null);
__decorate([
    (0, graphql_1.Query)(() => graphql_type_json_1.GraphQLJSONObject, {
        name: 'dynamicFindMany',
        description: 'Find many records with pagination and filters',
    }),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [universal_query_input_1.FindManyInput]),
    __metadata("design:returntype", Promise)
], UniversalQueryResolver.prototype, "dynamicFindMany", null);
__decorate([
    (0, graphql_1.Query)(() => graphql_type_json_1.GraphQLJSONObject, {
        name: 'dynamicFindUnique',
        description: 'Find unique record by identifier',
    }),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [universal_query_input_1.FindUniqueInput]),
    __metadata("design:returntype", Promise)
], UniversalQueryResolver.prototype, "dynamicFindUnique", null);
__decorate([
    (0, graphql_1.Query)(() => graphql_type_json_1.GraphQLJSONObject, {
        name: 'dynamicFindFirst',
        description: 'Find first matching record',
    }),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [universal_query_input_1.FindManyInput]),
    __metadata("design:returntype", Promise)
], UniversalQueryResolver.prototype, "dynamicFindFirst", null);
__decorate([
    (0, graphql_1.Mutation)(() => graphql_type_json_1.GraphQLJSONObject, {
        name: 'dynamicCreate',
        description: 'Create a new record',
    }),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [universal_query_input_1.CreateInput]),
    __metadata("design:returntype", Promise)
], UniversalQueryResolver.prototype, "dynamicCreate", null);
__decorate([
    (0, graphql_1.Mutation)(() => graphql_type_json_1.GraphQLJSONObject, {
        name: 'dynamicCreateMany',
        description: 'Create multiple records in bulk',
    }),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [universal_query_input_1.CreateManyInput]),
    __metadata("design:returntype", Promise)
], UniversalQueryResolver.prototype, "dynamicCreateMany", null);
__decorate([
    (0, graphql_1.Mutation)(() => graphql_type_json_1.GraphQLJSONObject, {
        name: 'dynamicUpdate',
        description: 'Update a single record',
    }),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [universal_query_input_1.UpdateInput]),
    __metadata("design:returntype", Promise)
], UniversalQueryResolver.prototype, "dynamicUpdate", null);
__decorate([
    (0, graphql_1.Mutation)(() => graphql_type_json_1.GraphQLJSONObject, {
        name: 'dynamicUpdateMany',
        description: 'Update multiple records in bulk',
    }),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [universal_query_input_1.UpdateManyInput]),
    __metadata("design:returntype", Promise)
], UniversalQueryResolver.prototype, "dynamicUpdateMany", null);
__decorate([
    (0, graphql_1.Mutation)(() => graphql_type_json_1.GraphQLJSONObject, {
        name: 'dynamicUpsert',
        description: 'Create or update a record (upsert)',
    }),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [universal_query_input_1.UpsertInput]),
    __metadata("design:returntype", Promise)
], UniversalQueryResolver.prototype, "dynamicUpsert", null);
__decorate([
    (0, graphql_1.Mutation)(() => graphql_type_json_1.GraphQLJSONObject, {
        name: 'dynamicDelete',
        description: 'Delete a single record',
    }),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [universal_query_input_1.DeleteInput]),
    __metadata("design:returntype", Promise)
], UniversalQueryResolver.prototype, "dynamicDelete", null);
__decorate([
    (0, graphql_1.Mutation)(() => graphql_type_json_1.GraphQLJSONObject, {
        name: 'dynamicDeleteMany',
        description: 'Delete multiple records in bulk',
    }),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [universal_query_input_1.DeleteManyInput]),
    __metadata("design:returntype", Promise)
], UniversalQueryResolver.prototype, "dynamicDeleteMany", null);
__decorate([
    (0, graphql_1.Query)(() => graphql_type_json_1.GraphQLJSONObject, {
        name: 'dynamicCount',
        description: 'Count records matching criteria',
    }),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [universal_query_input_1.CountInput]),
    __metadata("design:returntype", Promise)
], UniversalQueryResolver.prototype, "dynamicCount", null);
__decorate([
    (0, graphql_1.Query)(() => graphql_type_json_1.GraphQLJSONObject, {
        name: 'dynamicAggregate',
        description: 'Compute aggregations (sum, avg, min, max, count)',
    }),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [universal_query_input_1.AggregateInput]),
    __metadata("design:returntype", Promise)
], UniversalQueryResolver.prototype, "dynamicAggregate", null);
__decorate([
    (0, graphql_1.Query)(() => graphql_type_json_1.GraphQLJSONObject, {
        name: 'dynamicGroupBy',
        description: 'Group records and compute aggregations',
    }),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [universal_query_input_1.GroupByInput]),
    __metadata("design:returntype", Promise)
], UniversalQueryResolver.prototype, "dynamicGroupBy", null);
__decorate([
    (0, graphql_1.Query)(() => [String], {
        name: 'listAvailableModels',
        description: 'Get list of all available Prisma models',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UniversalQueryResolver.prototype, "listAvailableModels", null);
exports.UniversalQueryResolver = UniversalQueryResolver = UniversalQueryResolver_1 = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [dynamic_query_generator_service_1.DynamicQueryGeneratorService])
], UniversalQueryResolver);
//# sourceMappingURL=universal-query.resolver.js.map