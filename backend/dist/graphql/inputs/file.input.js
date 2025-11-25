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
exports.GetFilesInput = exports.BulkUpdateFilesInput = exports.BulkDeleteFilesInput = exports.MoveFilesInput = exports.CreateFileShareInput = exports.FileFiltersInput = exports.UpdateFileInput = exports.UpdateFolderInput = exports.CreateFolderInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const client_1 = require("@prisma/client");
const graphql_type_json_1 = __importDefault(require("graphql-type-json"));
const class_validator_1 = require("class-validator");
let CreateFolderInput = class CreateFolderInput {
};
exports.CreateFolderInput = CreateFolderInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFolderInput.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFolderInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFolderInput.prototype, "parentId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFolderInput.prototype, "color", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFolderInput.prototype, "icon", void 0);
exports.CreateFolderInput = CreateFolderInput = __decorate([
    (0, graphql_1.InputType)()
], CreateFolderInput);
let UpdateFolderInput = class UpdateFolderInput {
};
exports.UpdateFolderInput = UpdateFolderInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateFolderInput.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateFolderInput.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateFolderInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateFolderInput.prototype, "parentId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateFolderInput.prototype, "color", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateFolderInput.prototype, "icon", void 0);
exports.UpdateFolderInput = UpdateFolderInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateFolderInput);
let UpdateFileInput = class UpdateFileInput {
};
exports.UpdateFileInput = UpdateFileInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateFileInput.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateFileInput.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateFileInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateFileInput.prototype, "alt", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], UpdateFileInput.prototype, "tags", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateFileInput.prototype, "folderId", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.FileVisibility, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.FileVisibility),
    __metadata("design:type", String)
], UpdateFileInput.prototype, "visibility", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateFileInput.prototype, "metadata", void 0);
exports.UpdateFileInput = UpdateFileInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateFileInput);
let FileFiltersInput = class FileFiltersInput {
};
exports.FileFiltersInput = FileFiltersInput;
__decorate([
    (0, graphql_1.Field)(() => client_1.FileType, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.FileType),
    __metadata("design:type", String)
], FileFiltersInput.prototype, "fileType", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FileFiltersInput.prototype, "folderId", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.FileVisibility, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.FileVisibility),
    __metadata("design:type", String)
], FileFiltersInput.prototype, "visibility", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FileFiltersInput.prototype, "search", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], FileFiltersInput.prototype, "tags", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FileFiltersInput.prototype, "mimeType", void 0);
exports.FileFiltersInput = FileFiltersInput = __decorate([
    (0, graphql_1.InputType)()
], FileFiltersInput);
let CreateFileShareInput = class CreateFileShareInput {
};
exports.CreateFileShareInput = CreateFileShareInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFileShareInput.prototype, "fileId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFileShareInput.prototype, "sharedWith", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], CreateFileShareInput.prototype, "expiresAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFileShareInput.prototype, "password", void 0);
__decorate([
    (0, graphql_1.Field)({ defaultValue: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateFileShareInput.prototype, "canDownload", void 0);
__decorate([
    (0, graphql_1.Field)({ defaultValue: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateFileShareInput.prototype, "canView", void 0);
exports.CreateFileShareInput = CreateFileShareInput = __decorate([
    (0, graphql_1.InputType)()
], CreateFileShareInput);
let MoveFilesInput = class MoveFilesInput {
};
exports.MoveFilesInput = MoveFilesInput;
__decorate([
    (0, graphql_1.Field)(() => [graphql_1.ID]),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], MoveFilesInput.prototype, "fileIds", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MoveFilesInput.prototype, "targetFolderId", void 0);
exports.MoveFilesInput = MoveFilesInput = __decorate([
    (0, graphql_1.InputType)()
], MoveFilesInput);
let BulkDeleteFilesInput = class BulkDeleteFilesInput {
};
exports.BulkDeleteFilesInput = BulkDeleteFilesInput;
__decorate([
    (0, graphql_1.Field)(() => [graphql_1.ID]),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], BulkDeleteFilesInput.prototype, "fileIds", void 0);
exports.BulkDeleteFilesInput = BulkDeleteFilesInput = __decorate([
    (0, graphql_1.InputType)()
], BulkDeleteFilesInput);
let BulkUpdateFilesInput = class BulkUpdateFilesInput {
};
exports.BulkUpdateFilesInput = BulkUpdateFilesInput;
__decorate([
    (0, graphql_1.Field)(() => [graphql_1.ID]),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], BulkUpdateFilesInput.prototype, "fileIds", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.FileVisibility, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.FileVisibility),
    __metadata("design:type", String)
], BulkUpdateFilesInput.prototype, "visibility", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], BulkUpdateFilesInput.prototype, "tags", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BulkUpdateFilesInput.prototype, "folderId", void 0);
exports.BulkUpdateFilesInput = BulkUpdateFilesInput = __decorate([
    (0, graphql_1.InputType)()
], BulkUpdateFilesInput);
let GetFilesInput = class GetFilesInput {
};
exports.GetFilesInput = GetFilesInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { defaultValue: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], GetFilesInput.prototype, "page", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { defaultValue: 20 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], GetFilesInput.prototype, "limit", void 0);
__decorate([
    (0, graphql_1.Field)(() => FileFiltersInput, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", FileFiltersInput)
], GetFilesInput.prototype, "filters", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetFilesInput.prototype, "sortBy", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetFilesInput.prototype, "sortOrder", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true, defaultValue: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], GetFilesInput.prototype, "allUsers", void 0);
exports.GetFilesInput = GetFilesInput = __decorate([
    (0, graphql_1.InputType)()
], GetFilesInput);
//# sourceMappingURL=file.input.js.map