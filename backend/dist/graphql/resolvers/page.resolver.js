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
exports.PageResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const page_model_1 = require("../models/page.model");
const page_input_1 = require("../inputs/page.input");
const pagination_model_1 = require("../models/pagination.model");
const page_service_1 = require("../../services/page.service");
let PageResolver = class PageResolver {
    constructor(pageService) {
        this.pageService = pageService;
    }
    async getPages(pagination, filters) {
        return this.pageService.findMany(pagination, filters);
    }
    async getPageById(id) {
        return this.pageService.findById(id);
    }
    async getPageBySlug(slug) {
        console.log(`Fetching page with slug: ${slug}`);
        return this.pageService.findBySlug(slug);
    }
    async getPublishedPages(pagination) {
        return this.pageService.findPublished(pagination);
    }
    async getHomepage() {
        return this.pageService.findHomepage();
    }
    async getReservedSlugs() {
        return this.pageService.getReservedSlugs();
    }
    async getPageBySlugPattern(slugPattern) {
        return this.pageService.findBySlugPattern(slugPattern);
    }
    async createPage(input, context) {
        const userId = context.req.user.id;
        return this.pageService.create(input, userId);
    }
    async updatePage(id, input, context) {
        const userId = context.req.user.id;
        return this.pageService.update(id, input, userId);
    }
    async deletePage(id) {
        return this.pageService.delete(id);
    }
    async duplicatePage(id, title, slug, context) {
        const userId = context.req.user.id;
        return this.pageService.duplicate(id, userId, title, slug);
    }
    async addPageBlock(pageId, input) {
        return this.pageService.addBlock(pageId, input);
    }
    async updatePageBlock(id, input) {
        return this.pageService.updateBlock(id, input);
    }
    async deletePageBlock(id) {
        return this.pageService.deleteBlock(id);
    }
    async updatePageBlocksOrder(pageId, updates) {
        return this.pageService.updateBlocksOrder(pageId, updates);
    }
    seoKeywords(page) {
        if (!page.seoKeywords) {
            return null;
        }
        if (Array.isArray(page.seoKeywords)) {
            return page.seoKeywords;
        }
        if (typeof page.seoKeywords === 'string') {
            try {
                const parsed = JSON.parse(page.seoKeywords);
                return Array.isArray(parsed) ? parsed : [page.seoKeywords];
            }
            catch {
                return [page.seoKeywords];
            }
        }
        if (typeof page.seoKeywords === 'object') {
            if ('length' in page.seoKeywords) {
                return Object.values(page.seoKeywords).filter(v => typeof v === 'string');
            }
            return Object.values(page.seoKeywords).filter(v => typeof v === 'string');
        }
        return null;
    }
};
exports.PageResolver = PageResolver;
__decorate([
    (0, graphql_1.Query)(() => page_model_1.PaginatedPages, { name: 'getPages' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('pagination', { defaultValue: { page: 1, limit: 10 } })),
    __param(1, (0, graphql_1.Args)('filters', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_model_1.PaginationInput,
        page_input_1.PageFiltersInput]),
    __metadata("design:returntype", Promise)
], PageResolver.prototype, "getPages", null);
__decorate([
    (0, graphql_1.Query)(() => page_model_1.Page, { name: 'getPageById' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PageResolver.prototype, "getPageById", null);
__decorate([
    (0, graphql_1.Query)(() => page_model_1.Page, { name: 'getPageBySlug', nullable: true }),
    __param(0, (0, graphql_1.Args)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PageResolver.prototype, "getPageBySlug", null);
__decorate([
    (0, graphql_1.Query)(() => page_model_1.PaginatedPages, { name: 'getPublishedPages' }),
    __param(0, (0, graphql_1.Args)('pagination', { defaultValue: { page: 1, limit: 10 } })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_model_1.PaginationInput]),
    __metadata("design:returntype", Promise)
], PageResolver.prototype, "getPublishedPages", null);
__decorate([
    (0, graphql_1.Query)(() => page_model_1.Page, { name: 'getHomepage', nullable: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PageResolver.prototype, "getHomepage", null);
__decorate([
    (0, graphql_1.Query)(() => [String], { name: 'getReservedSlugs' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PageResolver.prototype, "getReservedSlugs", null);
__decorate([
    (0, graphql_1.Query)(() => page_model_1.Page, { name: 'getPageBySlugPattern', nullable: true }),
    __param(0, (0, graphql_1.Args)('slugPattern')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PageResolver.prototype, "getPageBySlugPattern", null);
__decorate([
    (0, graphql_1.Mutation)(() => page_model_1.Page, { name: 'createPage' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [page_input_1.CreatePageInput, Object]),
    __metadata("design:returntype", Promise)
], PageResolver.prototype, "createPage", null);
__decorate([
    (0, graphql_1.Mutation)(() => page_model_1.Page, { name: 'updatePage' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('input')),
    __param(2, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, page_input_1.UpdatePageInput, Object]),
    __metadata("design:returntype", Promise)
], PageResolver.prototype, "updatePage", null);
__decorate([
    (0, graphql_1.Mutation)(() => page_model_1.Page, { name: 'deletePage' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PageResolver.prototype, "deletePage", null);
__decorate([
    (0, graphql_1.Mutation)(() => page_model_1.Page, { name: 'duplicatePage' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('title', { nullable: true })),
    __param(2, (0, graphql_1.Args)('slug', { nullable: true })),
    __param(3, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], PageResolver.prototype, "duplicatePage", null);
__decorate([
    (0, graphql_1.Mutation)(() => page_model_1.PageBlock, { name: 'addPageBlock' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('pageId')),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, page_input_1.CreatePageBlockInput]),
    __metadata("design:returntype", Promise)
], PageResolver.prototype, "addPageBlock", null);
__decorate([
    (0, graphql_1.Mutation)(() => page_model_1.PageBlock, { name: 'updatePageBlock' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, page_input_1.UpdatePageBlockInput]),
    __metadata("design:returntype", Promise)
], PageResolver.prototype, "updatePageBlock", null);
__decorate([
    (0, graphql_1.Mutation)(() => page_model_1.PageBlock, { name: 'deletePageBlock' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PageResolver.prototype, "deletePageBlock", null);
__decorate([
    (0, graphql_1.Mutation)(() => [page_model_1.PageBlock], { name: 'updatePageBlocksOrder' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('pageId')),
    __param(1, (0, graphql_1.Args)('updates', { type: () => [page_input_1.BulkUpdateBlockOrderInput] })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", Promise)
], PageResolver.prototype, "updatePageBlocksOrder", null);
__decorate([
    (0, graphql_1.ResolveField)(() => [String], { nullable: true }),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [page_model_1.Page]),
    __metadata("design:returntype", Array)
], PageResolver.prototype, "seoKeywords", null);
exports.PageResolver = PageResolver = __decorate([
    (0, graphql_1.Resolver)(() => page_model_1.Page),
    __metadata("design:paramtypes", [page_service_1.PageService])
], PageResolver);
//# sourceMappingURL=page.resolver.js.map