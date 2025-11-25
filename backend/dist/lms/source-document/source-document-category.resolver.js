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
exports.SourceDocumentCategoryResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const source_document_category_service_1 = require("./source-document-category.service");
const source_document_entity_1 = require("./entities/source-document.entity");
const source_document_dto_1 = require("./dto/source-document.dto");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
let SourceDocumentCategoryResolver = class SourceDocumentCategoryResolver {
    constructor(categoryService) {
        this.categoryService = categoryService;
    }
    async createSourceDocumentCategory(input) {
        return this.categoryService.create(input);
    }
    async sourceDocumentCategories() {
        return this.categoryService.findAll();
    }
    async sourceDocumentCategory(id) {
        return this.categoryService.findOne(id);
    }
    async updateSourceDocumentCategory(id, input) {
        return this.categoryService.update(id, input);
    }
    async deleteSourceDocumentCategory(id) {
        return this.categoryService.delete(id);
    }
    async sourceDocumentCategoryTree() {
        return this.categoryService.getTree();
    }
};
exports.SourceDocumentCategoryResolver = SourceDocumentCategoryResolver;
__decorate([
    (0, graphql_1.Mutation)(() => source_document_entity_1.SourceDocumentCategory),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [source_document_dto_1.CreateSourceDocumentCategoryInput]),
    __metadata("design:returntype", Promise)
], SourceDocumentCategoryResolver.prototype, "createSourceDocumentCategory", null);
__decorate([
    (0, graphql_1.Query)(() => [source_document_entity_1.SourceDocumentCategory]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SourceDocumentCategoryResolver.prototype, "sourceDocumentCategories", null);
__decorate([
    (0, graphql_1.Query)(() => source_document_entity_1.SourceDocumentCategory),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SourceDocumentCategoryResolver.prototype, "sourceDocumentCategory", null);
__decorate([
    (0, graphql_1.Mutation)(() => source_document_entity_1.SourceDocumentCategory),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, source_document_dto_1.UpdateSourceDocumentCategoryInput]),
    __metadata("design:returntype", Promise)
], SourceDocumentCategoryResolver.prototype, "updateSourceDocumentCategory", null);
__decorate([
    (0, graphql_1.Mutation)(() => source_document_entity_1.SourceDocumentCategory),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SourceDocumentCategoryResolver.prototype, "deleteSourceDocumentCategory", null);
__decorate([
    (0, graphql_1.Query)(() => [source_document_entity_1.SourceDocumentCategory]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SourceDocumentCategoryResolver.prototype, "sourceDocumentCategoryTree", null);
exports.SourceDocumentCategoryResolver = SourceDocumentCategoryResolver = __decorate([
    (0, graphql_1.Resolver)(() => source_document_entity_1.SourceDocumentCategory),
    __metadata("design:paramtypes", [source_document_category_service_1.SourceDocumentCategoryService])
], SourceDocumentCategoryResolver);
//# sourceMappingURL=source-document-category.resolver.js.map