'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, X, FileSpreadsheet, TrendingUp, AlertCircle } from 'lucide-react';
import FrontendExcelExportService, { InvoiceExportData, ExcelPreviewData } from '@/services/frontendExcelExport';

interface ExcelPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoices: InvoiceExportData[];
  fromDate?: string;
  toDate?: string;
}

export function ExcelPreviewDialog({
  open,
  onOpenChange,
  invoices,
  fromDate,
  toDate
}: ExcelPreviewDialogProps) {
  const [isExporting, setIsExporting] = useState(false);

  // Generate preview data
  const preview: ExcelPreviewData | null = invoices.length > 0 
    ? FrontendExcelExportService.generatePreview(invoices, 10) 
    : null;

  // Get statistics
  const stats = FrontendExcelExportService.getStatistics(invoices);

  // Validate data
  const validation = FrontendExcelExportService.validateData(invoices);

  // Handle export
  const handleExport = () => {
    try {
      setIsExporting(true);
      
      if (fromDate && toDate) {
        FrontendExcelExportService.exportWithDateRange(invoices, fromDate, toDate);
      } else {
        FrontendExcelExportService.exportToExcel(invoices);
      }
      
      // Show success message
      setTimeout(() => {
        alert(`✅ Xuất thành công ${invoices.length} hóa đơn!`);
        onOpenChange(false);
      }, 500);
      
    } catch (error) {
      console.error('Export error:', error);
      alert('❌ Lỗi khi xuất Excel. Vui lòng thử lại.');
    } finally {
      setIsExporting(false);
    }
  };

  // Format currency for display
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-green-600" />
            Xem trước xuất Excel
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-4 py-4">
          {/* Statistics Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="text-xs text-blue-600 font-medium mb-1">Tổng hóa đơn</div>
              <div className="text-2xl font-bold text-blue-900">{stats.totalInvoices}</div>
            </div>
            
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="text-xs text-green-600 font-medium mb-1">Tổng tiền</div>
              <div className="text-lg font-bold text-green-900 truncate" title={formatCurrency(stats.totalAmount)}>
                {formatCurrency(stats.totalAmount)}
              </div>
            </div>
            
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
              <div className="text-xs text-purple-600 font-medium mb-1">Hợp lệ</div>
              <div className="text-2xl font-bold text-purple-900">{stats.validInvoices}</div>
            </div>
            
            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
              <div className="text-xs text-red-600 font-medium mb-1">Đã hủy</div>
              <div className="text-2xl font-bold text-red-900">{stats.cancelledInvoices}</div>
            </div>
          </div>

          {/* Validation Messages */}
          {validation.warnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-yellow-800 mb-1">Cảnh báo:</div>
                  <ul className="text-xs text-yellow-700 space-y-1">
                    {validation.warnings.map((warning, idx) => (
                      <li key={idx}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {validation.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-red-800 mb-1">Lỗi:</div>
                  <ul className="text-xs text-red-700 space-y-1">
                    {validation.errors.map((error, idx) => (
                      <li key={idx}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Preview Table */}
          {preview && (
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b flex items-center justify-between">
                <div className="font-medium text-sm">
                  Xem trước dữ liệu 
                  <Badge variant="secondary" className="ml-2">
                    {preview.previewRows} / {preview.totalRows} dòng
                  </Badge>
                </div>
                <div className="text-xs text-gray-600">
                  File: {preview.fileName}
                </div>
              </div>

              <div className="overflow-auto max-h-96">
                <table className="w-full text-xs">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      {preview.headers.map((header, idx) => (
                        <th 
                          key={idx} 
                          className="px-2 py-2 text-left font-medium text-gray-700 border-b whitespace-nowrap"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.map((row, rowIdx) => (
                      <tr 
                        key={rowIdx} 
                        className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                      >
                        {row.map((cell, cellIdx) => (
                          <td 
                            key={cellIdx} 
                            className="px-2 py-1.5 border-b text-gray-800 whitespace-nowrap"
                            title={String(cell)}
                          >
                            <div className="max-w-xs truncate">
                              {cell}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {preview.totalRows > preview.previewRows && (
                <div className="bg-gray-50 px-4 py-2 border-t text-xs text-gray-600 text-center">
                  ... và {preview.totalRows - preview.previewRows} dòng nữa
                </div>
              )}
            </div>
          )}

          {/* Export Info */}
          {fromDate && toDate && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-xs font-medium text-blue-800 mb-1">Khoảng thời gian:</div>
              <div className="text-sm text-blue-900">
                Từ <strong>{fromDate}</strong> đến <strong>{toDate}</strong>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0 border-t pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
          >
            <X className="w-4 h-4 mr-2" />
            Hủy
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || !validation.isValid}
            className="bg-green-600 hover:bg-green-700"
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? 'Đang xuất...' : `Xuất Excel (${stats.totalInvoices} hóa đơn)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
