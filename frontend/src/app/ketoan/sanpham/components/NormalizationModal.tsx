import React, { useState } from 'react';
import { Play, Loader2 } from 'lucide-react';

interface NormalizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNormalize: (dryRun: boolean, limit: number) => Promise<void>;
  loading: boolean;
}

export const NormalizationModal: React.FC<NormalizationModalProps> = ({
  isOpen,
  onClose,
  onNormalize,
  loading,
}) => {
  const [mode, setMode] = useState<'preview' | 'update'>('preview');
  const [limit, setLimit] = useState(10);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    await onNormalize(mode === 'preview', limit);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Chuẩn hóa tên sản phẩm
        </h3>

        <div className="space-y-4">
          {/* Mode Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Chế độ
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={mode === 'preview'}
                  onChange={() => setMode('preview')}
                  className="text-blue-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Xem trước (Dry run)
                </span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={mode === 'update'}
                  onChange={() => setMode('update')}
                  className="text-blue-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Cập nhật thực tế
                </span>
              </label>
            </div>
          </div>

          {/* Limit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Số lượng sản phẩm
            </label>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value={10}>10 sản phẩm</option>
              <option value={100}>100 sản phẩm</option>
              <option value={1000}>1000 sản phẩm</option>
              <option value={0}>Tất cả</option>
            </select>
          </div>

          {/* Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Fuzzy Matching với pg_trgm:</strong> Hệ thống sẽ tự động nhóm các sản phẩm có tên tương tự nhau bằng thuật toán fuzzy matching.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                {mode === 'preview' ? 'Xem trước' : 'Chạy ngay'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
