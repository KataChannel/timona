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
exports.LoggerService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const winston = __importStar(require("winston"));
require("winston-daily-rotate-file");
let LoggerService = class LoggerService {
    constructor(configService) {
        this.configService = configService;
        const logLevel = this.configService.get('LOG_LEVEL', 'info');
        const nodeEnv = this.configService.get('NODE_ENV', 'development');
        this.logger = winston.createLogger({
            level: logLevel,
            format: winston.format.combine(winston.format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss.SSS',
            }), winston.format.errors({ stack: true }), winston.format.printf(({ timestamp, level, message, stack, context, ...meta }) => {
                const contextStr = context ? `[${context}] ` : '';
                const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
                const stackStr = stack ? `\n${stack}` : '';
                return `${timestamp} [${level.toUpperCase()}] ${contextStr}${message} ${metaStr}${stackStr}`;
            })),
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(winston.format.colorize({ all: true }), winston.format.simple()),
                }),
                new winston.transports.DailyRotateFile({
                    filename: 'logs/application-%DATE%.log',
                    datePattern: 'YYYY-MM-DD',
                    zippedArchive: true,
                    maxSize: '20m',
                    maxFiles: '14d',
                    createSymlink: true,
                    symlinkName: 'application.log',
                }),
                new winston.transports.DailyRotateFile({
                    filename: 'logs/error-%DATE%.log',
                    datePattern: 'YYYY-MM-DD',
                    zippedArchive: true,
                    maxSize: '20m',
                    maxFiles: '30d',
                    level: 'error',
                    createSymlink: true,
                    symlinkName: 'error.log',
                }),
                new winston.transports.DailyRotateFile({
                    filename: 'logs/graphql-%DATE%.log',
                    datePattern: 'YYYY-MM-DD',
                    zippedArchive: true,
                    maxSize: '20m',
                    maxFiles: '7d',
                    createSymlink: true,
                    symlinkName: 'graphql.log',
                }),
            ],
        });
        if (nodeEnv === 'production') {
            this.logger.transports.forEach((transport) => {
                if (transport instanceof winston.transports.Console) {
                    transport.silent = true;
                }
            });
        }
    }
    log(message, context, meta) {
        this.logger.info(message, { context, ...meta });
    }
    error(message, trace, context, meta) {
        this.logger.error(message, { stack: trace, context, ...meta });
    }
    warn(message, context, meta) {
        this.logger.warn(message, { context, ...meta });
    }
    debug(message, context, meta) {
        this.logger.debug(message, { context, ...meta });
    }
    verbose(message, context, meta) {
        this.logger.verbose(message, { context, ...meta });
    }
    logGraphQLOperation(operationName, query, variables, duration, userId) {
        this.logger.info('GraphQL Operation', {
            context: 'GraphQL',
            operationName,
            query: query.replace(/\s+/g, ' ').trim(),
            variables,
            duration: duration ? `${duration}ms` : undefined,
            userId,
        });
    }
    logPrismaQuery(model, operation, duration, args) {
        this.logger.debug('Prisma Query', {
            context: 'Prisma',
            model,
            operation,
            duration: duration ? `${duration}ms` : undefined,
            args,
        });
    }
    logAuth(action, userId, email, success = true, reason) {
        const level = success ? 'info' : 'warn';
        this.logger.log(level, `Auth ${action}`, {
            context: 'Auth',
            action,
            userId,
            email,
            success,
            reason,
        });
    }
    logFileOperation(action, filename, size, mimetype, success = true, error) {
        const level = success ? 'info' : 'error';
        this.logger.log(level, `File ${action}`, {
            context: 'File',
            action,
            filename,
            size,
            mimetype,
            success,
            error,
        });
    }
    logCacheOperation(action, key, ttl) {
        this.logger.debug(`Cache ${action}`, {
            context: 'Cache',
            action,
            key,
            ttl,
        });
    }
    logSubscription(event, subscriberCount, payload) {
        this.logger.info(`Subscription ${event}`, {
            context: 'Subscription',
            event,
            subscriberCount,
            payload: payload ? JSON.stringify(payload) : undefined,
        });
    }
    logPerformance(operation, duration, meta) {
        const level = duration > 1000 ? 'warn' : 'debug';
        this.logger.log(level, `Performance: ${operation}`, {
            context: 'Performance',
            operation,
            duration: `${duration}ms`,
            ...meta,
        });
    }
    logSecurity(event, severity, details) {
        const level = severity === 'high' ? 'error' : severity === 'medium' ? 'warn' : 'info';
        this.logger.log(level, `Security: ${event}`, {
            context: 'Security',
            event,
            severity,
            ...details,
        });
    }
};
exports.LoggerService = LoggerService;
exports.LoggerService = LoggerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], LoggerService);
//# sourceMappingURL=logger.service.js.map