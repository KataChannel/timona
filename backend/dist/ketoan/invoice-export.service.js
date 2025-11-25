"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceExportService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ExcelJS = __importStar(require("exceljs"));
let InvoiceExportService = class InvoiceExportService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async exportInvoicesToExcel(fromDate, toDate, invoiceType) {
        console.log(`🔍 Fetching invoice data from ${fromDate} to ${toDate}...`);
        const invoiceData = await this.getInvoiceData(fromDate, toDate, invoiceType);
        console.log(`📊 Found ${invoiceData.length} invoices to export`);
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Danh sách hóa đơn');
        this.setupWorksheetHeaders(worksheet);
        await this.populateWorksheetData(worksheet, invoiceData);
        this.formatWorksheet(worksheet);
        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
    async getInvoiceData(fromDate, toDate, invoiceType, limit) {
        const startDate = new Date(fromDate);
        const endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999);
        console.log(`🔍 Querying invoices from ${startDate.toISOString()} to ${endDate.toISOString()}`);
        try {
            const whereCondition = {
                ntao: {
                    gte: startDate,
                    lte: endDate,
                },
            };
            if (invoiceType) {
                whereCondition.tlhdon = invoiceType;
            }
            const invoices = await this.prisma.ext_listhoadon.findMany({
                where: whereCondition,
                include: {
                    details: {
                        orderBy: {
                            stt: 'asc'
                        }
                    }
                },
                orderBy: {
                    tdlap: 'desc'
                },
                ...(limit && { take: limit }),
            });
            console.log(`✅ Retrieved ${invoices.length} invoices from database`);
            const exportData = invoices.map(invoice => {
                const details = invoice.details.map(detail => ({
                    id: detail.id,
                    stt: detail.stt || 0,
                    ten: detail.ten || '',
                    dvtinh: detail.dvtinh || '',
                    sluong: Number(detail.sluong) || 0,
                    dgia: Number(detail.dgia) || 0,
                    thtien: Number(detail.thtien) || 0,
                    tsuat: Number(detail.tsuat) || 0,
                    tthue: Number(detail.tthue) || 0,
                    tthhdtrung: detail.tthhdtrung || '',
                }));
                return {
                    id: invoice.id,
                    nbmst: invoice.nbmst || '',
                    nbten: invoice.nbten || '',
                    nbdchi: invoice.nbdchi || '',
                    nmmst: invoice.nmmst || '',
                    khhdon: invoice.khhdon || '',
                    shdon: invoice.shdon || '',
                    khmshdon: invoice.khmshdon || '',
                    tdlap: invoice.tdlap,
                    thlap: invoice.thlap ? String(invoice.thlap) : '',
                    tthai: invoice.tthai || '',
                    tlhdon: invoice.tlhdon || '',
                    nmdchi: invoice.nmdchi || '',
                    nmten: invoice.nmten || '',
                    tgtcthue: Number(invoice.tgtcthue) || 0,
                    tgtthue: Number(invoice.tgtthue) || 0,
                    tgtttbso: Number(invoice.tgtttbso) || 0,
                    details,
                };
            });
            return exportData;
        }
        catch (error) {
            console.error('❌ Error fetching invoice data:', error);
            throw new Error(`Failed to fetch invoice data: ${error.message}`);
        }
    }
    setupWorksheetHeaders(worksheet) {
        const headers = [
            'STT',
            'Mã số thuế NB',
            'Tên người bán',
            'Địa chỉ người bán',
            'Mã số thuế NM',
            'Ký hiệu hóa đơn',
            'Số hóa đơn',
            'Ký hiệu mẫu số hóa đơn',
            'Ngày lập',
            'Thời hạn lập',
            'Trạng thái',
            'Loại hóa đơn',
            'Địa chỉ NM',
            'Tên khách hàng',
            'Tên sản phẩm',
            'Đơn vị tính',
            'Số lượng',
            'Đơn giá',
            'Thành tiền',
            'Thuế suất',
            'Tiền thuế',
            'Tổng tiền',
            'Tổng thuế',
            'Tổng cộng',
        ];
        worksheet.addRow(headers);
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '366092' }
        };
        const columnWidths = [5, 15, 25, 30, 15, 12, 12, 15, 12, 12, 10, 12, 30, 25, 30, 10, 10, 15, 15, 10, 15, 15, 15, 15];
        columnWidths.forEach((width, index) => {
            worksheet.getColumn(index + 1).width = width;
        });
    }
    async populateWorksheetData(worksheet, invoiceData) {
        let rowIndex = 1;
        for (const invoice of invoiceData) {
            rowIndex++;
            if (invoice.details && invoice.details.length > 0) {
                for (let i = 0; i < invoice.details.length; i++) {
                    const detail = invoice.details[i];
                    const isFirstDetail = i === 0;
                    const row = [
                        rowIndex - 1,
                        isFirstDetail ? invoice.nbmst : '',
                        isFirstDetail ? invoice.nbten : '',
                        isFirstDetail ? invoice.nbdchi : '',
                        isFirstDetail ? invoice.nmmst : '',
                        isFirstDetail ? invoice.khhdon : '',
                        isFirstDetail ? invoice.shdon : '',
                        isFirstDetail ? invoice.khmshdon : '',
                        isFirstDetail ? this.formatDate(invoice.tdlap) : '',
                        isFirstDetail ? invoice.thlap : '',
                        isFirstDetail ? invoice.tthai : '',
                        isFirstDetail ? invoice.tlhdon : '',
                        isFirstDetail ? invoice.nmdchi : '',
                        isFirstDetail ? invoice.nmten : '',
                        detail.ten,
                        detail.dvtinh,
                        detail.sluong,
                        detail.dgia,
                        detail.thtien,
                        detail.tsuat,
                        detail.tthue,
                        isFirstDetail ? invoice.tgtcthue : '',
                        isFirstDetail ? invoice.tgtthue : '',
                        isFirstDetail ? invoice.tgtttbso : '',
                    ];
                    worksheet.addRow(row);
                }
            }
            else {
                const row = [
                    rowIndex - 1,
                    invoice.nbmst,
                    invoice.nbten,
                    invoice.nbdchi,
                    invoice.nmmst,
                    invoice.khhdon,
                    invoice.shdon,
                    invoice.khmshdon,
                    this.formatDate(invoice.tdlap),
                    invoice.thlap,
                    invoice.tthai,
                    invoice.tlhdon,
                    invoice.nmdchi,
                    invoice.nmten,
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    invoice.tgtcthue,
                    invoice.tgtthue,
                    invoice.tgtttbso,
                ];
                worksheet.addRow(row);
            }
        }
    }
    formatWorksheet(worksheet) {
        worksheet.eachRow((row, rowNumber) => {
            row.eachCell((cell, colNumber) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
                if (colNumber >= 17 && colNumber <= 24) {
                    cell.alignment = { horizontal: 'right' };
                    cell.numFmt = '#,##0';
                }
                else {
                    cell.alignment = { horizontal: 'left' };
                }
                if (colNumber === 9 && rowNumber > 1) {
                    cell.numFmt = 'dd/mm/yyyy';
                }
            });
        });
        worksheet.views = [{ state: 'frozen', ySplit: 1 }];
    }
    formatDate(date) {
        if (!date)
            return '';
        try {
            const d = new Date(date);
            return d.toLocaleDateString('vi-VN');
        }
        catch (error) {
            console.warn('Error formatting date:', error);
            return '';
        }
    }
};
exports.InvoiceExportService = InvoiceExportService;
exports.InvoiceExportService = InvoiceExportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InvoiceExportService);
//# sourceMappingURL=invoice-export.service.js.map