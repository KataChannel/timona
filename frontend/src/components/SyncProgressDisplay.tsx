import React from 'react';
import { CheckCircle, XCircle, Clock, AlertTriangle, Loader2, FileText, Database } from 'lucide-react';

export interface SyncProgress {
  status: 'idle' | 'fetching' | 'syncing' | 'completed' | 'error';
  currentStep: string;
  totalInvoices: number;
  processedInvoices: number;
  savedInvoices: number;
  skippedInvoices: number;
  failedInvoices: number;
  detailsFetched: number;
  errors: string[];
  startTime?: Date;
  endTime?: Date;
  metadata?: {
    totalProcessed: number;
    durationMs: number;
    durationMinutes: number;
    successRate: number;
    startTime: string;
    endTime: string;
  };
}

interface SyncProgressDisplayProps {
  progress: SyncProgress;
  onClose?: () => void;
}

const SyncProgressDisplay: React.FC<SyncProgressDisplayProps> = ({ progress, onClose }) => {
  const getStatusIcon = () => {
    switch (progress.status) {
      case 'fetching':
      case 'syncing':
        return <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'error':
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return <Clock className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (progress.status) {
      case 'fetching':
      case 'syncing':
        return 'border-blue-500 bg-blue-50';
      case 'completed':
        return 'border-green-500 bg-green-50';
      case 'error':
        return 'border-red-500 bg-red-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  const getProgressPercentage = () => {
    if (progress.totalInvoices === 0) return 0;
    return Math.round((progress.processedInvoices / progress.totalInvoices) * 100);
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
    return `${(ms / 60000).toFixed(2)} phút`;
  };

  const getDuration = () => {
    if (progress.metadata?.durationMs) {
      return formatDuration(progress.metadata.durationMs);
    }
    if (progress.startTime) {
      const endTime = progress.endTime || new Date();
      const duration = endTime.getTime() - progress.startTime.getTime();
      return formatDuration(duration);
    }
    return '0s';
  };

  const percentage = getProgressPercentage();
  const isActive = progress.status === 'fetching' || progress.status === 'syncing';

  return (
    <div className={`border-2 rounded-lg p-6 ${getStatusColor()} transition-all duration-300`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Tiến trình đồng bộ hóa đơn
            </h3>
            <p className="text-sm text-gray-600">{progress.currentStep}</p>
          </div>
        </div>
        {onClose && !isActive && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Progress Bar */}
      {isActive && progress.totalInvoices > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Tiến độ: {progress.processedInvoices}/{progress.totalInvoices}</span>
            <span>{percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300 ease-out"
              style={{ width: `${percentage}%` }}
            >
              <div className="h-full w-full bg-gradient-to-r from-blue-400 to-blue-600 animate-pulse" />
            </div>
          </div>
        </div>
      )}

      {/* Statistics Grid */}
      {progress.totalInvoices > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {/* Total Invoices */}
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-gray-500">Tổng số</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">{progress.totalInvoices}</div>
          </div>

          {/* Saved */}
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-xs text-gray-500">Đã lưu</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{progress.savedInvoices}</div>
          </div>

          {/* Skipped */}
          {progress.skippedInvoices > 0 && (
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                <span className="text-xs text-gray-500">Đã bỏ qua</span>
              </div>
              <div className="text-2xl font-bold text-yellow-600">{progress.skippedInvoices}</div>
            </div>
          )}

          {/* Failed */}
          {progress.failedInvoices > 0 && (
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="flex items-center gap-2 mb-1">
                <XCircle className="w-4 h-4 text-red-500" />
                <span className="text-xs text-gray-500">Thất bại</span>
              </div>
              <div className="text-2xl font-bold text-red-600">{progress.failedInvoices}</div>
            </div>
          )}

          {/* Details Fetched */}
          {progress.detailsFetched > 0 && (
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="flex items-center gap-2 mb-1">
                <Database className="w-4 h-4 text-purple-500" />
                <span className="text-xs text-gray-500">Chi tiết</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">{progress.detailsFetched}</div>
            </div>
          )}
        </div>
      )}

      {/* Completion Summary */}
      {progress.status === 'completed' && progress.metadata && (
        <div className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Kết quả đồng bộ
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Thời gian:</span>
              <span className="font-semibold text-gray-800">{getDuration()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tỷ lệ thành công:</span>
              <span className="font-semibold text-green-600">
                {progress.metadata.successRate.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Đã xử lý:</span>
              <span className="font-semibold text-gray-800">
                {progress.metadata.totalProcessed} hóa đơn
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Chi tiết:</span>
              <span className="font-semibold text-purple-600">
                {progress.detailsFetched} bản ghi
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Duration Display (for active sync) */}
      {isActive && progress.startTime && (
        <div className="text-sm text-gray-600 mb-4">
          <Clock className="w-4 h-4 inline mr-1" />
          Thời gian: {getDuration()}
        </div>
      )}

      {/* Errors Display */}
      {progress.errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            Lỗi ({progress.errors.length})
          </h4>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {progress.errors.map((error, index) => (
              <div key={index} className="text-sm text-red-700 flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                <span className="flex-1">{error}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Success Message */}
      {progress.status === 'completed' && progress.errors.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
          <div>
            <p className="font-semibold text-green-800">Đồng bộ hoàn tất!</p>
            <p className="text-sm text-green-700">
              Đã lưu thành công {progress.savedInvoices} hóa đơn vào cơ sở dữ liệu
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SyncProgressDisplay;
