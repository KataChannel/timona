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
var CategoryImportExportService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryImportExportService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ExcelJS = __importStar(require("exceljs"));
let CategoryImportExportService = CategoryImportExportService_1 = class CategoryImportExportService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(CategoryImportExportService_1.name);
    }
    async generateImportTemplate() {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Danh sách danh mục');
        sheet.columns = [
            { header: 'Tên danh mục (*)', key: 'name', width: 30 },
            { header: 'Slug (tự động nếu trống)', key: 'slug', width: 25 },
            { header: 'Mô tả', key: 'description', width: 40 },
            { header: 'URL hình ảnh', key: 'image', width: 40 },
            { header: 'Icon', key: 'icon', width: 20 },
            { header: 'Slug danh mục cha', key: 'parentSlug', width: 25 },
            { header: 'Thứ tự hiển thị', key: 'displayOrder', width: 15 },
            { header: 'Hoạt động (true/false)', key: 'isActive', width: 18 },
            { header: 'Nổi bật (true/false)', key: 'isFeatured', width: 18 },
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
            name: 'Rau củ quả',
            slug: 'rau-cu-qua',
            description: 'Các loại rau củ quả tươi sạch',
            image: 'https://example.com/rau-cu-qua.jpg',
            icon: 'vegetables',
            parentSlug: '',
            displayOrder: 1,
            isActive: true,
            isFeatured: true,
        });
        sheet.addRow({
            name: 'Rau xanh',
            slug: 'rau-xanh',
            description: 'Các loại rau xanh tươi ngon',
            image: 'https://example.com/rau-xanh.jpg',
            icon: 'leaf',
            parentSlug: 'rau-cu-qua',
            displayOrder: 1,
            isActive: true,
            isFeatured: false,
        });
        sheet.addRow({
            name: 'Củ quả',
            slug: 'cu-qua',
            description: 'Các loại củ quả dinh dưỡng',
            image: 'https://example.com/cu-qua.jpg',
            icon: 'carrot',
            parentSlug: 'rau-cu-qua',
            displayOrder: 2,
            isActive: true,
            isFeatured: false,
        });
        const instructionsSheet = workbook.addWorksheet('Hướng dẫn');
        instructionsSheet.columns = [
            { header: 'Cột', key: 'column', width: 30 },
            { header: 'Mô tả', key: 'description', width: 60 },
            { header: 'Bắt buộc', key: 'required', width: 15 },
        ];
        const instructions = [
            { column: 'Tên danh mục', description: 'Tên hiển thị của danh mục', required: 'Có' },
            { column: 'Slug', description: 'URL thân thiện (tự động tạo nếu để trống)', required: 'Không' },
            { column: 'Mô tả', description: 'Mô tả chi tiết về danh mục', required: 'Không' },
            { column: 'URL hình ảnh', description: 'Đường dẫn đến hình ảnh đại diện', required: 'Không' },
            { column: 'Icon', description: 'Tên icon hoặc class icon', required: 'Không' },
            { column: 'Slug danh mục cha', description: 'Để tạo danh mục con (để trống nếu là danh mục gốc)', required: 'Không' },
            { column: 'Thứ tự hiển thị', description: 'Số thứ tự sắp xếp (số nhỏ lên trước)', required: 'Không' },
            { column: 'Hoạt động', description: 'true hoặc false (mặc định: true)', required: 'Không' },
            { column: 'Nổi bật', description: 'true hoặc false (mặc định: false)', required: 'Không' },
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
        const worksheet = workbook.getWorksheet('Danh sách danh mục');
        if (!worksheet) {
            throw new Error('Không tìm thấy sheet "Danh sách danh mục"');
        }
        const result = {
            success: true,
            totalRows: 0,
            successCount: 0,
            errorCount: 0,
            errors: [],
            categoryIds: [],
            message: '',
            statistics: {
                totalCategories: 0,
                categoriesCreated: 0,
                categoriesUpdated: 0,
                duplicatesSkipped: 0,
                validationErrors: 0,
            },
        };
        const allCategories = [];
        const parentCategories = [];
        const childCategories = [];
        const rowCount = worksheet.rowCount;
        for (let rowNumber = 2; rowNumber <= rowCount; rowNumber++) {
            const row = worksheet.getRow(rowNumber);
            if (!row.getCell(1).value)
                continue;
            try {
                const categoryData = {
                    name: this.getCellValue(row, 1),
                    slug: this.getCellValue(row, 2) || undefined,
                    description: this.getCellValue(row, 3) || undefined,
                    image: this.getCellValue(row, 4) || undefined,
                    icon: this.getCellValue(row, 5) || undefined,
                    parentSlug: this.getCellValue(row, 6) || undefined,
                    displayOrder: this.getCellValue(row, 7) ? parseInt(this.getCellValue(row, 7)) : 0,
                    isActive: this.parseBooleanValue(this.getCellValue(row, 8), true),
                    isFeatured: this.parseBooleanValue(this.getCellValue(row, 9), false),
                };
                if (!categoryData.name) {
                    result.errors.push({
                        row: rowNumber,
                        error: 'Tên danh mục là bắt buộc',
                        data: categoryData,
                    });
                    result.errorCount++;
                    result.statistics.validationErrors++;
                    continue;
                }
                allCategories.push(categoryData);
                if (categoryData.parentSlug) {
                    childCategories.push(categoryData);
                }
                else {
                    parentCategories.push(categoryData);
                }
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
        result.statistics.totalCategories = allCategories.length;
        for (const categoryData of parentCategories) {
            try {
                await this.processCategory(categoryData, userId, result, null);
            }
            catch (error) {
                this.logger.error(`Error processing parent category: ${categoryData.name}`, error);
                result.errors.push({
                    row: allCategories.indexOf(categoryData) + 2,
                    error: error.message || 'Lỗi khi lưu danh mục cha',
                    data: categoryData,
                });
                result.errorCount++;
            }
        }
        for (const categoryData of childCategories) {
            try {
                const parentCategory = await this.prisma.category.findUnique({
                    where: { slug: categoryData.parentSlug },
                });
                if (!parentCategory) {
                    throw new Error(`Không tìm thấy danh mục cha: ${categoryData.parentSlug}`);
                }
                await this.processCategory(categoryData, userId, result, parentCategory.id);
            }
            catch (error) {
                this.logger.error(`Error processing child category: ${categoryData.name}`, error);
                result.errors.push({
                    row: allCategories.indexOf(categoryData) + 2,
                    error: error.message || 'Lỗi khi lưu danh mục con',
                    data: categoryData,
                });
                result.errorCount++;
            }
        }
        result.success = result.errorCount === 0;
        result.message = result.success
            ? `Import thành công ${result.successCount}/${result.totalRows} danh mục`
            : `Import hoàn tất với ${result.errorCount} lỗi`;
        return result;
    }
    async processCategory(categoryData, userId, result, parentId) {
        const slug = categoryData.slug || this.generateSlug(categoryData.name);
        const existing = await this.prisma.category.findUnique({
            where: { slug },
        });
        if (existing) {
            const updated = await this.prisma.category.update({
                where: { id: existing.id },
                data: {
                    name: categoryData.name,
                    description: categoryData.description,
                    image: categoryData.image,
                    icon: categoryData.icon,
                    parentId: parentId,
                    displayOrder: categoryData.displayOrder,
                    isActive: categoryData.isActive,
                    isFeatured: categoryData.isFeatured,
                    updatedBy: userId,
                },
            });
            result.categoryIds.push(updated.id);
            result.successCount++;
            result.statistics.categoriesUpdated++;
        }
        else {
            const created = await this.prisma.category.create({
                data: {
                    name: categoryData.name,
                    slug,
                    description: categoryData.description,
                    image: categoryData.image,
                    icon: categoryData.icon,
                    parentId: parentId,
                    displayOrder: categoryData.displayOrder ?? 0,
                    isActive: categoryData.isActive ?? true,
                    isFeatured: categoryData.isFeatured ?? false,
                    createdBy: userId,
                    updatedBy: userId,
                },
            });
            result.categoryIds.push(created.id);
            result.successCount++;
            result.statistics.categoriesCreated++;
        }
    }
    async exportToExcel() {
        const categories = await this.prisma.category.findMany({
            include: {
                parent: true,
                _count: {
                    select: {
                        products: true,
                        children: true,
                    },
                },
            },
            orderBy: [
                { displayOrder: 'asc' },
                { name: 'asc' },
            ],
        });
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Danh sách danh mục');
        sheet.columns = [
            { header: 'ID', key: 'id', width: 35 },
            { header: 'Tên danh mục', key: 'name', width: 30 },
            { header: 'Slug', key: 'slug', width: 25 },
            { header: 'Mô tả', key: 'description', width: 40 },
            { header: 'URL hình ảnh', key: 'image', width: 40 },
            { header: 'Icon', key: 'icon', width: 20 },
            { header: 'Danh mục cha', key: 'parentName', width: 25 },
            { header: 'Slug danh mục cha', key: 'parentSlug', width: 25 },
            { header: 'Thứ tự', key: 'displayOrder', width: 12 },
            { header: 'Trạng thái', key: 'isActive', width: 12 },
            { header: 'Nổi bật', key: 'isFeatured', width: 12 },
            { header: 'Số sản phẩm', key: 'productCount', width: 15 },
            { header: 'Số danh mục con', key: 'childCount', width: 15 },
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
        categories.forEach(category => {
            sheet.addRow({
                id: category.id,
                name: category.name,
                slug: category.slug,
                description: category.description || '',
                image: category.image || '',
                icon: category.icon || '',
                parentName: category.parent?.name || '',
                parentSlug: category.parent?.slug || '',
                displayOrder: category.displayOrder,
                isActive: category.isActive ? 'Có' : 'Không',
                isFeatured: category.isFeatured ? 'Có' : 'Không',
                productCount: category._count.products,
                childCount: category._count.children,
                createdAt: category.createdAt.toISOString().split('T')[0],
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
exports.CategoryImportExportService = CategoryImportExportService;
exports.CategoryImportExportService = CategoryImportExportService = CategoryImportExportService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CategoryImportExportService);
//# sourceMappingURL=category-import-export.service.js.map