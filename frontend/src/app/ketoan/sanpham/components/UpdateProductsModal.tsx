import React, { useState } from 'react';
import { X, PackagePlus, AlertTriangle } from 'lucide-react';

interface UpdateProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (dryRun: boolean, limit: number) => Promise<void>;
  loading: boolean;
}

export const UpdateProductsModal: React.FC<UpdateProductsModalProps> = ({
  isOpen,
  onClose,
  onUpdate,
  loading,
}) => {
  const [mode, setMode] = useState<'preview' | 'update'>('preview');
  const [limit, setLimit] = useState(100);

  const handleUpdate = async () => {
    const dryRun = mode === 'preview';
    await onUpdate(dryRun, limit);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <PackagePlus className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Cập Nhật Sản Phẩm
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
              Chức năng
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-300">
              Tự động đồng bộ sản phẩm từ <strong>ext_detailhoadon</strong> sang{' '}
              <strong>ext_sanphamhoadon</strong>.
            </p>
            <ul className="mt-2 text-sm text-blue-800 dark:text-blue-300 list-disc list-inside space-y-1">
              <li>Tạo sản phẩm mới nếu chưa tồn tại</li>
              <li>Cập nhật thông tin nếu đã có</li>
              <li>Tự động sinh mã sản phẩm từ tên</li>
              <li>Tự động chuẩn hóa tên sản phẩm (ten2) bằng fuzzy matching</li>
            </ul>
          </div>

          {/* Mode Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Chế độ thực thi
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setMode('preview')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  mode === 'preview'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                }`}
              >
                <div className="text-left">
                  <div className="font-medium text-gray-900 dark:text-white">
                    Xem trước
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Chỉ hiển thị thay đổi, không lưu vào database
                  </div>
                </div>
              </button>

              <button
                onClick={() => setMode('update')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  mode === 'update'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                }`}
              >
                <div className="text-left">
                  <div className="font-medium text-gray-900 dark:text-white">
                    Cập nhật
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Thực hiện và lưu thay đổi vào database
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Limit Setting */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Giới hạn số lượng (để test)
            </label>
            <input
              type="number"
              value={limit}
              onChange={(e) => setLimit(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              max="10000"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Bỏ trống hoặc nhập số lớn để xử lý tất cả
            </p>
          </div>

          {/* Warning for Update Mode */}
          {mode === 'update' && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-900 dark:text-yellow-200">
                    Cảnh báo
                  </h4>
                  <p className="text-sm text-yellow-800 dark:text-yellow-300 mt-1">
                    Chế độ cập nhật sẽ thay đổi dữ liệu trong database. Hãy đảm bảo bạn đã
                    kiểm tra ở chế độ xem trước trước khi thực hiện.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={handleUpdate}
            disabled={loading}
            className={`px-6 py-2 rounded-lg text-white disabled:opacity-50 flex items-center gap-2 ${
              mode === 'preview'
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {loading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Đang xử lý...
              </>
            ) : (
              <>
                <PackagePlus className="h-4 w-4" />
                {mode === 'preview' ? 'Xem trước' : 'Cập nhật ngay'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
