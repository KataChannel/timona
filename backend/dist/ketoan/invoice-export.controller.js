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
exports.InvoiceExportController = void 0;
const common_1 = require("@nestjs/common");
const invoice_export_service_1 = require("./invoice-export.service");
let InvoiceExportController = class InvoiceExportController {
    constructor(invoiceExportService) {
        this.invoiceExportService = invoiceExportService;
    }
    async exportToExcel(fromDate, toDate, invoiceType, res) {
        try {
            if (!this.isValidDate(fromDate) || !this.isValidDate(toDate)) {
                throw new common_1.BadRequestException('Invalid date format. Use YYYY-MM-DD format.');
            }
            const startDate = new Date(fromDate);
            const endDate = new Date(toDate);
            if (startDate > endDate) {
                throw new common_1.BadRequestException('From date must be before or equal to to date.');
            }
            const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
            if (daysDiff > 365) {
                throw new common_1.BadRequestException('Date range cannot exceed 365 days.');
            }
            console.log(`📊 Exporting invoices from ${fromDate} to ${toDate} (${invoiceType || 'all types'})`);
            const excelBuffer = await this.invoiceExportService.exportInvoicesToExcel(fromDate, toDate, invoiceType);
            const filename = `hoadon_${fromDate}_${toDate}${invoiceType ? `_${invoiceType}` : ''}.xlsx`;
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Length', excelBuffer.length);
            res.send(excelBuffer);
            console.log(`✅ Excel export completed: ${filename} (${excelBuffer.length} bytes)`);
        }
        catch (error) {
            console.error('❌ Error exporting to Excel:', error);
            if (!res.headersSent) {
                if (error instanceof common_1.BadRequestException) {
                    res.status(400).json({
                        error: 'Bad Request',
                        message: error.message,
                        statusCode: 400
                    });
                }
                else {
                    res.status(500).json({
                        error: 'Internal Server Error',
                        message: 'Failed to export data to Excel',
                        statusCode: 500
                    });
                }
            }
        }
    }
    async testEndpoint() {
        try {
            return {
                success: true,
                message: 'Ketoan endpoint is working',
                timestamp: new Date().toISOString(),
                service: !!this.invoiceExportService
            };
        }
        catch (error) {
            console.error('❌ Test endpoint error:', error);
            return {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
    async previewData(fromDate, toDate, invoiceType, limit = '10') {
        try {
            if (!this.isValidDate(fromDate) || !this.isValidDate(toDate)) {
                throw new common_1.BadRequestException('Invalid date format. Use YYYY-MM-DD format.');
            }
            const limitNumber = parseInt(limit) || 10;
            console.log('🔍 Preview request:', { fromDate, toDate, invoiceType, limit: limitNumber });
            const data = await this.invoiceExportService.getInvoiceData(fromDate, toDate, invoiceType, limitNumber);
            return {
                success: true,
                data,
                count: data.length,
                dateRange: { fromDate, toDate },
                invoiceType: invoiceType || 'all'
            };
        }
        catch (error) {
            console.error('❌ Error previewing data:', error);
            throw error;
        }
    }
    isValidDate(dateString) {
        const date = new Date(dateString);
        return date instanceof Date &&
            !isNaN(date.getTime()) &&
            /^\d{4}-\d{2}-\d{2}$/.test(dateString);
    }
};
exports.InvoiceExportController = InvoiceExportController;
__decorate([
    (0, common_1.Get)('export-excel'),
    __param(0, (0, common_1.Query)('fromDate')),
    __param(1, (0, common_1.Query)('toDate')),
    __param(2, (0, common_1.Query)('invoiceType')),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], InvoiceExportController.prototype, "exportToExcel", null);
__decorate([
    (0, common_1.Get)('test'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InvoiceExportController.prototype, "testEndpoint", null);
__decorate([
    (0, common_1.Get)('preview'),
    __param(0, (0, common_1.Query)('fromDate')),
    __param(1, (0, common_1.Query)('toDate')),
    __param(2, (0, common_1.Query)('invoiceType')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], InvoiceExportController.prototype, "previewData", null);
exports.InvoiceExportController = InvoiceExportController = __decorate([
    (0, common_1.Controller)('ketoan/listhoadon'),
    __metadata("design:paramtypes", [invoice_export_service_1.InvoiceExportService])
], InvoiceExportController);
//# sourceMappingURL=invoice-export.controller.js.map