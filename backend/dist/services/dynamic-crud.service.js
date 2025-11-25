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
exports.DynamicCRUDService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let DynamicCRUDService = class DynamicCRUDService {
    constructor(prisma) {
        this.prisma = prisma;
        this.cache = new Map();
        this.CACHE_TTL = 5 * 60 * 1000;
    }
    getModelDelegate(modelName) {
        const delegate = this.prisma[modelName];
        if (!delegate) {
            throw new common_1.BadRequestException(`Model ${modelName} not found`);
        }
        return delegate;
    }
    getCacheKey(modelName, id) {
        return `${modelName}:${id}`;
    }
    setCache(key, data) {
        this.cache.set(key, {
            data,
            expiry: Date.now() + this.CACHE_TTL
        });
    }
    getCache(key) {
        const cached = this.cache.get(key);
        if (cached && cached.expiry > Date.now()) {
            return cached.data;
        }
        this.cache.delete(key);
        return null;
    }
    clearModelCache(modelName) {
        for (const [key] of this.cache) {
            if (key.startsWith(`${modelName}:`)) {
                this.cache.delete(key);
            }
        }
    }
    async create(modelName, data, options, context) {
        try {
            const delegate = this.getModelDelegate(modelName);
            if (modelName === 'Task' || modelName === 'task') {
                if (data.user?.connect?.id && !data.userId) {
                    console.log(`🔄 Converting user.connect to userId:`, data.user.connect.id);
                    data.userId = data.user.connect.id;
                    delete data.user;
                }
                if (data.project?.connect?.id && !data.projectId) {
                    console.log(`🔄 Converting project.connect to projectId:`, data.project.connect.id);
                    data.projectId = data.project.connect.id;
                    delete data.project;
                }
                if (!data.userId) {
                    const userId = context?.req?.user?.id ||
                        context?.user?.id ||
                        context?.userId;
                    if (userId) {
                        console.log(`🔄 FALLBACK (task): Setting userId from context:`, userId);
                        data.userId = userId;
                    }
                }
                if (!data.userId) {
                    console.error('❌ Task create failed: Missing userId', { data, context: !!context });
                    throw new common_1.BadRequestException('Task userId is required. Please ensure you are authenticated.');
                }
            }
            if (modelName === 'TaskComment' || modelName === 'taskComment') {
                if (data.task?.connect?.id && !data.taskId) {
                    console.log(`🔄 Converting task.connect to taskId:`, data.task.connect.id);
                    data.taskId = data.task.connect.id;
                    delete data.task;
                }
                if (data.user?.connect?.id && !data.userId) {
                    console.log(`🔄 Converting user.connect to userId:`, data.user.connect.id);
                    data.userId = data.user.connect.id;
                    delete data.user;
                }
                if (!data.userId) {
                    const userId = context?.req?.user?.id ||
                        context?.user?.id ||
                        context?.userId;
                    if (userId) {
                        console.log(`🔄 FALLBACK (taskComment): Setting userId from context:`, userId);
                        data.userId = userId;
                    }
                }
                if (!data.taskId) {
                    console.error('❌ TaskComment create failed: Missing taskId', { data });
                    throw new common_1.BadRequestException('TaskComment taskId is required.');
                }
                if (!data.userId) {
                    console.error('❌ TaskComment create failed: Missing userId', { data, context: !!context });
                    throw new common_1.BadRequestException('TaskComment userId is required. Please ensure you are authenticated.');
                }
            }
            if ((modelName === 'Project' || modelName === 'project') && !data.ownerId) {
                console.warn('⚠️ No ownerId in data, checking context...');
                const userId = context?.req?.user?.id ||
                    context?.user?.id ||
                    context?.userId ||
                    data.userId;
                if (userId) {
                    console.log(`🔄 FALLBACK: Setting ownerId from context:`, userId);
                    data.ownerId = userId;
                }
            }
            if (modelName === 'Project' || modelName === 'project') {
                if (!data.ownerId) {
                    console.error('❌ Project create failed: Missing ownerId', { data, context: !!context });
                    throw new common_1.BadRequestException('Project ownerId is required. Please ensure you are authenticated.');
                }
                if (typeof data.ownerId !== 'string') {
                    console.error('❌ Project create failed: Invalid ownerId type', {
                        ownerId: data.ownerId,
                        type: typeof data.ownerId
                    });
                    throw new common_1.BadRequestException('Project ownerId must be a valid user ID');
                }
                console.log(`🔍 Verifying owner exists:`, data.ownerId);
                const ownerExists = await this.prisma.user.findUnique({
                    where: { id: data.ownerId }
                });
                if (!ownerExists) {
                    console.error('❌ Project owner not found:', data.ownerId);
                    throw new common_1.BadRequestException(`Owner user with ID ${data.ownerId} not found`);
                }
                console.log(`✅ Owner verified:`, ownerExists.id);
            }
            const queryOptions = { data };
            if (options?.include) {
                queryOptions.include = options.include;
            }
            else if (options?.select) {
                queryOptions.select = options.select;
            }
            console.log(`📝 Creating ${modelName}:`, {
                data: {
                    ...data,
                    password: data.password ? '[REDACTED]' : undefined
                },
                options: queryOptions
            });
            const result = await delegate.create(queryOptions);
            console.log(`✅ Created ${modelName}:`, result.id || result);
            this.clearModelCache(modelName);
            return result;
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new common_1.ConflictException(`Record with unique constraint already exists`);
                }
                if (error.message.includes('Argument')) {
                    console.error(`❌ Prisma validation error for ${modelName}:`, error.message);
                    throw new common_1.BadRequestException(`Missing required field(s): ${error.message.split('Argument ')[1]?.split('.')[0] || 'unknown'}`);
                }
            }
            throw new common_1.BadRequestException(`Failed to create ${modelName}: ${error.message}`);
        }
    }
    async createBulk(modelName, input, options, context) {
        const delegate = this.getModelDelegate(modelName);
        const results = [];
        const errors = [];
        try {
            await this.prisma.$transaction(async (tx) => {
                const queryOptions = {};
                if (options?.include) {
                    queryOptions.include = options.include;
                }
                else if (options?.select) {
                    queryOptions.select = options.select;
                }
                if (input.skipDuplicates) {
                    const result = await tx[modelName].createMany({
                        data: input.data,
                        skipDuplicates: true,
                    });
                    if (options?.select || options?.include) {
                        const created = await tx[modelName].findMany({
                            where: {},
                            ...queryOptions
                        });
                        results.push(...created);
                    }
                }
                else {
                    for (let i = 0; i < input.data.length; i++) {
                        try {
                            const result = await tx[modelName].create({
                                data: input.data[i],
                                ...queryOptions
                            });
                            results.push(result);
                        }
                        catch (error) {
                            errors.push({
                                index: i,
                                error: error.message,
                                data: input.data[i]
                            });
                        }
                    }
                }
            });
            this.clearModelCache(modelName);
            return {
                success: errors.length === 0,
                count: results.length,
                data: results,
                errors: errors.length > 0 ? errors : undefined
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Bulk create failed for ${modelName}: ${error.message}`);
        }
    }
    async findById(modelName, id, options) {
        if (!options?.select && !options?.include) {
            const cacheKey = this.getCacheKey(modelName, id);
            const cached = this.getCache(cacheKey);
            if (cached) {
                return cached;
            }
        }
        const delegate = this.getModelDelegate(modelName);
        const queryOptions = { where: { id } };
        if (options?.include) {
            queryOptions.include = options.include;
        }
        else if (options?.select) {
            queryOptions.select = options.select;
        }
        const result = await delegate.findUnique(queryOptions);
        if (result && !options?.select && !options?.include) {
            const cacheKey = this.getCacheKey(modelName, id);
            this.setCache(cacheKey, result);
        }
        return result;
    }
    async findMany(modelName, input) {
        try {
            const delegate = this.getModelDelegate(modelName);
            const queryOptions = {
                where: input?.where,
                orderBy: input?.orderBy,
                skip: input?.skip,
                take: input?.take,
            };
            if (input?.include) {
                queryOptions.include = input.include;
            }
            else if (input?.select) {
                queryOptions.select = input.select;
            }
            return await delegate.findMany(queryOptions);
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to find many ${modelName}: ${error.message}`);
        }
    }
    async findManyWithMeta(modelName, filter) {
        try {
            const delegate = this.getModelDelegate(modelName);
            const page = filter?.skip ? Math.floor(filter.skip / (filter.take || 10)) + 1 : 1;
            const limit = filter?.take || 10;
            const queryOptions = {
                where: filter?.where,
                orderBy: filter?.orderBy,
                skip: filter?.skip,
                take: filter?.take,
            };
            if (filter?.include) {
                queryOptions.include = filter.include;
            }
            else if (filter?.select) {
                queryOptions.select = filter.select;
            }
            const [data, total] = await Promise.all([
                delegate.findMany(queryOptions),
                delegate.count({
                    where: filter?.where
                })
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
                    hasPrevPage: page > 1
                }
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to fetch ${modelName} with meta: ${error.message}`);
        }
    }
    async update(modelName, id, data, options) {
        try {
            const delegate = this.getModelDelegate(modelName);
            const exists = await delegate.findUnique({ where: { id } });
            if (!exists) {
                throw new common_1.NotFoundException(`${modelName} with ID ${id} not found`);
            }
            const queryOptions = {
                where: { id },
                data,
            };
            if (options?.include) {
                queryOptions.include = options.include;
            }
            else if (options?.select) {
                queryOptions.select = options.select;
            }
            const result = await delegate.update(queryOptions);
            this.clearModelCache(modelName);
            return result;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to update ${modelName}: ${error.message}`);
        }
    }
    async updateBulk(modelName, input, options) {
        try {
            const delegate = this.getModelDelegate(modelName);
            const queryOptions = {};
            if (options?.include) {
                queryOptions.include = options.include;
            }
            else if (options?.select) {
                queryOptions.select = options.select;
            }
            let updatedRecords = [];
            if (options?.select || options?.include) {
                const recordsToUpdate = await delegate.findMany({
                    where: input.where
                });
                if (recordsToUpdate.length === 0) {
                    return {
                        success: true,
                        count: 0,
                        data: []
                    };
                }
                updatedRecords = await Promise.all(recordsToUpdate.map((record) => delegate.update({
                    where: { id: record.id },
                    data: input.data,
                    ...queryOptions
                })));
            }
            else {
                const result = await delegate.updateMany({
                    where: input.where,
                    data: input.data
                });
            }
            this.clearModelCache(modelName);
            return {
                success: true,
                count: updatedRecords.length || 0,
                data: updatedRecords.length > 0 ? updatedRecords : undefined
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Bulk update failed for ${modelName}: ${error.message}`);
        }
    }
    async delete(modelName, id, options) {
        try {
            const delegate = this.getModelDelegate(modelName);
            const exists = await delegate.findUnique({ where: { id } });
            if (!exists) {
                throw new common_1.NotFoundException(`${modelName} with ID ${id} not found`);
            }
            const result = await delegate.delete({
                where: { id },
                ...options
            });
            this.clearModelCache(modelName);
            return result;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to delete ${modelName}: ${error.message}`);
        }
    }
    async deleteBulk(modelName, input, options) {
        try {
            const delegate = this.getModelDelegate(modelName);
            let deletedRecords = [];
            if (options?.select || options?.include) {
                const recordsToDelete = await delegate.findMany({
                    where: input.where,
                    ...options
                });
                if (recordsToDelete.length === 0) {
                    return {
                        success: true,
                        count: 0,
                        data: []
                    };
                }
                deletedRecords = await Promise.all(recordsToDelete.map((record) => delegate.delete({
                    where: { id: record.id },
                    ...options
                })));
            }
            else {
                const result = await delegate.deleteMany({
                    where: input.where
                });
            }
            this.clearModelCache(modelName);
            return {
                success: true,
                count: deletedRecords.length || 0,
                data: deletedRecords.length > 0 ? deletedRecords : undefined
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Bulk delete failed for ${modelName}: ${error.message}`);
        }
    }
    async count(modelName, where) {
        try {
            const delegate = this.getModelDelegate(modelName);
            return await delegate.count({ where });
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to count ${modelName}: ${error.message}`);
        }
    }
    async exists(modelName, where) {
        try {
            const delegate = this.getModelDelegate(modelName);
            const record = await delegate.findFirst({ where });
            return !!record;
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to check existence for ${modelName}: ${error.message}`);
        }
    }
    async upsert(modelName, where, create, update, options) {
        try {
            const delegate = this.getModelDelegate(modelName);
            const result = await delegate.upsert({
                where,
                create,
                update,
                ...options
            });
            this.clearModelCache(modelName);
            return result;
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to upsert ${modelName}: ${error.message}`);
        }
    }
    async findManyPaginated(modelName, input) {
        try {
            const delegate = this.getModelDelegate(modelName);
            const page = input?.page || 1;
            const limit = input?.limit || 10;
            const skip = (page - 1) * limit;
            const total = await delegate.count({
                where: input?.where
            });
            const data = await delegate.findMany({
                where: input?.where,
                orderBy: input?.orderBy,
                skip,
                take: limit,
                select: input?.select,
                include: input?.include
            });
            const totalPages = Math.ceil(total / limit);
            return {
                data,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to find paginated ${modelName}: ${error.message}`);
        }
    }
    async bulkCreate(modelName, data, options, context) {
        try {
            const delegate = this.getModelDelegate(modelName);
            const results = [];
            const errors = [];
            if (modelName === 'Project' || modelName === 'project') {
                data = data.map((item, index) => {
                    if (!item.ownerId) {
                        const userId = context?.req?.user?.id ||
                            context?.user?.id ||
                            context?.userId ||
                            item.userId;
                        if (userId) {
                            console.log(`🔄 FALLBACK (bulk): Setting ownerId for item ${index} from context:`, userId);
                            return { ...item, ownerId: userId };
                        }
                    }
                    return item;
                });
                const ownerIds = new Set(data.map(item => item.ownerId).filter(Boolean));
                if (ownerIds.size > 0) {
                    console.log(`🔍 Verifying ${ownerIds.size} owner(s) exist...`);
                    const owners = await this.prisma.user.findMany({
                        where: { id: { in: Array.from(ownerIds) } },
                        select: { id: true }
                    });
                    const missingOwners = Array.from(ownerIds).filter(id => !owners.find(o => o.id === id));
                    if (missingOwners.length > 0) {
                        console.error('❌ Missing owners:', missingOwners);
                        throw new common_1.BadRequestException(`Owner user(s) not found: ${missingOwners.join(', ')}`);
                    }
                    console.log(`✅ All ${owners.length} owner(s) verified`);
                }
            }
            if (!options?.select && !options?.include) {
                try {
                    const result = await delegate.createMany({
                        data,
                        skipDuplicates: options?.skipDuplicates || false
                    });
                    this.clearModelCache(modelName);
                    return {
                        success: true,
                        count: result.count,
                        data: undefined,
                        errors: undefined
                    };
                }
                catch (error) {
                }
            }
            for (let i = 0; i < data.length; i++) {
                try {
                    const result = await delegate.create({
                        data: data[i],
                        select: options?.select,
                        include: options?.include
                    });
                    results.push(result);
                }
                catch (error) {
                    errors.push({
                        index: i,
                        error: error.message,
                        data: data[i]
                    });
                }
            }
            this.clearModelCache(modelName);
            return {
                success: errors.length === 0,
                count: results.length,
                data: results,
                errors: errors.length > 0 ? errors : undefined
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Bulk create failed for ${modelName}: ${error.message}`);
        }
    }
    async bulkUpdate(modelName, where, data, options) {
        try {
            const delegate = this.getModelDelegate(modelName);
            if (!options?.select && !options?.include) {
                const result = await delegate.updateMany({
                    where,
                    data
                });
                this.clearModelCache(modelName);
                return {
                    success: true,
                    count: result.count,
                    data: undefined,
                    errors: undefined
                };
            }
            const recordsToUpdate = await delegate.findMany({ where });
            const results = [];
            const errors = [];
            for (let i = 0; i < recordsToUpdate.length; i++) {
                try {
                    const result = await delegate.update({
                        where: { id: recordsToUpdate[i].id },
                        data,
                        select: options?.select,
                        include: options?.include
                    });
                    results.push(result);
                }
                catch (error) {
                    errors.push({
                        index: i,
                        error: error.message,
                        data: recordsToUpdate[i]
                    });
                }
            }
            this.clearModelCache(modelName);
            return {
                success: errors.length === 0,
                count: results.length,
                data: results,
                errors: errors.length > 0 ? errors : undefined
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Bulk update failed for ${modelName}: ${error.message}`);
        }
    }
    async bulkDelete(modelName, where, options) {
        try {
            const delegate = this.getModelDelegate(modelName);
            let recordsToDelete = [];
            if (options?.select || options?.include) {
                recordsToDelete = await delegate.findMany({
                    where,
                    select: options?.select,
                    include: options?.include
                });
            }
            const result = await delegate.deleteMany({ where });
            this.clearModelCache(modelName);
            return {
                success: true,
                count: result.count,
                data: recordsToDelete.length > 0 ? recordsToDelete : undefined,
                errors: undefined
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Bulk delete failed for ${modelName}: ${error.message}`);
        }
    }
};
exports.DynamicCRUDService = DynamicCRUDService;
exports.DynamicCRUDService = DynamicCRUDService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DynamicCRUDService);
//# sourceMappingURL=dynamic-crud.service.js.map