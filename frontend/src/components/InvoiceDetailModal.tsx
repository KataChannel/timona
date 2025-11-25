import React from 'react';
import { InvoiceData, ExtListhoadon } from '@/types/invoice';
import { X, FileText, Calendar, User, Building2, Hash, DollarSign, Receipt, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface InvoiceDetailModalProps {
  invoice: InvoiceData | ExtListhoadon | null;
  isOpen: boolean;
  onClose: () => void;
}

const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  invoice,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !invoice) return null;

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string | Date | undefined): string => {
    if (!dateString) return 'N/A';
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      return format(date, 'dd/MM/yyyy HH:mm', { locale: vi });
    } catch {
      return typeof dateString === 'string' ? dateString : 'N/A';
    }
  };

  // Helper to safely get field value
  const getField = (field: string): any => {
    return (invoice as any)?.[field];
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="w-8 h-8" />
                <div>
                  <h2 className="text-2xl font-bold">Chi tiết hóa đơn</h2>
                  <p className="text-blue-100 text-sm">Thông tin đầy đủ về hóa đơn điện tử</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-blue-500 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Invoice Number & Status */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center space-x-2 text-gray-600 mb-2">
                    <Hash className="w-5 h-5" />
                    <span className="text-sm font-medium">Số hóa đơn</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">{invoice.shdon}</p>
                </div>
                <div>
                  <div className="flex items-center space-x-2 text-gray-600 mb-2">
                    <Receipt className="w-5 h-5" />
                    <span className="text-sm font-medium">Ký hiệu hóa đơn</span>
                  </div>
                  <p className="text-xl font-semibold text-gray-900">{getField('khhdon') || invoice.khmshdon}</p>
                </div>
              </div>
            </div>

            {/* Date Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                Thông tin thời gian
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Ngày lập</label>
                  <p className="text-base font-medium text-gray-900">{formatDate(invoice.tdlap)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Thời gian lập</label>
                  <p className="text-base font-medium text-gray-900">{getField('tglap') || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Buyer Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-green-600" />
                Thông tin người mua
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm text-gray-600">Tên người mua</label>
                  <p className="text-base font-medium text-gray-900">{getField('nmten') || getField('tenxmua') || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Mã số thuế</label>
                  <p className="text-base font-medium text-gray-900">{getField('nmmst') || getField('msttmua') || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Địa chỉ</label>
                  <p className="text-base font-medium text-gray-900">{getField('nmdchi') || getField('dcxmua') || getField('dchi') || 'N/A'}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-gray-600">Người mua hàng</label>
                  <p className="text-base font-medium text-gray-900">{getField('nmtnmua') || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Seller Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Building2 className="w-5 h-5 mr-2 text-purple-600" />
                Thông tin người bán
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm text-gray-600">Tên người bán</label>
                  <p className="text-base font-medium text-gray-900">{getField('nbten') || getField('tentcgp') || getField('nten') || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Mã số thuế người bán</label>
                  <p className="text-base font-medium text-gray-900">{invoice.nbmst || getField('msttcgp') || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Địa chỉ người bán</label>
                  <p className="text-base font-medium text-gray-900">{getField('nbdchi') || getField('dctcgp') || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                Thông tin tài chính
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <label className="text-sm text-gray-600">Tổng tiền trước thuế</label>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(getField('tgtcthue') || invoice.tgtcthue || 0)}</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <label className="text-sm text-gray-600">Tiền thuế GTGT</label>
                  <p className="text-xl font-bold text-orange-600">{formatCurrency(invoice.tgtthue || 0)}</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <label className="text-sm text-gray-600">Tổng tiền thanh toán</label>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(invoice.tgtttbso || 0)}</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <label className="text-sm text-gray-600">Hình thức thanh toán</label>
                  <p className="text-base font-medium text-gray-900">{getField('htttt') || getField('pthuc') || 'N/A'}</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <label className="text-sm text-gray-600">Đơn vị tiền tệ</label>
                  <p className="text-base font-medium text-gray-900">{getField('dvtte') || 'VND'}</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <label className="text-sm text-gray-600">Tỷ giá</label>
                  <p className="text-base font-medium text-gray-900">{getField('tgia') || '1'}</p>
                </div>
              </div>
            </div>

            {/* Product Details */}
            {getField('details') && getField('details').length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Receipt className="w-5 h-5 mr-2 text-blue-600" />
                  Chi tiết hàng hóa/dịch vụ ({getField('details').length} mặt hàng)
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">STT</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên hàng hóa</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Số lượng</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ĐVT</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Đơn giá</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getField('details').map((item: any, index: number) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.dten || item.ten || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">{item.dsl || item.sl || 0}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.ddvt || item.dvt || ''}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">{formatCurrency(item.ddgia || item.dgia || 0)}</td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">{formatCurrency(item.dthanhtien || item.tien || 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Technical Information */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin kỹ thuật</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-gray-600">Mã CQT</label>
                  <p className="font-medium text-gray-900">{getField('cqt') || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-gray-600">Ký hiệu mẫu số hóa đơn</label>
                  <p className="font-medium text-gray-900">{invoice.khmshdon || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-gray-600">Trạng thái hóa đơn</label>
                  <p className="font-medium text-gray-900">
                    {getField('thdon') === '1' || getField('tghdon') === '1' ? (
                      <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full">
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Hợp lệ
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 rounded-full">
                        <XCircle className="w-4 h-4 mr-1" />
                        Không hợp lệ
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-gray-600">Loại hóa đơn</label>
                  <p className="font-medium text-gray-900">{getField('khdon') || invoice.shdon || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-gray-600">Mã tra cứu</label>
                  <p className="font-medium text-gray-900 break-all">{getField('mtdiep') || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-gray-600">Trạng thái lập</label>
                  <p className="font-medium text-gray-900">{getField('thlap') || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            {getField('gchu') && (
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ghi chú</h3>
                <p className="text-gray-700">{getField('gchu')}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-xl border-t border-gray-200">
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetailModal;
