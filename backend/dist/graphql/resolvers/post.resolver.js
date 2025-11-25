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
exports.PostResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const post_model_1 = require("../models/post.model");
const user_model_1 = require("../models/user.model");
const comment_model_1 = require("../models/comment.model");
const paginated_posts_model_1 = require("../models/paginated-posts.model");
const post_input_1 = require("../inputs/post.input");
const pagination_model_1 = require("../models/pagination.model");
const post_service_1 = require("../../services/post.service");
const user_service_1 = require("../../services/user.service");
const comment_service_1 = require("../../services/comment.service");
const pubsub_service_1 = require("../../services/pubsub.service");
const client_1 = require("@prisma/client");
let PostResolver = class PostResolver {
    constructor(postService, userService, commentService, pubSubService) {
        this.postService = postService;
        this.userService = userService;
        this.commentService = commentService;
        this.pubSubService = pubSubService;
    }
    async getPosts(pagination, filters) {
        return this.postService.findMany(pagination, filters);
    }
    async getPostById(id) {
        return this.postService.findById(id);
    }
    async getPostBySlug(slug) {
        return this.postService.findBySlug(slug);
    }
    async getMyPosts(context) {
        const userId = context.req.user.id;
        return this.postService.findByAuthor(userId);
    }
    async createPost(input, context) {
        const authorId = context.req.user.id;
        const post = await this.postService.create({ ...input, authorId });
        this.pubSubService.publishPostCreated(post);
        return post;
    }
    async updatePost(id, input, context) {
        const currentUser = context.req.user;
        const post = await this.postService.findById(id);
        if (post.authorId !== currentUser.id && currentUser.roleType !== client_1.$Enums.UserRoleType.ADMIN) {
            throw new Error('Unauthorized');
        }
        const updatedPost = await this.postService.update(id, input);
        this.pubSubService.publishPostUpdated(updatedPost);
        return updatedPost;
    }
    async deletePost(id, context) {
        const currentUser = context.req.user;
        const post = await this.postService.findById(id);
        if (post.authorId !== currentUser.id && currentUser.roleType !== client_1.$Enums.UserRoleType.ADMIN) {
            throw new Error('Unauthorized');
        }
        await this.postService.delete(id);
        this.pubSubService.publishPostDeleted(id);
        return true;
    }
    async publishPost(id, context) {
        const currentUser = context.req.user;
        const post = await this.postService.findById(id);
        if (post.authorId !== currentUser.id && currentUser.roleType !== client_1.$Enums.UserRoleType.ADMIN) {
            throw new Error('Unauthorized');
        }
        return this.postService.publish(id);
    }
    async author(post) {
        return this.userService.findById(post.authorId);
    }
    async comments(post) {
        return this.commentService.findByPost(post.id);
    }
    async likesCount(post) {
        return this.postService.getLikesCount(post.id);
    }
    async commentsCount(post) {
        return this.commentService.getCommentsCount(post.id);
    }
    postCreated() {
        return this.pubSubService.getPostCreatedIterator();
    }
    postUpdated() {
        return this.pubSubService.getPostUpdatedIterator();
    }
};
exports.PostResolver = PostResolver;
__decorate([
    (0, graphql_1.Query)(() => paginated_posts_model_1.PaginatedPosts, { name: 'getPosts' }),
    __param(0, (0, graphql_1.Args)('pagination', { defaultValue: { page: 1, limit: 10 } })),
    __param(1, (0, graphql_1.Args)('filters', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_model_1.PaginationInput,
        post_input_1.PostFiltersInput]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "getPosts", null);
__decorate([
    (0, graphql_1.Query)(() => post_model_1.Post, { name: 'getPostById' }),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "getPostById", null);
__decorate([
    (0, graphql_1.Query)(() => post_model_1.Post, { name: 'getPostBySlug' }),
    __param(0, (0, graphql_1.Args)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "getPostBySlug", null);
__decorate([
    (0, graphql_1.Query)(() => [post_model_1.Post], { name: 'getMyPosts' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "getMyPosts", null);
__decorate([
    (0, graphql_1.Mutation)(() => post_model_1.Post, { name: 'createPost' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [post_input_1.CreatePostInput, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "createPost", null);
__decorate([
    (0, graphql_1.Mutation)(() => post_model_1.Post, { name: 'updatePost' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('input')),
    __param(2, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, post_input_1.UpdatePostInput, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "updatePost", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean, { name: 'deletePost' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "deletePost", null);
__decorate([
    (0, graphql_1.Mutation)(() => post_model_1.Post, { name: 'publishPost' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "publishPost", null);
__decorate([
    (0, graphql_1.ResolveField)(() => user_model_1.User),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [post_model_1.Post]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "author", null);
__decorate([
    (0, graphql_1.ResolveField)(() => [comment_model_1.Comment]),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [post_model_1.Post]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "comments", null);
__decorate([
    (0, graphql_1.ResolveField)(() => Number),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [post_model_1.Post]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "likesCount", null);
__decorate([
    (0, graphql_1.ResolveField)(() => Number),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [post_model_1.Post]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "commentsCount", null);
__decorate([
    (0, graphql_1.Subscription)(() => post_model_1.Post, { name: 'postCreated', nullable: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PostResolver.prototype, "postCreated", null);
__decorate([
    (0, graphql_1.Subscription)(() => post_model_1.Post, { name: 'postUpdated', nullable: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PostResolver.prototype, "postUpdated", null);
exports.PostResolver = PostResolver = __decorate([
    (0, graphql_1.Resolver)(() => post_model_1.Post),
    __metadata("design:paramtypes", [post_service_1.PostService,
        user_service_1.UserService,
        comment_service_1.CommentService,
        pubsub_service_1.PubSubService])
], PostResolver);
//# sourceMappingURL=post.resolver.js.map