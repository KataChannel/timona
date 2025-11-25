"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SourceDocumentModule = void 0;
const common_1 = require("@nestjs/common");
const source_document_resolver_1 = require("./source-document.resolver");
const source_document_service_1 = require("./source-document.service");
const source_document_category_resolver_1 = require("./source-document-category.resolver");
const source_document_category_service_1 = require("./source-document-category.service");
const prisma_service_1 = require("../../prisma/prisma.service");
const minio_module_1 = require("../../minio/minio.module");
const ai_module_1 = require("../../ai/ai.module");
const auth_module_1 = require("../../auth/auth.module");
const user_service_1 = require("../../services/user.service");
let SourceDocumentModule = class SourceDocumentModule {
};
exports.SourceDocumentModule = SourceDocumentModule;
exports.SourceDocumentModule = SourceDocumentModule = __decorate([
    (0, common_1.Module)({
        imports: [minio_module_1.MinioModule, ai_module_1.AiModule, auth_module_1.AuthModule],
        providers: [
            prisma_service_1.PrismaService,
            source_document_resolver_1.SourceDocumentResolver,
            source_document_service_1.SourceDocumentService,
            source_document_category_resolver_1.SourceDocumentCategoryResolver,
            source_document_category_service_1.SourceDocumentCategoryService,
            user_service_1.UserService,
        ],
        exports: [source_document_service_1.SourceDocumentService, source_document_category_service_1.SourceDocumentCategoryService],
    })
], SourceDocumentModule);
//# sourceMappingURL=source-document.module.js.map