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
exports.CourseModule = void 0;
const graphql_1 = require("@nestjs/graphql");
const lesson_entity_1 = require("./lesson.entity");
let CourseModule = class CourseModule {
};
exports.CourseModule = CourseModule;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], CourseModule.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CourseModule.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CourseModule.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CourseModule.prototype, "order", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], CourseModule.prototype, "courseId", void 0);
__decorate([
    (0, graphql_1.Field)(() => [lesson_entity_1.Lesson], { nullable: true }),
    __metadata("design:type", Array)
], CourseModule.prototype, "lessons", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], CourseModule.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], CourseModule.prototype, "updatedAt", void 0);
exports.CourseModule = CourseModule = __decorate([
    (0, graphql_1.ObjectType)()
], CourseModule);
//# sourceMappingURL=course-module.entity.js.map