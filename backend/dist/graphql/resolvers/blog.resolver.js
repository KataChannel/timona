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
exports.BlogResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const blog_service_1 = require("../../services/blog.service");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const blog_type_1 = require("../types/blog.type");
const blog_input_1 = require("../inputs/blog.input");
let BlogResolver = class BlogResolver {
    constructor(blogService) {
        this.blogService = blogService;
    }
    isPublished(blog) {
        return blog.status === 'PUBLISHED';
    }
    thumbnailUrl(blog) {
        return blog.featuredImage || blog.thumbnailUrl || null;
    }
    bannerUrl(blog) {
        return blog.bannerUrl || blog.featuredImage || null;
    }
    metaKeywords(blog) {
        if (!blog.metaKeywords) {
            return null;
        }
        if (Array.isArray(blog.metaKeywords)) {
            return blog.metaKeywords;
        }
        if (typeof blog.metaKeywords === 'string') {
            try {
                const parsed = JSON.parse(blog.metaKeywords);
                return Array.isArray(parsed) ? parsed : [blog.metaKeywords];
            }
            catch {
                return [blog.metaKeywords];
            }
        }
        if (typeof blog.metaKeywords === 'object') {
            if ('length' in blog.metaKeywords) {
                return Object.values(blog.metaKeywords).filter(v => typeof v === 'string');
            }
            return Object.values(blog.metaKeywords).filter(v => typeof v === 'string');
        }
        return null;
    }
    async getBlogs(page, limit, search, categoryId, sort, statusFilter) {
        return this.blogService.getBlogs({
            page,
            limit,
            search,
            categoryId,
            sort,
            statusFilter,
        });
    }
    async getBlog(id) {
        return this.blogService.getBlogById(id);
    }
    async getBlogBySlug(slug) {
        return this.blogService.getBlogBySlug(slug);
    }
    async getFeaturedBlogs(limit) {
        return this.blogService.getFeaturedBlogs(limit);
    }
    async getBlogsByCategory(categoryId, page, limit) {
        return this.blogService.getBlogsByCategory(categoryId, { page, limit });
    }
    async getRelatedBlogs(blogId, limit) {
        return this.blogService.getRelatedBlogs(blogId, limit);
    }
    async getCategories() {
        return this.blogService.getCategories();
    }
    async getCategory(id) {
        return this.blogService.getCategoryById(id);
    }
    async getTags() {
        return this.blogService.getTags();
    }
    async createBlog(input, context) {
        const userId = context.req?.user?.id || input.author;
        return this.blogService.createBlog(input, userId);
    }
    async updateBlog(input) {
        console.log('=== UpdateBlog Resolver Debug ===');
        console.log('Full input object:', JSON.stringify(input, null, 2));
        console.log('Input keys:', Object.keys(input));
        console.log('id value:', input.id);
        console.log('id type:', typeof input.id);
        console.log('================================');
        const { id, ...updateData } = input;
        if (!id || id.trim() === '') {
            console.error('ID validation failed:', {
                id,
                isEmpty: !id,
                isTrimEmpty: id?.trim() === '',
                inputReceived: input
            });
            throw new Error('Blog post ID is required and cannot be empty');
        }
        return this.blogService.updateBlog(id, updateData);
    }
    async deleteBlog(id) {
        return this.blogService.deleteBlog(id);
    }
    async createCategory(input) {
        return this.blogService.createCategory(input);
    }
    async updateCategory(id, input) {
        return this.blogService.updateCategory(id, input);
    }
    async deleteCategory(id) {
        return this.blogService.deleteCategory(id);
    }
    async createTag(input) {
        return this.blogService.createTag(input);
    }
    async updateTag(input) {
        const { id, ...updateData } = input;
        return this.blogService.updateTag(id, updateData);
    }
    async deleteTag(id) {
        return this.blogService.deleteTag(id);
    }
};
exports.BlogResolver = BlogResolver;
__decorate([
    (0, graphql_1.ResolveField)(() => Boolean),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Boolean)
], BlogResolver.prototype, "isPublished", null);
__decorate([
    (0, graphql_1.ResolveField)(() => String, { nullable: true }),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", String)
], BlogResolver.prototype, "thumbnailUrl", null);
__decorate([
    (0, graphql_1.ResolveField)(() => String, { nullable: true }),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", String)
], BlogResolver.prototype, "bannerUrl", null);
__decorate([
    (0, graphql_1.ResolveField)(() => [String], { nullable: true }),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Array)
], BlogResolver.prototype, "metaKeywords", null);
__decorate([
    (0, graphql_1.Query)(() => blog_type_1.PaginatedBlogs, { name: 'blogs' }),
    __param(0, (0, graphql_1.Args)('page', { type: () => graphql_1.Int, nullable: true })),
    __param(1, (0, graphql_1.Args)('limit', { type: () => graphql_1.Int, nullable: true })),
    __param(2, (0, graphql_1.Args)('search', { nullable: true })),
    __param(3, (0, graphql_1.Args)('categoryId', { type: () => graphql_1.ID, nullable: true })),
    __param(4, (0, graphql_1.Args)('sort', { nullable: true })),
    __param(5, (0, graphql_1.Args)('statusFilter', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, String, String]),
    __metadata("design:returntype", Promise)
], BlogResolver.prototype, "getBlogs", null);
__decorate([
    (0, graphql_1.Query)(() => blog_type_1.BlogType, { name: 'blog' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BlogResolver.prototype, "getBlog", null);
__decorate([
    (0, graphql_1.Query)(() => blog_type_1.BlogType, { name: 'blogBySlug' }),
    __param(0, (0, graphql_1.Args)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BlogResolver.prototype, "getBlogBySlug", null);
__decorate([
    (0, graphql_1.Query)(() => [blog_type_1.BlogType], { name: 'featuredBlogs' }),
    __param(0, (0, graphql_1.Args)('limit', { type: () => graphql_1.Int, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], BlogResolver.prototype, "getFeaturedBlogs", null);
__decorate([
    (0, graphql_1.Query)(() => blog_type_1.PaginatedBlogs, { name: 'blogsByCategory' }),
    __param(0, (0, graphql_1.Args)('categoryId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('page', { type: () => graphql_1.Int, nullable: true })),
    __param(2, (0, graphql_1.Args)('limit', { type: () => graphql_1.Int, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], BlogResolver.prototype, "getBlogsByCategory", null);
__decorate([
    (0, graphql_1.Query)(() => [blog_type_1.BlogType], { name: 'relatedBlogs' }),
    __param(0, (0, graphql_1.Args)('blogId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('limit', { type: () => graphql_1.Int, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], BlogResolver.prototype, "getRelatedBlogs", null);
__decorate([
    (0, graphql_1.Query)(() => [blog_type_1.BlogCategoryType], { name: 'blogCategories' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BlogResolver.prototype, "getCategories", null);
__decorate([
    (0, graphql_1.Query)(() => blog_type_1.BlogCategoryType, { name: 'blogCategory' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BlogResolver.prototype, "getCategory", null);
__decorate([
    (0, graphql_1.Query)(() => [blog_type_1.BlogTagType], { name: 'blogTags' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BlogResolver.prototype, "getTags", null);
__decorate([
    (0, graphql_1.Mutation)(() => blog_type_1.BlogType, { name: 'createBlog' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [blog_input_1.CreateBlogInput, Object]),
    __metadata("design:returntype", Promise)
], BlogResolver.prototype, "createBlog", null);
__decorate([
    (0, graphql_1.Mutation)(() => blog_type_1.BlogType, { name: 'updateBlog' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false,
        skipMissingProperties: false
    })),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [blog_input_1.UpdateBlogInput]),
    __metadata("design:returntype", Promise)
], BlogResolver.prototype, "updateBlog", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean, { name: 'deleteBlog' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BlogResolver.prototype, "deleteBlog", null);
__decorate([
    (0, graphql_1.Mutation)(() => blog_type_1.BlogCategoryType, { name: 'createBlogCategory' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [blog_input_1.CreateBlogCategoryInput]),
    __metadata("design:returntype", Promise)
], BlogResolver.prototype, "createCategory", null);
__decorate([
    (0, graphql_1.Mutation)(() => blog_type_1.BlogCategoryType, { name: 'updateBlogCategory' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, blog_input_1.UpdateBlogCategoryInput]),
    __metadata("design:returntype", Promise)
], BlogResolver.prototype, "updateCategory", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean, { name: 'deleteBlogCategory' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BlogResolver.prototype, "deleteCategory", null);
__decorate([
    (0, graphql_1.Mutation)(() => blog_type_1.BlogTagType, { name: 'createBlogTag' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [blog_input_1.CreateBlogTagInput]),
    __metadata("design:returntype", Promise)
], BlogResolver.prototype, "createTag", null);
__decorate([
    (0, graphql_1.Mutation)(() => blog_type_1.BlogTagType, { name: 'updateBlogTag' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [blog_input_1.UpdateBlogTagInput]),
    __metadata("design:returntype", Promise)
], BlogResolver.prototype, "updateTag", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean, { name: 'deleteBlogTag' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BlogResolver.prototype, "deleteTag", null);
exports.BlogResolver = BlogResolver = __decorate([
    (0, graphql_1.Resolver)(() => blog_type_1.BlogType),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false
    })),
    __metadata("design:paramtypes", [blog_service_1.BlogService])
], BlogResolver);
//# sourceMappingURL=blog.resolver.js.map