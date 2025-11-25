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
exports.DeleteFileInput = exports.UploadFileInput = exports.ChatMediaType = exports.ProjectMediaType = exports.MediaUploaderType = void 0;
const graphql_1 = require("@nestjs/graphql");
const client_1 = require("@prisma/client");
(0, graphql_1.registerEnumType)(client_1.MediaType, {
    name: 'MediaType',
    description: 'Type of uploaded media',
});
let MediaUploaderType = class MediaUploaderType {
};
exports.MediaUploaderType = MediaUploaderType;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], MediaUploaderType.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MediaUploaderType.prototype, "firstName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MediaUploaderType.prototype, "lastName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MediaUploaderType.prototype, "email", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MediaUploaderType.prototype, "avatar", void 0);
exports.MediaUploaderType = MediaUploaderType = __decorate([
    (0, graphql_1.ObjectType)('MediaUploader')
], MediaUploaderType);
let ProjectMediaType = class ProjectMediaType {
};
exports.ProjectMediaType = ProjectMediaType;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], ProjectMediaType.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.MediaType),
    __metadata("design:type", String)
], ProjectMediaType.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ProjectMediaType.prototype, "url", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ProjectMediaType.prototype, "filename", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], ProjectMediaType.prototype, "size", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ProjectMediaType.prototype, "mimeType", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], ProjectMediaType.prototype, "caption", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ProjectMediaType.prototype, "projectId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ProjectMediaType.prototype, "uploadedBy", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], ProjectMediaType.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], ProjectMediaType.prototype, "updatedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => MediaUploaderType, { nullable: true }),
    __metadata("design:type", MediaUploaderType)
], ProjectMediaType.prototype, "uploader", void 0);
exports.ProjectMediaType = ProjectMediaType = __decorate([
    (0, graphql_1.ObjectType)('ProjectMedia')
], ProjectMediaType);
let ChatMediaType = class ChatMediaType {
};
exports.ChatMediaType = ChatMediaType;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], ChatMediaType.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.MediaType),
    __metadata("design:type", String)
], ChatMediaType.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ChatMediaType.prototype, "url", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ChatMediaType.prototype, "filename", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], ChatMediaType.prototype, "size", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ChatMediaType.prototype, "mimeType", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], ChatMediaType.prototype, "caption", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ChatMediaType.prototype, "messageId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ChatMediaType.prototype, "uploadedBy", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], ChatMediaType.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], ChatMediaType.prototype, "updatedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => MediaUploaderType, { nullable: true }),
    __metadata("design:type", MediaUploaderType)
], ChatMediaType.prototype, "uploader", void 0);
exports.ChatMediaType = ChatMediaType = __decorate([
    (0, graphql_1.ObjectType)('ChatMedia')
], ChatMediaType);
let UploadFileInput = class UploadFileInput {
};
exports.UploadFileInput = UploadFileInput;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], UploadFileInput.prototype, "projectId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UploadFileInput.prototype, "taskId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UploadFileInput.prototype, "messageId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UploadFileInput.prototype, "caption", void 0);
exports.UploadFileInput = UploadFileInput = __decorate([
    (0, graphql_1.InputType)()
], UploadFileInput);
let DeleteFileInput = class DeleteFileInput {
};
exports.DeleteFileInput = DeleteFileInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], DeleteFileInput.prototype, "fileId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], DeleteFileInput.prototype, "type", void 0);
exports.DeleteFileInput = DeleteFileInput = __decorate([
    (0, graphql_1.InputType)()
], DeleteFileInput);
//# sourceMappingURL=media.dto.js.map