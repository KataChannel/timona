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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PubSubService = void 0;
const common_1 = require("@nestjs/common");
const graphql_subscriptions_1 = require("graphql-subscriptions");
let PubSubService = class PubSubService {
    constructor() {
        this.pubSub = new graphql_subscriptions_1.PubSub();
    }
    async publish(event, payload) {
        return this.pubSub.publish(event, payload);
    }
    asyncIterator(event) {
        return this.pubSub.asyncIterator(event);
    }
    publishPostCreated(post) {
        this.publish('postCreated', { postCreated: post });
    }
    publishPostUpdated(post) {
        this.publish('postUpdated', { postUpdated: post });
    }
    publishPostDeleted(postId) {
        this.publish('postDeleted', { postDeleted: { id: postId } });
    }
    publishNewComment(comment, postId) {
        this.publish('newComment', {
            newComment: comment,
            postId: postId
        });
    }
    publishUserRegistered(user) {
        this.publish('userRegistered', { userRegistered: user });
    }
    publishTaskCreated(task) {
        this.publish('taskCreated', { taskCreated: task });
    }
    publishTaskUpdated(task) {
        this.publish('taskUpdated', { taskUpdated: task });
    }
    publishTaskCommentCreated(comment) {
        this.publish('taskCommentCreated', { taskCommentCreated: comment });
    }
    getPostCreatedIterator() {
        return this.asyncIterator('postCreated');
    }
    getPostUpdatedIterator() {
        return this.asyncIterator('postUpdated');
    }
    getTaskCreatedIterator() {
        return this.asyncIterator('taskCreated');
    }
    getTaskUpdatedIterator() {
        return this.asyncIterator('taskUpdated');
    }
    getTaskCommentCreatedIterator() {
        return this.asyncIterator('taskCommentCreated');
    }
    getPostDeletedIterator() {
        return this.asyncIterator('postDeleted');
    }
    getNewCommentIterator() {
        return this.asyncIterator('newComment');
    }
    getUserRegisteredIterator() {
        return this.asyncIterator('userRegistered');
    }
};
exports.PubSubService = PubSubService;
exports.PubSubService = PubSubService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PubSubService);
//# sourceMappingURL=pubsub.service.js.map