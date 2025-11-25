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
exports.GrokResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const grok_service_1 = require("../../grok/grok.service");
const post_service_1 = require("../../services/post.service");
let GrokResolver = class GrokResolver {
    constructor(grokService, postService) {
        this.grokService = grokService;
        this.postService = postService;
    }
    async generateSummary(content, maxLength) {
        return this.grokService.generateSummary(content, maxLength);
    }
    async generatePostSummary(postId) {
        const post = await this.postService.findById(postId);
        return this.grokService.generatePostExcerpt(post.title, post.content);
    }
    async generateTags(content, maxTags) {
        return this.grokService.generateTags(content, maxTags);
    }
    async improveContent(content, instruction) {
        return this.grokService.improveContent(content, instruction);
    }
};
exports.GrokResolver = GrokResolver;
__decorate([
    (0, graphql_1.Mutation)(() => String, { name: 'generateSummary' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('content')),
    __param(1, (0, graphql_1.Args)('maxLength', { defaultValue: 200 })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], GrokResolver.prototype, "generateSummary", null);
__decorate([
    (0, graphql_1.Mutation)(() => String, { name: 'generatePostSummary' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('postId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GrokResolver.prototype, "generatePostSummary", null);
__decorate([
    (0, graphql_1.Mutation)(() => [String], { name: 'generateTags' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('content')),
    __param(1, (0, graphql_1.Args)('maxTags', { defaultValue: 5 })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], GrokResolver.prototype, "generateTags", null);
__decorate([
    (0, graphql_1.Mutation)(() => String, { name: 'improveContent' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('content')),
    __param(1, (0, graphql_1.Args)('instruction')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], GrokResolver.prototype, "improveContent", null);
exports.GrokResolver = GrokResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [grok_service_1.GrokService,
        post_service_1.PostService])
], GrokResolver);
//# sourceMappingURL=grok.resolver.js.map