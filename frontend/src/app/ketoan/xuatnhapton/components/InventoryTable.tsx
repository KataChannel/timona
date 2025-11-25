import React from 'react';
import { InventoryRow } from '../types';
import { formatCurrency, formatNumber, formatDate } from '../utils';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, Package } from 'lucide-react';

interface InventoryTableProps {
  rows: InventoryRow[];
  currentPage: number;
  itemsPerPage: number;
  loading?: boolean;
  totalRecords?: number;
  isLimited?: boolean;
  searchTerm?: string;
  isSearching?: boolean;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  rows,
  currentPage,
  itemsPerPage,
  loading,
  totalRecords = 0,
  isLimited = false,
  searchTerm = '',
  isSearching = false,
}) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, rows.length);
  const displayRows = rows.slice(startIndex, endIndex);
  console.log('rows',rows);
  
  console.log('📋 InventoryTable render:', { 
    totalRows: rows.length, 
    displayRows: displayRows.length,
    currentPage,
    itemsPerPage,
    startIndex,
    endIndex,
    loading,
    searchTerm,
    isSearching
  });
  
  // Helper function to highlight matching text
  const highlightText = (text: string | null | undefined, searchTerm: string): React.ReactNode => {
    if (!text || !searchTerm) return text || '-';
    
    const lowerText = text.toLowerCase();
    const lowerSearch = searchTerm.toLowerCase();
    const index = lowerText.indexOf(lowerSearch);
    
    if (index === -1) return text;
    
    const before = text.slice(0, index);
    const match = text.slice(index, index + searchTerm.length);
    const after = text.slice(index + searchTerm.length);
    
    return (
      <>
        {before}
        <mark className="bg-yellow-200 dark:bg-yellow-800 font-semibold">{match}</mark>
        {after}
      </>
    );
  };
  
  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-muted-foreground">Đang tải dữ liệu...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (rows.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <Package className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Không có dữ liệu để hiển thị</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      {isLimited && totalRecords > rows.length && (
        <div className="bg-amber-50 dark:bg-amber-950 border-b border-amber-200 dark:border-amber-800 px-4 py-3">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            ⚠️ Hiển thị {rows.length.toLocaleString()} / {totalRecords.toLocaleString()} bản ghi để tối ưu hiệu suất.
            <span className="font-medium"> Sử dụng "Xuất Excel" để xem toàn bộ dữ liệu.</span>
          </p>
        </div>
      )}
      {searchTerm && (
        <div className="bg-blue-50 dark:bg-blue-950 border-b border-blue-200 dark:border-blue-800 px-4 py-3">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            🔍 Tìm kiếm: <span className="font-semibold">"{searchTerm}"</span> - 
            {isSearching ? (
              <span className="ml-2 italic">Đang tìm kiếm...</span>
            ) : (
              <span className="ml-2">Tìm thấy {rows.length.toLocaleString()} kết quả</span>
            )}
          </p>
        </div>
      )}
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">STT</TableHead>
                <TableHead className="w-[120px]">Ngày</TableHead>
                <TableHead className="min-w-[250px]">Tên Sản Phẩm</TableHead>
                <TableHead className="min-w-[250px]">Tên Gốc (Hóa Đơn)</TableHead>
                <TableHead className="w-[120px]">Mã SP</TableHead>
                <TableHead className="w-[80px]">ĐVT</TableHead>
                <TableHead colSpan={2} className="text-center bg-blue-50">Tồn Đầu</TableHead>
                <TableHead colSpan={2} className="text-center bg-green-50">Nhập</TableHead>
                <TableHead colSpan={5} className="text-center bg-orange-50">Xuất</TableHead>
                <TableHead colSpan={2} className="text-center bg-purple-50">Tồn Cuối</TableHead>
              </TableRow>
              <TableRow>
                <TableHead colSpan={6}></TableHead>
                <TableHead className="text-right bg-blue-50">SL</TableHead>
                <TableHead className="text-right bg-blue-50">Thành Tiền</TableHead>
                <TableHead className="text-right bg-green-50">SL</TableHead>
                <TableHead className="text-right bg-green-50">Thành Tiền</TableHead>
                <TableHead className="text-right bg-orange-50">SL</TableHead>
                <TableHead className="text-right bg-orange-50">Giá Vốn</TableHead>
                <TableHead className="text-right bg-orange-50">TT Vốn</TableHead>
                <TableHead className="text-right bg-orange-50">Giá Bán</TableHead>
                <TableHead className="text-right bg-orange-50">TT Bán</TableHead>
                <TableHead className="text-right bg-purple-50">SL</TableHead>
                <TableHead className="text-right bg-purple-50">Thành Tiền</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayRows.map((row, index) => (
                <TableRow 
                  key={`${row.productName}-${row.date}-${index}`}
                  className="animate-in fade-in duration-200"
                  style={{ animationDelay: `${index * 20}ms` }}
                >
                  <TableCell className="font-medium">
                    {startIndex + index + 1}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatDate(row.date)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {highlightText(row.productName, searchTerm)}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {highlightText(row.originalName, searchTerm)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {highlightText(row.productCode, searchTerm)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {highlightText(row.unit, searchTerm)}
                  </TableCell>
                  
                  {/* Tồn Đầu */}
                  <TableCell className="text-right bg-blue-50">
                    {formatNumber(row.openingQuantity)}
                  </TableCell>
                  <TableCell className="text-right text-blue-600 bg-blue-50">
                    {formatCurrency(row.openingAmount)}
                  </TableCell>
                  
                  {/* Nhập */}
                  <TableCell className="text-right bg-green-50">
                    {formatNumber(row.importQuantity)}
                  </TableCell>
                  <TableCell className="text-right text-green-600 bg-green-50">
                    {formatCurrency(row.importAmount)}
                  </TableCell>
                  
                  {/* Xuất - 5 columns */}
                  <TableCell className="text-right bg-orange-50">
                    {formatNumber(row.exportQuantity)}
                  </TableCell>
                  <TableCell className="text-right text-orange-600 bg-orange-50" title="Giá vốn bình quân gia quyền">
                    {formatCurrency(row.exportCostPrice)}
                  </TableCell>
                  <TableCell className="text-right text-orange-600 bg-orange-50" title="Thành tiền vốn">
                    {formatCurrency(row.exportAmount)}
                  </TableCell>
                  <TableCell className="text-right text-orange-700 bg-orange-50" title="Giá bán (từ đơn hàng)">
                    {formatCurrency(row.exportSalePrice)}
                  </TableCell>
                  <TableCell className="text-right text-orange-800 font-medium bg-orange-50" title="Thành tiền bán">
                    {formatCurrency(row.exportSaleAmount)}
                  </TableCell>
                  
                  {/* Tồn Cuối */}
                  <TableCell className="text-right font-semibold bg-purple-50">
                    {formatNumber(row.closingQuantity)}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-purple-600 bg-purple-50">
                    {formatCurrency(row.closingAmount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
