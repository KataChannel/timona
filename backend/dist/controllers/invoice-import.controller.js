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
var InvoiceImportController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceImportController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const invoice_import_service_1 = require("../services/invoice-import.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const client_1 = require("@prisma/client");
let InvoiceImportController = InvoiceImportController_1 = class InvoiceImportController {
    constructor(importService) {
        this.importService = importService;
        this.logger = new common_1.Logger(InvoiceImportController_1.name);
    }
    async downloadTemplate(res) {
        try {
            this.logger.log('Generating import template...');
            const buffer = await this.importService.generateImportTemplate();
            const filename = `Mau_Import_Hoadon_${new Date().getTime()}.xlsx`;
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Length', buffer.length);
            res.send(buffer);
            this.logger.log(`Template generated successfully: ${filename}`);
        }
        catch (error) {
            this.logger.error('Error generating template:', error);
            res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Không thể tạo file mẫu',
                error: error.message,
            });
        }
    }
    async uploadFile(file) {
        try {
            if (!file) {
                return {
                    success: false,
                    message: 'Không có file được upload',
                };
            }
            this.logger.log(`Importing file: ${file.originalname} (${file.size} bytes)`);
            if (!file.originalname.match(/\.(xlsx|xls)$/)) {
                return {
                    success: false,
                    message: 'File phải là định dạng Excel (.xlsx hoặc .xls)',
                };
            }
            const result = await this.importService.importFromExcel(file.buffer);
            this.logger.log(`Import completed: ${result.successCount} success, ${result.errorCount} errors`);
            return result;
        }
        catch (error) {
            this.logger.error('Error importing file:', error);
            return {
                success: false,
                totalRows: 0,
                successCount: 0,
                errorCount: 0,
                errors: [{
                        row: 0,
                        error: error.message,
                    }],
                invoiceIds: [],
                message: `Import thất bại: ${error.message}`,
            };
        }
    }
    async previewFile(file) {
        try {
            if (!file) {
                return {
                    success: false,
                    message: 'Không có file được upload',
                };
            }
            this.logger.log(`Previewing file: ${file.originalname}`);
            if (!file.originalname.match(/\.(xlsx|xls)$/)) {
                return {
                    success: false,
                    message: 'File phải là định dạng Excel (.xlsx hoặc .xls)',
                };
            }
            const data = await this.importService.parseImportFile(file.buffer);
            this.logger.log(`Preview completed: ${data.length} invoices found`);
            return {
                success: true,
                totalInvoices: data.length,
                data: data.slice(0, 10),
                message: `Tìm thấy ${data.length} hóa đơn trong file`,
            };
        }
        catch (error) {
            this.logger.error('Error previewing file:', error);
            return {
                success: false,
                message: `Preview thất bại: ${error.message}`,
            };
        }
    }
};
exports.InvoiceImportController = InvoiceImportController;
__decorate([
    (0, common_1.Get)('template'),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRoleType.ADMIN, client_1.$Enums.UserRoleType.USER),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InvoiceImportController.prototype, "downloadTemplate", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRoleType.ADMIN, client_1.$Enums.UserRoleType.USER),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InvoiceImportController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Post)('preview'),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRoleType.ADMIN, client_1.$Enums.UserRoleType.USER),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InvoiceImportController.prototype, "previewFile", null);
exports.InvoiceImportController = InvoiceImportController = InvoiceImportController_1 = __decorate([
    (0, common_1.Controller)('api/invoice-import'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [invoice_import_service_1.InvoiceImportService])
], InvoiceImportController);
//# sourceMappingURL=invoice-import.controller.js.map