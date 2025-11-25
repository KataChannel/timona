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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseSourceDocument = exports.SourceDocument = exports.SourceDocumentCategory = void 0;
const graphql_1 = require("@nestjs/graphql");
const client_1 = require("@prisma/client");
const graphql_type_json_1 = __importDefault(require("graphql-type-json"));
const user_model_1 = require("../../../graphql/models/user.model");
(0, graphql_1.registerEnumType)(client_1.SourceDocumentType, {
    name: 'SourceDocumentType',
    description: 'Type of source document',
});
(0, graphql_1.registerEnumType)(client_1.SourceDocumentStatus, {
    name: 'SourceDocumentStatus',
    description: 'Status of source document',
});
let SourceDocumentCategory = class SourceDocumentCategory {
};
exports.SourceDocumentCategory = SourceDocumentCategory;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], SourceDocumentCategory.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SourceDocumentCategory.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SourceDocumentCategory.prototype, "slug", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SourceDocumentCategory.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SourceDocumentCategory.prototype, "icon", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SourceDocumentCategory.prototype, "color", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    __metadata("design:type", String)
], SourceDocumentCategory.prototype, "parentId", void 0);
__decorate([
    (0, graphql_1.Field)(() => SourceDocumentCategory, { nullable: true }),
    __metadata("design:type", SourceDocumentCategory)
], SourceDocumentCategory.prototype, "parent", void 0);
__decorate([
    (0, graphql_1.Field)(() => [SourceDocumentCategory], { nullable: true }),
    __metadata("design:type", Array)
], SourceDocumentCategory.prototype, "children", void 0);
__decorate([
    (0, graphql_1.Field)(() => [SourceDocument], { nullable: true }),
    __metadata("design:type", Array)
], SourceDocumentCategory.prototype, "sourceDocuments", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], SourceDocumentCategory.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], SourceDocumentCategory.prototype, "updatedAt", void 0);
exports.SourceDocumentCategory = SourceDocumentCategory = __decorate([
    (0, graphql_1.ObjectType)()
], SourceDocumentCategory);
let SourceDocument = class SourceDocument {
};
exports.SourceDocument = SourceDocument;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], SourceDocument.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SourceDocument.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SourceDocument.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.SourceDocumentType),
    __metadata("design:type", String)
], SourceDocument.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.SourceDocumentStatus),
    __metadata("design:type", String)
], SourceDocument.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SourceDocument.prototype, "url", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SourceDocument.prototype, "content", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SourceDocument.prototype, "fileName", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true, description: 'File size in bytes (supports large files)' }),
    __metadata("design:type", Number)
], SourceDocument.prototype, "fileSize", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SourceDocument.prototype, "mimeType", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], SourceDocument.prototype, "duration", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SourceDocument.prototype, "thumbnailUrl", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    __metadata("design:type", String)
], SourceDocument.prototype, "categoryId", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    __metadata("design:type", Array)
], SourceDocument.prototype, "tags", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SourceDocument.prototype, "aiSummary", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    __metadata("design:type", Array)
], SourceDocument.prototype, "aiKeywords", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    __metadata("design:type", Array)
], SourceDocument.prototype, "aiTopics", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], SourceDocument.prototype, "aiAnalyzedAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], SourceDocument.prototype, "isAiAnalyzed", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default, { nullable: true }),
    __metadata("design:type", Object)
], SourceDocument.prototype, "metadata", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], SourceDocument.prototype, "userId", void 0);
__decorate([
    (0, graphql_1.Field)(() => SourceDocumentCategory, { nullable: true }),
    __metadata("design:type", SourceDocumentCategory)
], SourceDocument.prototype, "category", void 0);
__decorate([
    (0, graphql_1.Field)(() => user_model_1.User, { nullable: true }),
    __metadata("design:type", user_model_1.User)
], SourceDocument.prototype, "user", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], SourceDocument.prototype, "viewCount", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], SourceDocument.prototype, "downloadCount", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], SourceDocument.prototype, "usageCount", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], SourceDocument.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], SourceDocument.prototype, "updatedAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], SourceDocument.prototype, "publishedAt", void 0);
exports.SourceDocument = SourceDocument = __decorate([
    (0, graphql_1.ObjectType)()
], SourceDocument);
let CourseSourceDocument = class CourseSourceDocument {
};
exports.CourseSourceDocument = CourseSourceDocument;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], CourseSourceDocument.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], CourseSourceDocument.prototype, "courseId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], CourseSourceDocument.prototype, "documentId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], CourseSourceDocument.prototype, "order", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], CourseSourceDocument.prototype, "isRequired", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CourseSourceDocument.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    __metadata("design:type", String)
], CourseSourceDocument.prototype, "addedBy", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], CourseSourceDocument.prototype, "addedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => SourceDocument),
    __metadata("design:type", SourceDocument)
], CourseSourceDocument.prototype, "document", void 0);
exports.CourseSourceDocument = CourseSourceDocument = __decorate([
    (0, graphql_1.ObjectType)()
], CourseSourceDocument);
//# sourceMappingURL=source-document.entity.js.map