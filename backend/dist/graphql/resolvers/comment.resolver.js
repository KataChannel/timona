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
exports.CommentResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const comment_model_1 = require("../models/comment.model");
const user_model_1 = require("../models/user.model");
const post_model_1 = require("../models/post.model");
const client_1 = require("@prisma/client");
const comment_input_1 = require("../inputs/comment.input");
const comment_service_1 = require("../../services/comment.service");
const user_service_1 = require("../../services/user.service");
const post_service_1 = require("../../services/post.service");
const pubsub_service_1 = require("../../services/pubsub.service");
let CommentResolver = class CommentResolver {
    constructor(commentService, userService, postService, pubSubService) {
        this.commentService = commentService;
        this.userService = userService;
        this.postService = postService;
        this.pubSubService = pubSubService;
    }
    async getCommentsByPost(postId) {
        return this.commentService.findByPost(postId);
    }
    async getCommentById(id) {
        return this.commentService.findById(id);
    }
    async createComment(input, context) {
        const userId = context.req.user.id;
        const comment = await this.commentService.create({ ...input, userId });
        this.pubSubService.publishNewComment(comment, input.postId);
        return comment;
    }
    async updateComment(id, input, context) {
        const currentUser = context.req.user;
        const comment = await this.commentService.findById(id);
        if (comment.userId !== currentUser.id && currentUser.roleType !== client_1.$Enums.UserRoleType.ADMIN) {
            throw new Error('Unauthorized');
        }
        return this.commentService.update(id, input);
    }
    async deleteComment(id, context) {
        const currentUser = context.req.user;
        const comment = await this.commentService.findById(id);
        if (comment.userId !== currentUser.id && currentUser.roleType !== client_1.$Enums.UserRoleType.ADMIN) {
            throw new Error('Unauthorized');
        }
        await this.commentService.delete(id);
        return true;
    }
    async user(comment) {
        return this.userService.findById(comment.userId);
    }
    async post(comment) {
        return this.postService.findById(comment.postId);
    }
    async parent(comment) {
        if (!comment.parentId)
            return null;
        return this.commentService.findById(comment.parentId);
    }
    async replies(comment) {
        return this.commentService.findReplies(comment.id);
    }
    newComment(postId) {
        return this.pubSubService.getNewCommentIterator();
    }
};
exports.CommentResolver = CommentResolver;
__decorate([
    (0, graphql_1.Query)(() => [comment_model_1.Comment], { name: 'getCommentsByPost' }),
    __param(0, (0, graphql_1.Args)('postId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CommentResolver.prototype, "getCommentsByPost", null);
__decorate([
    (0, graphql_1.Query)(() => comment_model_1.Comment, { name: 'getCommentById' }),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CommentResolver.prototype, "getCommentById", null);
__decorate([
    (0, graphql_1.Mutation)(() => comment_model_1.Comment, { name: 'createComment' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [comment_input_1.CreateCommentInput, Object]),
    __metadata("design:returntype", Promise)
], CommentResolver.prototype, "createComment", null);
__decorate([
    (0, graphql_1.Mutation)(() => comment_model_1.Comment, { name: 'updateComment' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('input')),
    __param(2, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, comment_input_1.UpdateCommentInput, Object]),
    __metadata("design:returntype", Promise)
], CommentResolver.prototype, "updateComment", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean, { name: 'deleteComment' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CommentResolver.prototype, "deleteComment", null);
__decorate([
    (0, graphql_1.ResolveField)(() => user_model_1.User),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [comment_model_1.Comment]),
    __metadata("design:returntype", Promise)
], CommentResolver.prototype, "user", null);
__decorate([
    (0, graphql_1.ResolveField)(() => post_model_1.Post),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [comment_model_1.Comment]),
    __metadata("design:returntype", Promise)
], CommentResolver.prototype, "post", null);
__decorate([
    (0, graphql_1.ResolveField)(() => comment_model_1.Comment, { nullable: true }),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [comment_model_1.Comment]),
    __metadata("design:returntype", Promise)
], CommentResolver.prototype, "parent", null);
__decorate([
    (0, graphql_1.ResolveField)(() => [comment_model_1.Comment]),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [comment_model_1.Comment]),
    __metadata("design:returntype", Promise)
], CommentResolver.prototype, "replies", null);
__decorate([
    (0, graphql_1.Subscription)(() => comment_model_1.Comment, {
        name: 'newComment',
        nullable: true,
        filter: (payload, variables) => {
            return !variables.postId || payload.postId === variables.postId;
        }
    }),
    __param(0, (0, graphql_1.Args)('postId', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CommentResolver.prototype, "newComment", null);
exports.CommentResolver = CommentResolver = __decorate([
    (0, graphql_1.Resolver)(() => comment_model_1.Comment),
    __metadata("design:paramtypes", [comment_service_1.CommentService,
        user_service_1.UserService,
        post_service_1.PostService,
        pubsub_service_1.PubSubService])
], CommentResolver);
//# sourceMappingURL=comment.resolver.js.map