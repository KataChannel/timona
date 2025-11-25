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
exports.CustomTemplateResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const current_user_decorator_1 = require("../../auth/current-user.decorator");
const custom_template_model_1 = require("../models/custom-template.model");
const user_model_1 = require("../models/user.model");
const client_1 = require("@prisma/client");
const custom_template_input_1 = require("../inputs/custom-template.input");
const custom_template_service_1 = require("../../services/custom-template.service");
let CustomTemplateResolver = class CustomTemplateResolver {
    constructor(customTemplateService) {
        this.customTemplateService = customTemplateService;
    }
    async getMyCustomTemplates(user, archived = false, category) {
        return this.customTemplateService.getUserTemplates(user.id, {
            archived,
            category,
        });
    }
    async getCustomTemplate(user, id) {
        return this.customTemplateService.getTemplate(id, user.id);
    }
    async getPublicTemplates(category) {
        return this.customTemplateService.getPublicTemplates(category);
    }
    async getSharedTemplates(user) {
        return this.customTemplateService.getSharedTemplates(user.id);
    }
    async createCustomTemplate(user, input) {
        return this.customTemplateService.createTemplate(user.id, input);
    }
    async updateCustomTemplate(user, input) {
        return this.customTemplateService.updateTemplate(user.id, input);
    }
    async deleteCustomTemplate(user, id) {
        return this.customTemplateService.deleteTemplate(id, user.id);
    }
    async duplicateCustomTemplate(user, templateId, newName) {
        return this.customTemplateService.duplicateTemplate(templateId, user.id, newName);
    }
    async shareTemplate(user, input) {
        return this.customTemplateService.shareTemplate(input.templateId, user.id, input.userIds);
    }
    async unshareTemplate(user, templateId, userId) {
        return this.customTemplateService.unshareTemplate(templateId, user.id, userId);
    }
    async updateTemplatePublicity(user, input) {
        return this.customTemplateService.updatePublicity(input.templateId, user.id, input.isPublic);
    }
    async incrementTemplateUsage(templateId) {
        return this.customTemplateService.incrementUsage(templateId);
    }
};
exports.CustomTemplateResolver = CustomTemplateResolver;
__decorate([
    (0, graphql_1.Query)(() => [custom_template_model_1.CustomTemplate], { name: 'getMyCustomTemplates' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('archived', { type: () => Boolean, nullable: true })),
    __param(2, (0, graphql_1.Args)('category', { type: () => client_1.TemplateCategory, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_model_1.User, Boolean, String]),
    __metadata("design:returntype", Promise)
], CustomTemplateResolver.prototype, "getMyCustomTemplates", null);
__decorate([
    (0, graphql_1.Query)(() => custom_template_model_1.CustomTemplate, { name: 'getCustomTemplate' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_model_1.User, String]),
    __metadata("design:returntype", Promise)
], CustomTemplateResolver.prototype, "getCustomTemplate", null);
__decorate([
    (0, graphql_1.Query)(() => [custom_template_model_1.CustomTemplate], { name: 'getPublicTemplates' }),
    __param(0, (0, graphql_1.Args)('category', { type: () => client_1.TemplateCategory, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomTemplateResolver.prototype, "getPublicTemplates", null);
__decorate([
    (0, graphql_1.Query)(() => [custom_template_model_1.CustomTemplate], { name: 'getSharedTemplates' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_model_1.User]),
    __metadata("design:returntype", Promise)
], CustomTemplateResolver.prototype, "getSharedTemplates", null);
__decorate([
    (0, graphql_1.Mutation)(() => custom_template_model_1.CustomTemplate, { name: 'createCustomTemplate' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_model_1.User,
        custom_template_input_1.CreateCustomTemplateInput]),
    __metadata("design:returntype", Promise)
], CustomTemplateResolver.prototype, "createCustomTemplate", null);
__decorate([
    (0, graphql_1.Mutation)(() => custom_template_model_1.CustomTemplate, { name: 'updateCustomTemplate' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_model_1.User,
        custom_template_input_1.UpdateCustomTemplateInput]),
    __metadata("design:returntype", Promise)
], CustomTemplateResolver.prototype, "updateCustomTemplate", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean, { name: 'deleteCustomTemplate' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_model_1.User, String]),
    __metadata("design:returntype", Promise)
], CustomTemplateResolver.prototype, "deleteCustomTemplate", null);
__decorate([
    (0, graphql_1.Mutation)(() => custom_template_model_1.CustomTemplate, { name: 'duplicateCustomTemplate' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('templateId')),
    __param(2, (0, graphql_1.Args)('newName', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_model_1.User, String, String]),
    __metadata("design:returntype", Promise)
], CustomTemplateResolver.prototype, "duplicateCustomTemplate", null);
__decorate([
    (0, graphql_1.Mutation)(() => [custom_template_model_1.TemplateShare], { name: 'shareTemplate' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_model_1.User,
        custom_template_input_1.ShareTemplateInput]),
    __metadata("design:returntype", Promise)
], CustomTemplateResolver.prototype, "shareTemplate", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean, { name: 'unshareTemplate' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('templateId')),
    __param(2, (0, graphql_1.Args)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_model_1.User, String, String]),
    __metadata("design:returntype", Promise)
], CustomTemplateResolver.prototype, "unshareTemplate", null);
__decorate([
    (0, graphql_1.Mutation)(() => custom_template_model_1.CustomTemplate, { name: 'updateTemplatePublicity' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_model_1.User,
        custom_template_input_1.UpdateTemplatePublicityInput]),
    __metadata("design:returntype", Promise)
], CustomTemplateResolver.prototype, "updateTemplatePublicity", null);
__decorate([
    (0, graphql_1.Mutation)(() => custom_template_model_1.CustomTemplate, { name: 'incrementTemplateUsage' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('templateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomTemplateResolver.prototype, "incrementTemplateUsage", null);
exports.CustomTemplateResolver = CustomTemplateResolver = __decorate([
    (0, graphql_1.Resolver)(() => custom_template_model_1.CustomTemplate),
    __metadata("design:paramtypes", [custom_template_service_1.CustomTemplateService])
], CustomTemplateResolver);
//# sourceMappingURL=custom-template.resolver.js.map