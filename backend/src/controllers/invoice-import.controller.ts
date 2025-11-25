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
import { InvoiceImportService } from '../services/invoice-import.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { $Enums } from '@prisma/client';

@Controller('api/invoice-import')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvoiceImportController {
  private readonly logger = new Logger(InvoiceImportController.name);

  constructor(private readonly importService: InvoiceImportService) {}

  /**
   * Download import template
   */
  @Get('template')
  @Roles($Enums.UserRoleType.ADMIN, $Enums.UserRoleType.USER)
  async downloadTemplate(@Res() res: Response) {
    try {
      this.logger.log('Generating import template...');
      
      const buffer = await this.importService.generateImportTemplate();
      
      const filename = `Mau_Import_Hoadon_${new Date().getTime()}.xlsx`;
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length);
      
      res.send(buffer);
      
      this.logger.log(`Template generated successfully: ${filename}`);
    } catch (error) {
      this.logger.error('Error generating template:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Không thể tạo file mẫu',
        error: error.message,
      });
    }
  }

  /**
   * Upload and import invoices from Excel
   */
  @Post('upload')
  @Roles($Enums.UserRoleType.ADMIN, $Enums.UserRoleType.USER)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    try {
      if (!file) {
        return {
          success: false,
          message: 'Không có file được upload',
        };
      }

      this.logger.log(`Importing file: ${file.originalname} (${file.size} bytes)`);

      // Validate file type
      if (!file.originalname.match(/\.(xlsx|xls)$/)) {
        return {
          success: false,
          message: 'File phải là định dạng Excel (.xlsx hoặc .xls)',
        };
      }

      // Import from buffer
      const result = await this.importService.importFromExcel(file.buffer);

      this.logger.log(`Import completed: ${result.successCount} success, ${result.errorCount} errors`);

      return result;
    } catch (error) {
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

  /**
   * Preview import data without saving
   */
  @Post('preview')
  @Roles($Enums.UserRoleType.ADMIN, $Enums.UserRoleType.USER)
  @UseInterceptors(FileInterceptor('file'))
  async previewFile(@UploadedFile() file: Express.Multer.File): Promise<any> {
    try {
      if (!file) {
        return {
          success: false,
          message: 'Không có file được upload',
        };
      }

      this.logger.log(`Previewing file: ${file.originalname}`);

      // Validate file type
      if (!file.originalname.match(/\.(xlsx|xls)$/)) {
        return {
          success: false,
          message: 'File phải là định dạng Excel (.xlsx hoặc .xls)',
        };
      }

      // Parse without saving
      const data = await this.importService.parseImportFile(file.buffer);

      this.logger.log(`Preview completed: ${data.length} invoices found`);

      return {
        success: true,
        totalInvoices: data.length,
        data: data.slice(0, 10), // Return first 10 for preview
        message: `Tìm thấy ${data.length} hóa đơn trong file`,
      };
    } catch (error) {
      this.logger.error('Error previewing file:', error);
      return {
        success: false,
        message: `Preview thất bại: ${error.message}`,
      };
    }
  }
}
