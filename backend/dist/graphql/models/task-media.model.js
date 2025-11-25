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
exports.TaskMedia = void 0;
const graphql_1 = require("@nestjs/graphql");
const user_model_1 = require("./user.model");
const client_1 = require("@prisma/client");
(0, graphql_1.registerEnumType)(client_1.MediaType, {
    name: 'MediaType',
    description: 'The type of media file',
});
let TaskMedia = class TaskMedia {
};
exports.TaskMedia = TaskMedia;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], TaskMedia.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], TaskMedia.prototype, "filename", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], TaskMedia.prototype, "url", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.MediaType),
    __metadata("design:type", String)
], TaskMedia.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Number)
], TaskMedia.prototype, "size", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], TaskMedia.prototype, "mimeType", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], TaskMedia.prototype, "caption", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], TaskMedia.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], TaskMedia.prototype, "updatedAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], TaskMedia.prototype, "taskId", void 0);
__decorate([
    (0, graphql_1.Field)(() => user_model_1.User),
    __metadata("design:type", user_model_1.User)
], TaskMedia.prototype, "uploader", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], TaskMedia.prototype, "uploadedBy", void 0);
exports.TaskMedia = TaskMedia = __decorate([
    (0, graphql_1.ObjectType)()
], TaskMedia);
//# sourceMappingURL=task-media.model.js.map