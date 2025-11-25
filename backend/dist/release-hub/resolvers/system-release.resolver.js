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
exports.SystemReleaseResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const system_release_service_1 = require("../services/system-release.service");
const system_release_entity_1 = require("../entities/system-release.entity");
const system_release_input_1 = require("../dto/system-release.input");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const current_user_decorator_1 = require("../../auth/current-user.decorator");
const graphql_2 = require("@nestjs/graphql");
let SystemReleaseResolver = class SystemReleaseResolver {
    constructor(releaseService) {
        this.releaseService = releaseService;
    }
    async getSystemReleases(where, take, skip) {
        return this.releaseService.findAll(where, take, skip);
    }
    async getSystemRelease(id) {
        return this.releaseService.findOne(id);
    }
    async getSystemReleaseByVersion(version) {
        return this.releaseService.findByVersion(version);
    }
    async getSystemReleaseBySlug(slug) {
        return this.releaseService.findBySlug(slug);
    }
    async getLatestSystemRelease() {
        return this.releaseService.getLatestRelease();
    }
    async createSystemRelease(input, user) {
        return this.releaseService.create(input, user.id);
    }
    async updateSystemRelease(id, input, user) {
        return this.releaseService.update(id, input, user.id);
    }
    async deleteSystemRelease(id) {
        return this.releaseService.delete(id);
    }
    async publishSystemRelease(id) {
        return this.releaseService.publish(id);
    }
    async incrementSystemReleaseDownloadCount(id) {
        await this.releaseService.incrementDownloadCount(id);
        return true;
    }
};
exports.SystemReleaseResolver = SystemReleaseResolver;
__decorate([
    (0, graphql_1.Query)(() => [system_release_entity_1.SystemRelease], { name: 'systemReleases' }),
    __param(0, (0, graphql_1.Args)('where', { type: () => system_release_input_1.SystemReleaseWhereInput, nullable: true })),
    __param(1, (0, graphql_1.Args)('take', { type: () => graphql_2.Int, nullable: true, defaultValue: 20 })),
    __param(2, (0, graphql_1.Args)('skip', { type: () => graphql_2.Int, nullable: true, defaultValue: 0 })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [system_release_input_1.SystemReleaseWhereInput, Number, Number]),
    __metadata("design:returntype", Promise)
], SystemReleaseResolver.prototype, "getSystemReleases", null);
__decorate([
    (0, graphql_1.Query)(() => system_release_entity_1.SystemRelease, { name: 'systemRelease', nullable: true }),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SystemReleaseResolver.prototype, "getSystemRelease", null);
__decorate([
    (0, graphql_1.Query)(() => system_release_entity_1.SystemRelease, { name: 'systemReleaseByVersion', nullable: true }),
    __param(0, (0, graphql_1.Args)('version')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SystemReleaseResolver.prototype, "getSystemReleaseByVersion", null);
__decorate([
    (0, graphql_1.Query)(() => system_release_entity_1.SystemRelease, { name: 'systemReleaseBySlug', nullable: true }),
    __param(0, (0, graphql_1.Args)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SystemReleaseResolver.prototype, "getSystemReleaseBySlug", null);
__decorate([
    (0, graphql_1.Query)(() => system_release_entity_1.SystemRelease, { name: 'latestSystemRelease', nullable: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SystemReleaseResolver.prototype, "getLatestSystemRelease", null);
__decorate([
    (0, graphql_1.Mutation)(() => system_release_entity_1.SystemRelease),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [system_release_input_1.CreateSystemReleaseInput, Object]),
    __metadata("design:returntype", Promise)
], SystemReleaseResolver.prototype, "createSystemRelease", null);
__decorate([
    (0, graphql_1.Mutation)(() => system_release_entity_1.SystemRelease),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('input')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, system_release_input_1.UpdateSystemReleaseInput, Object]),
    __metadata("design:returntype", Promise)
], SystemReleaseResolver.prototype, "updateSystemRelease", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SystemReleaseResolver.prototype, "deleteSystemRelease", null);
__decorate([
    (0, graphql_1.Mutation)(() => system_release_entity_1.SystemRelease),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SystemReleaseResolver.prototype, "publishSystemRelease", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SystemReleaseResolver.prototype, "incrementSystemReleaseDownloadCount", null);
exports.SystemReleaseResolver = SystemReleaseResolver = __decorate([
    (0, graphql_1.Resolver)(() => system_release_entity_1.SystemRelease),
    __metadata("design:paramtypes", [system_release_service_1.SystemReleaseService])
], SystemReleaseResolver);
//# sourceMappingURL=system-release.resolver.js.map