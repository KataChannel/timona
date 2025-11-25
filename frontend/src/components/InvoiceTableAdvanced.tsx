'use client';

import React, { useMemo } from 'react';
import { InvoiceData } from '@/types/invoice';
import { AdvancedTable } from '@/components/ui/advanced-table/AdvancedTable';
import { ColumnDef, RowData } from '@/components/ui/advanced-table/types';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

// Extend InvoiceData to ensure it has required id field
interface InvoiceRowData extends Omit<InvoiceData, 'id'>, RowData {
  id: string | number;
}

interface InvoiceTableAdvancedProps {
  invoices: InvoiceData[];
  loading?: boolean;
  onRowClick?: (invoice: InvoiceData) => void;
  height?: number;
}

const InvoiceTableAdvanced: React.FC<InvoiceTableAdvancedProps> = ({
  invoices,
  loading = false,
  onRowClick,
  height = 600
}) => {
  
  // Format currency helper
  const formatCurrency = (amount: number | undefined | null): string => {
    if (!amount && amount !== 0) return 'N/A';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date helper
  const formatDate = (dateString: string | undefined | null): string => {
    if (!dateString) return 'N/A';
    try {
      let date: Date;
      if (dateString.includes('/')) {
        const [day, month, year] = dateString.split('/');
        date = new Date(`${year}-${month}-${day}`);
      } else {
        date = new Date(dateString);
      }
      return format(date, 'dd/MM/yyyy', { locale: vi });
    } catch (error) {
      return dateString;
    }
  };

  // Define columns for AdvancedTable
  const columns: ColumnDef<InvoiceRowData>[] = useMemo(() => [
    {
      field: 'nbmst' as keyof InvoiceRowData,
      headerName: 'MST Người bán',
      width: 130,
      sortable: true,
      filterable: true,
      resizable: true,
      pinned: 'left',
      cellRenderer: ({ data }) => (data as any).nbmst || 'N/A'
    },
    {
      field: 'khmshdon',
      headerName: 'Ký hiệu mẫu',
      width: 120,
      sortable: true,
      filterable: true,
      resizable: true,
      pinned: 'left',
      cellRenderer: ({ data }) => data.khmshdon || 'N/A'
    },
    {
      field: 'khhdon' as keyof InvoiceRowData,
      headerName: 'Ký hiệu HĐ',
      width: 120,
      filterable: true,
      resizable: true,
      cellRenderer: ({ data }) => (data as any).khhdon || 'N/A'
    },
    {
      field: 'shdon',
      headerName: 'Số HĐ',
      width: 100,
      sortable: true,
      filterable: true,
      resizable: true,
      cellRenderer: ({ data }) => data.shdon || 'N/A',
      cellClass: 'font-medium'
    },
    {
      field: 'cqt' as keyof InvoiceRowData,
      headerName: 'CQT',
      width: 80,
      filterable: true,
      resizable: true,
      cellRenderer: ({ data }) => (data as any).cqt || 'N/A'
    },
    {
      field: 'nbdchi' as keyof InvoiceRowData,
      headerName: 'Địa chỉ NB',
      width: 200,
      filterable: true,
      resizable: true,
      cellRenderer: ({ data }) => (data as any).nbdchi || 'N/A'
    },
    {
      field: 'nbten' as keyof InvoiceRowData,
      headerName: 'Tên NB',
      width: 200,
      filterable: true,
      resizable: true,
      cellRenderer: ({ data }) => (data as any).nbten || 'N/A'
    },
    {
      field: 'nmdchi' as keyof InvoiceRowData,
      headerName: 'Địa chỉ NM',
      width: 200,
      filterable: true,
      resizable: true,
      cellRenderer: ({ data }) => (data as any).nmdchi || 'N/A'
    },
    {
      field: 'nmmst' as keyof InvoiceRowData,
      headerName: 'MST NM',
      width: 130,
      filterable: true,
      resizable: true,
      cellRenderer: ({ data }) => (data as any).nmmst || 'N/A'
    },
    {
      field: 'nmten' as keyof InvoiceRowData,
      headerName: 'Tên NM',
      width: 200,
      filterable: true,
      resizable: true,
      cellRenderer: ({ data }) => (data as any).nmten || 'N/A'
    },
    {
      field: 'nmtnmua' as keyof InvoiceRowData,
      headerName: 'Tên NM mua',
      width: 200,
      filterable: true,
      resizable: true,
      cellRenderer: ({ data }) => (data as any).nmtnmua || 'N/A'
    },
    {
      field: 'tgtcthue',
      headerName: 'Tiền chưa thuế',
      width: 150,
      type: 'number',
      sortable: true,
      filterable: true,
      resizable: true,
      cellRenderer: ({ data }) => (
        <div className="text-right font-medium">
          {formatCurrency(data.tgtcthue)}
        </div>
      )
    },
    {
      field: 'tgtthue',
      headerName: 'Tiền thuế',
      width: 150,
      type: 'number',
      sortable: true,
      filterable: true,
      resizable: true,
      cellRenderer: ({ data }) => (
        <div className="text-right font-medium">
          {formatCurrency(data.tgtthue)}
        </div>
      )
    },
    {
      field: 'tgtttbso',
      headerName: 'Tổng TT (số)',
      width: 150,
      type: 'number',
      sortable: true,
      filterable: true,
      resizable: true,
      pinned: 'right',
      cellRenderer: ({ data }) => (
        <div className="text-right font-bold text-blue-600">
          {formatCurrency(data.tgtttbso)}
        </div>
      )
    },
    {
      field: 'tgtttbchu' as keyof InvoiceRowData,
      headerName: 'Tổng TT (chữ)',
      width: 200,
      resizable: true,
      cellRenderer: ({ data }) => (data as any).tgtttbchu || 'N/A'
    },
    {
      field: 'thlap' as keyof InvoiceRowData,
      headerName: 'Thời điểm lập',
      width: 150,
      sortable: true,
      filterable: true,
      resizable: true,
      cellRenderer: ({ data }) => (data as any).thlap || 'N/A'
    },
    {
      field: 'ttcktmai' as keyof InvoiceRowData,
      headerName: 'CKTM',
      width: 100,
      resizable: true,
      cellRenderer: ({ data }) => (data as any).ttcktmai || 'N/A'
    },
    {
      field: 'tthai' as keyof InvoiceRowData,
      headerName: 'Trạng thái',
      width: 120,
      filterable: true,
      resizable: true,
      cellRenderer: ({ data }) => {
        const status = (data as any).tthai;
        let bgColor = 'bg-yellow-100 text-yellow-800';
        let label = status || 'N/A';
        
        if (status === '1' || status === 'active') {
          bgColor = 'bg-green-100 text-green-800';
          label = 'Hợp lệ';
        } else if (status === '0' || status === 'cancelled') {
          bgColor = 'bg-red-100 text-red-800';
          label = 'Đã hủy';
        }
        
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${bgColor}`}>
            {label}
          </span>
        );
      }
    },
    {
      field: 'tttbao' as keyof InvoiceRowData,
      headerName: 'TT Báo',
      width: 100,
      resizable: true,
      cellRenderer: ({ data }) => (data as any).tttbao || 'N/A'
    },
    {
      field: 'ttxly' as keyof InvoiceRowData,
      headerName: 'TT Xử lý',
      width: 100,
      resizable: true,
      cellRenderer: ({ data }) => (data as any).ttxly || 'N/A'
    }
  ], []);

  // Convert invoices to RowData format (add id if not exists)
  const tableData: InvoiceRowData[] = useMemo(() => {
    return invoices.map((invoice, index) => ({
      ...invoice,
      id: invoice.id || `${invoice.shdon}-${invoice.khmshdon}-${index}`
    })) as InvoiceRowData[];
  }, [invoices]);

  // Handle row selection
  const handleRowSelect = (selectedRows: InvoiceRowData[]) => {
    if (selectedRows.length === 1 && onRowClick) {
      onRowClick(selectedRows[0] as InvoiceData);
    }
  };

  return (
    <div className="w-full">
      <AdvancedTable<InvoiceRowData>
        columns={columns}
        data={tableData}
        loading={loading}
        height={height}
        config={{
          enableSorting: true,
          enableFiltering: true,
          enableColumnPinning: true,
          enableColumnResizing: true,
          enableColumnHiding: true,
          enableRowSelection: true,
          enableInlineEditing: false,
          enableDialogEditing: false,
          enableRowDeletion: false,
          showToolbar: true,
          showPagination: false,
          virtualScrolling: true,
          rowHeight: 48,
          headerHeight: 48
        }}
        onRowSelect={handleRowSelect}
        className="border rounded-lg shadow-sm"
      />
    </div>
  );
};

export default InvoiceTableAdvanced;
