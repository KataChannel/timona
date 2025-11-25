"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogController = void 0;
const common_1 = require("@nestjs/common");
const file_logger_service_1 = require("../services/file-logger.service");
let LogController = class LogController {
    constructor() {
        this.fileLogger = new file_logger_service_1.FileLoggerService();
    }
    getLogStats() {
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
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to get log statistics: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    getLogFiles() {
        try {
            const files = this.fileLogger.getLogFiles();
            return {
                files: files.map(file => file.split('/').pop() || file),
                count: files.length
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to list log files: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    viewLogs(query) {
        try {
            const { filename, lines = 100 } = query;
            if (!filename) {
                throw new common_1.HttpException('Filename is required', common_1.HttpStatus.BAD_REQUEST);
            }
            const logLines = this.fileLogger.readLogFile(filename, lines);
            return {
                filename,
                lines: logLines,
                totalLines: logLines.length,
                requestedLines: lines
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to read log file: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    getRecentLogs(lines = '50') {
        try {
            const lineCount = parseInt(lines) || 50;
            const files = this.fileLogger.getLogFiles();
            const allLogs = [];
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
            allLogs.sort((a, b) => {
                if (!a.timestamp || !b.timestamp)
                    return 0;
                return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
            });
            return {
                logs: allLogs.slice(0, lineCount),
                count: allLogs.length
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to get recent logs: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    getLogsByLevel(level, lines = '100') {
        try {
            const lineCount = parseInt(lines) || 100;
            const filename = `${level.toLowerCase()}-${new Date().toISOString().split('T')[0]}.log`;
            const logLines = this.fileLogger.readLogFile(filename, lineCount);
            return {
                level: level.toUpperCase(),
                logs: logLines,
                count: logLines.length
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to get logs for level ${level}: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    searchLogs(body) {
        try {
            const { query, files, maxResults = 100, caseSensitive = false } = body;
            if (!query || query.trim().length === 0) {
                throw new common_1.HttpException('Search query is required', common_1.HttpStatus.BAD_REQUEST);
            }
            const searchQuery = caseSensitive ? query : query.toLowerCase();
            const filesToSearch = files || this.fileLogger.getLogFiles().map(f => f.split('/').pop() || f);
            const results = [];
            for (const filename of filesToSearch) {
                const lines = this.fileLogger.readLogFile(filename, 1000);
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
                if (results.length >= maxResults) {
                    break;
                }
            }
            return {
                query,
                results: results.slice(0, maxResults),
                totalResults: results.length
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to search logs: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    clearOldLogs(body) {
        try {
            const { olderThanDays = 7 } = body;
            this.fileLogger.clearLogs(olderThanDays);
            return {
                success: true,
                message: `Successfully cleared logs older than ${olderThanDays} days`
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to clear logs: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    formatBytes(bytes) {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    getLogType(filename) {
        if (filename.includes('error'))
            return 'error';
        if (filename.includes('warn'))
            return 'warning';
        if (filename.includes('debug'))
            return 'debug';
        if (filename.includes('all'))
            return 'combined';
        return 'info';
    }
    parseLogLine(line) {
        try {
            const match = line.match(/\[([^\]]+)\]\s*\[([^\]]+)\]\s*\[([^\]]+)\]/);
            if (match) {
                return {
                    timestamp: match[1],
                    level: match[2],
                    context: match[3]
                };
            }
        }
        catch (error) {
        }
        return {};
    }
};
exports.LogController = LogController;
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], LogController.prototype, "getLogStats", null);
__decorate([
    (0, common_1.Get)('files'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], LogController.prototype, "getLogFiles", null);
__decorate([
    (0, common_1.Get)('view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Object)
], LogController.prototype, "viewLogs", null);
__decorate([
    (0, common_1.Get)('recent'),
    __param(0, (0, common_1.Query)('lines')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Object)
], LogController.prototype, "getRecentLogs", null);
__decorate([
    (0, common_1.Get)('level/:level'),
    __param(0, (0, common_1.Param)('level')),
    __param(1, (0, common_1.Query)('lines')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Object)
], LogController.prototype, "getLogsByLevel", null);
__decorate([
    (0, common_1.Post)('search'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Object)
], LogController.prototype, "searchLogs", null);
__decorate([
    (0, common_1.Post)('cleanup'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Object)
], LogController.prototype, "clearOldLogs", null);
exports.LogController = LogController = __decorate([
    (0, common_1.Controller)('api/logs')
], LogController);
//# sourceMappingURL=log.controller.js.map