import axios, { AxiosResponse } from 'axios';
import { ExtDetailhoadon } from '@/types/invoice';
import ConfigService from './configService';

export interface InvoiceDetailParams {
  nbmst: string;    // Mã số thuế người bán
  khhdon: string;   // Ký hiệu hóa đơn
  shdon: string;    // Số hóa đơn
  khmshdon: string; // Ký hiệu mẫu số hóa đơn
}

export interface InvoiceDetailResponse {
  datas: ExtDetailhoadon[];
  success: boolean;
  message?: string;
}

export class InvoiceDetailApiService {
  private static readonly BASE_URL = 'https://hoadondientu.gdt.gov.vn:30000';

  private static createAxiosInstance() {
    const config = ConfigService.getValidatedConfig();
    
    return axios.create({
      baseURL: this.BASE_URL,
      headers: {
        'Authorization': `Bearer ${config.bearerToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 30000, // 30 seconds timeout
    });
  }

  /**
   * Fetch invoice details from external API
   */
  static async fetchInvoiceDetails(params: InvoiceDetailParams): Promise<InvoiceDetailResponse> {
    try {
      const axiosInstance = this.createAxiosInstance();
      
      // Validate required parameters
      if (!params.nbmst || !params.khhdon || !params.shdon || !params.khmshdon) {
        throw new Error('Thiếu thông tin bắt buộc để lấy chi tiết hóa đơn');
      }

      const queryParams = new URLSearchParams({
        nbmst: params.nbmst,
        khhdon: params.khhdon,
        shdon: params.shdon,
        khmshdon: params.khmshdon
      });

      const response: AxiosResponse<InvoiceDetailResponse> = await axiosInstance.get(
        `/query/invoices/detail?${queryParams.toString()}`
      );

      return {
        datas: response.data.datas || [],
        success: true
      };
    } catch (error) {
      console.error('Error fetching invoice details:', error);
      
      // Handle different types of errors
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Token xác thực không hợp lệ hoặc đã hết hạn. Vui lòng cập nhật token trong cấu hình.');
        } else if (error.response?.status === 403) {
          throw new Error('Không có quyền truy cập chi tiết hóa đơn');
        } else if (error.response?.status === 404) {
          throw new Error('Không tìm thấy chi tiết hóa đơn với thông tin đã cung cấp');
        } else if (error.code === 'ECONNABORTED') {
          throw new Error('Kết nối timeout, vui lòng thử lại');
        } else if (error.response?.status && error.response.status >= 500) {
          throw new Error('Lỗi hệ thống phía server, vui lòng thử lại sau');
        }
      }
      
      throw new Error('Không thể tải chi tiết hóa đơn. Vui lòng kiểm tra kết nối internet và thử lại.');
    }
  }

  /**
   * Validate invoice detail parameters
   */
  static validateDetailParams(params: Partial<InvoiceDetailParams>): { isValid: boolean; error?: string } {
    if (!params.nbmst) {
      return { isValid: false, error: 'Mã số thuế người bán là bắt buộc' };
    }

    if (!params.khhdon) {
      return { isValid: false, error: 'Ký hiệu hóa đơn là bắt buộc' };
    }

    if (!params.shdon) {
      return { isValid: false, error: 'Số hóa đơn là bắt buộc' };
    }

    if (!params.khmshdon) {
      return { isValid: false, error: 'Ký hiệu mẫu số hóa đơn là bắt buộc' };
    }

    // Validate MST format (should be 10 or 13 digits)
    const mstRegex = /^\d{10}(\d{3})?$/;
    if (!mstRegex.test(params.nbmst)) {
      return { isValid: false, error: 'Mã số thuế không đúng định dạng (10 hoặc 13 số)' };
    }

    return { isValid: true };
  }

  /**
   * Extract detail parameters from invoice data
   */
  static extractDetailParamsFromInvoice(invoice: any): InvoiceDetailParams | null {
    try {
      // Map from API response fields to detail params
      const nbmst = invoice.nbmst || invoice.msttcgp;
      const khhdon = invoice.khhdon || invoice.khmshdon;
      const shdon = invoice.shdon;
      const khmshdon = invoice.khmshdon;

      if (!nbmst || !khhdon || !shdon || !khmshdon) {
        return null;
      }

      return {
        nbmst,
        khhdon,
        shdon,
        khmshdon
      };
    } catch (error) {
      console.error('Error extracting detail params from invoice:', error);
      return null;
    }
  }

  /**
   * Format invoice detail for display
   */
  static formatInvoiceDetail(detail: ExtDetailhoadon): string {
    const parts = [];
    
    if (detail.stt) parts.push(`STT: ${detail.stt}`);
    if (detail.ten) parts.push(`Tên: ${detail.ten}`);
    if (detail.sluong) parts.push(`SL: ${detail.sluong}`);
    if (detail.dvtinh) parts.push(`ĐVT: ${detail.dvtinh}`);
    if (detail.dgia) parts.push(`Đơn giá: ${this.formatCurrency(detail.dgia)}`);
    if (detail.thtien) parts.push(`Thành tiền: ${this.formatCurrency(detail.thtien)}`);
    
    return parts.join(' | ');
  }

  /**
   * Format currency for Vietnamese locale
   */
  private static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Calculate totals from invoice details
   */
  static calculateTotals(details: ExtDetailhoadon[]): {
    totalAmount: number;
    totalTax: number;
    totalQuantity: number;
    itemCount: number;
  } {
    return details.reduce((totals, detail) => {
      return {
        totalAmount: totals.totalAmount + (detail.thtien || 0),
        totalTax: totals.totalTax + (detail.tthue || 0),
        totalQuantity: totals.totalQuantity + (detail.sluong || 0),
        itemCount: totals.itemCount + 1
      };
    }, {
      totalAmount: 0,
      totalTax: 0,
      totalQuantity: 0,
      itemCount: 0
    });
  }
}

export default InvoiceDetailApiService;