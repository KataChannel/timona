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
exports.DiscussionsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const discussions_service_1 = require("./discussions.service");
const discussion_entity_1 = require("./entities/discussion.entity");
const discussion_input_1 = require("./dto/discussion.input");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const current_user_decorator_1 = require("../../auth/current-user.decorator");
let DiscussionsResolver = class DiscussionsResolver {
    constructor(discussionsService) {
        this.discussionsService = discussionsService;
    }
    createDiscussion(user, input) {
        return this.discussionsService.createDiscussion(user.id, input);
    }
    getCourseDiscussions(courseId, lessonId) {
        return this.discussionsService.getCourseDiscussions(courseId, lessonId);
    }
    getDiscussion(id) {
        return this.discussionsService.getDiscussion(id);
    }
    createReply(user, input) {
        return this.discussionsService.createReply(user.id, input);
    }
    updateDiscussion(user, input) {
        return this.discussionsService.updateDiscussion(user.id, input);
    }
    deleteDiscussion(user, id) {
        return this.discussionsService.deleteDiscussion(user.id, id);
    }
    togglePin(user, id) {
        return this.discussionsService.togglePin(user.id, id);
    }
};
exports.DiscussionsResolver = DiscussionsResolver;
__decorate([
    (0, graphql_1.Mutation)(() => discussion_entity_1.Discussion, { name: 'createDiscussion' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, discussion_input_1.CreateDiscussionInput]),
    __metadata("design:returntype", void 0)
], DiscussionsResolver.prototype, "createDiscussion", null);
__decorate([
    (0, graphql_1.Query)(() => [discussion_entity_1.Discussion], { name: 'courseDiscussions' }),
    __param(0, (0, graphql_1.Args)('courseId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('lessonId', { type: () => graphql_1.ID, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DiscussionsResolver.prototype, "getCourseDiscussions", null);
__decorate([
    (0, graphql_1.Query)(() => discussion_entity_1.Discussion, { name: 'discussion' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DiscussionsResolver.prototype, "getDiscussion", null);
__decorate([
    (0, graphql_1.Mutation)(() => discussion_entity_1.DiscussionReply, { name: 'createReply' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, discussion_input_1.CreateReplyInput]),
    __metadata("design:returntype", void 0)
], DiscussionsResolver.prototype, "createReply", null);
__decorate([
    (0, graphql_1.Mutation)(() => discussion_entity_1.Discussion, { name: 'updateDiscussion' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, discussion_input_1.UpdateDiscussionInput]),
    __metadata("design:returntype", void 0)
], DiscussionsResolver.prototype, "updateDiscussion", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean, { name: 'deleteDiscussion' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], DiscussionsResolver.prototype, "deleteDiscussion", null);
__decorate([
    (0, graphql_1.Mutation)(() => discussion_entity_1.Discussion, { name: 'toggleDiscussionPin' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], DiscussionsResolver.prototype, "togglePin", null);
exports.DiscussionsResolver = DiscussionsResolver = __decorate([
    (0, graphql_1.Resolver)(() => discussion_entity_1.Discussion),
    __metadata("design:paramtypes", [discussions_service_1.DiscussionsService])
], DiscussionsResolver);
//# sourceMappingURL=discussions.resolver.js.map