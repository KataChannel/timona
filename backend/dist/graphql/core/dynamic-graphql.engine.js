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
var DynamicGraphQLEngine_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamicGraphQLEngine = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let DynamicGraphQLEngine = DynamicGraphQLEngine_1 = class DynamicGraphQLEngine {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(DynamicGraphQLEngine_1.name);
        this.cache = new Map();
        this.CACHE_TTL = 5 * 60 * 1000;
        this.logger.log('🚀 Dynamic GraphQL Engine initialized');
    }
    getDelegate(modelName) {
        const delegate = this.prisma[modelName];
        if (!delegate) {
            throw new common_1.BadRequestException(`Model "${modelName}" not found. Available models: ${this.getAvailableModels().join(', ')}`);
        }
        return delegate;
    }
    getAvailableModels() {
        return Object.keys(this.prisma).filter(key => !key.startsWith('_') &&
            !key.startsWith('$') &&
            typeof this.prisma[key] === 'object');
    }
    validateModel(modelName) {
        const models = this.getAvailableModels();
        if (!models.includes(modelName)) {
            throw new common_1.BadRequestException(`Invalid model: "${modelName}". Available: ${models.join(', ')}`);
        }
    }
    getCacheKey(modelName, operation, params) {
        return `${modelName}:${operation}:${JSON.stringify(params || {})}`;
    }
    setCache(key, data) {
        this.cache.set(key, { data, expiry: Date.now() + this.CACHE_TTL });
    }
    getCache(key) {
        const cached = this.cache.get(key);
        if (cached && cached.expiry > Date.now()) {
            return cached.data;
        }
        this.cache.delete(key);
        return null;
    }
    invalidateCache(modelName) {
        Array.from(this.cache.keys())
            .filter(key => key.startsWith(`${modelName}:`))
            .forEach(key => this.cache.delete(key));
    }
    clearAllCache() {
        this.cache.clear();
        this.logger.log('🧹 All cache cleared');
    }
    async findMany(modelName, options) {
        this.validateModel(modelName);
        const cacheKey = this.getCacheKey(modelName, 'findMany', options);
        const cached = this.getCache(cacheKey);
        if (cached)
            return cached;
        try {
            const delegate = this.getDelegate(modelName);
            const result = await delegate.findMany(options || {});
            this.setCache(cacheKey, result);
            return result;
        }
        catch (error) {
            this.logger.error(`findMany error for ${modelName}:`, error);
            throw error;
        }
    }
    async findUnique(modelName, where, options) {
        this.validateModel(modelName);
        const cacheKey = this.getCacheKey(modelName, 'findUnique', where);
        const cached = this.getCache(cacheKey);
        if (cached)
            return cached;
        try {
            const delegate = this.getDelegate(modelName);
            const result = await delegate.findUnique({ where, ...options });
            if (result)
                this.setCache(cacheKey, result);
            return result;
        }
        catch (error) {
            this.logger.error(`findUnique error for ${modelName}:`, error);
            throw error;
        }
    }
    async findFirst(modelName, options) {
        this.validateModel(modelName);
        try {
            const delegate = this.getDelegate(modelName);
            return await delegate.findFirst(options || {});
        }
        catch (error) {
            this.logger.error(`findFirst error for ${modelName}:`, error);
            throw error;
        }
    }
    async findManyPaginated(modelName, page = 1, limit = 10, options) {
        this.validateModel(modelName);
        try {
            const delegate = this.getDelegate(modelName);
            const skip = (page - 1) * limit;
            const [data, total] = await Promise.all([
                delegate.findMany({
                    ...options,
                    skip,
                    take: limit,
                }),
                delegate.count({ where: options?.where }),
            ]);
            const totalPages = Math.ceil(total / limit);
            return {
                data,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1,
                },
            };
        }
        catch (error) {
            this.logger.error(`findManyPaginated error for ${modelName}:`, error);
            throw error;
        }
    }
    async count(modelName, where) {
        this.validateModel(modelName);
        try {
            const delegate = this.getDelegate(modelName);
            return await delegate.count({ where });
        }
        catch (error) {
            this.logger.error(`count error for ${modelName}:`, error);
            throw error;
        }
    }
    async aggregate(modelName, options) {
        this.validateModel(modelName);
        try {
            const delegate = this.getDelegate(modelName);
            return await delegate.aggregate(options);
        }
        catch (error) {
            this.logger.error(`aggregate error for ${modelName}:`, error);
            throw error;
        }
    }
    async groupBy(modelName, options) {
        this.validateModel(modelName);
        try {
            const delegate = this.getDelegate(modelName);
            return await delegate.groupBy(options);
        }
        catch (error) {
            this.logger.error(`groupBy error for ${modelName}:`, error);
            throw error;
        }
    }
    async create(modelName, options) {
        this.validateModel(modelName);
        try {
            const delegate = this.getDelegate(modelName);
            const result = await delegate.create(options);
            this.invalidateCache(modelName);
            this.logger.log(`✅ Created ${modelName}: ${result.id || 'N/A'}`);
            return result;
        }
        catch (error) {
            this.logger.error(`create error for ${modelName}:`, error);
            throw error;
        }
    }
    async createMany(modelName, options) {
        this.validateModel(modelName);
        try {
            const delegate = this.getDelegate(modelName);
            const result = await delegate.createMany(options);
            this.invalidateCache(modelName);
            this.logger.log(`✅ Created ${result.count} ${modelName} records`);
            return { success: true, count: result.count };
        }
        catch (error) {
            this.logger.error(`createMany error for ${modelName}:`, error);
            throw error;
        }
    }
    async update(modelName, options) {
        this.validateModel(modelName);
        try {
            const delegate = this.getDelegate(modelName);
            const result = await delegate.update(options);
            this.invalidateCache(modelName);
            this.logger.log(`✅ Updated ${modelName}: ${result.id || 'N/A'}`);
            return result;
        }
        catch (error) {
            this.logger.error(`update error for ${modelName}:`, error);
            throw error;
        }
    }
    async updateMany(modelName, options) {
        this.validateModel(modelName);
        try {
            const delegate = this.getDelegate(modelName);
            const result = await delegate.updateMany(options);
            this.invalidateCache(modelName);
            this.logger.log(`✅ Updated ${result.count} ${modelName} records`);
            return { success: true, count: result.count };
        }
        catch (error) {
            this.logger.error(`updateMany error for ${modelName}:`, error);
            throw error;
        }
    }
    async delete(modelName, where, options) {
        this.validateModel(modelName);
        try {
            const delegate = this.getDelegate(modelName);
            const result = await delegate.delete({ where, ...options });
            this.invalidateCache(modelName);
            this.logger.log(`🗑️ Deleted ${modelName}: ${result.id || 'N/A'}`);
            return result;
        }
        catch (error) {
            this.logger.error(`delete error for ${modelName}:`, error);
            throw error;
        }
    }
    async deleteMany(modelName, where) {
        this.validateModel(modelName);
        try {
            const delegate = this.getDelegate(modelName);
            const result = await delegate.deleteMany({ where });
            this.invalidateCache(modelName);
            this.logger.log(`🗑️ Deleted ${result.count} ${modelName} records`);
            return { success: true, count: result.count };
        }
        catch (error) {
            this.logger.error(`deleteMany error for ${modelName}:`, error);
            throw error;
        }
    }
    async upsert(modelName, options) {
        this.validateModel(modelName);
        try {
            const delegate = this.getDelegate(modelName);
            const result = await delegate.upsert(options);
            this.invalidateCache(modelName);
            this.logger.log(`✅ Upserted ${modelName}: ${result.id || 'N/A'}`);
            return result;
        }
        catch (error) {
            this.logger.error(`upsert error for ${modelName}:`, error);
            throw error;
        }
    }
    async transaction(callback) {
        try {
            return await this.prisma.$transaction(callback);
        }
        catch (error) {
            this.logger.error('Transaction error:', error);
            throw error;
        }
    }
    async executeRaw(query, params) {
        try {
            return await this.prisma.$executeRawUnsafe(query, ...(params || []));
        }
        catch (error) {
            this.logger.error('Raw query error:', error);
            throw error;
        }
    }
    async queryRaw(query, params) {
        try {
            return await this.prisma.$queryRawUnsafe(query, ...(params || []));
        }
        catch (error) {
            this.logger.error('Raw query error:', error);
            throw error;
        }
    }
};
exports.DynamicGraphQLEngine = DynamicGraphQLEngine;
exports.DynamicGraphQLEngine = DynamicGraphQLEngine = DynamicGraphQLEngine_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DynamicGraphQLEngine);
//# sourceMappingURL=dynamic-graphql.engine.js.map