import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as ExcelJS from 'exceljs';

export interface InvoiceExportData {
  // Từ ext_listhoadon  
  id: string;
  nbmst?: string;     // Mã số thuế người bán
  nbten?: string;     // Tên người bán
  nbdchi?: string;    // Địa chỉ người bán
  nmmst?: string;     // Mã số thuế người mua
  khhdon?: string;    // Ký hiệu hóa đơn
  shdon?: string;     // Số hóa đơn  
  khmshdon?: string;  // Ký hiệu mẫu số hóa đơn
  tdlap?: Date;       // Thời điểm lập
  thlap?: string;     // Thời hạn lập
  tthai?: string;     // Trạng thái
  tlhdon?: string;    // Loại hóa đơn
  nmdchi?: string;    // Địa chỉ người mua
  nmten?: string;     // Tên người mua
  tgtcthue?: number;  // Tổng giá trị chưa thuế
  tgtthue?: number;   // Tổng giá trị thuế
  tgtttbso?: number;  // Tổng giá trị thanh toán bằng số
  // Từ ext_detailhoadon
  details?: {
    id: string;
    stt?: number;      // Số thứ tự
    ten?: string;      // Tên sản phẩm
    dvtinh?: string;   // Đơn vị tính
    sluong?: number;   // Số lượng
    dgia?: number;     // Đơn giá
    thtien?: number;   // Thành tiền
    tsuat?: number;    // Thuế suất
    tthue?: number;    // Tiền thuế
    tthhdtrung?: string; // Thông tin hàng hóa trùng
  }[];
}

@Injectable()
export class InvoiceExportService {
  constructor(private readonly prisma: PrismaService) {}

  async exportInvoicesToExcel(
    fromDate: string,
    toDate: string,
    invoiceType?: 'banra' | 'muavao'
  ): Promise<Buffer> {
    console.log(`🔍 Fetching invoice data from ${fromDate} to ${toDate}...`);

    // Lấy dữ liệu từ database
    const invoiceData = await this.getInvoiceData(fromDate, toDate, invoiceType);

    console.log(`📊 Found ${invoiceData.length} invoices to export`);

    // Tạo Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Danh sách hóa đơn');

    // Thiết lập headers
    this.setupWorksheetHeaders(worksheet);

    // Thêm dữ liệu vào worksheet
    await this.populateWorksheetData(worksheet, invoiceData);

    // Format worksheet
    this.formatWorksheet(worksheet);

    // Chuyển đổi thành buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async getInvoiceData(
    fromDate: string,
    toDate: string,
    invoiceType?: 'banra' | 'muavao',
    limit?: number
  ): Promise<InvoiceExportData[]> {
    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);
    endDate.setHours(23, 59, 59, 999); // Include end of day

    console.log(`🔍 Querying invoices from ${startDate.toISOString()} to ${endDate.toISOString()}`);

    try {
      // Build where condition
      const whereCondition: any = {
        ntao: {
          gte: startDate,
          lte: endDate,
        },
      };

      if (invoiceType) {
        whereCondition.tlhdon = invoiceType;
      }

      // Query invoices with details  
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

      // Transform data for export
      const exportData: InvoiceExportData[] = invoices.map(invoice => {
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

    } catch (error) {
      console.error('❌ Error fetching invoice data:', error);
      throw new Error(`Failed to fetch invoice data: ${error.message}`);
    }
  }

  private setupWorksheetHeaders(worksheet: ExcelJS.Worksheet): void {
    // Định nghĩa headers
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

    // Thêm headers
    worksheet.addRow(headers);

    // Style cho headers
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '366092' }
    };

    // Set column widths
    const columnWidths = [5, 15, 25, 30, 15, 12, 12, 15, 12, 12, 10, 12, 30, 25, 30, 10, 10, 15, 15, 10, 15, 15, 15, 15];
    columnWidths.forEach((width, index) => {
      worksheet.getColumn(index + 1).width = width;
    });
  }

  private async populateWorksheetData(
    worksheet: ExcelJS.Worksheet,
    invoiceData: InvoiceExportData[]
  ): Promise<void> {
    let rowIndex = 1;

    for (const invoice of invoiceData) {
      rowIndex++;

      if (invoice.details && invoice.details.length > 0) {
        // Nếu có chi tiết, tạo một row cho mỗi detail
        for (let i = 0; i < invoice.details.length; i++) {
          const detail = invoice.details[i];
          const isFirstDetail = i === 0;

          const row = [
            rowIndex - 1, // STT
            isFirstDetail ? invoice.nbmst : '', // Mã số thuế người bán
            isFirstDetail ? invoice.nbten : '', // Tên người bán
            isFirstDetail ? invoice.nbdchi : '', // Địa chỉ người bán
            isFirstDetail ? invoice.nmmst : '', // Mã số thuế người mua
            isFirstDetail ? invoice.khhdon : '', // Ký hiệu hóa đơn
            isFirstDetail ? invoice.shdon : '', // Số hóa đơn
            isFirstDetail ? invoice.khmshdon : '', // Ký hiệu mẫu số hóa đơn
            isFirstDetail ? this.formatDate(invoice.tdlap) : '', // Ngày lập
            isFirstDetail ? invoice.thlap : '', // Thời hạn lập
            isFirstDetail ? invoice.tthai : '', // Trạng thái
            isFirstDetail ? invoice.tlhdon : '', // Loại hóa đơn
            isFirstDetail ? invoice.nmdchi : '',  // Địa chỉ người mua
            isFirstDetail ? invoice.nmten : '',   // Tên người mua
            detail.ten, // Tên sản phẩm
            detail.dvtinh,
            detail.sluong,
            detail.dgia,
            detail.thtien,
            detail.tsuat,
            detail.tthue,
            isFirstDetail ? invoice.tgtcthue : '', // Tổng tiền chưa thuế
            isFirstDetail ? invoice.tgtthue : '',  // Tổng tiền thuế
            isFirstDetail ? invoice.tgtttbso : '', // Tổng thanh toán
          ];

          worksheet.addRow(row);
        }
      } else {
        // Nếu không có chi tiết, chỉ hiện thông tin hóa đơn
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
          '', // Không có thông tin sản phẩm
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

  private formatWorksheet(worksheet: ExcelJS.Worksheet): void {
    // Auto-fit columns và apply borders
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell, colNumber) => {
        // Borders
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };

        // Alignment
        if (colNumber >= 17 && colNumber <= 24) { // Số columns (điều chỉnh cho cột mới)
          cell.alignment = { horizontal: 'right' };
          cell.numFmt = '#,##0';
        } else {
          cell.alignment = { horizontal: 'left' };
        }

        // Date formatting
        if (colNumber === 9 && rowNumber > 1) { // Ngày lập column (điều chỉnh cho cột mới)
          cell.numFmt = 'dd/mm/yyyy';
        }
      });
    });

    // Freeze header row
    worksheet.views = [{ state: 'frozen', ySplit: 1 }];
  }

  private formatDate(date: Date | null | undefined): string {
    if (!date) return '';
    
    try {
      const d = new Date(date);
      return d.toLocaleDateString('vi-VN');
    } catch (error) {
      console.warn('Error formatting date:', error);
      return '';
    }
  }
}