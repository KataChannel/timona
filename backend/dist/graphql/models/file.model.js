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
exports.VisibilityCount = exports.FileTypeCount = exports.FileStorageStats = exports.FileUploadResponse = exports.PaginatedFolders = exports.PaginatedFiles = exports.FileShare = exports.File = exports.FileFolder = void 0;
const graphql_1 = require("@nestjs/graphql");
const client_1 = require("@prisma/client");
const graphql_type_json_1 = __importDefault(require("graphql-type-json"));
(0, graphql_1.registerEnumType)(client_1.FileType, {
    name: 'FileType',
    description: 'Type of file',
});
(0, graphql_1.registerEnumType)(client_1.FileVisibility, {
    name: 'FileVisibility',
    description: 'Visibility level of the file',
});
let FileFolder = class FileFolder {
};
exports.FileFolder = FileFolder;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], FileFolder.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], FileFolder.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], FileFolder.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    __metadata("design:type", String)
], FileFolder.prototype, "parentId", void 0);
__decorate([
    (0, graphql_1.Field)(() => FileFolder, { nullable: true }),
    __metadata("design:type", FileFolder)
], FileFolder.prototype, "parent", void 0);
__decorate([
    (0, graphql_1.Field)(() => [FileFolder], { defaultValue: [] }),
    __metadata("design:type", Array)
], FileFolder.prototype, "children", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], FileFolder.prototype, "path", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], FileFolder.prototype, "userId", void 0);
__decorate([
    (0, graphql_1.Field)(() => [File], { defaultValue: [] }),
    __metadata("design:type", Array)
], FileFolder.prototype, "files", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], FileFolder.prototype, "color", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], FileFolder.prototype, "icon", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], FileFolder.prototype, "isSystem", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], FileFolder.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], FileFolder.prototype, "updatedAt", void 0);
exports.FileFolder = FileFolder = __decorate([
    (0, graphql_1.ObjectType)()
], FileFolder);
let File = class File {
};
exports.File = File;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], File.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], File.prototype, "filename", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], File.prototype, "originalName", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], File.prototype, "mimeType", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], File.prototype, "size", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.FileType),
    __metadata("design:type", String)
], File.prototype, "fileType", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], File.prototype, "url", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], File.prototype, "bucket", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], File.prototype, "path", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], File.prototype, "etag", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    __metadata("design:type", String)
], File.prototype, "folderId", void 0);
__decorate([
    (0, graphql_1.Field)(() => FileFolder, { nullable: true }),
    __metadata("design:type", FileFolder)
], File.prototype, "folder", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], File.prototype, "userId", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.FileVisibility),
    __metadata("design:type", String)
], File.prototype, "visibility", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], File.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], File.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], File.prototype, "alt", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { defaultValue: [] }),
    __metadata("design:type", Array)
], File.prototype, "tags", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default, { nullable: true }),
    __metadata("design:type", Object)
], File.prototype, "metadata", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], File.prototype, "width", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], File.prototype, "height", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], File.prototype, "thumbnailUrl", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], File.prototype, "downloadCount", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], File.prototype, "viewCount", void 0);
__decorate([
    (0, graphql_1.Field)(() => [FileShare], { defaultValue: [] }),
    __metadata("design:type", Array)
], File.prototype, "shares", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], File.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], File.prototype, "updatedAt", void 0);
exports.File = File = __decorate([
    (0, graphql_1.ObjectType)()
], File);
let FileShare = class FileShare {
};
exports.FileShare = FileShare;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], FileShare.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], FileShare.prototype, "fileId", void 0);
__decorate([
    (0, graphql_1.Field)(() => File),
    __metadata("design:type", File)
], FileShare.prototype, "file", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], FileShare.prototype, "sharedBy", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], FileShare.prototype, "sharedWith", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], FileShare.prototype, "token", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], FileShare.prototype, "expiresAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], FileShare.prototype, "password", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], FileShare.prototype, "canDownload", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], FileShare.prototype, "canView", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], FileShare.prototype, "accessCount", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], FileShare.prototype, "lastAccess", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], FileShare.prototype, "createdAt", void 0);
exports.FileShare = FileShare = __decorate([
    (0, graphql_1.ObjectType)()
], FileShare);
let PaginatedFiles = class PaginatedFiles {
};
exports.PaginatedFiles = PaginatedFiles;
__decorate([
    (0, graphql_1.Field)(() => [File]),
    __metadata("design:type", Array)
], PaginatedFiles.prototype, "items", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], PaginatedFiles.prototype, "total", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], PaginatedFiles.prototype, "page", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], PaginatedFiles.prototype, "limit", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], PaginatedFiles.prototype, "totalPages", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], PaginatedFiles.prototype, "hasNextPage", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], PaginatedFiles.prototype, "hasPreviousPage", void 0);
exports.PaginatedFiles = PaginatedFiles = __decorate([
    (0, graphql_1.ObjectType)()
], PaginatedFiles);
let PaginatedFolders = class PaginatedFolders {
};
exports.PaginatedFolders = PaginatedFolders;
__decorate([
    (0, graphql_1.Field)(() => [FileFolder]),
    __metadata("design:type", Array)
], PaginatedFolders.prototype, "items", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], PaginatedFolders.prototype, "total", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], PaginatedFolders.prototype, "page", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], PaginatedFolders.prototype, "limit", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], PaginatedFolders.prototype, "totalPages", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], PaginatedFolders.prototype, "hasNextPage", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], PaginatedFolders.prototype, "hasPreviousPage", void 0);
exports.PaginatedFolders = PaginatedFolders = __decorate([
    (0, graphql_1.ObjectType)()
], PaginatedFolders);
let FileUploadResponse = class FileUploadResponse {
};
exports.FileUploadResponse = FileUploadResponse;
__decorate([
    (0, graphql_1.Field)(() => File),
    __metadata("design:type", File)
], FileUploadResponse.prototype, "file", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], FileUploadResponse.prototype, "success", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], FileUploadResponse.prototype, "message", void 0);
exports.FileUploadResponse = FileUploadResponse = __decorate([
    (0, graphql_1.ObjectType)()
], FileUploadResponse);
let FileStorageStats = class FileStorageStats {
};
exports.FileStorageStats = FileStorageStats;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], FileStorageStats.prototype, "totalFiles", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], FileStorageStats.prototype, "totalSize", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], FileStorageStats.prototype, "totalFolders", void 0);
__decorate([
    (0, graphql_1.Field)(() => [FileTypeCount]),
    __metadata("design:type", Array)
], FileStorageStats.prototype, "filesByType", void 0);
__decorate([
    (0, graphql_1.Field)(() => [VisibilityCount]),
    __metadata("design:type", Array)
], FileStorageStats.prototype, "filesByVisibility", void 0);
exports.FileStorageStats = FileStorageStats = __decorate([
    (0, graphql_1.ObjectType)()
], FileStorageStats);
let FileTypeCount = class FileTypeCount {
};
exports.FileTypeCount = FileTypeCount;
__decorate([
    (0, graphql_1.Field)(() => client_1.FileType),
    __metadata("design:type", String)
], FileTypeCount.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], FileTypeCount.prototype, "count", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], FileTypeCount.prototype, "totalSize", void 0);
exports.FileTypeCount = FileTypeCount = __decorate([
    (0, graphql_1.ObjectType)()
], FileTypeCount);
let VisibilityCount = class VisibilityCount {
};
exports.VisibilityCount = VisibilityCount;
__decorate([
    (0, graphql_1.Field)(() => client_1.FileVisibility),
    __metadata("design:type", String)
], VisibilityCount.prototype, "visibility", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], VisibilityCount.prototype, "count", void 0);
exports.VisibilityCount = VisibilityCount = __decorate([
    (0, graphql_1.ObjectType)()
], VisibilityCount);
//# sourceMappingURL=file.model.js.map