import { 
  Controller, 
  Post, 
  Get, 
  UseInterceptors, 
  UploadedFile, 
  Res, 
  HttpStatus,
  Logger,
  UseGuards,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ProductImportExportService } from '../services/product-import-export.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { $Enums } from '@prisma/client';

@Controller('api/product-import-export')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductImportExportController {
  private readonly logger = new Logger(ProductImportExportController.name);

  constructor(private readonly importExportService: ProductImportExportService) {}

  /**
   * Download product import template
   */
  @Get('template')
  @Roles($Enums.UserRoleType.ADMIN, $Enums.UserRoleType.USER)
  async downloadTemplate(@Res() res: Response) {
    try {
      this.logger.log('Generating product import template...');
      
      const buffer = await this.importExportService.generateImportTemplate();
      
      const filename = `Mau_Import_SanPham_${new Date().getTime()}.xlsx`;
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length);
      
      res.send(buffer);
      
      this.logger.log(`Product template generated successfully: ${filename}`);
    } catch (error) {
      this.logger.error('Error generating product template:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Không thể tạo file mẫu sản phẩm',
        error: error.message,
      });
    }
  }

  /**
   * Upload and import products from Excel
   */
  @Post('import')
  @Roles($Enums.UserRoleType.ADMIN, $Enums.UserRoleType.USER)
  @UseInterceptors(FileInterceptor('file'))
  async importFile(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
  ) {
    try {
      if (!file) {
        return {
          success: false,
          message: 'Không có file được upload',
        };
      }

      this.logger.log(`Importing products from file: ${file.originalname} (${file.size} bytes)`);

      // Validate file type
      if (!file.originalname.match(/\.(xlsx|xls)$/)) {
        return {
          success: false,
          message: 'File phải là định dạng Excel (.xlsx hoặc .xls)',
        };
      }

      // Import from buffer
      const userId = user?.id || 'system';
      const result = await this.importExportService.importFromExcel(file.buffer, userId);

      this.logger.log(`Product import completed: ${result.successCount} success, ${result.errorCount} errors`);

      return result;
    } catch (error) {
      this.logger.error('Error importing products:', error);
      return {
        success: false,
        totalRows: 0,
        successCount: 0,
        errorCount: 0,
        errors: [{
          row: 0,
          error: error.message,
        }],
        productIds: [],
        message: `Import sản phẩm thất bại: ${error.message}`,
        statistics: {
          totalProducts: 0,
          productsCreated: 0,
          productsUpdated: 0,
          duplicatesSkipped: 0,
          validationErrors: 0,
        },
      };
    }
  }

  /**
   * Export products to Excel with optional filters
   */
  @Get('export')
  @Roles($Enums.UserRoleType.ADMIN, $Enums.UserRoleType.USER)
  async exportProducts(
    @Res() res: Response,
    @Query('categoryId') categoryId?: string,
    @Query('status') status?: string,
  ) {
    try {
      this.logger.log('Exporting products to Excel...');
      
      // Build filters
      const filters: any = {};
      if (categoryId) {
        filters.categoryId = categoryId;
      }
      if (status) {
        filters.status = status;
      }

      const buffer = await this.importExportService.exportToExcel(filters);
      
      const filename = `DanhSachSanPham_${new Date().getTime()}.xlsx`;
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length);
      
      res.send(buffer);
      
      this.logger.log(`Products exported successfully: ${filename}`);
    } catch (error) {
      this.logger.error('Error exporting products:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Không thể export sản phẩm',
        error: error.message,
      });
    }
  }
}
