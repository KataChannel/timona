'use client';

import { useState, useRef } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImportResult {
  success: boolean;
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: Array<{
    row: number;
    error: string;
  }>;
  message: string;
  statistics?: {
    totalCategories?: number;
    categoriesCreated?: number;
    categoriesUpdated?: number;
    totalProducts?: number;
    productsCreated?: number;
    productsUpdated?: number;
    validationErrors: number;
  };
}

interface ImportExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  templateUrl: string;
  importUrl: string;
  onImportSuccess?: () => void;
}

export function ImportExportDialog({
  open,
  onOpenChange,
  title,
  description,
  templateUrl,
  importUrl,
  onImportSuccess,
}: ImportExportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.name.match(/\.(xlsx|xls)$/)) {
        toast({
          title: 'Lỗi',
          description: 'Chỉ chấp nhận file Excel (.xlsx, .xls)',
          type: 'error',
        });
        return;
      }
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const backendUrl = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT?.replace('/graphql', '') || 'http://localhost:12001';
      const response = await fetch(`${backendUrl}${templateUrl}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `template_${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Thành công',
        description: 'Đã tải xuống file mẫu',
        type: 'success',
      });
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải file mẫu',
        type: 'error',
      });
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const token = localStorage.getItem('accessToken');
      const backendUrl = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT?.replace('/graphql', '') || 'http://localhost:12001';
      const response = await fetch(`${backendUrl}${importUrl}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      const data = await response.json();
      setResult(data);

      if (data.success) {
        toast({
          title: 'Import thành công',
          description: data.message,
          type: 'success',
        });
        onImportSuccess?.();
      } else {
        toast({
          title: 'Import có lỗi',
          description: data.message,
          type: 'error',
        });
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể import file',
        type: 'error',
      });
      setResult({
        success: false,
        totalRows: 0,
        successCount: 0,
        errorCount: 1,
        errors: [{ row: 0, error: 'Lỗi kết nối server' }],
        message: 'Import thất bại',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    setProgress(0);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4">
          {/* Download Template */}
          <div className="flex items-center gap-2 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            <div className="flex-1">
              <p className="font-medium text-sm">Bước 1: Tải file mẫu</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                File Excel có dữ liệu mẫu và hướng dẫn
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleDownloadTemplate}
            >
              <Download className="w-4 h-4 mr-2" />
              Tải mẫu
            </Button>
          </div>

          {/* Upload File */}
          <div className="space-y-2">
            <p className="font-medium text-sm">Bước 2: Chọn file để import</p>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Upload className="w-4 h-4 mr-2" />
                Chọn file
              </Button>
              {file && (
                <span className="text-sm text-gray-600">
                  {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </span>
              )}
            </div>
          </div>

          {/* Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Đang import...</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-3">
              <Alert className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                <div className="flex items-start gap-2">
                  {result.success ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <AlertDescription className="font-medium">
                      {result.message}
                    </AlertDescription>
                    <div className="mt-2 text-sm space-y-1">
                      <p>Tổng số dòng: {result.totalRows}</p>
                      <p className="text-green-600">✓ Thành công: {result.successCount}</p>
                      {result.errorCount > 0 && (
                        <p className="text-red-600">✗ Lỗi: {result.errorCount}</p>
                      )}
                      {result.statistics && (
                        <div className="mt-2 pt-2 border-t">
                          {result.statistics.categoriesCreated !== undefined && (
                            <p>→ Tạo mới: {result.statistics.categoriesCreated}</p>
                          )}
                          {result.statistics.categoriesUpdated !== undefined && (
                            <p>→ Cập nhật: {result.statistics.categoriesUpdated}</p>
                          )}
                          {result.statistics.productsCreated !== undefined && (
                            <p>→ Tạo mới: {result.statistics.productsCreated}</p>
                          )}
                          {result.statistics.productsUpdated !== undefined && (
                            <p>→ Cập nhật: {result.statistics.productsUpdated}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Alert>

              {/* Error List */}
              {result.errors && result.errors.length > 0 && (
                <div className="max-h-60 overflow-y-auto border rounded-lg p-3 bg-gray-50 dark:bg-gray-900">
                  <p className="font-medium text-sm mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                    Chi tiết lỗi:
                  </p>
                  <div className="space-y-1 text-xs">
                    {result.errors.slice(0, 20).map((error, idx) => (
                      <div key={idx} className="flex gap-2 text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Dòng {error.row}:</span>
                        <span>{error.error}</span>
                      </div>
                    ))}
                    {result.errors.length > 20 && (
                      <p className="text-gray-500 italic pt-1">
                        ... và {result.errors.length - 20} lỗi khác
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Đóng
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={!file || uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang import...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
