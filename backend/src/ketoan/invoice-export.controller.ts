import { Controller, Get, Query, Res, BadRequestException } from '@nestjs/common';
import type { Response } from 'express';
import { InvoiceExportService } from './invoice-export.service';


@Controller('ketoan/listhoadon')
export class InvoiceExportController {
  constructor(private readonly invoiceExportService: InvoiceExportService) {}

  @Get('export-excel')
  async exportToExcel(
    @Query('fromDate') fromDate: string,
    @Query('toDate') toDate: string,
    @Query('invoiceType') invoiceType: 'banra' | 'muavao' | undefined,
    @Res() res: Response,
  ): Promise<void> {
    try {
      // Validate date format
      if (!this.isValidDate(fromDate) || !this.isValidDate(toDate)) {
        throw new BadRequestException('Invalid date format. Use YYYY-MM-DD format.');
      }

      // Validate date range
      const startDate = new Date(fromDate);
      const endDate = new Date(toDate);
      
      if (startDate > endDate) {
        throw new BadRequestException('From date must be before or equal to to date.');
      }

      // Check if date range is not too large (prevent performance issues)
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff > 365) {
        throw new BadRequestException('Date range cannot exceed 365 days.');
      }

      console.log(`📊 Exporting invoices from ${fromDate} to ${toDate} (${invoiceType || 'all types'})`);

      // Generate Excel file
      const excelBuffer = await this.invoiceExportService.exportInvoicesToExcel(
        fromDate,
        toDate,
        invoiceType
      );

      // Set response headers for Excel file download
      const filename = `hoadon_${fromDate}_${toDate}${invoiceType ? `_${invoiceType}` : ''}.xlsx`;
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', excelBuffer.length);

      // Send the Excel file
      res.send(excelBuffer);

      console.log(`✅ Excel export completed: ${filename} (${excelBuffer.length} bytes)`);

    } catch (error) {
      console.error('❌ Error exporting to Excel:', error);
      
      if (!res.headersSent) {
        if (error instanceof BadRequestException) {
          res.status(400).json({
            error: 'Bad Request',
            message: error.message,
            statusCode: 400
          });
        } else {
          res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to export data to Excel',
            statusCode: 500
          });
        }
      }
    }
  }

  @Get('test')
  async testEndpoint() {
    try {
      return {
        success: true,
        message: 'Ketoan endpoint is working',
        timestamp: new Date().toISOString(),
        service: !!this.invoiceExportService
      };
    } catch (error) {
      console.error('❌ Test endpoint error:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  @Get('preview')
  async previewData(
    @Query('fromDate') fromDate: string,
    @Query('toDate') toDate: string,
    @Query('invoiceType') invoiceType: 'banra' | 'muavao' | undefined,
    @Query('limit') limit = '10',
  ) {
    try {
      if (!this.isValidDate(fromDate) || !this.isValidDate(toDate)) {
        throw new BadRequestException('Invalid date format. Use YYYY-MM-DD format.');
      }

      const limitNumber = parseInt(limit) || 10;
      console.log('🔍 Preview request:', { fromDate, toDate, invoiceType, limit: limitNumber });

      const data = await this.invoiceExportService.getInvoiceData(
        fromDate,
        toDate,
        invoiceType,
        limitNumber
      );

      return {
        success: true,
        data,
        count: data.length,
        dateRange: { fromDate, toDate },
        invoiceType: invoiceType || 'all'
      };

    } catch (error) {
      console.error('❌ Error previewing data:', error);
      throw error;
    }
  }

  private isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return date instanceof Date && 
           !isNaN(date.getTime()) && 
           /^\d{4}-\d{2}-\d{2}$/.test(dateString);
  }
}