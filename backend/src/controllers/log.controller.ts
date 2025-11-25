import { Controller, Get, Post, Query, Param, Body, HttpException, HttpStatus } from '@nestjs/common';
import { FileLoggerService } from '../services/file-logger.service';

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

@Controller('api/logs')
export class LogController {
  private readonly fileLogger = new FileLoggerService();

  /**
   * Get log statistics
   */
  @Get('stats')
  getLogStats(): LogStatsResponse {
    try {
      const stats = this.fileLogger.getLogStats();
      
      return {
        ...stats,
        totalSizeFormatted: this.formatBytes(stats.totalSize),
        fileList: stats.fileList.map(file => ({
          ...file,
          sizeFormatted: this.formatBytes(file.size),
          type: this.getLogType(file.name)
        }))
      };
    } catch (error) {
      throw new HttpException(
        `Failed to get log statistics: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * List all log files
   */
  @Get('files')
  getLogFiles(): { files: string[]; count: number } {
    try {
      const files = this.fileLogger.getLogFiles();
      return {
        files: files.map(file => file.split('/').pop() || file),
        count: files.length
      };
    } catch (error) {
      throw new HttpException(
        `Failed to list log files: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Read specific log file
   */
  @Get('view')
  viewLogs(@Query() query: LogViewRequest): { 
    filename: string; 
    lines: string[]; 
    totalLines: number;
    requestedLines: number;
  } {
    try {
      const { filename, lines = 100 } = query;
      
      if (!filename) {
        throw new HttpException('Filename is required', HttpStatus.BAD_REQUEST);
      }

      const logLines = this.fileLogger.readLogFile(filename, lines);
      
      return {
        filename,
        lines: logLines,
        totalLines: logLines.length,
        requestedLines: lines
      };
    } catch (error) {
      throw new HttpException(
        `Failed to read log file: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get recent logs across all files
   */
  @Get('recent')
  getRecentLogs(@Query('lines') lines: string = '50'): {
    logs: Array<{
      filename: string;
      line: string;
      timestamp?: string;
      level?: string;
      context?: string;
    }>;
    count: number;
  } {
    try {
      const lineCount = parseInt(lines) || 50;
      const files = this.fileLogger.getLogFiles();
      const allLogs: Array<{
        filename: string;
        line: string;
        timestamp?: string;
        level?: string;
        context?: string;
      }> = [];

      // Get recent logs from each file
      for (const filePath of files) {
        const filename = filePath.split('/').pop() || filePath;
        const logLines = this.fileLogger.readLogFile(filename, Math.min(lineCount, 20));
        
        for (const line of logLines) {
          const parsed = this.parseLogLine(line);
          allLogs.push({
            filename,
            line,
            ...parsed
          });
        }
      }

      // Sort by timestamp (newest first)
      allLogs.sort((a, b) => {
        if (!a.timestamp || !b.timestamp) return 0;
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });

      return {
        logs: allLogs.slice(0, lineCount),
        count: allLogs.length
      };
    } catch (error) {
      throw new HttpException(
        `Failed to get recent logs: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Filter logs by level
   */
  @Get('level/:level')
  getLogsByLevel(
    @Param('level') level: string,
    @Query('lines') lines: string = '100'
  ): {
    level: string;
    logs: string[];
    count: number;
  } {
    try {
      const lineCount = parseInt(lines) || 100;
      const filename = `${level.toLowerCase()}-${new Date().toISOString().split('T')[0]}.log`;
      const logLines = this.fileLogger.readLogFile(filename, lineCount);
      
      return {
        level: level.toUpperCase(),
        logs: logLines,
        count: logLines.length
      };
    } catch (error) {
      throw new HttpException(
        `Failed to get logs for level ${level}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Search logs
   */
  @Post('search')
  searchLogs(@Body() body: { 
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
  } {
    try {
      const { query, files, maxResults = 100, caseSensitive = false } = body;
      
      if (!query || query.trim().length === 0) {
        throw new HttpException('Search query is required', HttpStatus.BAD_REQUEST);
      }

      const searchQuery = caseSensitive ? query : query.toLowerCase();
      const filesToSearch = files || this.fileLogger.getLogFiles().map(f => f.split('/').pop() || f);
      const results: Array<{
        filename: string;
        line: string;
        lineNumber: number;
      }> = [];

      for (const filename of filesToSearch) {
        const lines = this.fileLogger.readLogFile(filename, 1000); // Search in last 1000 lines
        
        lines.forEach((line, index) => {
          const searchLine = caseSensitive ? line : line.toLowerCase();
          if (searchLine.includes(searchQuery)) {
            results.push({
              filename,
              line,
              lineNumber: index + 1
            });
          }
        });

        // Break if we have enough results
        if (results.length >= maxResults) {
          break;
        }
      }

      return {
        query,
        results: results.slice(0, maxResults),
        totalResults: results.length
      };
    } catch (error) {
      throw new HttpException(
        `Failed to search logs: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Clear old logs
   */
  @Post('cleanup')
  clearOldLogs(@Body() body: { olderThanDays?: number }): {
    success: boolean;
    message: string;
  } {
    try {
      const { olderThanDays = 7 } = body;
      
      this.fileLogger.clearLogs(olderThanDays);
      
      return {
        success: true,
        message: `Successfully cleared logs older than ${olderThanDays} days`
      };
    } catch (error) {
      throw new HttpException(
        `Failed to clear logs: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Helper methods
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private getLogType(filename: string): string {
    if (filename.includes('error')) return 'error';
    if (filename.includes('warn')) return 'warning';
    if (filename.includes('debug')) return 'debug';
    if (filename.includes('all')) return 'combined';
    return 'info';
  }

  private parseLogLine(line: string): {
    timestamp?: string;
    level?: string;
    context?: string;
  } {
    try {
      // Parse log format: [timestamp] [level] [context] message
      const match = line.match(/\[([^\]]+)\]\s*\[([^\]]+)\]\s*\[([^\]]+)\]/);
      
      if (match) {
        return {
          timestamp: match[1],
          level: match[2],
          context: match[3]
        };
      }
    } catch (error) {
      // Ignore parsing errors
    }
    
    return {};
  }
}