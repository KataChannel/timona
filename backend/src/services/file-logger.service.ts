import { Injectable, LoggerService, LogLevel } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface LogEntry {
  timestamp: string;
  level: string;
  context: string;
  message: string;
  data?: any;
}

@Injectable()
export class FileLoggerService implements LoggerService {
  private readonly logDir: string;
  private readonly maxFileSize: number = 10 * 1024 * 1024; // 10MB
  private readonly maxFiles: number = 10;

  constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
    this.ensureLogDirectory();
  }

  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private getLogFileName(level: string): string {
    const date = new Date().toISOString().split('T')[0];
    return path.join(this.logDir, `${level.toLowerCase()}-${date}.log`);
  }

  private getAllLogFileName(): string {
    const date = new Date().toISOString().split('T')[0];
    return path.join(this.logDir, `all-${date}.log`);
  }

  private formatLogEntry(level: string, message: any, context?: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const logEntry: LogEntry = {
      timestamp,
      level: level.toUpperCase(),
      context: context || 'Application',
      message: typeof message === 'object' ? JSON.stringify(message) : String(message),
      data: data ? (typeof data === 'object' ? data : { extra: data }) : undefined
    };

    // Format for file output
    const baseLog = `[${timestamp}] [${level.toUpperCase()}] [${context || 'App'}] ${logEntry.message}`;
    
    if (data) {
      return `${baseLog}\n  Data: ${JSON.stringify(data, null, 2)}\n`;
    }
    
    return `${baseLog}\n`;
  }

  private writeToFile(filename: string, content: string): void {
    try {
      // Check file size and rotate if necessary
      if (fs.existsSync(filename)) {
        const stats = fs.statSync(filename);
        if (stats.size > this.maxFileSize) {
          this.rotateLogFile(filename);
        }
      }

      fs.appendFileSync(filename, content, 'utf8');
    } catch (error) {
      console.error(`Failed to write to log file ${filename}:`, error);
    }
  }

  private rotateLogFile(filename: string): void {
    try {
      const dirname = path.dirname(filename);
      const basename = path.basename(filename, '.log');
      
      // Rotate existing backup files
      for (let i = this.maxFiles - 1; i >= 1; i--) {
        const oldFile = path.join(dirname, `${basename}.${i}.log`);
        const newFile = path.join(dirname, `${basename}.${i + 1}.log`);
        
        if (fs.existsSync(oldFile)) {
          if (i === this.maxFiles - 1) {
            fs.unlinkSync(oldFile); // Delete oldest file
          } else {
            fs.renameSync(oldFile, newFile);
          }
        }
      }
      
      // Move current file to .1
      const backupFile = path.join(dirname, `${basename}.1.log`);
      fs.renameSync(filename, backupFile);
    } catch (error) {
      console.error(`Failed to rotate log file ${filename}:`, error);
    }
  }

  private logToFile(level: string, message: any, context?: string, data?: any): void {
    const formattedLog = this.formatLogEntry(level, message, context, data);
    
    // Write to level-specific file
    const levelFile = this.getLogFileName(level);
    this.writeToFile(levelFile, formattedLog);
    
    // Write to combined log file
    const allFile = this.getAllLogFileName();
    this.writeToFile(allFile, formattedLog);
    
    // Also log to console for development
    if (process.env.NODE_ENV !== 'production') {
      const coloredLog = this.addColors(level, formattedLog.trim());
      console.log(coloredLog);
    }
  }

  private addColors(level: string, message: string): string {
    const colors = {
      error: '\x1b[31m',   // Red
      warn: '\x1b[33m',    // Yellow
      log: '\x1b[32m',     // Green
      debug: '\x1b[36m',   // Cyan
      verbose: '\x1b[35m', // Magenta
      reset: '\x1b[0m'     // Reset
    };

    const color = colors[level.toLowerCase()] || colors.log;
    return `${color}${message}${colors.reset}`;
  }

  // Implement LoggerService interface
  log(message: any, context?: string): void {
    this.logToFile('log', message, context);
  }

  error(message: any, trace?: string, context?: string): void {
    const errorData = trace ? { trace } : undefined;
    this.logToFile('error', message, context, errorData);
  }

  warn(message: any, context?: string): void {
    this.logToFile('warn', message, context);
  }

  debug(message: any, context?: string): void {
    this.logToFile('debug', message, context);
  }

  verbose(message: any, context?: string): void {
    this.logToFile('verbose', message, context);
  }

  // Additional methods for structured logging
  logWithData(level: LogLevel, message: string, data: any, context?: string): void {
    this.logToFile(level, message, context, data);
  }

  // Invoice-specific logging methods
  logInvoiceOperation(operation: string, invoiceId: string, data?: any, context = 'InvoiceService'): void {
    this.logWithData('log', `Invoice ${operation}: ${invoiceId}`, data, context);
  }

  logInvoiceError(operation: string, invoiceId: string, error: any, context = 'InvoiceService'): void {
    this.logWithData('error', `Invoice ${operation} failed: ${invoiceId}`, {
      error: error.message || error,
      stack: error.stack,
      code: error.code,
      status: error.status
    }, context);
  }

  logApiCall(method: string, url: string, status?: number, duration?: number, context = 'ApiClient'): void {
    this.logWithData('log', `API Call: ${method} ${url}`, {
      status,
      duration: duration ? `${duration}ms` : undefined
    }, context);
  }

  logApiError(method: string, url: string, error: any, context = 'ApiClient'): void {
    this.logWithData('error', `API Error: ${method} ${url}`, {
      error: error.message || error,
      status: error.response?.status,
      statusText: error.response?.statusText,
      code: error.code
    }, context);
  }

  // Utility methods for log management
  getLogFiles(): string[] {
    try {
      return fs.readdirSync(this.logDir)
        .filter(file => file.endsWith('.log'))
        .map(file => path.join(this.logDir, file));
    } catch (error) {
      console.error('Failed to read log directory:', error);
      return [];
    }
  }

  readLogFile(filename: string, lines: number = 100): string[] {
    try {
      const filePath = path.join(this.logDir, filename);
      if (!fs.existsSync(filePath)) {
        return [];
      }

      const content = fs.readFileSync(filePath, 'utf8');
      const allLines = content.split('\n').filter(line => line.trim());
      
      // Return last N lines
      return allLines.slice(-lines);
    } catch (error) {
      console.error(`Failed to read log file ${filename}:`, error);
      return [];
    }
  }

  clearLogs(olderThanDays: number = 7): void {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const files = fs.readdirSync(this.logDir);
      
      for (const file of files) {
        if (file.endsWith('.log')) {
          const filePath = path.join(this.logDir, file);
          const stats = fs.statSync(filePath);
          
          if (stats.mtime < cutoffDate) {
            fs.unlinkSync(filePath);
            console.log(`Deleted old log file: ${file}`);
          }
        }
      }
    } catch (error) {
      console.error('Failed to clear old logs:', error);
    }
  }

  // Get log statistics
  getLogStats(): { 
    totalFiles: number; 
    totalSize: number; 
    oldestLog: string | null; 
    newestLog: string | null;
    fileList: Array<{ name: string; size: number; modified: Date }>;
  } {
    try {
      const files = fs.readdirSync(this.logDir);
      const logFiles = files
        .filter(file => file.endsWith('.log'))
        .map(file => {
          const filePath = path.join(this.logDir, file);
          const stats = fs.statSync(filePath);
          return {
            name: file,
            size: stats.size,
            modified: stats.mtime
          };
        })
        .sort((a, b) => b.modified.getTime() - a.modified.getTime());

      const totalSize = logFiles.reduce((sum, file) => sum + file.size, 0);

      return {
        totalFiles: logFiles.length,
        totalSize,
        oldestLog: logFiles.length > 0 ? logFiles[logFiles.length - 1].name : null,
        newestLog: logFiles.length > 0 ? logFiles[0].name : null,
        fileList: logFiles
      };
    } catch (error) {
      console.error('Failed to get log stats:', error);
      return {
        totalFiles: 0,
        totalSize: 0,
        oldestLog: null,
        newestLog: null,
        fileList: []
      };
    }
  }
}