"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileModule = void 0;
const common_1 = require("@nestjs/common");
const file_service_1 = require("../../services/file.service");
const minio_service_1 = require("../../services/minio.service");
const file_resolver_1 = require("../resolvers/file.resolver");
const folder_resolver_1 = require("../resolvers/folder.resolver");
const prisma_service_1 = require("../../prisma/prisma.service");
const file_controller_1 = require("../../controllers/file.controller");
const auth_module_1 = require("../../auth/auth.module");
const user_service_1 = require("../../services/user.service");
let FileModule = class FileModule {
};
exports.FileModule = FileModule;
exports.FileModule = FileModule = __decorate([
    (0, common_1.Module)({
        imports: [auth_module_1.AuthModule],
        controllers: [file_controller_1.FileController],
        providers: [
            file_service_1.FileService,
            minio_service_1.MinioService,
            file_resolver_1.FileResolver,
            folder_resolver_1.FolderResolver,
            prisma_service_1.PrismaService,
            user_service_1.UserService,
        ],
        exports: [file_service_1.FileService, minio_service_1.MinioService],
    })
], FileModule);
//# sourceMappingURL=file.module.js.map