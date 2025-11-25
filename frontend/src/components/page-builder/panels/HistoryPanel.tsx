/**
 * PageBuilder Advanced Features - History Panel
 * Phase 6.4: Timeline View and State Management
 * 
 * History panel with:
 * - Timeline view of all changes
 * - Action descriptions
 * - Jump to any state
 * - Branch visualization
 * - Export/import history
 */

'use client';

import React, { useState } from 'react';
import { HistoryState } from '@/hooks/useHistory';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  History,
  Undo,
  Redo,
  Download,
  Upload,
  Trash2,
  Clock,
  CheckCircle,
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

interface HistoryPanelProps<T = any> {
  history: HistoryState<T>[];
  currentIndex: number;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onJumpToState: (index: number) => void;
  onClearHistory: () => void;
  onExportHistory: () => string;
  onImportHistory: (jsonString: string) => boolean;
}

// ============================================================================
// History Panel Component
// ============================================================================

export function HistoryPanel<T = any>({
  history,
  currentIndex,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onJumpToState,
  onClearHistory,
  onExportHistory,
  onImportHistory,
}: HistoryPanelProps<T>) {
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');

  // Format timestamp
  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) {
      return 'Just now';
    } else if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes}m ago`;
    } else if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours}h ago`;
    } else {
      return new Date(timestamp).toLocaleDateString();
    }
  };

  // Handle export
  const handleExport = () => {
    const jsonString = onExportHistory();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `history_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle import
  const handleImport = () => {
    if (importText) {
      const success = onImportHistory(importText);
      if (success) {
        setImportText('');
        setShowImport(false);
      } else {
        alert('Failed to import history. Invalid format.');
      }
    }
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setImportText(text);
      };
      reader.readAsText(file);
    }
  };

  // Empty state
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <History className="w-12 h-12 mb-4" />
        <p className="text-sm">No history</p>
        <p className="text-xs mt-1">Make changes to see history</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm text-gray-900">History</h3>
          <div className="text-xs text-gray-500">
            {history.length} state{history.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onUndo}
            disabled={!canUndo}
            className="flex-1 h-8 text-xs"
          >
            <Undo className="w-3 h-3 mr-1.5" />
            Undo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onRedo}
            disabled={!canRedo}
            className="flex-1 h-8 text-xs"
          >
            <Redo className="w-3 h-3 mr-1.5" />
            Redo
          </Button>
        </div>

        {/* Import/Export */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="flex-1 h-8 text-xs"
          >
            <Download className="w-3 h-3 mr-1.5" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowImport(!showImport)}
            className="flex-1 h-8 text-xs"
          >
            <Upload className="w-3 h-3 mr-1.5" />
            Import
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onClearHistory}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            title="Clear History"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>

        {/* Import UI */}
        {showImport && (
          <div className="space-y-2 pt-2 border-t">
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="text-xs w-full file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <div className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={handleImport}
                disabled={!importText}
                className="flex-1 h-7 text-xs"
              >
                Import History
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowImport(false);
                  setImportText('');
                }}
                className="flex-1 h-7 text-xs"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Timeline */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {/* Timeline Line */}
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

            {/* Timeline Items */}
            <div className="space-y-2">
              {history.map((item, index) => (
                <HistoryItem
                  key={item.id}
                  item={item}
                  index={index}
                  isCurrent={index === currentIndex}
                  isFuture={index > currentIndex}
                  onClick={() => onJumpToState(index)}
                  formatTime={formatTime}
                />
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

// ============================================================================
// History Item Component
// ============================================================================

interface HistoryItemProps<T = any> {
  item: HistoryState<T>;
  index: number;
  isCurrent: boolean;
  isFuture: boolean;
  onClick: () => void;
  formatTime: (timestamp: number) => string;
}

function HistoryItem<T = any>({
  item,
  index,
  isCurrent,
  isFuture,
  onClick,
  formatTime,
}: HistoryItemProps<T>) {
  return (
    <div
      className={`
        relative pl-10 pr-3 py-2 rounded-lg cursor-pointer transition-all
        ${isCurrent
          ? 'bg-blue-100 border-2 border-blue-500'
          : isFuture
          ? 'bg-gray-50 opacity-50 hover:opacity-75'
          : 'bg-white border border-gray-200 hover:border-gray-300'
        }
      `}
      onClick={onClick}
    >
      {/* Timeline Dot */}
      <div
        className={`
          absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2
          ${isCurrent
            ? 'bg-blue-500 border-blue-600'
            : isFuture
            ? 'bg-gray-200 border-gray-300'
            : 'bg-white border-gray-400'
          }
        `}
      >
        {isCurrent && (
          <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75" />
        )}
      </div>

      {/* Content */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isCurrent && (
              <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
            )}
            <span className="text-sm font-medium text-gray-900">
              {item.description || `State #${index + 1}`}
            </span>
          </div>
          <span className="text-xs text-gray-500">
            #{index + 1}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Clock className="w-3 h-3" />
          <span>{formatTime(item.timestamp)}</span>
        </div>
      </div>
    </div>
  );
}
