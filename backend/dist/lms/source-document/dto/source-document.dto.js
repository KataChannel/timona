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
exports.UpdateCourseDocumentLinkInput = exports.LinkDocumentToCourseInput = exports.SourceDocumentFilterInput = exports.UpdateSourceDocumentInput = exports.CreateSourceDocumentInput = exports.UpdateSourceDocumentCategoryInput = exports.CreateSourceDocumentCategoryInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const client_1 = require("@prisma/client");
const graphql_type_json_1 = __importDefault(require("graphql-type-json"));
const class_validator_1 = require("class-validator");
let CreateSourceDocumentCategoryInput = class CreateSourceDocumentCategoryInput {
};
exports.CreateSourceDocumentCategoryInput = CreateSourceDocumentCategoryInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSourceDocumentCategoryInput.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSourceDocumentCategoryInput.prototype, "slug", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSourceDocumentCategoryInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSourceDocumentCategoryInput.prototype, "icon", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSourceDocumentCategoryInput.prototype, "color", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSourceDocumentCategoryInput.prototype, "parentId", void 0);
exports.CreateSourceDocumentCategoryInput = CreateSourceDocumentCategoryInput = __decorate([
    (0, graphql_1.InputType)()
], CreateSourceDocumentCategoryInput);
let UpdateSourceDocumentCategoryInput = class UpdateSourceDocumentCategoryInput {
};
exports.UpdateSourceDocumentCategoryInput = UpdateSourceDocumentCategoryInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UpdateSourceDocumentCategoryInput.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UpdateSourceDocumentCategoryInput.prototype, "slug", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSourceDocumentCategoryInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSourceDocumentCategoryInput.prototype, "icon", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSourceDocumentCategoryInput.prototype, "color", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSourceDocumentCategoryInput.prototype, "parentId", void 0);
exports.UpdateSourceDocumentCategoryInput = UpdateSourceDocumentCategoryInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateSourceDocumentCategoryInput);
let CreateSourceDocumentInput = class CreateSourceDocumentInput {
};
exports.CreateSourceDocumentInput = CreateSourceDocumentInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSourceDocumentInput.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSourceDocumentInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.SourceDocumentType),
    (0, class_validator_1.IsEnum)(client_1.SourceDocumentType),
    __metadata("design:type", String)
], CreateSourceDocumentInput.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.SourceDocumentStatus, { defaultValue: client_1.SourceDocumentStatus.DRAFT }),
    (0, class_validator_1.IsEnum)(client_1.SourceDocumentStatus),
    __metadata("design:type", String)
], CreateSourceDocumentInput.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSourceDocumentInput.prototype, "url", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSourceDocumentInput.prototype, "content", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSourceDocumentInput.prototype, "fileName", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateSourceDocumentInput.prototype, "fileSize", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSourceDocumentInput.prototype, "mimeType", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateSourceDocumentInput.prototype, "duration", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSourceDocumentInput.prototype, "thumbnailUrl", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSourceDocumentInput.prototype, "categoryId", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { defaultValue: [] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateSourceDocumentInput.prototype, "tags", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateSourceDocumentInput.prototype, "metadata", void 0);
exports.CreateSourceDocumentInput = CreateSourceDocumentInput = __decorate([
    (0, graphql_1.InputType)()
], CreateSourceDocumentInput);
let UpdateSourceDocumentInput = class UpdateSourceDocumentInput {
};
exports.UpdateSourceDocumentInput = UpdateSourceDocumentInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UpdateSourceDocumentInput.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSourceDocumentInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.SourceDocumentType, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.SourceDocumentType),
    __metadata("design:type", String)
], UpdateSourceDocumentInput.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.SourceDocumentStatus, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.SourceDocumentStatus),
    __metadata("design:type", String)
], UpdateSourceDocumentInput.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSourceDocumentInput.prototype, "url", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSourceDocumentInput.prototype, "content", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSourceDocumentInput.prototype, "fileName", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateSourceDocumentInput.prototype, "fileSize", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSourceDocumentInput.prototype, "mimeType", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateSourceDocumentInput.prototype, "duration", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSourceDocumentInput.prototype, "thumbnailUrl", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSourceDocumentInput.prototype, "categoryId", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdateSourceDocumentInput.prototype, "tags", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateSourceDocumentInput.prototype, "metadata", void 0);
exports.UpdateSourceDocumentInput = UpdateSourceDocumentInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateSourceDocumentInput);
let SourceDocumentFilterInput = class SourceDocumentFilterInput {
};
exports.SourceDocumentFilterInput = SourceDocumentFilterInput;
__decorate([
    (0, graphql_1.Field)(() => [client_1.SourceDocumentType], { nullable: true }),
    __metadata("design:type", Array)
], SourceDocumentFilterInput.prototype, "types", void 0);
__decorate([
    (0, graphql_1.Field)(() => [client_1.SourceDocumentStatus], { nullable: true }),
    __metadata("design:type", Array)
], SourceDocumentFilterInput.prototype, "statuses", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    __metadata("design:type", String)
], SourceDocumentFilterInput.prototype, "categoryId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    __metadata("design:type", String)
], SourceDocumentFilterInput.prototype, "userId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SourceDocumentFilterInput.prototype, "search", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], SourceDocumentFilterInput.prototype, "tags", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], SourceDocumentFilterInput.prototype, "isAiAnalyzed", void 0);
exports.SourceDocumentFilterInput = SourceDocumentFilterInput = __decorate([
    (0, graphql_1.InputType)()
], SourceDocumentFilterInput);
let LinkDocumentToCourseInput = class LinkDocumentToCourseInput {
};
exports.LinkDocumentToCourseInput = LinkDocumentToCourseInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], LinkDocumentToCourseInput.prototype, "courseId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], LinkDocumentToCourseInput.prototype, "documentId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], LinkDocumentToCourseInput.prototype, "order", void 0);
__decorate([
    (0, graphql_1.Field)({ defaultValue: false }),
    __metadata("design:type", Boolean)
], LinkDocumentToCourseInput.prototype, "isRequired", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], LinkDocumentToCourseInput.prototype, "description", void 0);
exports.LinkDocumentToCourseInput = LinkDocumentToCourseInput = __decorate([
    (0, graphql_1.InputType)()
], LinkDocumentToCourseInput);
let UpdateCourseDocumentLinkInput = class UpdateCourseDocumentLinkInput {
};
exports.UpdateCourseDocumentLinkInput = UpdateCourseDocumentLinkInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], UpdateCourseDocumentLinkInput.prototype, "order", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], UpdateCourseDocumentLinkInput.prototype, "isRequired", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateCourseDocumentLinkInput.prototype, "description", void 0);
exports.UpdateCourseDocumentLinkInput = UpdateCourseDocumentLinkInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateCourseDocumentLinkInput);
//# sourceMappingURL=source-document.dto.js.map