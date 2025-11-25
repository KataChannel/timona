import React, { useState, useEffect } from 'react';
import useSyncInvoices from '@/hooks/useSyncInvoices';
import { InvoiceFilter, InvoiceType } from '@/types/invoice';
import ConfigService from '@/services/configService';

interface InvoiceSyncComponentProps {
  filter?: InvoiceFilter;
  invoiceType?: InvoiceType;
  defaultIncludeDetails?: boolean;
  onSyncComplete?: (result: any) => void;
}

const InvoiceSyncComponent: React.FC<InvoiceSyncComponentProps> = ({
  filter,
  invoiceType,
  defaultIncludeDetails = false,
  onSyncComplete
}) => {
  const {
    isLoading,
    progress,
    result,
    error,
    startSync,
    cancelSync,
    clearError,
    clearResult,
    validateConfiguration,
    getStatistics
  } = useSyncInvoices();

  const [includeDetails, setIncludeDetails] = useState(defaultIncludeDetails);
  const [batchSize, setBatchSize] = useState(10);
  const [configValid, setConfigValid] = useState<boolean | null>(null);
  const [configErrors, setConfigErrors] = useState<string[]>([]);
  const [statistics, setStatistics] = useState<any>(null);

  // Validate configuration on mount
  useEffect(() => {
    const validate = async () => {
      const validation = await validateConfiguration();
      setConfigValid(validation.isValid);
      setConfigErrors(validation.errors);
    };
    
    validate();
  }, [validateConfiguration]);

  // Load statistics
  useEffect(() => {
    const loadStats = async () => {
      const stats = await getStatistics();
      setStatistics(stats);
    };
    
    loadStats();
  }, [getStatistics, result]);

  // Notify parent component when sync completes
  useEffect(() => {
    if (result && onSyncComplete) {
      onSyncComplete(result);
    }
  }, [result, onSyncComplete]);

  const handleStartSync = async () => {
    if (!filter) {
      return;
    }

    // Get Bearer Token from config for detail API authentication
    const config = ConfigService.getConfig();
    const bearerToken = config.bearerToken;

    const options = {
      includeDetails,
      batchSize,
      maxRetries: 3,
      skipExisting: true,
      bearerToken // Pass Bearer Token from frontend config
    };

    await startSync(filter, invoiceType, options);
  };

  const handleCancelSync = () => {
    cancelSync();
  };

  const getProgressPercentage = (): number => {
    if (!progress || progress.totalInvoices === 0) return 0;
    return Math.round((progress.processedInvoices / progress.totalInvoices) * 100);
  };

  const getStatusIcon = () => {
    if (isLoading) return '🔄';
    if (error) return '❌';
    if (result?.success) return '✅';
    return 'ℹ️';
  };

  const getStatusText = () => {
    if (isLoading) return 'Đang đồng bộ...';
    if (error) return 'Có lỗi xảy ra';
    if (result?.success) return 'Đồng bộ thành công';
    return 'Sẵn sàng đồng bộ';
  };

  const styles = {
    container: {
      padding: '24px',
      fontFamily: 'Arial, sans-serif'
    },
    card: {
      border: '1px solid #d9d9d9',
      borderRadius: '6px',
      padding: '16px',
      marginBottom: '16px',
      backgroundColor: '#fff'
    },
    cardTitle: {
      fontSize: '16px',
      fontWeight: 'bold',
      marginBottom: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    button: {
      padding: '8px 16px',
      border: '1px solid #d9d9d9',
      borderRadius: '4px',
      backgroundColor: '#fff',
      cursor: 'pointer'
    },
    primaryButton: {
      backgroundColor: '#1890ff',
      color: '#fff',
      border: '1px solid #1890ff'
    },
    dangerButton: {
      backgroundColor: '#ff4d4f',
      color: '#fff',
      border: '1px solid #ff4d4f'
    },
    disabledButton: {
      backgroundColor: '#f5f5f5',
      color: '#bfbfbf',
      cursor: 'not-allowed'
    },
    alert: {
      padding: '12px',
      borderRadius: '4px',
      marginBottom: '16px'
    },
    alertSuccess: {
      backgroundColor: '#f6ffed',
      border: '1px solid #b7eb8f',
      color: '#389e0d'
    },
    alertError: {
      backgroundColor: '#fff2f0',
      border: '1px solid #ffccc7',
      color: '#cf1322'
    },
    alertWarning: {
      backgroundColor: '#fffbe6',
      border: '1px solid #ffe58f',
      color: '#d48806'
    },
    progress: {
      width: '100%',
      height: '8px',
      backgroundColor: '#f5f5f5',
      borderRadius: '4px',
      overflow: 'hidden'
    },
    progressBar: {
      height: '100%',
      backgroundColor: '#1890ff',
      transition: 'width 0.3s ease'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px'
    },
    statistic: {
      textAlign: 'center' as const,
      padding: '12px',
      border: '1px solid #f0f0f0',
      borderRadius: '4px'
    },
    statisticTitle: {
      fontSize: '12px',
      color: '#666',
      marginBottom: '4px'
    },
    statisticValue: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#262626'
    }
  };

  return (
    <div style={styles.container}>
      {/* Configuration Status */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>Trạng thái cấu hình</div>
        {configValid === null ? (
          <div>Đang kiểm tra...</div>
        ) : configValid ? (
          <div style={{...styles.alert, ...styles.alertSuccess}}>
            ✅ Cấu hình hợp lệ
          </div>
        ) : (
          <div style={{...styles.alert, ...styles.alertError}}>
            ❌ Cấu hình không hợp lệ
            <ul style={{ marginTop: '8px' }}>
              {configErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Database Statistics */}
      {statistics?.databaseStats && (
        <div style={styles.card}>
          <div style={styles.cardTitle}>Thống kê cơ sở dữ liệu</div>
          <div style={styles.grid}>
            <div style={styles.statistic}>
              <div style={styles.statisticTitle}>Tổng hóa đơn</div>
              <div style={styles.statisticValue}>{statistics.databaseStats.totalInvoices}</div>
            </div>
            <div style={styles.statistic}>
              <div style={styles.statisticTitle}>Tổng chi tiết</div>
              <div style={styles.statisticValue}>{statistics.databaseStats.totalDetails}</div>
            </div>
            <div style={styles.statistic}>
              <div style={styles.statisticTitle}>Tổng tiền</div>
              <div style={styles.statisticValue}>
                {(statistics.databaseStats.totalAmount || 0).toLocaleString('vi-VN')}₫
              </div>
            </div>
            <div style={styles.statistic}>
              <div style={styles.statisticTitle}>Tổng thuế</div>
              <div style={styles.statisticValue}>
                {(statistics.databaseStats.totalTax || 0).toLocaleString('vi-VN')}₫
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Sync Card */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>
          {getStatusIcon()} Đồng bộ hóa đơn
          <div style={{ marginLeft: 'auto' }}>
            {isLoading ? (
              <button
                style={{...styles.button, ...styles.dangerButton}}
                onClick={handleCancelSync}
              >
                ❌ Hủy
              </button>
            ) : (
              <button
                style={{
                  ...styles.button,
                  ...(configValid && filter ? styles.primaryButton : styles.disabledButton)
                }}
                onClick={handleStartSync}
                disabled={!configValid || !filter}
              >
                🔄 Bắt đầu đồng bộ
              </button>
            )}
          </div>
        </div>

        {/* Settings */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ marginBottom: '8px' }}>
            <label>
              <input
                type="checkbox"
                checked={includeDetails}
                onChange={(e) => setIncludeDetails(e.target.checked)}
                disabled={isLoading}
              />
              {' '}Bao gồm chi tiết hóa đơn
            </label>
          </div>
          
          <div>
            <label>
              Kích thước batch: 
              <input
                type="number"
                value={batchSize}
                onChange={(e) => setBatchSize(parseInt(e.target.value) || 10)}
                min={1}
                max={50}
                style={{ marginLeft: '8px', width: '80px' }}
                disabled={isLoading}
              />
            </label>
          </div>
        </div>

        <hr style={{ margin: '16px 0', border: '1px solid #f0f0f0' }} />

        {/* Status */}
        <div style={{ marginBottom: '16px' }}>
          <strong>Trạng thái: </strong>
          <span>{getStatusText()}</span>
        </div>

        {/* Progress */}
        {progress && (
          <div style={{ marginBottom: '16px' }}>
            <div style={styles.progress}>
              <div 
                style={{
                  ...styles.progressBar,
                  width: `${getProgressPercentage()}%`
                }}
              />
            </div>
            <div style={{ marginTop: '4px', fontSize: '12px', textAlign: 'center' }}>
              {progress.processedInvoices}/{progress.totalInvoices} ({getProgressPercentage()}%)
            </div>
            
            {progress.currentBatch && progress.totalBatches && (
              <div style={{ marginTop: '4px', fontSize: '12px', color: '#666', textAlign: 'center' }}>
                Batch {progress.currentBatch}/{progress.totalBatches}
              </div>
            )}
          </div>
        )}

        {/* Error Messages */}
        {error && (
          <div style={{...styles.alert, ...styles.alertError}}>
            <strong>Lỗi đồng bộ:</strong> {error}
            <button
              onClick={clearError}
              style={{
                float: 'right' as const,
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              ❌
            </button>
          </div>
        )}

        {/* Success Result */}
        {result && result.success && (
          <div style={{...styles.alert, ...styles.alertSuccess}}>
            <strong>Đồng bộ thành công:</strong> {result.message}
            <button
              onClick={clearResult}
              style={{
                float: 'right' as const,
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              ❌
            </button>
          </div>
        )}

        {/* Error Result */}
        {result && !result.success && (
          <div style={{...styles.alert, ...styles.alertWarning}}>
            <strong>Đồng bộ có lỗi:</strong> {result.message}
            {result.errors.length > 0 && (
              <details style={{ marginTop: '8px' }}>
                <summary>Chi tiết lỗi ({result.errors.length})</summary>
                <ul style={{ marginTop: '8px' }}>
                  {result.errors.map((err, index) => (
                    <li key={index}>{err}</li>
                  ))}
                </ul>
              </details>
            )}
            <button
              onClick={clearResult}
              style={{
                float: 'right' as const,
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              ❌
            </button>
          </div>
        )}

        {/* Result Statistics */}
        {result && (
          <div style={styles.grid}>
            <div style={styles.statistic}>
              <div style={styles.statisticTitle}>Hóa đơn đã lưu</div>
              <div style={{...styles.statisticValue, color: '#52c41a'}}>
                ✅ {result.invoicesSaved}
              </div>
            </div>
            <div style={styles.statistic}>
              <div style={styles.statisticTitle}>Chi tiết đã lưu</div>
              <div style={{...styles.statisticValue, color: '#1890ff'}}>
                ℹ️ {result.detailsSaved}
              </div>
            </div>
            <div style={styles.statistic}>
              <div style={styles.statisticTitle}>Lỗi</div>
              <div style={{...styles.statisticValue, color: '#ff4d4f'}}>
                ❌ {result.errors.length}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceSyncComponent;