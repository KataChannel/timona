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
exports.SystemGuideResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const system_guide_entity_1 = require("../entities/system-guide.entity");
const system_guide_service_1 = require("../services/system-guide.service");
const system_guide_dto_1 = require("../dto/system-guide.dto");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const current_user_decorator_1 = require("../../auth/current-user.decorator");
let SystemGuideResolver = class SystemGuideResolver {
    constructor(systemGuideService) {
        this.systemGuideService = systemGuideService;
    }
    order(guide) {
        return guide.orderIndex;
    }
    icon(guide) {
        return guide.icon || null;
    }
    async getSystemGuides(type, parentId, search) {
        return this.systemGuideService.findAll({
            type,
            parentId,
            search,
            isPublished: true,
        });
    }
    async getSystemGuide(id) {
        return this.systemGuideService.findOne(id);
    }
    async getSystemGuideBySlug(slug) {
        return this.systemGuideService.findBySlug(slug);
    }
    async createSystemGuide(input, user) {
        return this.systemGuideService.create({
            ...input,
            authorId: user.id,
        });
    }
    async updateSystemGuide(input) {
        return this.systemGuideService.update(input);
    }
    async deleteSystemGuide(id) {
        return this.systemGuideService.delete(id);
    }
    async incrementGuideView(id) {
        return this.systemGuideService.incrementViewCount(id);
    }
    async voteGuideHelpful(id, isHelpful) {
        return this.systemGuideService.voteHelpful(id, isHelpful);
    }
};
exports.SystemGuideResolver = SystemGuideResolver;
__decorate([
    (0, graphql_1.ResolveField)(() => Number),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SystemGuideResolver.prototype, "order", null);
__decorate([
    (0, graphql_1.ResolveField)(() => String, { nullable: true }),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SystemGuideResolver.prototype, "icon", null);
__decorate([
    (0, graphql_1.Query)(() => [system_guide_entity_1.SystemGuideEntity], { name: 'systemGuides' }),
    __param(0, (0, graphql_1.Args)('type', { type: () => system_guide_entity_1.GuideType, nullable: true })),
    __param(1, (0, graphql_1.Args)('parentId', { type: () => String, nullable: true })),
    __param(2, (0, graphql_1.Args)('search', { type: () => String, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], SystemGuideResolver.prototype, "getSystemGuides", null);
__decorate([
    (0, graphql_1.Query)(() => system_guide_entity_1.SystemGuideEntity, { name: 'systemGuide' }),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SystemGuideResolver.prototype, "getSystemGuide", null);
__decorate([
    (0, graphql_1.Query)(() => system_guide_entity_1.SystemGuideEntity, { name: 'systemGuideBySlug' }),
    __param(0, (0, graphql_1.Args)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SystemGuideResolver.prototype, "getSystemGuideBySlug", null);
__decorate([
    (0, graphql_1.Mutation)(() => system_guide_entity_1.SystemGuideEntity),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [system_guide_dto_1.CreateSystemGuideInput, Object]),
    __metadata("design:returntype", Promise)
], SystemGuideResolver.prototype, "createSystemGuide", null);
__decorate([
    (0, graphql_1.Mutation)(() => system_guide_entity_1.SystemGuideEntity),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [system_guide_dto_1.UpdateSystemGuideInput]),
    __metadata("design:returntype", Promise)
], SystemGuideResolver.prototype, "updateSystemGuide", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SystemGuideResolver.prototype, "deleteSystemGuide", null);
__decorate([
    (0, graphql_1.Mutation)(() => system_guide_entity_1.SystemGuideEntity),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SystemGuideResolver.prototype, "incrementGuideView", null);
__decorate([
    (0, graphql_1.Mutation)(() => system_guide_entity_1.SystemGuideEntity),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('isHelpful')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", Promise)
], SystemGuideResolver.prototype, "voteGuideHelpful", null);
exports.SystemGuideResolver = SystemGuideResolver = __decorate([
    (0, graphql_1.Resolver)(() => system_guide_entity_1.SystemGuideEntity),
    __metadata("design:paramtypes", [system_guide_service_1.SystemGuideService])
], SystemGuideResolver);
//# sourceMappingURL=system-guide.resolver.js.map