'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { FieldMappingDragDrop } from '@/components/FieldMappingDragDrop';
import { 
  FileSpreadsheet, 
  FileText, 
  FileJson, 
  Upload, 
  Eye, 
  Download,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Loader2,
  Info,
  ClipboardPaste,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

interface DataImportProps {
  modelName?: string;
  onImportComplete?: (result: any) => void;
}

interface PreviewData {
  headers: string[];
  rows: any[];
  totalRows: number;
}

interface FieldMapping {
  source: string;
  target: string;
}

type Step = 'input' | 'preview' | 'mapping' | 'import' | 'result';

export function DataImportComponent({ modelName = 'product', onImportComplete }: DataImportProps) {
  const [currentStep, setCurrentStep] = useState<Step>('input');
  const [activeTab, setActiveTab] = useState<'excel' | 'text' | 'json'>('excel');
  const [rawData, setRawData] = useState<string>('');
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [mappingConfig, setMappingConfig] = useState<Record<string, string>>({});
  const [selectedModel, setSelectedModel] = useState(modelName);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  // Progress calculation
  const getProgressPercentage = () => {
    const steps: Step[] = ['input', 'preview', 'mapping', 'import', 'result'];
    const currentIndex = steps.indexOf(currentStep);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  // Step navigation
  const goToStep = (step: Step) => {
    setCurrentStep(step);
  };

  // Paste handler
  const handlePaste = async (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    setRawData(pastedData);
    toast.success('Đã dán dữ liệu! Click "Tiếp tục" để preview.');
  };

  // Parse data based on type
  const parseData = (data: string, type: 'excel' | 'text' | 'json') => {
    try {
      let parsed: any[] = [];

      if (type === 'json') {
        const jsonData = JSON.parse(data);
        parsed = Array.isArray(jsonData) ? jsonData : [jsonData];
      } else if (type === 'text' || type === 'excel') {
        // Parse as TSV/CSV
        const lines = data.trim().split('\n');
        if (lines.length === 0) {
          toast.error('Dữ liệu trống');
          return;
        }

        const headers = lines[0].split('\t');
        parsed = lines.slice(1).map(line => {
          const values = line.split('\t');
          const row: any = {};
          headers.forEach((header, i) => {
            row[header.trim()] = values[i]?.trim() || '';
          });
          return row;
        });

        // Auto-generate field mappings
        const mappings = headers.map(h => ({
          source: h.trim(),
          target: h.trim().toLowerCase().replace(/\s+/g, '_')
        }));
        setFieldMappings(mappings);
      }

      // Set preview
      if (parsed.length > 0) {
        setPreviewData({
          headers: Object.keys(parsed[0]),
          rows: parsed.slice(0, 10), // Preview first 10 rows
          totalRows: parsed.length
        });
        toast.success(`Đã parse ${parsed.length} dòng dữ liệu`);
        setCurrentStep('preview');
      }
    } catch (error: any) {
      toast.error(`Lỗi parse dữ liệu: ${error.message}`);
    }
  };

  // Handle preview and go to next step
  const handlePreview = () => {
    if (!rawData.trim()) {
      toast.error('Vui lòng nhập hoặc paste dữ liệu');
      return;
    }
    parseData(rawData, activeTab);
  };

  // File upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target?.result as string;
      setRawData(data);
      
      if (file.name.endsWith('.json')) {
        setActiveTab('json');
        parseData(data, 'json');
      } else {
        setActiveTab('text');
        parseData(data, 'text');
      }
    };
    reader.readAsText(file);
  };

  // Update field mapping
  const updateMapping = (index: number, field: 'source' | 'target', value: string) => {
    const newMappings = [...fieldMappings];
    newMappings[index][field] = value;
    setFieldMappings(newMappings);
  };

  // Import data
  const handleImport = async () => {
    if (!previewData) {
      toast.error('Không có dữ liệu để import');
      return;
    }

    if (Object.keys(mappingConfig).length === 0) {
      toast.error('Vui lòng mapping các trường dữ liệu');
      return;
    }

    setIsImporting(true);
    setCurrentStep('import');
    
    try {
      // Parse lại toàn bộ data
      let allData: any[] = [];
      
      if (activeTab === 'json') {
        const jsonData = JSON.parse(rawData);
        allData = Array.isArray(jsonData) ? jsonData : [jsonData];
      } else {
        const lines = rawData.trim().split('\n');
        const headers = lines[0].split('\t');
        allData = lines.slice(1).map(line => {
          const values = line.split('\t');
          const row: any = {};
          headers.forEach((header, i) => {
            row[header.trim()] = values[i]?.trim() || '';
          });
          return row;
        });
      }

      // Apply field mappings từ drag-drop
      const mappedData = allData.map(row => {
        const mapped: any = {};
        Object.entries(mappingConfig).forEach(([source, target]) => {
          mapped[target] = row[source];
        });
        return mapped;
      });

      // TODO: Call GraphQL API
      const mockResult = {
        success: true,
        totalRows: mappedData.length,
        successRows: mappedData.length,
        errors: []
      };

      setImportResult(mockResult);
      setCurrentStep('result');
      toast.success(`Import thành công ${mockResult.successRows}/${mockResult.totalRows} dòng`);
      
      if (onImportComplete) {
        onImportComplete(mockResult);
      }
    } catch (error: any) {
      toast.error(`Lỗi import: ${error.message}`);
      setCurrentStep('mapping');
    } finally {
      setIsImporting(false);
    }
  };

  // Render step indicator
  const renderStepIndicator = () => {
    const steps = [
      { id: 'input', label: 'Nhập dữ liệu', icon: ClipboardPaste },
      { id: 'preview', label: 'Xem trước', icon: Eye },
      { id: 'mapping', label: 'Mapping', icon: ArrowRight },
      { id: 'result', label: 'Kết quả', icon: CheckCircle2 },
    ];

    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = steps.findIndex(s => s.id === currentStep) > index;
            
            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : isCompleted 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-xs mt-1 text-center hidden sm:block ${
                    isActive ? 'font-bold' : ''
                  }`}>
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-2 transition-colors ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
        <Progress value={getProgressPercentage()} className="h-2" />
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Step 1: Input Data */}
      {currentStep === 'input' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardPaste className="h-5 w-5" />
              Bước 1: Nhập Dữ Liệu
            </CardTitle>
            <CardDescription>
              Chọn loại dữ liệu và paste từ Excel, CSV, JSON hoặc upload file
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Model Selection */}
            <div className="space-y-2">
              <Label>Chọn bảng dữ liệu</Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Product">Sản phẩm (Product)</SelectItem>
                  <SelectItem value="Category">Danh mục (Category)</SelectItem>
                  <SelectItem value="Post">Bài viết (Post)</SelectItem>
                  <SelectItem value="User">Người dùng (User)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tabs for different input types */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="excel" className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  <span className="hidden sm:inline">Excel</span>
                </TabsTrigger>
                <TabsTrigger value="text" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Text/CSV</span>
                </TabsTrigger>
                <TabsTrigger value="json" className="flex items-center gap-2">
                  <FileJson className="h-4 w-4" />
                  <span className="hidden sm:inline">JSON</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="excel" className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Cách làm:</strong> Mở Excel → Select cells (bao gồm header) → Copy (Ctrl+C) → Paste vào ô dưới (Ctrl+V)
                  </AlertDescription>
                </Alert>
                <div className="space-y-2">
                  <Label>Dữ liệu từ Excel</Label>
                  <Textarea
                    placeholder="Paste dữ liệu từ Excel vào đây... (Ctrl+V)"
                    value={rawData}
                    onChange={(e) => setRawData(e.target.value)}
                    onPaste={handlePaste}
                    className="min-h-[250px] font-mono text-sm"
                  />
                  <div className="text-xs text-muted-foreground">
                    {rawData ? `${rawData.split('\n').length} dòng` : 'Chưa có dữ liệu'}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="text" className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Upload file .txt hoặc .csv</strong> hoặc paste dữ liệu text trực tiếp
                  </AlertDescription>
                </Alert>
                <Input
                  type="file"
                  accept=".txt,.csv"
                  onChange={handleFileUpload}
                  className="mb-2"
                />
                <div className="space-y-2">
                  <Label>Dữ liệu Text/CSV</Label>
                  <Textarea
                    placeholder="Paste dữ liệu text/CSV vào đây..."
                    value={rawData}
                    onChange={(e) => setRawData(e.target.value)}
                    onPaste={handlePaste}
                    className="min-h-[250px] font-mono text-sm"
                  />
                </div>
              </TabsContent>

              <TabsContent value="json" className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Upload file .json</strong> hoặc paste JSON array/object
                  </AlertDescription>
                </Alert>
                <Input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="mb-2"
                />
                <div className="space-y-2">
                  <Label>JSON Data</Label>
                  <Textarea
                    placeholder='[{"name": "Product 1", "price": 100}]'
                    value={rawData}
                    onChange={(e) => setRawData(e.target.value)}
                    onPaste={handlePaste}
                    className="min-h-[250px] font-mono text-sm"
                  />
                </div>
              </TabsContent>
            </Tabs>

            <Button 
              onClick={handlePreview}
              className="w-full"
              size="lg"
              disabled={!rawData.trim()}
            >
              Tiếp tục - Xem trước dữ liệu
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Preview Data */}
      {currentStep === 'preview' && previewData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Bước 2: Xem Trước Dữ Liệu
                </CardTitle>
                <CardDescription>
                  Kiểm tra dữ liệu đã đúng chưa. Showing {previewData.rows.length} / {previewData.totalRows} dòng
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-lg px-4 py-2">
                {previewData.totalRows} dòng
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Data Preview Table */}
            <div className="border rounded-lg overflow-auto max-h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    {previewData.headers.map((header, i) => (
                      <TableHead key={i} className="font-bold">{header}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.rows.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{i + 1}</TableCell>
                      {previewData.headers.map((header, j) => (
                        <TableCell key={j} className="font-mono text-xs">
                          {row[header]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => setCurrentStep('input')}
                className="flex-1"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại
              </Button>
              <Button 
                onClick={() => setCurrentStep('mapping')}
                className="flex-1"
                size="lg"
              >
                Tiếp tục - Mapping fields
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Field Mapping */}
      {currentStep === 'mapping' && previewData && previewData.headers.length > 0 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="h-5 w-5" />
                Bước 3: Mapping Fields (Kéo thả)
              </CardTitle>
              <CardDescription>
                Kéo field từ bên trái sang bên phải để mapping. Field màu cam là bắt buộc.
              </CardDescription>
            </CardHeader>
          </Card>

          <FieldMappingDragDrop
            sourceFields={previewData.headers}
            modelName={selectedModel}
            onMappingChange={setMappingConfig}
          />

          {/* Navigation Buttons */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => setCurrentStep('preview')}
                  className="flex-1"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Quay lại
                </Button>
                <Button 
                  onClick={handleImport}
                  className="flex-1"
                  size="lg"
                  disabled={Object.keys(mappingConfig).length === 0}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Import {previewData.totalRows} dòng
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 4: Importing Progress */}
      {currentStep === 'import' && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-16 h-16 animate-spin text-primary" />
              <div className="text-center">
                <h3 className="text-xl font-bold">Đang import dữ liệu...</h3>
                <p className="text-muted-foreground mt-2">
                  Vui lòng đợi, đang xử lý {previewData?.totalRows} dòng
                </p>
              </div>
              <Progress value={66} className="w-full max-w-md" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Result */}
      {currentStep === 'result' && importResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {importResult.success ? (
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              ) : (
                <XCircle className="h-6 w-6 text-red-500" />
              )}
              {importResult.success ? 'Import Thành Công!' : 'Import Thất Bại'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg text-center">
                <div className="text-3xl font-bold text-blue-600">{importResult.totalRows}</div>
                <div className="text-sm text-muted-foreground">Tổng số dòng</div>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg text-center">
                <div className="text-3xl font-bold text-green-600">{importResult.successRows}</div>
                <div className="text-sm text-muted-foreground">Thành công</div>
              </div>
            </div>

            {importResult.errors && importResult.errors.length > 0 && (
              <Alert className="border-red-500 bg-red-50 dark:bg-red-950">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-900 dark:text-red-100">
                  <strong>Có {importResult.errors.length} lỗi:</strong>
                  <ul className="list-disc list-inside mt-2">
                    {importResult.errors.slice(0, 5).map((error: any, idx: number) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <Button 
              onClick={() => {
                setCurrentStep('input');
                setRawData('');
                setPreviewData(null);
                setMappingConfig({});
                setImportResult(null);
              }}
              className="w-full"
              size="lg"
            >
              Import lại dữ liệu mới
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
