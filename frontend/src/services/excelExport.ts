import * as XLSX from 'xlsx';
import { InvoiceData, ExportOptions } from '@/types/invoice';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export class ExcelExportService {
  /**
   * Format currency for Excel (removes currency symbol, keeps number)
   */
  private static formatCurrencyForExcel(amount: number): number {
    return amount;
  }

  /**
   * Format date for Excel display
   */
  private static formatDateForExcel(dateString: string): string {
    try {
      let date: Date;
      if (dateString.includes('/')) {
        // DD/MM/YYYY format
        const [day, month, year] = dateString.split('/');
        date = new Date(`${year}-${month}-${day}`);
      } else {
        // ISO format
        date = new Date(dateString);
      }
      
      return format(date, 'dd/MM/yyyy HH:mm', { locale: vi });
    } catch (error) {
      return dateString;
    }
  }

  /**
   * Convert invoice data to Excel format
   */
  private static convertToExcelData(invoices: InvoiceData[]): any[][] {
    const headers = [
      'STT',
      'Số hóa đơn',
      'Ký hiệu mẫu số',
      'Ngày lập',
      'Tên người bán',
      'MST người bán',
      'Tên người mua',
      'MST người mua',
      'Tiền chưa thuế (VNĐ)',
      'Tiền thuế (VNĐ)',
      'Tổng thanh toán (VNĐ)',
      'Đơn vị tiền tệ',
      'Trạng thái',
      'Phương thức thanh toán',
      'Địa chỉ người bán',
      'Địa chỉ người mua'
    ];

    const rows = invoices.map((invoice, index) => [
      index + 1,
      invoice.shdon || '',
      invoice.khmshdon || '',
      this.formatDateForExcel(invoice.tdlap),
      invoice.tentcgp || '',
      invoice.msttcgp || '',
      invoice.tenxmua || '',
      invoice.msttmua || '',
      this.formatCurrencyForExcel(invoice.tgtcthue),
      this.formatCurrencyForExcel(invoice.tgtthue),
      this.formatCurrencyForExcel(invoice.tgtttbso),
      invoice.dvtte || 'VNĐ',
      invoice.tghdon === 'active' || !invoice.tghdon ? 'Hợp lệ' : 
      invoice.tghdon === 'cancelled' ? 'Đã hủy' : 
      invoice.tghdon || 'Không xác định',
      invoice.pthuc || '',
      invoice.dctcgp || '',
      invoice.dcxmua || ''
    ]);

    return [headers, ...rows];
  }

  /**
   * Create Excel workbook with formatting
   */
  private static createWorkbook(data: any[][], options: ExportOptions): XLSX.WorkBook {
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();

    // Set column widths
    const colWidths = [
      { wch: 5 },   // STT
      { wch: 15 },  // Số hóa đơn
      { wch: 15 },  // Ký hiệu
      { wch: 18 },  // Ngày lập
      { wch: 30 },  // Tên người bán
      { wch: 15 },  // MST người bán
      { wch: 30 },  // Tên người mua
      { wch: 15 },  // MST người mua
      { wch: 18 },  // Tiền chưa thuế
      { wch: 15 },  // Tiền thuế
      { wch: 18 },  // Tổng thanh toán
      { wch: 12 },  // Đơn vị tiền tệ
      { wch: 12 },  // Trạng thái
      { wch: 20 },  // Phương thức thanh toán
      { wch: 35 },  // Địa chỉ người bán
      { wch: 35 }   // Địa chỉ người mua
    ];
    ws['!cols'] = colWidths;

    // Format header row
    const headerRange = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!ws[cellAddress]) continue;
      
      ws[cellAddress].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '366092' } },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: {
          top: { style: 'thin', color: { rgb: '000000' } },
          bottom: { style: 'thin', color: { rgb: '000000' } },
          left: { style: 'thin', color: { rgb: '000000' } },
          right: { style: 'thin', color: { rgb: '000000' } }
        }
      };
    }

    // Format currency columns
    for (let row = 1; row <= headerRange.e.r; row++) {
      // Format currency columns (columns 8, 9, 10 = H, I, J)
      [8, 9, 10].forEach(col => {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        if (ws[cellAddress] && typeof ws[cellAddress].v === 'number') {
          ws[cellAddress].z = '#,##0';
          ws[cellAddress].s = {
            alignment: { horizontal: 'right' },
            numFmt: '#,##0'
          };
        }
      });

      // Format date column (column 3 = D)
      const dateCellAddress = XLSX.utils.encode_cell({ r: row, c: 3 });
      if (ws[dateCellAddress]) {
        ws[dateCellAddress].s = {
          alignment: { horizontal: 'center' }
        };
      }

      // Format STT column (column 0 = A)
      const sttCellAddress = XLSX.utils.encode_cell({ r: row, c: 0 });
      if (ws[sttCellAddress]) {
        ws[sttCellAddress].s = {
          alignment: { horizontal: 'center' }
        };
      }
    }

    // Add borders to all cells
    for (let row = 0; row <= headerRange.e.r; row++) {
      for (let col = 0; col <= headerRange.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        if (!ws[cellAddress]) continue;
        
        if (!ws[cellAddress].s) ws[cellAddress].s = {};
        ws[cellAddress].s.border = {
          top: { style: 'thin', color: { rgb: '000000' } },
          bottom: { style: 'thin', color: { rgb: '000000' } },
          left: { style: 'thin', color: { rgb: '000000' } },
          right: { style: 'thin', color: { rgb: '000000' } }
        };
      }
    }

    XLSX.utils.book_append_sheet(wb, ws, 'Danh sách hóa đơn');
    return wb;
  }

  /**
   * Export invoice data to Excel file
   */
  static exportToExcel(
    invoices: InvoiceData[],
    options: ExportOptions = {}
  ): void {
    try {
      if (!invoices || invoices.length === 0) {
        throw new Error('Không có dữ liệu để xuất');
      }

      const data = this.convertToExcelData(invoices);
      const workbook = this.createWorkbook(data, options);

      // Generate filename
      const currentDate = format(new Date(), 'yyyyMMdd_HHmmss');
      const filename = options.filename || `DanhSachHoaDon_${currentDate}.xlsx`;

      // Write and download file
      XLSX.writeFile(workbook, filename, {
        bookType: 'xlsx',
        type: 'binary'
      });

      console.log(`Đã xuất ${invoices.length} hóa đơn ra file Excel: ${filename}`);
    } catch (error) {
      console.error('Lỗi khi xuất file Excel:', error);
      throw new Error('Không thể xuất file Excel. Vui lòng thử lại.');
    }
  }

  /**
   * Export summary statistics to Excel
   */
  static exportSummaryToExcel(
    invoices: InvoiceData[],
    filename?: string
  ): void {
    try {
      if (!invoices || invoices.length === 0) {
        throw new Error('Không có dữ liệu để xuất');
      }

      // Calculate summary statistics
      const totalInvoices = invoices.length;
      const totalAmountBeforeTax = invoices.reduce((sum, inv) => sum + inv.tgtcthue, 0);
      const totalTaxAmount = invoices.reduce((sum, inv) => sum + inv.tgtthue, 0);
      const totalAmount = invoices.reduce((sum, inv) => sum + inv.tgtttbso, 0);

      const activeInvoices = invoices.filter(inv => inv.tghdon === 'active' || !inv.tghdon);
      const cancelledInvoices = invoices.filter(inv => inv.tghdon === 'cancelled');

      // Create summary data
      const summaryData = [
        ['BÁO CÁO TỔNG HỢP HÓA ĐƠN'],
        [''],
        ['Chỉ tiêu', 'Số lượng', 'Giá trị (VNĐ)'],
        ['Tổng số hóa đơn', totalInvoices, ''],
        ['Hóa đơn hợp lệ', activeInvoices.length, ''],
        ['Hóa đơn đã hủy', cancelledInvoices.length, ''],
        [''],
        ['Tổng tiền chưa thuế', '', this.formatCurrencyForExcel(totalAmountBeforeTax)],
        ['Tổng tiền thuế', '', this.formatCurrencyForExcel(totalTaxAmount)],
        ['Tổng tiền thanh toán', '', this.formatCurrencyForExcel(totalAmount)],
        [''],
        ['Thời gian xuất báo cáo:', format(new Date(), 'dd/MM/yyyy HH:mm:ss', { locale: vi })]
      ];

      const ws = XLSX.utils.aoa_to_sheet(summaryData);
      const wb = XLSX.utils.book_new();

      // Set column widths
      ws['!cols'] = [
        { wch: 25 },
        { wch: 15 },
        { wch: 20 }
      ];

      // Format title row
      ws['A1'].s = {
        font: { bold: true, sz: 16 },
        alignment: { horizontal: 'center', vertical: 'center' }
      };

      // Merge title row
      ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }];

      XLSX.utils.book_append_sheet(wb, ws, 'Tổng hợp');

      const currentDate = format(new Date(), 'yyyyMMdd_HHmmss');
      const exportFilename = filename || `BaoCaoTongHop_${currentDate}.xlsx`;

      XLSX.writeFile(wb, exportFilename);

      console.log(`Đã xuất báo cáo tổng hợp ra file Excel: ${exportFilename}`);
    } catch (error) {
      console.error('Lỗi khi xuất báo cáo tổng hợp:', error);
      throw new Error('Không thể xuất báo cáo tổng hợp. Vui lòng thử lại.');
    }
  }
}

export default ExcelExportService;