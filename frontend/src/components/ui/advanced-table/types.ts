export type ColumnType = 'text' | 'number' | 'date' | 'boolean' | 'select' | 'custom';
export type SortDirection = 'asc' | 'desc' | null;
export type FilterType = 'text' | 'number' | 'date' | 'select' | 'boolean';
export type ColumnPinPosition = 'left' | 'right' | null;

export interface FilterCondition {
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'between' | 'in' | 'notIn' | 'isEmpty' | 'isNotEmpty';
  value: any;
  value2?: any; // For 'between' operator
}

export interface SortConfig {
  field: string;
  direction: SortDirection;
  priority: number;
}

export interface ColumnDef<T = any> {
  field: keyof T;
  headerName: string;
  type?: ColumnType;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  resizable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  pinned?: ColumnPinPosition;
  hide?: boolean;
  editable?: boolean;
  cellRenderer?: (params: CellRendererParams<T>) => React.ReactNode;
  cellEditor?: (params: CellEditorParams<T>) => React.ReactNode;
  valueGetter?: (data: T) => any;
  valueSetter?: (data: T, value: any) => T;
  filterOptions?: string[]; // For select type filters
  validation?: (value: any) => string | null;
  headerClass?: string;
  cellClass?: string | ((data: T) => string);
}

export interface CellRendererParams<T = any> {
  value: any;
  data: T;
  field: keyof T;
  rowIndex: number;
  colDef: ColumnDef<T>;
}

export interface CellEditorParams<T = any> {
  value: any;
  data: T;
  field: keyof T;
  rowIndex: number;
  colDef: ColumnDef<T>;
  onValueChange: (value: any) => void;
  onCancel: () => void;
  onSave: () => void;
}

export interface RowData {
  id: string | number;
  [key: string]: any;
}

export interface TableConfig {
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enableColumnPinning?: boolean;
  enableColumnResizing?: boolean;
  enableColumnHiding?: boolean;
  enableRowSelection?: boolean;
  enableInlineEditing?: boolean;
  enableDialogEditing?: boolean;
  enableRowDeletion?: boolean;
  rowHeight?: number;
  headerHeight?: number;
  showToolbar?: boolean;
  showPagination?: boolean;
  pageSize?: number;
  virtualScrolling?: boolean;
}

export interface AdvancedTableProps<T extends RowData = RowData> {
  columns: ColumnDef<T>[];
  data: T[];
  config?: TableConfig;
  loading?: boolean;
  onRowSelect?: (selectedRows: T[]) => void;
  onRowEdit?: (row: T, field: keyof T, newValue: any) => Promise<boolean>;
  onRowCreate?: (newRow: Partial<T>) => Promise<boolean>;
  onRowDelete?: (rows: T[]) => Promise<boolean>;
  onSort?: (sortConfigs: SortConfig[]) => void;
  onFilter?: (filters: FilterCondition[]) => void;
  className?: string;
  height?: number;
}