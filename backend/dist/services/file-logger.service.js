"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileLoggerService = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let FileLoggerService = class FileLoggerService {
    constructor() {
        this.maxFileSize = 10 * 1024 * 1024;
        this.maxFiles = 10;
        this.logDir = path.join(process.cwd(), 'logs');
        this.ensureLogDirectory();
    }
    ensureLogDirectory() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }
    getLogFileName(level) {
        const date = new Date().toISOString().split('T')[0];
        return path.join(this.logDir, `${level.toLowerCase()}-${date}.log`);
    }
    getAllLogFileName() {
        const date = new Date().toISOString().split('T')[0];
        return path.join(this.logDir, `all-${date}.log`);
    }
    formatLogEntry(level, message, context, data) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level: level.toUpperCase(),
            context: context || 'Application',
            message: typeof message === 'object' ? JSON.stringify(message) : String(message),
            data: data ? (typeof data === 'object' ? data : { extra: data }) : undefined
        };
        const baseLog = `[${timestamp}] [${level.toUpperCase()}] [${context || 'App'}] ${logEntry.message}`;
        if (data) {
            return `${baseLog}\n  Data: ${JSON.stringify(data, null, 2)}\n`;
        }
        return `${baseLog}\n`;
    }
    writeToFile(filename, content) {
        try {
            if (fs.existsSync(filename)) {
                const stats = fs.statSync(filename);
                if (stats.size > this.maxFileSize) {
                    this.rotateLogFile(filename);
                }
            }
            fs.appendFileSync(filename, content, 'utf8');
        }
        catch (error) {
            console.error(`Failed to write to log file ${filename}:`, error);
        }
    }
    rotateLogFile(filename) {
        try {
            const dirname = path.dirname(filename);
            const basename = path.basename(filename, '.log');
            for (let i = this.maxFiles - 1; i >= 1; i--) {
                const oldFile = path.join(dirname, `${basename}.${i}.log`);
                const newFile = path.join(dirname, `${basename}.${i + 1}.log`);
                if (fs.existsSync(oldFile)) {
                    if (i === this.maxFiles - 1) {
                        fs.unlinkSync(oldFile);
                    }
                    else {
                        fs.renameSync(oldFile, newFile);
                    }
                }
            }
            const backupFile = path.join(dirname, `${basename}.1.log`);
            fs.renameSync(filename, backupFile);
        }
        catch (error) {
            console.error(`Failed to rotate log file ${filename}:`, error);
        }
    }
    logToFile(level, message, context, data) {
        const formattedLog = this.formatLogEntry(level, message, context, data);
        const levelFile = this.getLogFileName(level);
        this.writeToFile(levelFile, formattedLog);
        const allFile = this.getAllLogFileName();
        this.writeToFile(allFile, formattedLog);
        if (process.env.NODE_ENV !== 'production') {
            const coloredLog = this.addColors(level, formattedLog.trim());
            console.log(coloredLog);
        }
    }
    addColors(level, message) {
        const colors = {
            error: '\x1b[31m',
            warn: '\x1b[33m',
            log: '\x1b[32m',
            debug: '\x1b[36m',
            verbose: '\x1b[35m',
            reset: '\x1b[0m'
        };
        const color = colors[level.toLowerCase()] || colors.log;
        return `${color}${message}${colors.reset}`;
    }
    log(message, context) {
        this.logToFile('log', message, context);
    }
    error(message, trace, context) {
        const errorData = trace ? { trace } : undefined;
        this.logToFile('error', message, context, errorData);
    }
    warn(message, context) {
        this.logToFile('warn', message, context);
    }
    debug(message, context) {
        this.logToFile('debug', message, context);
    }
    verbose(message, context) {
        this.logToFile('verbose', message, context);
    }
    logWithData(level, message, data, context) {
        this.logToFile(level, message, context, data);
    }
    logInvoiceOperation(operation, invoiceId, data, context = 'InvoiceService') {
        this.logWithData('log', `Invoice ${operation}: ${invoiceId}`, data, context);
    }
    logInvoiceError(operation, invoiceId, error, context = 'InvoiceService') {
        this.logWithData('error', `Invoice ${operation} failed: ${invoiceId}`, {
            error: error.message || error,
            stack: error.stack,
            code: error.code,
            status: error.status
        }, context);
    }
    logApiCall(method, url, status, duration, context = 'ApiClient') {
        this.logWithData('log', `API Call: ${method} ${url}`, {
            status,
            duration: duration ? `${duration}ms` : undefined
        }, context);
    }
    logApiError(method, url, error, context = 'ApiClient') {
        this.logWithData('error', `API Error: ${method} ${url}`, {
            error: error.message || error,
            status: error.response?.status,
            statusText: error.response?.statusText,
            code: error.code
        }, context);
    }
    getLogFiles() {
        try {
            return fs.readdirSync(this.logDir)
                .filter(file => file.endsWith('.log'))
                .map(file => path.join(this.logDir, file));
        }
        catch (error) {
            console.error('Failed to read log directory:', error);
            return [];
        }
    }
    readLogFile(filename, lines = 100) {
        try {
            const filePath = path.join(this.logDir, filename);
            if (!fs.existsSync(filePath)) {
                return [];
            }
            const content = fs.readFileSync(filePath, 'utf8');
            const allLines = content.split('\n').filter(line => line.trim());
            return allLines.slice(-lines);
        }
        catch (error) {
            console.error(`Failed to read log file ${filename}:`, error);
            return [];
        }
    }
    clearLogs(olderThanDays = 7) {
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
        }
        catch (error) {
            console.error('Failed to clear old logs:', error);
        }
    }
    getLogStats() {
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
        }
        catch (error) {
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
};
exports.FileLoggerService = FileLoggerService;
exports.FileLoggerService = FileLoggerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], FileLoggerService);
//# sourceMappingURL=file-logger.service.js.map