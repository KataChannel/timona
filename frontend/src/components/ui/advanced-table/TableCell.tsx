'use client';

import React, { useState, useRef, useEffect, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ColumnDef, RowData, CellEditorParams } from './types';
import { TableUtils } from './utils';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TableCellProps<T extends RowData> {
  column: ColumnDef<T>;
  data: T;
  value: any;
  rowIndex: number;
  isEditing: boolean;
  onStartEdit: () => void;
  onSave: (newValue: any) => void;
  onCancel: () => void;
  isSelected?: boolean;
  className?: string;
}

export function TableCell<T extends RowData>({
  column,
  data,
  value,
  rowIndex,
  isEditing,
  onStartEdit,
  onSave,
  onCancel,
  isSelected,
  className
}: TableCellProps<T>) {
  const [editValue, setEditValue] = useState(value);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = () => {
    const error = TableUtils.validateCellValue(editValue, column);
    if (error) {
      setValidationError(error);
      return;
    }

    setValidationError(null);
    onSave(editValue);
  };

  const handleCancel = () => {
    setEditValue(value);
    setValidationError(null);
    onCancel();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const renderValue = () => {
    if (column.cellRenderer) {
      const rendered = column.cellRenderer({
        value,
        data,
        field: column.field,
        rowIndex,
        colDef: column
      });
      
      // If cellRenderer returns a simple value (string, number), wrap it properly
      if (typeof rendered === 'string' || typeof rendered === 'number') {
        return <span className="truncate block">{rendered}</span>;
      }
      
      // Otherwise return as-is (React element)
      return rendered;
    }

    if (column.valueGetter) {
      const displayValue = column.valueGetter(data);
      return renderDefaultValue(displayValue);
    }

    return renderDefaultValue(value);
  };

  const renderDefaultValue = (val: any) => {
    if (val === null || val === undefined) {
      return <span className="text-gray-400">—</span>;
    }

    switch (column.type) {
      case 'boolean':
        return (
          <div className="flex justify-center">
            <Checkbox checked={Boolean(val)} disabled />
          </div>
        );
      case 'date':
        if (val instanceof Date) {
          return val.toLocaleDateString();
        }
        if (typeof val === 'string') {
          const date = new Date(val);
          return isNaN(date.getTime()) ? val : date.toLocaleDateString();
        }
        return String(val);
      case 'number':
        return typeof val === 'number' ? val.toLocaleString() : val;
      default:
        // Return string for display with title attribute
        return String(val);
    }
  };

  // Get display text for title attribute
  const getDisplayText = (): string => {
    if (value === null || value === undefined) {
      return '';
    }

    if (column.valueGetter) {
      const displayValue = column.valueGetter(data);
      if (displayValue === null || displayValue === undefined) return '';
      
      switch (column.type) {
        case 'boolean':
          return Boolean(displayValue) ? 'True' : 'False';
        case 'date':
          if (displayValue instanceof Date) {
            return displayValue.toLocaleDateString();
          }
          if (typeof displayValue === 'string') {
            const date = new Date(displayValue);
            return isNaN(date.getTime()) ? displayValue : date.toLocaleDateString();
          }
          return String(displayValue);
        case 'number':
          return typeof displayValue === 'number' ? displayValue.toLocaleString() : String(displayValue);
        default:
          return String(displayValue);
      }
    }

    switch (column.type) {
      case 'boolean':
        return Boolean(value) ? 'True' : 'False';
      case 'date':
        if (value instanceof Date) {
          return value.toLocaleDateString();
        }
        if (typeof value === 'string') {
          const date = new Date(value);
          return isNaN(date.getTime()) ? value : date.toLocaleDateString();
        }
        return String(value);
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : String(value);
      default:
        return String(value);
    }
  };

  const renderEditor = () => {
    if (column.cellEditor) {
      const editorParams: CellEditorParams<T> = {
        value: editValue,
        data,
        field: column.field,
        rowIndex,
        colDef: column,
        onValueChange: setEditValue,
        onCancel: handleCancel,
        onSave: handleSave
      };
      return column.cellEditor(editorParams);
    }

    return renderDefaultEditor();
  };

  const renderDefaultEditor = () => {
    switch (column.type) {
      case 'boolean':
        return (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={Boolean(editValue)}
              onCheckedChange={(checked) => setEditValue(checked)}
              autoFocus
            />
          </div>
        );

      case 'select':
        if (column.filterOptions) {
          return (
            <Select value={editValue} onValueChange={setEditValue}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {column.filterOptions.map(option => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        }
        break;

      case 'number':
        return (
          <Input
            ref={inputRef}
            type="number"
            value={editValue || ''}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-8"
          />
        );

      case 'date':
        return (
          <Input
            ref={inputRef}
            type="date"
            value={editValue instanceof Date ? editValue.toISOString().split('T')[0] : editValue || ''}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-8"
          />
        );

      default:
        return (
          <Input
            ref={inputRef}
            type="text"
            value={editValue || ''}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-8"
          />
        );
    }

    return (
      <Input
        ref={inputRef}
        type="text"
        value={editValue || ''}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="h-8"
      />
    );
  };

  const cellClass = typeof column.cellClass === 'function' 
    ? column.cellClass(data) 
    : column.cellClass;

  if (isEditing) {
    return (
      <div className={cn(
        'h-full w-full px-2 py-1 bg-white relative flex items-center',
        'border-2 border-blue-500 shadow-[0_0_0_1px_rgba(59,130,246,0.5)]',
        cellClass,
        className
      )}>
        <div className="flex items-center gap-1 w-full min-w-0">
          <div className="flex-1 min-w-0">
            {renderEditor()}
          </div>
          <div className="flex gap-0.5 ml-1 flex-shrink-0">
            <Button
              size="sm"
              variant="ghost"
              className="h-5 w-5 p-0 text-green-600 hover:bg-green-100"
              onClick={handleSave}
            >
              <Check className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-5 w-5 p-0 text-red-600 hover:bg-red-100"
              onClick={handleCancel}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
        {validationError && (
          <div className="absolute top-full left-0 z-10 mt-1 text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1 shadow-md">
            {validationError}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'h-full w-full px-2 py-1.5 cursor-default flex items-center overflow-hidden',
        'text-sm text-gray-800',
        'transition-colors',
        column.editable && 'cursor-cell',
        isSelected && 'bg-blue-50/70',
        cellClass,
        className
      )}
      onClick={column.editable ? onStartEdit : undefined}
      onDoubleClick={column.editable ? onStartEdit : undefined}
      title={getDisplayText()}
    >
      <div className="truncate w-full min-w-0">
        {renderValue()}
      </div>
    </div>
  );
}