import { LoggerService, LogLevel } from '@nestjs/common';
export interface LogEntry {
    timestamp: string;
    level: string;
    context: string;
    message: string;
    data?: any;
}
export declare class FileLoggerService implements LoggerService {
    private readonly logDir;
    private readonly maxFileSize;
    private readonly maxFiles;
    constructor();
    private ensureLogDirectory;
    private getLogFileName;
    private getAllLogFileName;
    private formatLogEntry;
    private writeToFile;
    private rotateLogFile;
    private logToFile;
    private addColors;
    log(message: any, context?: string): void;
    error(message: any, trace?: string, context?: string): void;
    warn(message: any, context?: string): void;
    debug(message: any, context?: string): void;
    verbose(message: any, context?: string): void;
    logWithData(level: LogLevel, message: string, data: any, context?: string): void;
    logInvoiceOperation(operation: string, invoiceId: string, data?: any, context?: string): void;
    logInvoiceError(operation: string, invoiceId: string, error: any, context?: string): void;
    logApiCall(method: string, url: string, status?: number, duration?: number, context?: string): void;
    logApiError(method: string, url: string, error: any, context?: string): void;
    getLogFiles(): string[];
    readLogFile(filename: string, lines?: number): string[];
    clearLogs(olderThanDays?: number): void;
    getLogStats(): {
        totalFiles: number;
        totalSize: number;
        oldestLog: string | null;
        newestLog: string | null;
        fileList: Array<{
            name: string;
            size: number;
            modified: Date;
        }>;
    };
}
