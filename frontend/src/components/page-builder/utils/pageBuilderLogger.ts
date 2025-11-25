/**
 * Page Builder Logger
 * 
 * Centralized logging system for Page Builder operations.
 * - Development: Shows detailed console logs
 * - Production: Only logs errors, minimal toast notifications
 */

type LogLevel = 'debug' | 'info' | 'success' | 'warning' | 'error';

interface LogEntry {
  level: LogLevel;
  operation: string;
  message: string;
  data?: any;
  timestamp: Date;
}

class PageBuilderLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 100;
  private isDevelopment = process.env.NODE_ENV === 'development';

  /**
   * Log a message without showing toast
   */
  private log(level: LogLevel, operation: string, message: string, data?: any) {
    const entry: LogEntry = {
      level,
      operation,
      message,
      data,
      timestamp: new Date(),
    };

    // Add to logs array
    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    // Console output in development
    if (this.isDevelopment) {
      const emoji = this.getEmoji(level);
      const color = this.getColor(level);
      console.group(`${emoji} [${operation}] ${message}`);
      console.log('%c' + level.toUpperCase(), `color: ${color}; font-weight: bold`);
      if (data) {
        console.log('Data:', data);
      }
      console.log('Time:', entry.timestamp.toLocaleTimeString());
      console.groupEnd();
    }
  }

  /**
   * Debug level - только для development, не показывает toast
   */
  debug(operation: string, message: string, data?: any) {
    if (this.isDevelopment) {
      this.log('debug', operation, message, data);
    }
  }

  /**
   * Info level - логирует, не показывает toast
   */
  info(operation: string, message: string, data?: any) {
    this.log('info', operation, message, data);
  }

  /**
   * Success level - логирует, возвращает нужно ли показать toast
   */
  success(operation: string, message: string, data?: any): boolean {
    this.log('success', operation, message, data);
    // Only show toast for important operations
    return this.isImportantOperation(operation);
  }

  /**
   * Warning level - логирует, возвращает нужно ли показать toast
   */
  warning(operation: string, message: string, data?: any): boolean {
    this.log('warning', operation, message, data);
    return true; // Always show warnings
  }

  /**
   * Error level - всегда логирует и возвращает true для toast
   */
  error(operation: string, message: string, data?: any): boolean {
    this.log('error', operation, message, data);
    return true; // Always show errors
  }

  /**
   * Get all logs
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Clear all logs
   */
  clearLogs() {
    this.logs = [];
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Determine if operation is important enough for toast
   */
  private isImportantOperation(operation: string): boolean {
    const importantOps = [
      'PAGE_SAVE',
      'PAGE_CREATE',
      'PAGE_DELETE',
      'PAGE_PUBLISH',
      'TEMPLATE_ADD',
      'BULK_OPERATION',
    ];
    return importantOps.includes(operation);
  }

  private getEmoji(level: LogLevel): string {
    const emojis: Record<LogLevel, string> = {
      debug: '🔍',
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌',
    };
    return emojis[level];
  }

  private getColor(level: LogLevel): string {
    const colors: Record<LogLevel, string> = {
      debug: '#6B7280',
      info: '#3B82F6',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
    };
    return colors[level];
  }
}

// Singleton instance
export const pageBuilderLogger = new PageBuilderLogger();

/**
 * Operation types for better organization
 */
export const LOG_OPERATIONS = {
  // Page operations
  PAGE_CREATE: 'PAGE_CREATE',
  PAGE_UPDATE: 'PAGE_UPDATE',
  PAGE_DELETE: 'PAGE_DELETE',
  PAGE_SAVE: 'PAGE_SAVE',
  PAGE_PUBLISH: 'PAGE_PUBLISH',
  
  // Block operations
  BLOCK_ADD: 'BLOCK_ADD',
  BLOCK_CREATE: 'BLOCK_CREATE',
  BLOCK_UPDATE: 'BLOCK_UPDATE',
  BLOCK_DELETE: 'BLOCK_DELETE',
  BLOCK_REORDER: 'BLOCK_REORDER',
  BLOCK_STYLE_UPDATE: 'BLOCK_STYLE_UPDATE',
  
  // Child block operations
  CHILD_BLOCK_ADD: 'CHILD_BLOCK_ADD',
  
  // Template operations
  TEMPLATE_ADD: 'TEMPLATE_ADD',
  TEMPLATE_APPLY: 'TEMPLATE_APPLY',
  TEMPLATE_SAVE: 'TEMPLATE_SAVE',
  
  // Bulk operations
  BULK_OPERATION: 'BULK_OPERATION',
} as const;
