export interface LogViewRequest {
    filename?: string;
    lines?: number;
    level?: string;
}
export interface LogStatsResponse {
    totalFiles: number;
    totalSize: number;
    totalSizeFormatted: string;
    oldestLog: string | null;
    newestLog: string | null;
    fileList: Array<{
        name: string;
        size: number;
        sizeFormatted: string;
        modified: Date;
        type: string;
    }>;
}
export declare class LogController {
    private readonly fileLogger;
    getLogStats(): LogStatsResponse;
    getLogFiles(): {
        files: string[];
        count: number;
    };
    viewLogs(query: LogViewRequest): {
        filename: string;
        lines: string[];
        totalLines: number;
        requestedLines: number;
    };
    getRecentLogs(lines?: string): {
        logs: Array<{
            filename: string;
            line: string;
            timestamp?: string;
            level?: string;
            context?: string;
        }>;
        count: number;
    };
    getLogsByLevel(level: string, lines?: string): {
        level: string;
        logs: string[];
        count: number;
    };
    searchLogs(body: {
        query: string;
        files?: string[];
        maxResults?: number;
        caseSensitive?: boolean;
    }): {
        query: string;
        results: Array<{
            filename: string;
            line: string;
            lineNumber: number;
        }>;
        totalResults: number;
    };
    clearOldLogs(body: {
        olderThanDays?: number;
    }): {
        success: boolean;
        message: string;
    };
    private formatBytes;
    private getLogType;
    private parseLogLine;
}
