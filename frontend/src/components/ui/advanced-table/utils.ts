import { FilterCondition, SortConfig, ColumnDef, RowData } from './types';

export class TableUtils {
  // Sorting utilities
  static applySorting<T extends RowData>(data: T[], sortConfigs: SortConfig[]): T[] {
    if (sortConfigs.length === 0) return data;

    return [...data].sort((a, b) => {
      for (const config of sortConfigs.sort((x, y) => x.priority - y.priority)) {
        const aValue = a[config.field];
        const bValue = b[config.field];
        
        let comparison = 0;
        
        if (aValue == null && bValue == null) comparison = 0;
        else if (aValue == null) comparison = -1;
        else if (bValue == null) comparison = 1;
        else if (typeof aValue === 'string' && typeof bValue === 'string') {
          comparison = aValue.localeCompare(bValue);
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          comparison = aValue - bValue;
        } else if (aValue instanceof Date && bValue instanceof Date) {
          comparison = aValue.getTime() - bValue.getTime();
        } else {
          comparison = String(aValue).localeCompare(String(bValue));
        }
        
        if (comparison !== 0) {
          return config.direction === 'desc' ? -comparison : comparison;
        }
      }
      return 0;
    });
  }

  // Filtering utilities
  static applyFiltering<T extends RowData>(data: T[], filters: FilterCondition[]): T[] {
    if (filters.length === 0) return data;

    return data.filter(row => {
      return filters.every(filter => {
        const value = row[filter.field];
        const filterValue = filter.value;
        
        switch (filter.operator) {
          case 'equals':
            return value === filterValue || String(value) === String(filterValue);
          case 'contains':
            return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
          case 'startsWith':
            return String(value).toLowerCase().startsWith(String(filterValue).toLowerCase());
          case 'endsWith':
            return String(value).toLowerCase().endsWith(String(filterValue).toLowerCase());
          case 'greaterThan':
            return Number(value) > Number(filterValue);
          case 'lessThan':
            return Number(value) < Number(filterValue);
          case 'between':
            return Number(value) >= Number(filterValue) && Number(value) <= Number(filter.value2);
          case 'in':
            if (Array.isArray(filterValue)) {
              return filterValue.some(fv => String(value) === String(fv));
            }
            return filterValue.includes(value);
          case 'notIn':
            if (Array.isArray(filterValue)) {
              return !filterValue.some(fv => String(value) === String(fv));
            }
            return !filterValue.includes(value);
          case 'isEmpty':
            return value === null || value === undefined || value === '';
          case 'isNotEmpty':
            return value !== null && value !== undefined && value !== '';
          default:
            return true;
        }
      });
    });
  }

  // Column utilities
  static getVisibleColumns<T>(columns: ColumnDef<T>[]): ColumnDef<T>[] {
    return columns.filter(col => !col.hide);
  }

  static getPinnedColumns<T>(columns: ColumnDef<T>[], position: 'left' | 'right'): ColumnDef<T>[] {
    return columns.filter(col => col.pinned === position && !col.hide);
  }

  static getCenterColumns<T>(columns: ColumnDef<T>[]): ColumnDef<T>[] {
    return columns.filter(col => !col.pinned && !col.hide);
  }

  // Data utilities
  static generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  static validateCellValue(value: any, column: ColumnDef): string | null {
    if (column.validation) {
      return column.validation(value);
    }

    // Basic type validation
    switch (column.type) {
      case 'number':
        if (value !== null && value !== undefined && value !== '' && isNaN(Number(value))) {
          return 'Must be a valid number';
        }
        break;
      case 'date':
        if (value && !(value instanceof Date) && isNaN(Date.parse(value))) {
          return 'Must be a valid date';
        }
        break;
      default:
        break;
    }

    return null;
  }

  // Search utilities
  static globalSearch<T extends RowData>(data: T[], searchTerm: string, columns: ColumnDef<T>[]): T[] {
    if (!searchTerm.trim()) return data;

    const term = searchTerm.toLowerCase();
    return data.filter(row => {
      return columns.some(column => {
        const value = row[column.field];
        return String(value).toLowerCase().includes(term);
      });
    });
  }

  // Export utilities
  static exportToCsv<T extends RowData>(data: T[], columns: ColumnDef<T>[], filename: string = 'export.csv'): void {
    const visibleColumns = this.getVisibleColumns(columns);
    const headers = visibleColumns.map(col => col.headerName).join(',');
    
    const rows = data.map(row => 
      visibleColumns.map(col => {
        const value = row[col.field];
        // Escape quotes and wrap in quotes if contains comma
        const stringValue = String(value || '');
        return stringValue.includes(',') || stringValue.includes('"') 
          ? `"${stringValue.replace(/"/g, '""')}"` 
          : stringValue;
      }).join(',')
    );

    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}