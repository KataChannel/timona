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
exports.Discussion = exports.DiscussionReply = void 0;
const graphql_1 = require("@nestjs/graphql");
const user_model_1 = require("../../../graphql/models/user.model");
const course_entity_1 = require("../../courses/entities/course.entity");
const lesson_entity_1 = require("../../courses/entities/lesson.entity");
let DiscussionReply = class DiscussionReply {
};
exports.DiscussionReply = DiscussionReply;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], DiscussionReply.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], DiscussionReply.prototype, "content", void 0);
__decorate([
    (0, graphql_1.Field)(() => user_model_1.User),
    __metadata("design:type", user_model_1.User)
], DiscussionReply.prototype, "user", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], DiscussionReply.prototype, "parentId", void 0);
__decorate([
    (0, graphql_1.Field)(() => [DiscussionReply], { nullable: true }),
    __metadata("design:type", Array)
], DiscussionReply.prototype, "children", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], DiscussionReply.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], DiscussionReply.prototype, "updatedAt", void 0);
exports.DiscussionReply = DiscussionReply = __decorate([
    (0, graphql_1.ObjectType)()
], DiscussionReply);
let Discussion = class Discussion {
};
exports.Discussion = Discussion;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], Discussion.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Discussion.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Discussion.prototype, "content", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], Discussion.prototype, "isPinned", void 0);
__decorate([
    (0, graphql_1.Field)(() => user_model_1.User),
    __metadata("design:type", user_model_1.User)
], Discussion.prototype, "user", void 0);
__decorate([
    (0, graphql_1.Field)(() => course_entity_1.Course, { nullable: true }),
    __metadata("design:type", course_entity_1.Course)
], Discussion.prototype, "course", void 0);
__decorate([
    (0, graphql_1.Field)(() => lesson_entity_1.Lesson, { nullable: true }),
    __metadata("design:type", lesson_entity_1.Lesson)
], Discussion.prototype, "lesson", void 0);
__decorate([
    (0, graphql_1.Field)(() => [DiscussionReply]),
    __metadata("design:type", Array)
], Discussion.prototype, "replies", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], Discussion.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], Discussion.prototype, "updatedAt", void 0);
exports.Discussion = Discussion = __decorate([
    (0, graphql_1.ObjectType)()
], Discussion);
//# sourceMappingURL=discussion.entity.js.map