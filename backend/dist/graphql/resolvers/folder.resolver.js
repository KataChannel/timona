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
exports.FolderResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const file_service_1 = require("../../services/file.service");
const file_model_1 = require("../models/file.model");
const file_input_1 = require("../inputs/file.input");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
let FolderResolver = class FolderResolver {
    constructor(fileService) {
        this.fileService = fileService;
    }
    async createFolder(input, context) {
        const userId = context.req.user.id;
        return this.fileService.createFolder(input, userId);
    }
    async getFolder(id, context) {
        const userId = context.req.user.id;
        return this.fileService.getFolder(id, userId);
    }
    async getFolders(context) {
        const userId = context.req.user.id;
        return this.fileService.getFolders(userId);
    }
    async updateFolder(input, context) {
        const userId = context.req.user.id;
        return this.fileService.updateFolder(input, userId);
    }
    async deleteFolder(id, context) {
        const userId = context.req.user.id;
        return this.fileService.deleteFolder(id, userId);
    }
};
exports.FolderResolver = FolderResolver;
__decorate([
    (0, graphql_1.Mutation)(() => file_model_1.FileFolder),
    __param(0, (0, graphql_1.Args)('input', { type: () => file_input_1.CreateFolderInput })),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [file_input_1.CreateFolderInput, Object]),
    __metadata("design:returntype", Promise)
], FolderResolver.prototype, "createFolder", null);
__decorate([
    (0, graphql_1.Query)(() => file_model_1.FileFolder, { name: 'folder' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FolderResolver.prototype, "getFolder", null);
__decorate([
    (0, graphql_1.Query)(() => [file_model_1.FileFolder], { name: 'folders' }),
    __param(0, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FolderResolver.prototype, "getFolders", null);
__decorate([
    (0, graphql_1.Mutation)(() => file_model_1.FileFolder),
    __param(0, (0, graphql_1.Args)('input', { type: () => file_input_1.UpdateFolderInput })),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [file_input_1.UpdateFolderInput, Object]),
    __metadata("design:returntype", Promise)
], FolderResolver.prototype, "updateFolder", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FolderResolver.prototype, "deleteFolder", null);
exports.FolderResolver = FolderResolver = __decorate([
    (0, graphql_1.Resolver)(() => file_model_1.FileFolder),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [file_service_1.FileService])
], FolderResolver);
//# sourceMappingURL=folder.resolver.js.map