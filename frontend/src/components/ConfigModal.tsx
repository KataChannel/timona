'use client'

import React, { useState, useEffect } from 'react';
import { InvoiceConfig, InvoiceType } from '@/types/invoice';
import ConfigService from '@/services/configService';
import InvoiceApiService from '@/services/invoiceApi';
import { Settings, Save, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigChanged?: () => void;
}

const ConfigModal: React.FC<ConfigModalProps> = ({ isOpen, onClose, onConfigChanged }) => {
  const [config, setConfig] = useState<InvoiceConfig>(ConfigService.getConfig());
  const [showToken, setShowToken] = useState(false);
  const [saving, setSaving] = useState(false);

  const configOptions = InvoiceApiService.getConfigOptions();

  useEffect(() => {
    if (isOpen) {
      setConfig(ConfigService.getConfig());
    }
  }, [isOpen]);

  const handleSave = () => {
    setSaving(true);
    
    // Validate bearer token
    if (!ConfigService.validateBearerToken(config.bearerToken)) {
      toast.error('Token Bearer không hợp lệ');
      setSaving(false);
      return;
    }

    // Validate page size
    if (config.pageSize < 1 || config.pageSize > 1000) {
      toast.error('Kích thước trang phải từ 1 đến 1000');
      setSaving(false);
      return;
    }

    try {
      ConfigService.setConfig(config);
      toast.success('Đã lưu cấu hình thành công');
      onConfigChanged?.();
      onClose();
    } catch (error) {
      toast.error('Không thể lưu cấu hình');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Bạn có chắc chắn muốn khôi phục cấu hình mặc định?')) {
      ConfigService.resetConfig();
      setConfig(ConfigService.getConfig());
      toast.success('Đã khôi phục cấu hình mặc định');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Settings className="w-5 h-5 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Cấu hình hệ thống</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Bearer Token */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bearer Token
            </label>
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                value={config.bearerToken}
                onChange={(e) => setConfig({ ...config, bearerToken: e.target.value })}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập Bearer Token"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Token xác thực để truy cập API hóa đơn điện tử
            </p>
          </div>

          {/* Invoice Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại hóa đơn
            </label>
            <select
              value={config.invoiceType}
              onChange={(e) => setConfig({ ...config, invoiceType: e.target.value as InvoiceType })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {configOptions.invoiceTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              {config.invoiceType === 'banra' 
                ? 'Endpoint: /query/invoices/sold' 
                : 'Endpoint: /query/invoices/purchase'
              }
            </p>
          </div>

          {/* Brand Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên nhãn hàng
            </label>
            <input
              type="text"
              value={config.brandname || ''}
              onChange={(e) => setConfig({ ...config, brandname: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập tên nhãn hàng"
            />
            <p className="text-sm text-gray-500 mt-1">
              Tên nhãn hàng sẽ được lưu cùng với thông tin hóa đơn
            </p>
          </div>

          {/* Page Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số bản ghi trên trang
            </label>
            <select
              value={config.pageSize}
              onChange={(e) => setConfig({ ...config, pageSize: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {configOptions.pageSizes.map(size => (
                <option key={size} value={size}>
                  {size} bản ghi
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Số lượng hóa đơn hiển thị trên mỗi trang
            </p>
          </div>

          {/* API Endpoint (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Endpoint
            </label>
            <input
              type="text"
              value={ConfigService.getApiEndpoint(config.invoiceType)}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
            />
            <p className="text-sm text-gray-500 mt-1">
              Địa chỉ API được sử dụng dựa trên loại hóa đơn
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={handleReset}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Khôi phục mặc định
          </button>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigModal;