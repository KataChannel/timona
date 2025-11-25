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
var ExtModelsResolver_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtModelsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const graphql_type_json_1 = __importDefault(require("graphql-type-json"));
const common_1 = require("@nestjs/common");
const dynamic_query_generator_service_1 = require("../services/dynamic-query-generator.service");
let ExtModelsResolver = ExtModelsResolver_1 = class ExtModelsResolver {
    constructor(dynamicQueryService) {
        this.dynamicQueryService = dynamicQueryService;
        this.logger = new common_1.Logger(ExtModelsResolver_1.name);
    }
    async getext_sanphamhoadons(filters) {
        this.logger.log('Query: getext_sanphamhoadons');
        const result = await this.dynamicQueryService.findMany('ext_sanphamhoadon', {
            where: filters?.where,
            select: filters?.select,
            include: filters?.include,
            orderBy: filters?.orderBy,
            skip: filters?.skip,
            take: filters?.take,
        });
        return result.data;
    }
    async getext_sanphamhoadonsPaginated(filters) {
        this.logger.log('Query: getext_sanphamhoadonsPaginated');
        const page = filters?.page || 0;
        const limit = filters?.limit || 10;
        const [data, total] = await Promise.all([
            this.dynamicQueryService.findMany('ext_sanphamhoadon', {
                where: filters?.where,
                select: filters?.select,
                include: filters?.include,
                orderBy: filters?.orderBy,
                skip: page * limit,
                take: limit,
            }),
            this.dynamicQueryService.count('ext_sanphamhoadon', filters?.where),
        ]);
        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNextPage: (page + 1) * limit < total,
                hasPrevPage: page > 0,
            },
        };
    }
    async getext_sanphamhoadonById(id, options) {
        this.logger.log(`Query: getext_sanphamhoadonById - ${id}`);
        return this.dynamicQueryService.findUnique('ext_sanphamhoadon', { id }, options);
    }
    async createext_sanphamhoadon(data, options) {
        this.logger.log('Mutation: createext_sanphamhoadon');
        return this.dynamicQueryService.create('ext_sanphamhoadon', data, options);
    }
    async updateext_sanphamhoadon(id, data, options) {
        this.logger.log(`Mutation: updateext_sanphamhoadon - ${id}`);
        return this.dynamicQueryService.update('ext_sanphamhoadon', { id }, data, options);
    }
    async deleteext_sanphamhoadon(id, options) {
        this.logger.log(`Mutation: deleteext_sanphamhoadon - ${id}`);
        return this.dynamicQueryService.delete('ext_sanphamhoadon', { id }, options);
    }
    async getext_listhoadons(filters) {
        this.logger.log('Query: getext_listhoadons');
        const result = await this.dynamicQueryService.findMany('ext_listhoadon', {
            where: filters?.where,
            select: filters?.select,
            include: filters?.include,
            orderBy: filters?.orderBy,
            skip: filters?.skip,
            take: filters?.take,
        });
        return result.data;
    }
    async getext_detailhoadons(filters) {
        this.logger.log('Query: getext_detailhoadons');
        const result = await this.dynamicQueryService.findMany('ext_detailhoadon', {
            where: filters?.where,
            select: filters?.select,
            include: filters?.include,
            orderBy: filters?.orderBy,
            skip: filters?.skip,
            take: filters?.take,
        });
        return result.data;
    }
};
exports.ExtModelsResolver = ExtModelsResolver;
__decorate([
    (0, graphql_1.Query)(() => [graphql_type_json_1.default], {
        name: 'getext_sanphamhoadons',
        description: 'Get all ext_sanphamhoadon records',
    }),
    __param(0, (0, graphql_1.Args)('filters', { type: () => graphql_type_json_1.default, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ExtModelsResolver.prototype, "getext_sanphamhoadons", null);
__decorate([
    (0, graphql_1.Query)(() => graphql_type_json_1.default, {
        name: 'getext_sanphamhoadonsPaginated',
        description: 'Get paginated ext_sanphamhoadon records',
    }),
    __param(0, (0, graphql_1.Args)('filters', { type: () => graphql_type_json_1.default, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ExtModelsResolver.prototype, "getext_sanphamhoadonsPaginated", null);
__decorate([
    (0, graphql_1.Query)(() => graphql_type_json_1.default, {
        name: 'getext_sanphamhoadonById',
        description: 'Get single ext_sanphamhoadon by ID',
    }),
    __param(0, (0, graphql_1.Args)('id', { type: () => String })),
    __param(1, (0, graphql_1.Args)('options', { type: () => graphql_type_json_1.default, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ExtModelsResolver.prototype, "getext_sanphamhoadonById", null);
__decorate([
    (0, graphql_1.Mutation)(() => graphql_type_json_1.default, {
        name: 'createext_sanphamhoadon',
        description: 'Create new ext_sanphamhoadon',
    }),
    __param(0, (0, graphql_1.Args)('data', { type: () => graphql_type_json_1.default })),
    __param(1, (0, graphql_1.Args)('options', { type: () => graphql_type_json_1.default, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ExtModelsResolver.prototype, "createext_sanphamhoadon", null);
__decorate([
    (0, graphql_1.Mutation)(() => graphql_type_json_1.default, {
        name: 'updateext_sanphamhoadon',
        description: 'Update ext_sanphamhoadon',
    }),
    __param(0, (0, graphql_1.Args)('id', { type: () => String })),
    __param(1, (0, graphql_1.Args)('data', { type: () => graphql_type_json_1.default })),
    __param(2, (0, graphql_1.Args)('options', { type: () => graphql_type_json_1.default, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ExtModelsResolver.prototype, "updateext_sanphamhoadon", null);
__decorate([
    (0, graphql_1.Mutation)(() => graphql_type_json_1.default, {
        name: 'deleteext_sanphamhoadon',
        description: 'Delete ext_sanphamhoadon',
    }),
    __param(0, (0, graphql_1.Args)('id', { type: () => String })),
    __param(1, (0, graphql_1.Args)('options', { type: () => graphql_type_json_1.default, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ExtModelsResolver.prototype, "deleteext_sanphamhoadon", null);
__decorate([
    (0, graphql_1.Query)(() => [graphql_type_json_1.default], {
        name: 'getext_listhoadons',
        description: 'Get all ext_listhoadon records',
    }),
    __param(0, (0, graphql_1.Args)('filters', { type: () => graphql_type_json_1.default, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ExtModelsResolver.prototype, "getext_listhoadons", null);
__decorate([
    (0, graphql_1.Query)(() => [graphql_type_json_1.default], {
        name: 'getext_detailhoadons',
        description: 'Get all ext_detailhoadon records',
    }),
    __param(0, (0, graphql_1.Args)('filters', { type: () => graphql_type_json_1.default, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ExtModelsResolver.prototype, "getext_detailhoadons", null);
exports.ExtModelsResolver = ExtModelsResolver = ExtModelsResolver_1 = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [dynamic_query_generator_service_1.DynamicQueryGeneratorService])
], ExtModelsResolver);
//# sourceMappingURL=ext-models.resolver.js.map