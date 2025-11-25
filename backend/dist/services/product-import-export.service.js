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
var ProductImportExportService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductImportExportService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ExcelJS = __importStar(require("exceljs"));
let ProductImportExportService = ProductImportExportService_1 = class ProductImportExportService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ProductImportExportService_1.name);
    }
    async generateImportTemplate() {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Danh sách sản phẩm');
        sheet.columns = [
            { header: 'Tên sản phẩm (*)', key: 'name', width: 30 },
            { header: 'Slug (tự động nếu trống)', key: 'slug', width: 25 },
            { header: 'Mô tả ngắn', key: 'shortDesc', width: 30 },
            { header: 'Mô tả chi tiết', key: 'description', width: 40 },
            { header: 'Giá bán (*)', key: 'price', width: 15 },
            { header: 'Giá gốc', key: 'originalPrice', width: 15 },
            { header: 'Giá vốn', key: 'costPrice', width: 15 },
            { header: 'Mã SKU', key: 'sku', width: 15 },
            { header: 'Mã vạch', key: 'barcode', width: 15 },
            { header: 'Tồn kho', key: 'stock', width: 12 },
            { header: 'Tồn kho tối thiểu', key: 'minStock', width: 15 },
            { header: 'Danh mục (slug)', key: 'categorySlug', width: 25 },
            { header: 'Đơn vị (KG/G/BUNDLE/PIECE/BAG/BOX)', key: 'unit', width: 12 },
            { header: 'Khối lượng (g)', key: 'weight', width: 12 },
            { header: 'Xuất xứ', key: 'origin', width: 20 },
            { header: 'URL ảnh đại diện', key: 'thumbnail', width: 40 },
            { header: 'Trạng thái (DRAFT/ACTIVE/INACTIVE/OUT_OF_STOCK)', key: 'status', width: 20 },
            { header: 'Nổi bật (true/false)', key: 'isFeatured', width: 15 },
            { header: 'Hàng mới (true/false)', key: 'isNewArrival', width: 15 },
            { header: 'Bán chạy (true/false)', key: 'isBestSeller', width: 15 },
            { header: 'Đang giảm giá (true/false)', key: 'isOnSale', width: 15 },
        ];
        const headerRow = sheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' }
        };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        headerRow.height = 40;
        sheet.addRow({
            name: 'Rau muống',
            slug: 'rau-muong',
            shortDesc: 'Rau muống tươi xanh non',
            description: 'Rau muống tươi, xanh non, được trồng theo phương pháp hữu cơ',
            price: 15000,
            originalPrice: 20000,
            costPrice: 10000,
            sku: 'RAU-MUONG-001',
            barcode: '1234567890123',
            stock: 100,
            minStock: 10,
            categorySlug: 'rau-xanh',
            unit: 'KG',
            weight: 500,
            origin: 'Đà Lạt',
            thumbnail: 'https://example.com/rau-muong.jpg',
            status: 'ACTIVE',
            isFeatured: true,
            isNewArrival: false,
            isBestSeller: true,
            isOnSale: true,
        });
        sheet.addRow({
            name: 'Cà rốt Đà Lạt',
            slug: 'ca-rot-da-lat',
            shortDesc: 'Cà rốt Đà Lạt tươi ngon',
            description: 'Cà rốt Đà Lạt chất lượng cao, giàu vitamin A',
            price: 25000,
            originalPrice: 30000,
            costPrice: 18000,
            sku: 'CU-CAROT-001',
            barcode: '1234567890124',
            stock: 50,
            minStock: 5,
            categorySlug: 'cu-qua',
            unit: 'KG',
            weight: 1000,
            origin: 'Đà Lạt, Lâm Đồng',
            thumbnail: 'https://example.com/ca-rot.jpg',
            status: 'ACTIVE',
            isFeatured: false,
            isNewArrival: true,
            isBestSeller: false,
            isOnSale: false,
        });
        sheet.addRow({
            name: 'Rau cải hữu cơ',
            slug: 'rau-cai-huu-co',
            shortDesc: 'Rau cải xanh hữu cơ',
            description: 'Rau cải xanh trồng hữu cơ, không hóa chất',
            price: 12000,
            originalPrice: 15000,
            costPrice: 8000,
            sku: 'RAU-CAI-001',
            barcode: '1234567890125',
            stock: 80,
            minStock: 10,
            categorySlug: 'rau-xanh',
            unit: 'BUNDLE',
            weight: 300,
            origin: 'Hà Nội',
            thumbnail: 'https://example.com/rau-cai.jpg',
            status: 'ACTIVE',
            isFeatured: true,
            isNewArrival: true,
            isBestSeller: false,
            isOnSale: false,
        });
        const instructionsSheet = workbook.addWorksheet('Hướng dẫn');
        instructionsSheet.columns = [
            { header: 'Cột', key: 'column', width: 30 },
            { header: 'Mô tả', key: 'description', width: 60 },
            { header: 'Bắt buộc', key: 'required', width: 15 },
        ];
        const instructions = [
            { column: 'Tên sản phẩm', description: 'Tên hiển thị của sản phẩm', required: 'Có' },
            { column: 'Slug', description: 'URL thân thiện (tự động tạo nếu để trống)', required: 'Không' },
            { column: 'Mô tả ngắn', description: 'Mô tả ngắn gọn về sản phẩm', required: 'Không' },
            { column: 'Mô tả chi tiết', description: 'Mô tả chi tiết đầy đủ về sản phẩm', required: 'Không' },
            { column: 'Giá bán', description: 'Giá bán lẻ hiện tại (VNĐ)', required: 'Có' },
            { column: 'Giá gốc', description: 'Giá trước khuyến mãi (VNĐ)', required: 'Không' },
            { column: 'Giá vốn', description: 'Giá nhập vào (VNĐ)', required: 'Không' },
            { column: 'Mã SKU', description: 'Mã quản lý kho nội bộ (duy nhất)', required: 'Không' },
            { column: 'Mã vạch', description: 'Mã vạch sản phẩm (duy nhất)', required: 'Không' },
            { column: 'Tồn kho', description: 'Số lượng hiện có trong kho', required: 'Không' },
            { column: 'Tồn kho tối thiểu', description: 'Ngưỡng cảnh báo tồn kho thấp', required: 'Không' },
            { column: 'Danh mục', description: 'Slug của danh mục sản phẩm', required: 'Không' },
            { column: 'Đơn vị', description: 'KG, G, BUNDLE, PIECE, BAG, BOX', required: 'Không' },
            { column: 'Khối lượng', description: 'Khối lượng tính bằng gram', required: 'Không' },
            { column: 'Xuất xứ', description: 'Nơi sản xuất/trồng trọt', required: 'Không' },
            { column: 'URL ảnh đại diện', description: 'Đường dẫn đến ảnh chính', required: 'Không' },
            { column: 'Trạng thái', description: 'DRAFT, ACTIVE, INACTIVE, OUT_OF_STOCK', required: 'Không' },
            { column: 'Nổi bật', description: 'Sản phẩm nổi bật (true/false)', required: 'Không' },
            { column: 'Hàng mới', description: 'Hàng mới về (true/false)', required: 'Không' },
            { column: 'Bán chạy', description: 'Sản phẩm bán chạy (true/false)', required: 'Không' },
            { column: 'Đang giảm giá', description: 'Đang có khuyến mãi (true/false)', required: 'Không' },
        ];
        instructions.forEach(row => instructionsSheet.addRow(row));
        const instHeader = instructionsSheet.getRow(1);
        instHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        instHeader.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' }
        };
        return await workbook.xlsx.writeBuffer();
    }
    async importFromExcel(buffer, userId) {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);
        const worksheet = workbook.getWorksheet('Danh sách sản phẩm');
        if (!worksheet) {
            throw new Error('Không tìm thấy sheet "Danh sách sản phẩm"');
        }
        const result = {
            success: true,
            totalRows: 0,
            successCount: 0,
            errorCount: 0,
            errors: [],
            productIds: [],
            message: '',
            statistics: {
                totalProducts: 0,
                productsCreated: 0,
                productsUpdated: 0,
                duplicatesSkipped: 0,
                validationErrors: 0,
            },
        };
        const products = [];
        const rowCount = worksheet.rowCount;
        for (let rowNumber = 2; rowNumber <= rowCount; rowNumber++) {
            const row = worksheet.getRow(rowNumber);
            if (!row.getCell(1).value)
                continue;
            try {
                const productData = {
                    name: this.getCellValue(row, 1),
                    slug: this.getCellValue(row, 2) || undefined,
                    shortDesc: this.getCellValue(row, 3) || undefined,
                    description: this.getCellValue(row, 4) || undefined,
                    price: parseFloat(this.getCellValue(row, 5)) || 0,
                    originalPrice: this.getCellValue(row, 6) ? parseFloat(this.getCellValue(row, 6)) : undefined,
                    costPrice: this.getCellValue(row, 7) ? parseFloat(this.getCellValue(row, 7)) : undefined,
                    sku: this.getCellValue(row, 8) || undefined,
                    barcode: this.getCellValue(row, 9) || undefined,
                    stock: this.getCellValue(row, 10) ? parseInt(this.getCellValue(row, 10)) : 0,
                    minStock: this.getCellValue(row, 11) ? parseInt(this.getCellValue(row, 11)) : 0,
                    categorySlug: this.getCellValue(row, 12) || undefined,
                    unit: this.getCellValue(row, 13) || 'PIECE',
                    weight: this.getCellValue(row, 14) ? parseFloat(this.getCellValue(row, 14)) : undefined,
                    origin: this.getCellValue(row, 15) || undefined,
                    thumbnail: this.getCellValue(row, 16) || undefined,
                    status: this.getCellValue(row, 17) || 'ACTIVE',
                    isFeatured: this.parseBooleanValue(this.getCellValue(row, 18), false),
                    isNewArrival: this.parseBooleanValue(this.getCellValue(row, 19), false),
                    isBestSeller: this.parseBooleanValue(this.getCellValue(row, 20), false),
                    isOnSale: this.parseBooleanValue(this.getCellValue(row, 21), false),
                };
                if (!productData.name) {
                    result.errors.push({
                        row: rowNumber,
                        error: 'Tên sản phẩm là bắt buộc',
                        data: productData,
                    });
                    result.errorCount++;
                    result.statistics.validationErrors++;
                    continue;
                }
                if (!productData.price || productData.price <= 0) {
                    result.errors.push({
                        row: rowNumber,
                        error: 'Giá bán phải lớn hơn 0',
                        data: productData,
                    });
                    result.errorCount++;
                    result.statistics.validationErrors++;
                    continue;
                }
                products.push(productData);
                result.totalRows++;
            }
            catch (error) {
                result.errors.push({
                    row: rowNumber,
                    error: error.message || 'Lỗi không xác định',
                    data: row.values,
                });
                result.errorCount++;
                result.statistics.validationErrors++;
            }
        }
        result.statistics.totalProducts = products.length;
        for (const productData of products) {
            try {
                const slug = productData.slug || this.generateSlug(productData.name);
                let categoryId;
                if (productData.categorySlug) {
                    const category = await this.prisma.category.findUnique({
                        where: { slug: productData.categorySlug },
                    });
                    if (!category) {
                        throw new Error(`Không tìm thấy danh mục: ${productData.categorySlug}`);
                    }
                    categoryId = category.id;
                }
                const existing = await this.prisma.product.findUnique({
                    where: { slug },
                });
                if (existing) {
                    const updated = await this.prisma.product.update({
                        where: { id: existing.id },
                        data: {
                            name: productData.name,
                            shortDesc: productData.shortDesc,
                            description: productData.description,
                            price: productData.price,
                            originalPrice: productData.originalPrice,
                            costPrice: productData.costPrice,
                            sku: productData.sku,
                            barcode: productData.barcode,
                            stock: productData.stock,
                            minStock: productData.minStock,
                            categoryId,
                            unit: productData.unit,
                            weight: productData.weight,
                            origin: productData.origin,
                            thumbnail: productData.thumbnail,
                            status: productData.status,
                            isFeatured: productData.isFeatured,
                            isNewArrival: productData.isNewArrival,
                            isBestSeller: productData.isBestSeller,
                            isOnSale: productData.isOnSale,
                            updatedBy: userId,
                        },
                    });
                    result.productIds.push(updated.id);
                    result.successCount++;
                    result.statistics.productsUpdated++;
                }
                else {
                    if (!categoryId) {
                        throw new Error('Danh mục là bắt buộc cho sản phẩm mới');
                    }
                    const created = await this.prisma.product.create({
                        data: {
                            name: productData.name,
                            slug,
                            shortDesc: productData.shortDesc,
                            description: productData.description,
                            price: productData.price,
                            originalPrice: productData.originalPrice,
                            costPrice: productData.costPrice,
                            sku: productData.sku,
                            barcode: productData.barcode,
                            stock: productData.stock ?? 0,
                            minStock: productData.minStock ?? 0,
                            categoryId,
                            unit: productData.unit || 'PIECE',
                            weight: productData.weight,
                            origin: productData.origin,
                            thumbnail: productData.thumbnail,
                            status: productData.status || 'ACTIVE',
                            isFeatured: productData.isFeatured ?? false,
                            isNewArrival: productData.isNewArrival ?? false,
                            isBestSeller: productData.isBestSeller ?? false,
                            isOnSale: productData.isOnSale ?? false,
                            createdBy: userId,
                            updatedBy: userId,
                        },
                    });
                    result.productIds.push(created.id);
                    result.successCount++;
                    result.statistics.productsCreated++;
                }
            }
            catch (error) {
                this.logger.error(`Error processing product: ${productData.name}`, error);
                result.errors.push({
                    row: products.indexOf(productData) + 2,
                    error: error.message || 'Lỗi khi lưu sản phẩm',
                    data: productData,
                });
                result.errorCount++;
            }
        }
        result.success = result.errorCount === 0;
        result.message = result.success
            ? `Import thành công ${result.successCount}/${result.totalRows} sản phẩm`
            : `Import hoàn tất với ${result.errorCount} lỗi`;
        return result;
    }
    async exportToExcel(filters) {
        const products = await this.prisma.product.findMany({
            include: {
                category: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
            where: filters,
        });
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Danh sách sản phẩm');
        sheet.columns = [
            { header: 'ID', key: 'id', width: 35 },
            { header: 'Tên sản phẩm', key: 'name', width: 30 },
            { header: 'Slug', key: 'slug', width: 25 },
            { header: 'Mô tả ngắn', key: 'shortDesc', width: 30 },
            { header: 'Mô tả chi tiết', key: 'description', width: 40 },
            { header: 'Giá bán', key: 'price', width: 15 },
            { header: 'Giá gốc', key: 'originalPrice', width: 15 },
            { header: 'Giá vốn', key: 'costPrice', width: 15 },
            { header: 'Mã SKU', key: 'sku', width: 15 },
            { header: 'Mã vạch', key: 'barcode', width: 15 },
            { header: 'Tồn kho', key: 'stock', width: 12 },
            { header: 'Tồn tối thiểu', key: 'minStock', width: 15 },
            { header: 'Danh mục', key: 'categoryName', width: 25 },
            { header: 'Slug danh mục', key: 'categorySlug', width: 25 },
            { header: 'Đơn vị', key: 'unit', width: 12 },
            { header: 'Khối lượng (g)', key: 'weight', width: 12 },
            { header: 'Xuất xứ', key: 'origin', width: 20 },
            { header: 'URL ảnh', key: 'thumbnail', width: 40 },
            { header: 'Trạng thái', key: 'status', width: 15 },
            { header: 'Nổi bật', key: 'isFeatured', width: 12 },
            { header: 'Hàng mới', key: 'isNewArrival', width: 12 },
            { header: 'Bán chạy', key: 'isBestSeller', width: 12 },
            { header: 'Giảm giá', key: 'isOnSale', width: 12 },
            { header: 'Lượt xem', key: 'viewCount', width: 12 },
            { header: 'Đã bán', key: 'soldCount', width: 12 },
            { header: 'Ngày tạo', key: 'createdAt', width: 20 },
        ];
        const headerRow = sheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' }
        };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
        headerRow.height = 25;
        products.forEach(product => {
            sheet.addRow({
                id: product.id,
                name: product.name,
                slug: product.slug,
                shortDesc: product.shortDesc || '',
                description: product.description || '',
                price: product.price,
                originalPrice: product.originalPrice || '',
                costPrice: product.costPrice || '',
                sku: product.sku || '',
                barcode: product.barcode || '',
                stock: product.stock,
                minStock: product.minStock,
                categoryName: product.category?.name || '',
                categorySlug: product.category?.slug || '',
                unit: product.unit || '',
                weight: product.weight || '',
                origin: product.origin || '',
                thumbnail: product.thumbnail || '',
                status: product.status,
                isFeatured: product.isFeatured ? 'Có' : 'Không',
                isNewArrival: product.isNewArrival ? 'Có' : 'Không',
                isBestSeller: product.isBestSeller ? 'Có' : 'Không',
                isOnSale: product.isOnSale ? 'Có' : 'Không',
                viewCount: product.viewCount,
                soldCount: product.soldCount,
                createdAt: product.createdAt.toISOString().split('T')[0],
            });
        });
        sheet.columns.forEach(column => {
            if (column.header) {
                column.width = Math.max(column.width || 10, column.header.toString().length + 2);
            }
        });
        return await workbook.xlsx.writeBuffer();
    }
    getCellValue(row, columnNumber) {
        const cell = row.getCell(columnNumber);
        if (!cell.value)
            return '';
        if (typeof cell.value === 'object' && 'text' in cell.value) {
            return cell.value.text?.toString() || '';
        }
        return cell.value.toString().trim();
    }
    parseBooleanValue(value, defaultValue = false) {
        if (!value)
            return defaultValue;
        const lowerValue = value.toLowerCase().trim();
        return lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes' || lowerValue === 'có';
    }
    generateSlug(name) {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }
};
exports.ProductImportExportService = ProductImportExportService;
exports.ProductImportExportService = ProductImportExportService = ProductImportExportService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductImportExportService);
//# sourceMappingURL=product-import-export.service.js.map