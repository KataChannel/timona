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
var DynamicQueryGeneratorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamicQueryGeneratorService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let DynamicQueryGeneratorService = DynamicQueryGeneratorService_1 = class DynamicQueryGeneratorService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(DynamicQueryGeneratorService_1.name);
        this.validModels = [
            'user',
            'authMethod',
            'verificationToken',
            'userSession',
            'auditLog',
            'role',
            'permission',
            'rolePermission',
            'userRoleAssignment',
            'userPermission',
            'resourceAccess',
            'post',
            'comment',
            'tag',
            'postTag',
            'like',
            'task',
            'taskComment',
            'taskMedia',
            'taskShare',
            'notification',
            'menu',
            'page',
            'pageBlock',
            'chatbotModel',
            'trainingData',
            'chatConversation',
            'chatMessage',
            'affUser',
            'affCampaign',
            'affCampaignAffiliate',
            'affLink',
            'affClick',
            'affConversion',
            'affPaymentRequest',
            'userMfaSettings',
            'invoice',
            'invoiceItem',
            'invoicePayment',
            'ext_listhoadon',
            'ext_detailhoadon',
            'ext_sanphamhoadon',
        ];
    }
    validateModel(modelName) {
        const normalizedModel = modelName.toLowerCase();
        if (!this.validModels.includes(normalizedModel)) {
            throw new Error(`Invalid model: ${modelName}. Valid models: ${this.validModels.join(', ')}`);
        }
    }
    getModelDelegate(modelName) {
        const normalizedModel = modelName.toLowerCase();
        const modelMap = {
            user: this.prisma.user,
            authmethod: this.prisma.authMethod,
            verificationtoken: this.prisma.verificationToken,
            usersession: this.prisma.userSession,
            auditlog: this.prisma.auditLog,
            role: this.prisma.role,
            permission: this.prisma.permission,
            rolepermission: this.prisma.rolePermission,
            userroleassignment: this.prisma.userRoleAssignment,
            userpermission: this.prisma.userPermission,
            resourceaccess: this.prisma.resourceAccess,
            post: this.prisma.post,
            comment: this.prisma.comment,
            tag: this.prisma.tag,
            posttag: this.prisma.postTag,
            like: this.prisma.like,
            task: this.prisma.task,
            taskcomment: this.prisma.taskComment,
            taskmedia: this.prisma.taskMedia,
            taskshare: this.prisma.taskShare,
            notification: this.prisma.notification,
            menu: this.prisma.menu,
            page: this.prisma.page,
            pageblock: this.prisma.pageBlock,
            chatbotmodel: this.prisma.chatbotModel,
            trainingdata: this.prisma.trainingData,
            chatconversation: this.prisma.chatConversation,
            chatmessage: this.prisma.chatMessage,
            affuser: this.prisma.affUser,
            affcampaign: this.prisma.affCampaign,
            affcampaignaffiliate: this.prisma.affCampaignAffiliate,
            afflink: this.prisma.affLink,
            affclick: this.prisma.affClick,
            affconversion: this.prisma.affConversion,
            affpaymentrequest: this.prisma.affPaymentRequest,
            usermfasettings: this.prisma.userMfaSettings,
            invoice: this.prisma.ext_listhoadon,
            invoiceitem: this.prisma.ext_detailhoadon,
            invoicepayment: this.prisma.ext_listhoadon,
            ext_listhoadon: this.prisma.ext_listhoadon,
            ext_detailhoadon: this.prisma.ext_detailhoadon,
            ext_sanphamhoadon: this.prisma.ext_sanphamhoadon,
        };
        const delegate = modelMap[normalizedModel];
        if (!delegate) {
            throw new Error(`No Prisma delegate found for model: ${modelName}`);
        }
        return delegate;
    }
    async findMany(modelName, options = {}) {
        this.validateModel(modelName);
        const delegate = this.getModelDelegate(modelName);
        try {
            const { select, where, include, orderBy, skip, take, distinct } = options;
            const queryOptions = {};
            if (select)
                queryOptions.select = select;
            if (where)
                queryOptions.where = where;
            if (include)
                queryOptions.include = include;
            if (orderBy) {
                if (Array.isArray(orderBy)) {
                    queryOptions.orderBy = orderBy;
                }
                else if (typeof orderBy === 'object') {
                    const keys = Object.keys(orderBy);
                    if (keys.length > 1) {
                        queryOptions.orderBy = keys.map(key => ({ [key]: orderBy[key] }));
                    }
                    else {
                        queryOptions.orderBy = orderBy;
                    }
                }
            }
            if (skip !== undefined)
                queryOptions.skip = skip;
            if (take !== undefined)
                queryOptions.take = take;
            if (distinct)
                queryOptions.distinct = distinct;
            this.logger.debug(`findMany ${modelName}:`, queryOptions);
            const data = await delegate.findMany(queryOptions);
            let total;
            if (skip !== undefined || take !== undefined) {
                total = await delegate.count({ where });
            }
            return {
                data,
                count: data.length,
                total,
                hasMore: total ? skip + take < total : false,
            };
        }
        catch (error) {
            this.logger.error(`Error in findMany for ${modelName}:`, error);
            throw error;
        }
    }
    async findUnique(modelName, where, options = {}) {
        this.validateModel(modelName);
        const delegate = this.getModelDelegate(modelName);
        try {
            const { select, include } = options;
            const queryOptions = { where };
            if (select)
                queryOptions.select = select;
            if (include)
                queryOptions.include = include;
            this.logger.debug(`findUnique ${modelName}:`, queryOptions);
            return await delegate.findUnique(queryOptions);
        }
        catch (error) {
            this.logger.error(`Error in findUnique for ${modelName}:`, error);
            throw error;
        }
    }
    async findFirst(modelName, options = {}) {
        this.validateModel(modelName);
        const delegate = this.getModelDelegate(modelName);
        try {
            const { select, where, include, orderBy } = options;
            const queryOptions = {};
            if (select)
                queryOptions.select = select;
            if (where)
                queryOptions.where = where;
            if (include)
                queryOptions.include = include;
            if (orderBy)
                queryOptions.orderBy = orderBy;
            this.logger.debug(`findFirst ${modelName}:`, queryOptions);
            return await delegate.findFirst(queryOptions);
        }
        catch (error) {
            this.logger.error(`Error in findFirst for ${modelName}:`, error);
            throw error;
        }
    }
    async create(modelName, data, options = {}) {
        this.validateModel(modelName);
        const delegate = this.getModelDelegate(modelName);
        try {
            const { select, include } = options;
            const queryOptions = { data };
            if (select)
                queryOptions.select = select;
            if (include)
                queryOptions.include = include;
            this.logger.debug(`create ${modelName}:`, queryOptions);
            return await delegate.create(queryOptions);
        }
        catch (error) {
            this.logger.error(`Error in create for ${modelName}:`, error);
            throw error;
        }
    }
    async createMany(modelName, data, skipDuplicates = false) {
        this.validateModel(modelName);
        const delegate = this.getModelDelegate(modelName);
        try {
            this.logger.debug(`createMany ${modelName}:`, { count: data.length });
            return await delegate.createMany({
                data,
                skipDuplicates,
            });
        }
        catch (error) {
            this.logger.error(`Error in createMany for ${modelName}:`, error);
            throw error;
        }
    }
    async update(modelName, where, data, options = {}) {
        this.validateModel(modelName);
        const delegate = this.getModelDelegate(modelName);
        try {
            const { select, include } = options;
            const queryOptions = { where, data };
            if (select)
                queryOptions.select = select;
            if (include)
                queryOptions.include = include;
            this.logger.debug(`update ${modelName}:`, queryOptions);
            return await delegate.update(queryOptions);
        }
        catch (error) {
            this.logger.error(`Error in update for ${modelName}:`, error);
            throw error;
        }
    }
    async updateMany(modelName, where, data) {
        this.validateModel(modelName);
        const delegate = this.getModelDelegate(modelName);
        try {
            this.logger.debug(`updateMany ${modelName}:`, { where, data });
            return await delegate.updateMany({ where, data });
        }
        catch (error) {
            this.logger.error(`Error in updateMany for ${modelName}:`, error);
            throw error;
        }
    }
    async upsert(modelName, where, create, update, options = {}) {
        this.validateModel(modelName);
        const delegate = this.getModelDelegate(modelName);
        try {
            const { select, include } = options;
            const queryOptions = { where, create, update };
            if (select)
                queryOptions.select = select;
            if (include)
                queryOptions.include = include;
            this.logger.debug(`upsert ${modelName}:`, queryOptions);
            return await delegate.upsert(queryOptions);
        }
        catch (error) {
            this.logger.error(`Error in upsert for ${modelName}:`, error);
            throw error;
        }
    }
    async delete(modelName, where, options = {}) {
        this.validateModel(modelName);
        const delegate = this.getModelDelegate(modelName);
        try {
            const { select, include } = options;
            const queryOptions = { where };
            if (select)
                queryOptions.select = select;
            if (include)
                queryOptions.include = include;
            this.logger.debug(`delete ${modelName}:`, queryOptions);
            return await delegate.delete(queryOptions);
        }
        catch (error) {
            this.logger.error(`Error in delete for ${modelName}:`, error);
            throw error;
        }
    }
    async deleteMany(modelName, where) {
        this.validateModel(modelName);
        const delegate = this.getModelDelegate(modelName);
        try {
            this.logger.debug(`deleteMany ${modelName}:`, { where });
            return await delegate.deleteMany({ where });
        }
        catch (error) {
            this.logger.error(`Error in deleteMany for ${modelName}:`, error);
            throw error;
        }
    }
    async count(modelName, where) {
        this.validateModel(modelName);
        const delegate = this.getModelDelegate(modelName);
        try {
            this.logger.debug(`count ${modelName}:`, { where });
            return await delegate.count({ where });
        }
        catch (error) {
            this.logger.error(`Error in count for ${modelName}:`, error);
            throw error;
        }
    }
    async aggregate(modelName, options) {
        this.validateModel(modelName);
        const delegate = this.getModelDelegate(modelName);
        try {
            this.logger.debug(`aggregate ${modelName}:`, options);
            return await delegate.aggregate(options);
        }
        catch (error) {
            this.logger.error(`Error in aggregate for ${modelName}:`, error);
            throw error;
        }
    }
    async groupBy(modelName, options) {
        this.validateModel(modelName);
        const delegate = this.getModelDelegate(modelName);
        try {
            this.logger.debug(`groupBy ${modelName}:`, options);
            return await delegate.groupBy(options);
        }
        catch (error) {
            this.logger.error(`Error in groupBy for ${modelName}:`, error);
            throw error;
        }
    }
    async executeRaw(query, params = []) {
        try {
            this.logger.debug('executeRaw:', { query, params });
            return await this.prisma.$executeRaw `${query}`;
        }
        catch (error) {
            this.logger.error('Error in executeRaw:', error);
            throw error;
        }
    }
    async queryRaw(query, params = []) {
        try {
            this.logger.debug('queryRaw:', { query, params });
            return await this.prisma.$queryRaw `${query}`;
        }
        catch (error) {
            this.logger.error('Error in queryRaw:', error);
            throw error;
        }
    }
    getAvailableModels() {
        return this.validModels;
    }
    modelExists(modelName) {
        return this.validModels.includes(modelName.toLowerCase());
    }
};
exports.DynamicQueryGeneratorService = DynamicQueryGeneratorService;
exports.DynamicQueryGeneratorService = DynamicQueryGeneratorService = DynamicQueryGeneratorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DynamicQueryGeneratorService);
//# sourceMappingURL=dynamic-query-generator.service.js.map