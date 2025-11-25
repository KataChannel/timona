'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Download, Filter } from 'lucide-react';
import { pageBuilderLogger } from '../utils/pageBuilderLogger';

/**
 * Developer Log Panel
 * Shows real-time logs of page builder operations
 * Only visible in development mode
 */
export function DevLogPanel() {
  const [logs, setLogs] = useState(pageBuilderLogger.getLogs());
  const [filter, setFilter] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Auto refresh logs
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setLogs(pageBuilderLogger.getLogs());
    }, 500);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleClearLogs = () => {
    pageBuilderLogger.clearLogs();
    setLogs([]);
  };

  const handleExportLogs = () => {
    const json = pageBuilderLogger.exportLogs();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pagebuilder-logs-${new Date().toISOString()}.json`;
    a.click();
  };

  const filteredLogs = filter === 'all' 
    ? logs 
    : logs.filter(log => log.level === filter);

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      debug: 'text-gray-500',
      info: 'text-blue-500',
      success: 'text-green-500',
      warning: 'text-yellow-500',
      error: 'text-red-500',
    };
    return colors[level] || 'text-gray-500';
  };

  const getLevelBg = (level: string) => {
    const colors: Record<string, string> = {
      debug: 'bg-gray-50',
      info: 'bg-blue-50',
      success: 'bg-green-50',
      warning: 'bg-yellow-50',
      error: 'bg-red-50',
    };
    return colors[level] || 'bg-gray-50';
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-3 border-b bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-900">🔍 Dev Logs</h3>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`h-7 text-xs ${autoRefresh ? 'bg-green-100' : ''}`}
            >
              {autoRefresh ? '⏸️ Pause' : '▶️ Resume'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExportLogs}
              className="h-7 text-xs"
            >
              <Download className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearLogs}
              className="h-7 text-xs"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1">
          {['all', 'debug', 'info', 'success', 'warning', 'error'].map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
              className="h-6 text-xs px-2"
            >
              {f}
            </Button>
          ))}
        </div>

        <div className="mt-2 text-xs text-gray-500">
          Total: {logs.length} | Filtered: {filteredLogs.length}
        </div>
      </div>

      {/* Logs */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filteredLogs.length === 0 ? (
            <div className="text-center text-xs text-gray-400 py-8">
              No logs to display
            </div>
          ) : (
            filteredLogs.map((log, index) => (
              <div
                key={index}
                className={`p-2 rounded text-xs ${getLevelBg(log.level)} border border-gray-200`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${getLevelColor(log.level)}`}>
                      {log.level.toUpperCase()}
                    </span>
                    <span className="font-medium text-gray-700">
                      [{log.operation}]
                    </span>
                  </div>
                  <span className="text-gray-400 text-[10px]">
                    {log.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-gray-600 mb-1">{log.message}</div>
                {log.data && (
                  <details className="mt-1">
                    <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                      View data
                    </summary>
                    <pre className="mt-1 p-2 bg-gray-100 rounded text-[10px] overflow-x-auto">
                      {JSON.stringify(log.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
