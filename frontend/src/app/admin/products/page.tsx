'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useProducts, useDeleteProduct } from '@/hooks/useProducts';
import { Product, GetProductsInput } from '@/graphql/product.queries';
import { DataImportComponent } from '@/components/DataImport';
import { ImportExportDialog } from '@/components/admin/ImportExportDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AdvancedTable, ColumnDef, TableConfig, FilterCondition, SortConfig } from '@/components/ui/advanced-table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Loader2,
  Download,
  Upload,
  FileSpreadsheet,
  Info,
  Package,
  DollarSign,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useActiveCategories } from '@/hooks/useCategories';
import { toast } from 'sonner';
// Helper to get full image URL
const getImageUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:13001';
  return `${apiBase}${url.startsWith('/') ? '' : '/'}${url}`;
};

// Extend Product - keep string id for uniqueness
interface ProductRow extends Product {
  // id is already string | number compatible with RowData
}

export default function ProductsPage() {
  const router = useRouter();
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showExcelImportDialog, setShowExcelImportDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<ProductRow[]>([]);

  // State for GraphQL filters
  const [filters, setFilters] = useState<GetProductsInput>({
    page: 1,
    limit: 50,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    filters: {}
  });

  const { products, pagination, loading, error, refetch } = useProducts(filters);
  const { categories } = useActiveCategories();
  const deleteProduct = useDeleteProduct();

  // Convert products to ProductRow format (keep string id for uniqueness)
  const productRows = useMemo<ProductRow[]>(() => 
    products.map(p => ({ ...p })),
    [products]
  );

  // Stats calculation
  const stats = useMemo(() => {
    return {
      total: pagination?.total || 0,
      active: products.filter(p => p.status === 'active').length,
      outOfStock: products.filter(p => p.status === 'out_of_stock').length,
      draft: products.filter(p => p.status === 'draft').length,
    };
  }, [products, pagination]);

  // Column definitions with Mobile First responsive design
  const columns: ColumnDef<ProductRow>[] = [
    {
      field: 'thumbnail',
      headerName: 'Hình ảnh',
      width: 100,
      pinned: 'left',
      sortable: false,
      filterable: false,
      cellRenderer: ({ value, data }) => (
        <div className="flex items-center justify-center p-1">
          {value ? (
            <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-md overflow-hidden border">
              <Image
                src={getImageUrl(value)}
                alt={data.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 48px, 64px"
              />
            </div>
          ) : (
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-md bg-gray-100 flex items-center justify-center">
              <Package className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
            </div>
          )}
        </div>
      ),
    },
    {
      field: 'name',
      headerName: 'Tên sản phẩm',
      width: 250,
      minWidth: 200,
      sortable: true,
      filterable: true,
      resizable: true,
      cellRenderer: ({ value }) => (
        <div className="font-medium text-sm sm:text-base line-clamp-2">
          {value}
        </div>
      ),
    },
    {
      field: 'category',
      headerName: 'Danh mục',
      width: 150,
      type: 'select',
      sortable: true,
      filterable: true,
      filterOptions: categories.map(c => c.name),
      cellRenderer: ({ value }) => value?.name || '-',
    },
    {
      field: 'price',
      headerName: 'Giá',
      width: 120,
      type: 'number',
      sortable: true,
      filterable: true,
      cellRenderer: ({ value }) => (
        <div className="font-semibold text-sm sm:text-base text-green-600">
          {new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
          }).format(value || 0)}
        </div>
      ),
    },
    {
      field: 'stock',
      headerName: 'Tồn kho',
      width: 100,
      type: 'number',
      sortable: true,
      filterable: true,
      cellRenderer: ({ value }) => (
        <div className={`text-center font-medium text-sm sm:text-base ${
          value === 0 ? 'text-red-600' : value < 10 ? 'text-yellow-600' : 'text-green-600'
        }`}>
          {value || 0}
        </div>
      ),
    },
    {
      field: 'status',
      headerName: 'Trạng thái',
      width: 130,
      type: 'select',
      sortable: true,
      filterable: true,
      filterOptions: ['active', 'draft', 'out_of_stock', 'archived'],
      pinned: 'right',
      cellRenderer: ({ value }) => {
        const statusConfig = {
          active: { label: 'Hoạt động', variant: 'default' as const, icon: Package },
          draft: { label: 'Nháp', variant: 'secondary' as const, icon: FileText },
          out_of_stock: { label: 'Hết hàng', variant: 'destructive' as const, icon: AlertCircle },
          archived: { label: 'Lưu trữ', variant: 'outline' as const, icon: Package },
        };
        
        const config = statusConfig[value as keyof typeof statusConfig] || statusConfig.draft;
        const Icon = config.icon;
        
        return (
          <Badge variant={config.variant} className="text-xs sm:text-sm">
            <Icon className="w-3 h-3 mr-1 hidden sm:inline" />
            {config.label}
          </Badge>
        );
      },
    },
    {
      field: 'id',
      headerName: 'Thao tác',
      width: 150,
      pinned: 'right',
      sortable: false,
      filterable: false,
      cellRenderer: ({ data }) => (
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/sanpham/${data.slug}`)}
            className="text-xs sm:text-sm p-1 sm:p-2"
          >
            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden lg:inline ml-1">Xem</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/admin/products/${data.id}`)}
            className="text-xs sm:text-sm p-1 sm:p-2"
          >
            <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden lg:inline ml-1">Sửa</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteSingle(data)}
            className="text-xs sm:text-sm p-1 sm:p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden lg:inline ml-1">Xóa</span>
          </Button>
        </div>
      ),
    },
  ];

  // Advanced table configuration - Google Sheets Style
  const tableConfig: TableConfig = {
    enableSorting: true,
    enableFiltering: true,
    enableColumnPinning: true,
    enableColumnResizing: true,
    enableColumnHiding: true,
    enableRowSelection: true,
    enableInlineEditing: false,
    enableRowDeletion: true,
    rowHeight: 36, // Compact Google Sheets style
    headerHeight: 36, // Compact header
    showToolbar: true,
  };

  // Handle advanced table filters and convert to GraphQL format
  const handleTableFilter = useCallback((tableFilters: FilterCondition[]) => {
    const graphqlFilters: GetProductsInput['filters'] = {};

    tableFilters.forEach(filter => {
      const field = filter.field as keyof Product;
      
      switch (filter.operator) {
        case 'contains':
          if (field === 'name') {
            graphqlFilters.search = filter.value;
          }
          break;
        case 'equals':
          if (field === 'status') {
            graphqlFilters.status = filter.value;
          } else if (field === 'category') {
            const category = categories.find(c => c.name === filter.value);
            if (category) {
              graphqlFilters.categoryId = category.id;
            }
          }
          break;
        case 'in':
          if (field === 'status' && Array.isArray(filter.value) && filter.value.length > 0) {
            graphqlFilters.status = filter.value[0]; // Take first for now
          }
          break;
      }
    });

    setFilters(prev => ({ ...prev, filters: graphqlFilters, page: 1 }));
  }, [categories]);

  // Handle advanced table sorting
  const handleTableSort = useCallback((sortConfigs: SortConfig[]) => {
    if (sortConfigs.length > 0) {
      const primarySort = sortConfigs[0];
      setFilters(prev => ({
        ...prev,
        sortBy: primarySort.field,
        sortOrder: primarySort.direction === 'asc' ? 'asc' : 'desc',
      }));
    }
  }, []);

  // Handle row selection
  const handleRowSelect = useCallback((selectedRows: ProductRow[]) => {
    setSelectedProducts(selectedRows);
  }, []);

  // Handle bulk delete
  const handleBulkDelete = useCallback(async (rows: ProductRow[]): Promise<boolean> => {
    setSelectedProducts(rows);
    setShowDeleteDialog(true);
    return false; // Don't auto-delete, show dialog first
  }, []);

  // Confirm delete
  const confirmDelete = async () => {
    try {
      const deletePromises = selectedProducts.map(product =>
        deleteProduct.deleteProduct(String(product.id))
      );
      
      await Promise.all(deletePromises);
      
      toast.success(`Đã xóa ${selectedProducts.length} sản phẩm thành công`);
      setShowDeleteDialog(false);
      setSelectedProducts([]);
      refetch();
      return true;
    } catch (error: any) {
      toast.error(`Lỗi khi xóa sản phẩm: ${error.message}`);
      return false;
    }
  };

  // Handle delete single product
  const handleDeleteSingle = (product: ProductRow) => {
    setSelectedProducts([product]);
    setShowDeleteDialog(true);
  };

  // Export to CSV
  const handleExport = () => {
    toast.info('Đang xuất dữ liệu...');
    // Will be handled by AdvancedTable's built-in export
  };

  if (error) {
    return (
      <div className="container mx-auto py-4 sm:py-6 lg:py-8 px-4">
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Lỗi khi tải danh sách sản phẩm: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 sm:py-6 lg:py-8 px-4">
      {/* Header - Mobile First */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Quản lý sản phẩm</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Quản lý thông tin sản phẩm của cửa hàng
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            onClick={() => setShowExcelImportDialog(true)}
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none text-xs sm:text-sm"
          >
            <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Import Excel</span>
            <span className="sm:hidden">Import</span>
          </Button>
          <Button
            onClick={() => setShowImportDialog(true)}
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none text-xs sm:text-sm"
          >
            <FileSpreadsheet className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Import JSON</span>
            <span className="sm:hidden">JSON</span>
          </Button>
          <Button
            onClick={() => router.push('/admin/products/new')}
            className="flex-1 sm:flex-none text-xs sm:text-sm"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Thêm mới
          </Button>
        </div>
      </div>

      {/* Stats Cards - Mobile First Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Tổng sản phẩm
            </CardTitle>
            <Package className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Đang hoạt động
            </CardTitle>
            <Package className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Hết hàng
            </CardTitle>
            <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold text-red-600">{stats.outOfStock}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Nháp
            </CardTitle>
            <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold">{stats.draft}</div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Table - Mobile First with horizontal scroll */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <AdvancedTable
              columns={columns}
              data={productRows}
              config={tableConfig}
              onRowSelect={handleRowSelect}
              onRowDelete={handleBulkDelete}
              onFilter={handleTableFilter}
              onSort={handleTableSort}
              height={600}
              className="w-full"
            />
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa {selectedProducts.length} sản phẩm? 
              Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedProducts.slice(0, 3).map(product => (
              <div key={product.id} className="flex items-center gap-2 py-2 border-b last:border-0">
                {product.thumbnail && (
                  <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0">
                    <Image
                      src={getImageUrl(product.thumbnail)}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                )}
                <span className="text-sm truncate flex-1">{product.name}</span>
              </div>
            ))}
            {selectedProducts.length > 3 && (
              <div className="text-sm text-muted-foreground text-center py-2">
                và {selectedProducts.length - 3} sản phẩm khác...
              </div>
            )}
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="w-full sm:w-auto"
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteProduct.loading}
              className="w-full sm:w-auto"
            >
              {deleteProduct.loading && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Excel Import Dialog */}
      <ImportExportDialog
        open={showExcelImportDialog}
        onOpenChange={setShowExcelImportDialog}
        title="Import Sản Phẩm từ Excel"
        description="Tải xuống template Excel, điền thông tin và upload để import sản phẩm hàng loạt"
        templateUrl="/api/products/export-template"
        importUrl="/api/products/import"
        onImportSuccess={() => {
          toast.success('Import sản phẩm thành công!');
          refetch();
        }}
      />

      {/* JSON Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-4xl w-[95vw] sm:w-full max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Import sản phẩm từ JSON</DialogTitle>
            <DialogDescription>
              Kéo thả hoặc chọn file JSON để import dữ liệu sản phẩm
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            <DataImportComponent
              modelName="Product"
              onImportComplete={(result: any) => {
                if (result.success) {
                  toast.success('Import sản phẩm thành công!');
                  setShowImportDialog(false);
                  refetch();
                } else {
                  toast.error('Import thất bại: ' + (result.message || 'Lỗi không xác định'));
                }
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Info Alert - Mobile First */}
      <Alert className="mt-4">
        <Info className="h-4 w-4" />
        <AlertDescription className="text-xs sm:text-sm">
          <strong>Hướng dẫn:</strong> 
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Click vào header cột để sắp xếp</li>
            <li>Sử dụng icon filter trên header để lọc theo cột</li>
            <li>Chọn nhiều sản phẩm và click Delete để xóa hàng loạt</li>
            <li>Click nút "Columns" để ẩn/hiện cột, ghim cột trái/phải</li>
            <li>Kéo viền cột để thay đổi kích thước</li>
            <li>Sử dụng thanh tìm kiếm toàn cục để tìm nhanh</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}
