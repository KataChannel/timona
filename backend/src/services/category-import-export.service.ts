import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as ExcelJS from 'exceljs';

interface ImportCategoryData {
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  icon?: string;
  parentSlug?: string;
  displayOrder?: number;
  isActive?: boolean;
  isFeatured?: boolean;
}

export interface CategoryImportResult {
  success: boolean;
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: Array<{
    row: number;
    error: string;
    data?: any;
  }>;
  categoryIds: string[];
  message: string;
  statistics: {
    totalCategories: number;
    categoriesCreated: number;
    categoriesUpdated: number;
    duplicatesSkipped: number;
    validationErrors: number;
  };
}

@Injectable()
export class CategoryImportExportService {
  private readonly logger = new Logger(CategoryImportExportService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate Excel template for category import
   */
  async generateImportTemplate(): Promise<any> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Danh sách danh mục');

    // Define columns
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

    // Style header row
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    headerRow.height = 40;

    // Add sample data rows - hierarchical structure
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

    // Add instructions sheet
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

    // Style instructions header
    const instHeader = instructionsSheet.getRow(1);
    instHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    instHeader.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };

    return await workbook.xlsx.writeBuffer();
  }

  /**
   * Import categories from Excel buffer
   * Uses two-pass approach: first create parent categories, then children
   */
  async importFromExcel(buffer: any, userId: string): Promise<CategoryImportResult> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const worksheet = workbook.getWorksheet('Danh sách danh mục');
    if (!worksheet) {
      throw new Error('Không tìm thấy sheet "Danh sách danh mục"');
    }

    const result: CategoryImportResult = {
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

    const allCategories: ImportCategoryData[] = [];
    const parentCategories: ImportCategoryData[] = [];
    const childCategories: ImportCategoryData[] = [];
    const rowCount = worksheet.rowCount;

    // Parse all rows first (skip header)
    for (let rowNumber = 2; rowNumber <= rowCount; rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      
      // Skip empty rows
      if (!row.getCell(1).value) continue;

      try {
        const categoryData: ImportCategoryData = {
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

        // Validate required fields
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
        
        // Separate parent and child categories
        if (categoryData.parentSlug) {
          childCategories.push(categoryData);
        } else {
          parentCategories.push(categoryData);
        }
        
        result.totalRows++;
      } catch (error) {
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

    // PASS 1: Process parent categories first
    for (const categoryData of parentCategories) {
      try {
        await this.processCategory(categoryData, userId, result, null);
      } catch (error) {
        this.logger.error(`Error processing parent category: ${categoryData.name}`, error);
        result.errors.push({
          row: allCategories.indexOf(categoryData) + 2,
          error: error.message || 'Lỗi khi lưu danh mục cha',
          data: categoryData,
        });
        result.errorCount++;
      }
    }

    // PASS 2: Process child categories
    for (const categoryData of childCategories) {
      try {
        // Find parent category
        const parentCategory = await this.prisma.category.findUnique({
          where: { slug: categoryData.parentSlug },
        });

        if (!parentCategory) {
          throw new Error(`Không tìm thấy danh mục cha: ${categoryData.parentSlug}`);
        }

        await this.processCategory(categoryData, userId, result, parentCategory.id);
      } catch (error) {
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

  /**
   * Process a single category (create or update)
   */
  private async processCategory(
    categoryData: ImportCategoryData,
    userId: string,
    result: CategoryImportResult,
    parentId: string | null,
  ): Promise<void> {
    const slug = categoryData.slug || this.generateSlug(categoryData.name);

    // Check if category exists
    const existing = await this.prisma.category.findUnique({
      where: { slug },
    });

    if (existing) {
      // Update existing category
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
    } else {
      // Create new category
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

  /**
   * Export all categories to Excel
   */
  async exportToExcel(): Promise<any> {
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

    // Define columns
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

    // Style header row
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 25;

    // Add data rows
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

    // Auto-fit columns
    sheet.columns.forEach(column => {
      if (column.header) {
        column.width = Math.max(column.width || 10, column.header.toString().length + 2);
      }
    });

    return await workbook.xlsx.writeBuffer();
  }

  /**
   * Helper: Get cell value as string
   */
  private getCellValue(row: ExcelJS.Row, columnNumber: number): string {
    const cell = row.getCell(columnNumber);
    if (!cell.value) return '';
    
    if (typeof cell.value === 'object' && 'text' in cell.value) {
      return cell.value.text?.toString() || '';
    }
    
    return cell.value.toString().trim();
  }

  /**
   * Helper: Parse boolean value
   */
  private parseBooleanValue(value: string, defaultValue: boolean = false): boolean {
    if (!value) return defaultValue;
    const lowerValue = value.toLowerCase().trim();
    return lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes' || lowerValue === 'có';
  }

  /**
   * Helper: Generate slug from Vietnamese name
   */
  private generateSlug(name: string): string {
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
}
