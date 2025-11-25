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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsiteSettingResolver = exports.WebsiteSetting = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const website_setting_input_1 = require("../dto/website-setting.input");
const graphql_type_json_1 = __importDefault(require("graphql-type-json"));
let WebsiteSetting = class WebsiteSetting {
};
exports.WebsiteSetting = WebsiteSetting;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], WebsiteSetting.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], WebsiteSetting.prototype, "key", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], WebsiteSetting.prototype, "label", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], WebsiteSetting.prototype, "value", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], WebsiteSetting.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], WebsiteSetting.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], WebsiteSetting.prototype, "category", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], WebsiteSetting.prototype, "group", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Number)
], WebsiteSetting.prototype, "order", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default, { nullable: true }),
    __metadata("design:type", Object)
], WebsiteSetting.prototype, "options", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default, { nullable: true }),
    __metadata("design:type", Object)
], WebsiteSetting.prototype, "validation", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], WebsiteSetting.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], WebsiteSetting.prototype, "isPublic", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], WebsiteSetting.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], WebsiteSetting.prototype, "updatedAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], WebsiteSetting.prototype, "createdBy", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], WebsiteSetting.prototype, "updatedBy", void 0);
exports.WebsiteSetting = WebsiteSetting = __decorate([
    (0, graphql_1.ObjectType)()
], WebsiteSetting);
let WebsiteSettingResolver = class WebsiteSettingResolver {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getWebsiteSettings(category, group, isActive, isPublic) {
        const where = {};
        if (category)
            where.category = category;
        if (group)
            where.group = group;
        if (typeof isActive === 'boolean')
            where.isActive = isActive;
        if (typeof isPublic === 'boolean')
            where.isPublic = isPublic;
        return await this.prisma.websiteSetting.findMany({
            where,
            orderBy: [{ category: 'asc' }, { order: 'asc' }],
        });
    }
    async getPublicWebsiteSettings(category, group, keys) {
        const where = {
            isActive: true,
            isPublic: true,
        };
        if (category)
            where.category = category;
        if (group)
            where.group = group;
        if (keys && keys.length > 0)
            where.key = { in: keys };
        return await this.prisma.websiteSetting.findMany({
            where,
            orderBy: [{ category: 'asc' }, { order: 'asc' }],
        });
    }
    async getWebsiteSetting(key) {
        return await this.prisma.websiteSetting.findUnique({
            where: { key },
        });
    }
    async getWebsiteSettingsByCategory(category) {
        return await this.prisma.websiteSetting.findMany({
            where: {
                category: category,
                isActive: true,
                isPublic: true,
            },
            orderBy: { order: 'asc' },
        });
    }
    async getHeaderSettings() {
        return await this.prisma.websiteSetting.findMany({
            where: {
                category: 'HEADER',
                isActive: true,
                isPublic: true,
            },
            orderBy: { order: 'asc' },
        });
    }
    async getFooterSettings() {
        return await this.prisma.websiteSetting.findMany({
            where: {
                category: 'FOOTER',
                isActive: true,
                isPublic: true,
            },
            orderBy: { order: 'asc' },
        });
    }
    async updateWebsiteSetting(key, input) {
        return await this.prisma.websiteSetting.update({
            where: { key },
            data: {
                ...input,
                updatedAt: new Date(),
            },
        });
    }
    async createWebsiteSetting(input) {
        return await this.prisma.websiteSetting.create({
            data: {
                ...input,
            },
        });
    }
    async deleteWebsiteSetting(key) {
        return await this.prisma.websiteSetting.delete({
            where: { key },
        });
    }
};
exports.WebsiteSettingResolver = WebsiteSettingResolver;
__decorate([
    (0, graphql_1.Query)(() => [WebsiteSetting], { name: 'websiteSettings' }),
    __param(0, (0, graphql_1.Args)('category', { nullable: true })),
    __param(1, (0, graphql_1.Args)('group', { nullable: true })),
    __param(2, (0, graphql_1.Args)('isActive', { nullable: true })),
    __param(3, (0, graphql_1.Args)('isPublic', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Boolean, Boolean]),
    __metadata("design:returntype", Promise)
], WebsiteSettingResolver.prototype, "getWebsiteSettings", null);
__decorate([
    (0, graphql_1.Query)(() => [WebsiteSetting], { name: 'publicWebsiteSettings' }),
    __param(0, (0, graphql_1.Args)('category', { nullable: true })),
    __param(1, (0, graphql_1.Args)('group', { nullable: true })),
    __param(2, (0, graphql_1.Args)('keys', { type: () => [String], nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Array]),
    __metadata("design:returntype", Promise)
], WebsiteSettingResolver.prototype, "getPublicWebsiteSettings", null);
__decorate([
    (0, graphql_1.Query)(() => WebsiteSetting, { name: 'websiteSetting', nullable: true }),
    __param(0, (0, graphql_1.Args)('key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WebsiteSettingResolver.prototype, "getWebsiteSetting", null);
__decorate([
    (0, graphql_1.Query)(() => [WebsiteSetting], { name: 'websiteSettingsByCategory' }),
    __param(0, (0, graphql_1.Args)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WebsiteSettingResolver.prototype, "getWebsiteSettingsByCategory", null);
__decorate([
    (0, graphql_1.Query)(() => [WebsiteSetting], { name: 'headerSettings' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WebsiteSettingResolver.prototype, "getHeaderSettings", null);
__decorate([
    (0, graphql_1.Query)(() => [WebsiteSetting], { name: 'footerSettings' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WebsiteSettingResolver.prototype, "getFooterSettings", null);
__decorate([
    (0, graphql_1.Mutation)(() => WebsiteSetting, { name: 'updateWebsiteSetting' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRoleType.ADMIN),
    __param(0, (0, graphql_1.Args)('key')),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, website_setting_input_1.UpdateWebsiteSettingInput]),
    __metadata("design:returntype", Promise)
], WebsiteSettingResolver.prototype, "updateWebsiteSetting", null);
__decorate([
    (0, graphql_1.Mutation)(() => WebsiteSetting, { name: 'createWebsiteSetting' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRoleType.ADMIN),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [website_setting_input_1.CreateWebsiteSettingInput]),
    __metadata("design:returntype", Promise)
], WebsiteSettingResolver.prototype, "createWebsiteSetting", null);
__decorate([
    (0, graphql_1.Mutation)(() => WebsiteSetting, { name: 'deleteWebsiteSetting' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRoleType.ADMIN),
    __param(0, (0, graphql_1.Args)('key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WebsiteSettingResolver.prototype, "deleteWebsiteSetting", null);
exports.WebsiteSettingResolver = WebsiteSettingResolver = __decorate([
    (0, graphql_1.Resolver)(() => WebsiteSetting),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WebsiteSettingResolver);
//# sourceMappingURL=website-setting.resolver.js.map