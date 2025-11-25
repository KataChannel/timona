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
var InvoiceImportService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceImportService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ExcelJS = __importStar(require("exceljs"));
const library_1 = require("@prisma/client/runtime/library");
let InvoiceImportService = InvoiceImportService_1 = class InvoiceImportService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(InvoiceImportService_1.name);
    }
    async generateImportTemplate() {
        const workbook = new ExcelJS.Workbook();
        const invoiceSheet = workbook.addWorksheet('Danh sách hóa đơn');
        invoiceSheet.columns = [
            { header: 'Số hóa đơn (*)', key: 'shdon', width: 15 },
            { header: 'Ký hiệu hóa đơn (*)', key: 'khhdon', width: 15 },
            { header: 'Ký hiệu mẫu số (*)', key: 'khmshdon', width: 15 },
            { header: 'Thời điểm lập (*)', key: 'tdlap', width: 20 },
            { header: 'MST người bán (*)', key: 'nbmst', width: 15 },
            { header: 'Tên người bán', key: 'nbten', width: 30 },
            { header: 'Địa chỉ người bán', key: 'nbdchi', width: 40 },
            { header: 'STK người bán', key: 'nbstkhoan', width: 20 },
            { header: 'MST người mua', key: 'nmmst', width: 15 },
            { header: 'Tên người mua', key: 'nmten', width: 30 },
            { header: 'Địa chỉ người mua', key: 'nmdchi', width: 40 },
            { header: 'STK người mua', key: 'nmstkhoan', width: 20 },
            { header: 'Tổng tiền chưa thuế', key: 'tgtcthue', width: 20 },
            { header: 'Tổng tiền thuế', key: 'tgtthue', width: 15 },
            { header: 'Tổng tiền TT', key: 'tgtttbso', width: 20 },
            { header: 'Tổng tiền bằng chữ', key: 'tgtttbchu', width: 40 },
            { header: 'Trạng thái', key: 'tthai', width: 15 },
            { header: 'HT thanh toán', key: 'htttoan', width: 20 },
        ];
        const headerRow = invoiceSheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' }
        };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
        headerRow.height = 25;
        invoiceSheet.addRow({
            shdon: '0000001',
            khhdon: 'AA/23E',
            khmshdon: '1/001',
            tdlap: '2025-10-18 10:00:00',
            nbmst: '0123456789',
            nbten: 'CÔNG TY TNHH ABC',
            nbdchi: '123 Đường ABC, Quận 1, TP.HCM',
            nbstkhoan: '1234567890',
            nmmst: '9876543210',
            nmten: 'CÔNG TY CP XYZ',
            nmdchi: '456 Đường XYZ, Quận 2, TP.HCM',
            nmstkhoan: '0987654321',
            tgtcthue: 10000000,
            tgtthue: 1000000,
            tgtttbso: 11000000,
            tgtttbchu: 'Mười một triệu đồng chẵn',
            tthai: 'Đã ký',
            htttoan: 'Chuyển khoản'
        });
        invoiceSheet.eachRow((row, rowNumber) => {
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });
        });
        const detailSheet = workbook.addWorksheet('Chi tiết hóa đơn');
        detailSheet.columns = [
            { header: 'Số hóa đơn (*)', key: 'shdon', width: 15 },
            { header: 'STT', key: 'stt', width: 8 },
            { header: 'Tên hàng hóa/DV (*)', key: 'ten', width: 40 },
            { header: 'Đơn vị tính', key: 'dvtinh', width: 12 },
            { header: 'Số lượng', key: 'sluong', width: 12 },
            { header: 'Đơn giá', key: 'dgia', width: 15 },
            { header: 'Thành tiền chưa thuế', key: 'thtcthue', width: 20 },
            { header: 'Thuế suất (%)', key: 'tsuat', width: 12 },
            { header: 'Tiền thuế', key: 'tthue', width: 15 },
            { header: 'Thành tiền', key: 'thtien', width: 20 },
        ];
        const detailHeaderRow = detailSheet.getRow(1);
        detailHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        detailHeaderRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF70AD47' }
        };
        detailHeaderRow.alignment = { vertical: 'middle', horizontal: 'center' };
        detailHeaderRow.height = 25;
        detailSheet.addRow({
            shdon: '0000001',
            stt: 1,
            ten: 'Dịch vụ tư vấn',
            dvtinh: 'Giờ',
            sluong: 10,
            dgia: 1000000,
            thtcthue: 10000000,
            tsuat: 10,
            tthue: 1000000,
            thtien: 11000000
        });
        detailSheet.eachRow((row, rowNumber) => {
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });
        });
        const instructionSheet = workbook.addWorksheet('Hướng dẫn');
        instructionSheet.mergeCells('A1:B1');
        const titleCell = instructionSheet.getCell('A1');
        titleCell.value = 'HƯỚNG DẪN IMPORT DỮ LIỆU HÓA ĐƠN';
        titleCell.font = { bold: true, size: 14, color: { argb: 'FF0000FF' } };
        titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
        instructionSheet.addRow([]);
        instructionSheet.addRow(['1. CẤU TRÚC FILE']);
        instructionSheet.addRow(['', 'File gồm 2 sheet chính:']);
        instructionSheet.addRow(['', '- Sheet "Danh sách hóa đơn": Thông tin tổng hợp hóa đơn']);
        instructionSheet.addRow(['', '- Sheet "Chi tiết hóa đơn": Thông tin chi tiết hàng hóa/dịch vụ']);
        instructionSheet.addRow([]);
        instructionSheet.addRow(['2. QUY TẮC NHẬP LIỆU']);
        instructionSheet.addRow(['', '- Các trường có dấu (*) là bắt buộc']);
        instructionSheet.addRow(['', '- Số hóa đơn phải duy nhất trong hệ thống']);
        instructionSheet.addRow(['', '- Thời điểm lập: định dạng YYYY-MM-DD HH:mm:ss']);
        instructionSheet.addRow(['', '- Số tiền: chỉ nhập số, không nhập dấu phân cách']);
        instructionSheet.addRow(['', '- MST: 10 hoặc 13 ký tự số']);
        instructionSheet.addRow([]);
        instructionSheet.addRow(['3. LIÊN KẾT DỮ LIỆU']);
        instructionSheet.addRow(['', '- Chi tiết hóa đơn liên kết qua "Số hóa đơn"']);
        instructionSheet.addRow(['', '- Một hóa đơn có thể có nhiều dòng chi tiết']);
        instructionSheet.addRow(['', '- Số hóa đơn ở sheet chi tiết phải tồn tại ở sheet danh sách']);
        instructionSheet.addRow([]);
        instructionSheet.addRow(['4. CHÚ Ý']);
        instructionSheet.addRow(['', '- Không xóa dòng tiêu đề']);
        instructionSheet.addRow(['', '- Không thay đổi tên các cột']);
        instructionSheet.addRow(['', '- Dữ liệu mẫu có thể xóa và thay bằng dữ liệu thực']);
        instructionSheet.addRow(['', '- Hệ thống sẽ bỏ qua các dòng trống']);
        instructionSheet.getColumn('A').width = 5;
        instructionSheet.getColumn('B').width = 70;
        return await workbook.xlsx.writeBuffer();
    }
    async parseImportFile(buffer) {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);
        const invoiceSheet = workbook.getWorksheet('Danh sách hóa đơn');
        const detailSheet = workbook.getWorksheet('Chi tiết hóa đơn');
        if (!invoiceSheet) {
            throw new common_1.BadRequestException('Không tìm thấy sheet "Danh sách hóa đơn"');
        }
        const invoices = new Map();
        const details = new Map();
        invoiceSheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1)
                return;
            const rowData = row.values;
            const shdon = this.getCellValue(row, 1);
            if (!shdon)
                return;
            const invoice = {
                shdon: shdon,
                khhdon: this.getCellValue(row, 2),
                khmshdon: this.getCellValue(row, 3),
                tdlap: this.parseDateValue(this.getCellValue(row, 4)),
                nbmst: this.getCellValue(row, 5),
                nbten: this.getCellValue(row, 6),
                nbdchi: this.getCellValue(row, 7),
                nbstkhoan: this.getCellValue(row, 8),
                nmmst: this.getCellValue(row, 9),
                nmten: this.getCellValue(row, 10),
                nmdchi: this.getCellValue(row, 11),
                nmstkhoan: this.getCellValue(row, 12),
                tgtcthue: this.parseNumberValue(this.getCellValue(row, 13)),
                tgtthue: this.parseNumberValue(this.getCellValue(row, 14)),
                tgtttbso: this.parseNumberValue(this.getCellValue(row, 15)),
                tgtttbchu: this.getCellValue(row, 16),
                tthai: this.getCellValue(row, 17),
                htttoan: this.getCellValue(row, 18),
            };
            invoices.set(shdon, invoice);
        });
        if (detailSheet) {
            detailSheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1)
                    return;
                const shdon = this.getCellValue(row, 1);
                if (!shdon)
                    return;
                const detail = {
                    stt: this.parseNumberValue(this.getCellValue(row, 2)),
                    ten: this.getCellValue(row, 3),
                    dvtinh: this.getCellValue(row, 4),
                    sluong: this.parseNumberValue(this.getCellValue(row, 5)),
                    dgia: this.parseNumberValue(this.getCellValue(row, 6)),
                    thtcthue: this.parseNumberValue(this.getCellValue(row, 7)),
                    tsuat: this.parseNumberValue(this.getCellValue(row, 8)),
                    tthue: this.parseNumberValue(this.getCellValue(row, 9)),
                    thtien: this.parseNumberValue(this.getCellValue(row, 10)),
                };
                if (!details.has(shdon)) {
                    details.set(shdon, []);
                }
                details.get(shdon).push(detail);
            });
        }
        const result = [];
        invoices.forEach((invoice, shdon) => {
            invoice.details = details.get(shdon) || [];
            result.push(invoice);
        });
        return result;
    }
    async importInvoices(data) {
        const result = {
            success: true,
            totalRows: data.length,
            successCount: 0,
            errorCount: 0,
            errors: [],
            invoiceIds: [],
            message: '',
            statistics: {
                totalInvoices: data.length,
                totalDetails: data.reduce((sum, inv) => sum + (inv.details?.length || 0), 0),
                invoicesCreated: 0,
                detailsCreated: 0,
                duplicatesSkipped: 0,
                validationErrors: 0,
            },
            invoicesCreated: []
        };
        for (let i = 0; i < data.length; i++) {
            const invoiceData = data[i];
            const rowNumber = i + 2;
            try {
                if (!invoiceData.shdon || !invoiceData.khhdon || !invoiceData.khmshdon) {
                    result.statistics.validationErrors++;
                    throw new Error('Thiếu thông tin bắt buộc: Số hóa đơn, Ký hiệu hóa đơn, hoặc Ký hiệu mẫu số');
                }
                if (!invoiceData.nbmst) {
                    throw new Error('Thiếu mã số thuế người bán');
                }
                const existing = await this.prisma.ext_listhoadon.findFirst({
                    where: {
                        nbmst: invoiceData.nbmst,
                        khmshdon: invoiceData.khmshdon,
                        shdon: invoiceData.shdon,
                        khhdon: invoiceData.khhdon,
                    }
                });
                if (existing) {
                    result.statistics.duplicatesSkipped++;
                    result.errors.push({
                        row: rowNumber,
                        error: `Hóa đơn đã tồn tại: ${invoiceData.shdon}`,
                        data: invoiceData
                    });
                    result.errorCount++;
                    result.invoicesCreated.push({
                        id: existing.id,
                        shdon: invoiceData.shdon || '',
                        khhdon: invoiceData.khhdon || '',
                        nbten: invoiceData.nbten || '',
                        nmten: invoiceData.nmten || '',
                        tgtttbso: invoiceData.tgtttbso || 0,
                        detailsCount: 0,
                        status: 'duplicate',
                    });
                    continue;
                }
                const invoice = await this.prisma.ext_listhoadon.create({
                    data: {
                        shdon: invoiceData.shdon,
                        khhdon: invoiceData.khhdon,
                        khmshdon: invoiceData.khmshdon,
                        tdlap: invoiceData.tdlap,
                        nbmst: invoiceData.nbmst,
                        nbten: invoiceData.nbten,
                        nbdchi: invoiceData.nbdchi,
                        nbstkhoan: invoiceData.nbstkhoan,
                        nmmst: invoiceData.nmmst,
                        nmten: invoiceData.nmten,
                        nmdchi: invoiceData.nmdchi,
                        nmstkhoan: invoiceData.nmstkhoan,
                        tgtcthue: invoiceData.tgtcthue ? new library_1.Decimal(invoiceData.tgtcthue) : null,
                        tgtthue: invoiceData.tgtthue ? new library_1.Decimal(invoiceData.tgtthue) : null,
                        tgtttbso: invoiceData.tgtttbso ? new library_1.Decimal(invoiceData.tgtttbso) : null,
                        tgtttbchu: invoiceData.tgtttbchu,
                        tthai: invoiceData.tthai,
                        htttoan: invoiceData.htttoan,
                        idServer: `IMPORT-${invoiceData.nbmst}-${invoiceData.shdon}-${Date.now()}`,
                    }
                });
                result.statistics.invoicesCreated++;
                let detailsCreated = 0;
                if (invoiceData.details && invoiceData.details.length > 0) {
                    for (const detail of invoiceData.details) {
                        await this.prisma.ext_detailhoadon.create({
                            data: {
                                idhdonServer: invoice.idServer,
                                idServer: `${invoice.idServer}-${detail.stt || 0}`,
                                stt: detail.stt,
                                ten: detail.ten,
                                dvtinh: detail.dvtinh,
                                sluong: detail.sluong ? new library_1.Decimal(detail.sluong) : null,
                                dgia: detail.dgia ? new library_1.Decimal(detail.dgia) : null,
                                thtcthue: detail.thtcthue ? new library_1.Decimal(detail.thtcthue) : null,
                                tsuat: detail.tsuat ? new library_1.Decimal(detail.tsuat) : null,
                                tthue: detail.tthue ? new library_1.Decimal(detail.tthue) : null,
                                thtien: detail.thtien ? new library_1.Decimal(detail.thtien) : null,
                            }
                        });
                        detailsCreated++;
                        result.statistics.detailsCreated++;
                    }
                }
                result.invoiceIds.push(invoice.id);
                result.successCount++;
                result.invoicesCreated.push({
                    id: invoice.id,
                    shdon: invoiceData.shdon || '',
                    khhdon: invoiceData.khhdon || '',
                    nbten: invoiceData.nbten || '',
                    nmten: invoiceData.nmten || '',
                    tgtttbso: invoiceData.tgtttbso || 0,
                    detailsCount: detailsCreated,
                    status: 'created',
                });
            }
            catch (error) {
                this.logger.error(`Error importing invoice at row ${rowNumber}:`, error);
                result.errors.push({
                    row: rowNumber,
                    error: error.message,
                    data: invoiceData
                });
                result.errorCount++;
                result.invoicesCreated.push({
                    id: '',
                    shdon: invoiceData.shdon || '',
                    khhdon: invoiceData.khhdon || '',
                    nbten: invoiceData.nbten || '',
                    nmten: invoiceData.nmten || '',
                    tgtttbso: invoiceData.tgtttbso || 0,
                    detailsCount: 0,
                    status: 'error',
                });
            }
        }
        result.success = result.errorCount === 0;
        const messages = [];
        messages.push(`✅ ${result.statistics.invoicesCreated} hóa đơn đã tạo thành công`);
        if (result.statistics.detailsCreated > 0) {
            messages.push(`📋 ${result.statistics.detailsCreated} chi tiết hóa đơn đã tạo`);
        }
        if (result.statistics.duplicatesSkipped > 0) {
            messages.push(`⚠️ ${result.statistics.duplicatesSkipped} hóa đơn trùng lặp (bỏ qua)`);
        }
        if (result.statistics.validationErrors > 0) {
            messages.push(`❌ ${result.statistics.validationErrors} lỗi xác thực dữ liệu`);
        }
        result.message = messages.join(' | ');
        return result;
    }
    async importFromExcel(buffer) {
        try {
            const data = await this.parseImportFile(buffer);
            return await this.importInvoices(data);
        }
        catch (error) {
            this.logger.error('Error importing from Excel:', error);
            throw new common_1.BadRequestException(`Import failed: ${error.message}`);
        }
    }
    getCellValue(row, columnNumber) {
        const cell = row.getCell(columnNumber);
        if (!cell || cell.value === null || cell.value === undefined) {
            return '';
        }
        return String(cell.value).trim();
    }
    parseNumberValue(value) {
        if (value === '' || value === null || value === undefined) {
            return undefined;
        }
        const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/[,\s]/g, ''));
        return isNaN(num) ? undefined : num;
    }
    parseDateValue(value) {
        if (!value)
            return undefined;
        if (value instanceof Date) {
            return value;
        }
        try {
            const dateStr = String(value).trim();
            if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}$/.test(dateStr)) {
                return new Date(dateStr);
            }
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                return new Date(dateStr);
            }
            if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
                const [day, month, year] = dateStr.split('/');
                return new Date(`${year}-${month}-${day}`);
            }
            const parsed = new Date(dateStr);
            if (!isNaN(parsed.getTime())) {
                return parsed;
            }
            return undefined;
        }
        catch (error) {
            return undefined;
        }
    }
};
exports.InvoiceImportService = InvoiceImportService;
exports.InvoiceImportService = InvoiceImportService = InvoiceImportService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InvoiceImportService);
//# sourceMappingURL=invoice-import.service.js.map