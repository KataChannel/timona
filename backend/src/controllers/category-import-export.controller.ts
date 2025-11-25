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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { CategoryImportExportService } from '../services/category-import-export.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { $Enums } from '@prisma/client';

@Controller('api/category-import-export')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoryImportExportController {
  private readonly logger = new Logger(CategoryImportExportController.name);

  constructor(private readonly importExportService: CategoryImportExportService) {}

  /**
   * Download category import template
   */
  @Get('template')
  @Roles($Enums.UserRoleType.ADMIN)
  async downloadTemplate(@Res() res: Response) {
    try {
      this.logger.log('Generating category import template...');
      
      const buffer = await this.importExportService.generateImportTemplate();
      
      const filename = `Mau_Import_DanhMuc_${new Date().getTime()}.xlsx`;
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length);
      
      res.send(buffer);
      
      this.logger.log(`Category template generated successfully: ${filename}`);
    } catch (error) {
      this.logger.error('Error generating category template:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Không thể tạo file mẫu danh mục',
        error: error.message,
      });
    }
  }

  /**
   * Upload and import categories from Excel
   */
  @Post('import')
  @Roles($Enums.UserRoleType.ADMIN)
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

      this.logger.log(`Importing categories from file: ${file.originalname} (${file.size} bytes)`);

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

      this.logger.log(`Category import completed: ${result.successCount} success, ${result.errorCount} errors`);

      return result;
    } catch (error) {
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

  /**
   * Export all categories to Excel
   */
  @Get('export')
  @Roles($Enums.UserRoleType.ADMIN)
  async exportCategories(@Res() res: Response) {
    try {
      this.logger.log('Exporting all categories to Excel...');
      
      const buffer = await this.importExportService.exportToExcel();
      
      const filename = `DanhSachDanhMuc_${new Date().getTime()}.xlsx`;
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length);
      
      res.send(buffer);
      
      this.logger.log(`Categories exported successfully: ${filename}`);
    } catch (error) {
      this.logger.error('Error exporting categories:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Không thể export danh mục',
        error: error.message,
      });
    }
  }
}
