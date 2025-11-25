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
var CategoryImportExportController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryImportExportController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const category_import_export_service_1 = require("../services/category-import-export.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const current_user_decorator_1 = require("../auth/current-user.decorator");
const client_1 = require("@prisma/client");
let CategoryImportExportController = CategoryImportExportController_1 = class CategoryImportExportController {
    constructor(importExportService) {
        this.importExportService = importExportService;
        this.logger = new common_1.Logger(CategoryImportExportController_1.name);
    }
    async downloadTemplate(res) {
        try {
            this.logger.log('Generating category import template...');
            const buffer = await this.importExportService.generateImportTemplate();
            const filename = `Mau_Import_DanhMuc_${new Date().getTime()}.xlsx`;
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Length', buffer.length);
            res.send(buffer);
            this.logger.log(`Category template generated successfully: ${filename}`);
        }
        catch (error) {
            this.logger.error('Error generating category template:', error);
            res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Không thể tạo file mẫu danh mục',
                error: error.message,
            });
        }
    }
    async importFile(file, user) {
        try {
            if (!file) {
                return {
                    success: false,
                    message: 'Không có file được upload',
                };
            }
            this.logger.log(`Importing categories from file: ${file.originalname} (${file.size} bytes)`);
            if (!file.originalname.match(/\.(xlsx|xls)$/)) {
                return {
                    success: false,
                    message: 'File phải là định dạng Excel (.xlsx hoặc .xls)',
                };
            }
            const userId = user?.id || 'system';
            const result = await this.importExportService.importFromExcel(file.buffer, userId);
            this.logger.log(`Category import completed: ${result.successCount} success, ${result.errorCount} errors`);
            return result;
        }
        catch (error) {
            this.logger.error('Error importing categories:', error);
            return {
                success: false,
                totalRows: 0,
                successCount: 0,
                errorCount: 0,
                errors: [{
                        row: 0,
                        error: error.message,
                    }],
                categoryIds: [],
                message: `Import danh mục thất bại: ${error.message}`,
                statistics: {
                    totalCategories: 0,
                    categoriesCreated: 0,
                    categoriesUpdated: 0,
                    duplicatesSkipped: 0,
                    validationErrors: 0,
                },
            };
        }
    }
    async exportCategories(res) {
        try {
            this.logger.log('Exporting all categories to Excel...');
            const buffer = await this.importExportService.exportToExcel();
            const filename = `DanhSachDanhMuc_${new Date().getTime()}.xlsx`;
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Length', buffer.length);
            res.send(buffer);
            this.logger.log(`Categories exported successfully: ${filename}`);
        }
        catch (error) {
            this.logger.error('Error exporting categories:', error);
            res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Không thể export danh mục',
                error: error.message,
            });
        }
    }
};
exports.CategoryImportExportController = CategoryImportExportController;
__decorate([
    (0, common_1.Get)('template'),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRoleType.ADMIN),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CategoryImportExportController.prototype, "downloadTemplate", null);
__decorate([
    (0, common_1.Post)('import'),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRoleType.ADMIN),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CategoryImportExportController.prototype, "importFile", null);
__decorate([
    (0, common_1.Get)('export'),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRoleType.ADMIN),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CategoryImportExportController.prototype, "exportCategories", null);
exports.CategoryImportExportController = CategoryImportExportController = CategoryImportExportController_1 = __decorate([
    (0, common_1.Controller)('api/category-import-export'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [category_import_export_service_1.CategoryImportExportService])
], CategoryImportExportController);
//# sourceMappingURL=category-import-export.controller.js.map