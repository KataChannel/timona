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
exports.GraphQLPerformanceInterceptor = void 0;
const common_1 = require("@nestjs/common");
const graphql_1 = require("@nestjs/graphql");
const operators_1 = require("rxjs/operators");
const performance_metrics_service_1 = require("../services/performance-metrics.service");
const advanced_cache_service_1 = require("../services/advanced-cache.service");
const mobile_optimization_service_1 = require("../services/mobile-optimization.service");
const crypto = __importStar(require("crypto"));
let GraphQLPerformanceInterceptor = class GraphQLPerformanceInterceptor {
    constructor(performanceService, cacheService, mobileService) {
        this.performanceService = performanceService;
        this.cacheService = cacheService;
        this.mobileService = mobileService;
    }
    intercept(context, next) {
        if (context.getType() !== 'graphql') {
            return next.handle();
        }
        const gqlContext = graphql_1.GqlExecutionContext.create(context);
        const info = gqlContext.getInfo();
        const request = gqlContext.getContext().req;
        const args = gqlContext.getArgs();
        const startTime = Date.now();
        const operationName = info.operation.name?.value || 'anonymous';
        const operationType = info.operation.operation;
        const fieldName = info.fieldName;
        const userId = request.user?.id || 'anonymous';
        const queryHash = this.generateQueryHash(info.fieldNodes[0]);
        const clientInfo = this.extractClientInfo(request);
        let cacheHit = false;
        const cacheKey = `gql:${operationType}:${fieldName}:${queryHash}`;
        return next.handle().pipe((0, operators_1.tap)({
            next: (result) => {
                const executionTime = Date.now() - startTime;
                this.recordPerformanceMetrics({
                    operationName,
                    operationType,
                    fieldName,
                    queryHash,
                    executionTime,
                    userId,
                    cacheHit,
                    success: true,
                    complexity: this.calculateQueryComplexity(info),
                    fieldCount: this.countFields(info.fieldNodes[0]),
                    clientInfo
                });
                if (this.isMobileClient(clientInfo)) {
                    this.handleMobileOptimization(result, clientInfo, cacheKey);
                }
                this.cacheResult(cacheKey, result, operationType, clientInfo);
            },
            error: (error) => {
                const executionTime = Date.now() - startTime;
                this.recordPerformanceMetrics({
                    operationName,
                    operationType,
                    fieldName,
                    queryHash,
                    executionTime,
                    userId,
                    cacheHit,
                    success: false,
                    error: error.message,
                    complexity: this.calculateQueryComplexity(info),
                    fieldCount: this.countFields(info.fieldNodes[0]),
                    clientInfo
                });
                this.performanceService.incrementCounter('graphql.errors.total');
                this.performanceService.incrementCounter(`graphql.errors.${operationType}`);
            }
        }));
    }
    recordPerformanceMetrics(data) {
        const { operationName, operationType, fieldName, queryHash, executionTime, userId, cacheHit, success, error, complexity, fieldCount, clientInfo } = data;
        this.performanceService.recordQueryPerformance({
            operationName,
            queryHash,
            duration: executionTime,
            cacheHit,
            complexity,
            fieldCount,
            userId
        });
        this.performanceService.incrementCounter(`graphql.${operationType}.total`);
        if (success) {
            this.performanceService.incrementCounter(`graphql.${operationType}.success`);
        }
        else {
            this.performanceService.incrementCounter(`graphql.${operationType}.error`);
        }
        this.performanceService.recordMetric({
            name: `graphql.${operationType}.execution_time`,
            value: executionTime,
            timestamp: Date.now(),
            tags: {
                operation: operationName,
                field: fieldName,
                success: success.toString(),
                cached: cacheHit.toString(),
                deviceType: clientInfo.deviceType,
                platform: clientInfo.platform
            },
            unit: 'ms'
        });
        this.performanceService.recordMetric({
            name: `graphql.query.complexity`,
            value: complexity,
            timestamp: Date.now(),
            tags: {
                operation: operationName,
                field: fieldName
            },
            unit: 'count'
        });
        if (this.isMobileClient(clientInfo)) {
            this.performanceService.recordMetric({
                name: 'mobile.graphql.execution_time',
                value: executionTime,
                timestamp: Date.now(),
                tags: {
                    platform: clientInfo.platform,
                    connectionType: clientInfo.connectionType || 'unknown'
                },
                unit: 'ms'
            });
        }
        if (error) {
            this.performanceService.recordMetric({
                name: 'graphql.error.details',
                value: 1,
                timestamp: Date.now(),
                tags: {
                    operation: operationName,
                    error: error.substring(0, 100),
                    userId
                },
                unit: 'count'
            });
        }
    }
    extractClientInfo(request) {
        const userAgent = request.headers['user-agent'] || '';
        const clientVersion = request.headers['x-client-version'] || '';
        const deviceType = request.headers['x-device-type'] || this.detectDeviceType(userAgent);
        const platform = request.headers['x-platform'] || this.detectPlatform(userAgent);
        const connectionType = request.headers['x-connection-type'] || 'unknown';
        const screenResolution = request.headers['x-screen-resolution'];
        const batteryLevel = request.headers['x-battery-level'];
        return {
            deviceType: deviceType,
            platform: platform,
            version: clientVersion,
            screenResolution: screenResolution ? this.parseResolution(screenResolution) : undefined,
            connectionType: connectionType,
            batteryLevel: batteryLevel ? parseInt(batteryLevel) : undefined
        };
    }
    detectDeviceType(userAgent) {
        const ua = userAgent.toLowerCase();
        if (/ipad|android.*tablet/.test(ua))
            return 'tablet';
        if (/mobile|android|iphone|ipod|blackberry|windows phone/.test(ua))
            return 'mobile';
        return 'desktop';
    }
    detectPlatform(userAgent) {
        const ua = userAgent.toLowerCase();
        if (/iphone|ipad|ipod/.test(ua))
            return 'ios';
        if (/android/.test(ua))
            return 'android';
        return 'web';
    }
    parseResolution(resolution) {
        const match = resolution.match(/(\d+)x(\d+)/);
        if (match) {
            return {
                width: parseInt(match[1]),
                height: parseInt(match[2])
            };
        }
        return undefined;
    }
    isMobileClient(clientInfo) {
        return clientInfo.deviceType === 'mobile' || clientInfo.deviceType === 'tablet';
    }
    async handleMobileOptimization(result, clientInfo, cacheKey) {
        this.performanceService.recordMetric({
            name: 'mobile.queries.total',
            value: 1,
            timestamp: Date.now(),
            tags: {
                platform: clientInfo.platform,
                deviceType: clientInfo.deviceType
            },
            unit: 'count'
        });
    }
    async cacheResult(cacheKey, result, operationType, clientInfo) {
        if (operationType !== 'query')
            return;
        if (!result || result.errors)
            return;
        const resultSize = JSON.stringify(result).length;
        const isMobile = this.isMobileClient(clientInfo);
        let cacheLayer = 'L2_MEDIUM';
        let ttl = 300000;
        if (isMobile) {
            cacheLayer = 'L1_FAST';
            ttl = 600000;
        }
        else if (resultSize > 10000) {
            cacheLayer = 'L3_SLOW';
            ttl = 1800000;
        }
        await this.cacheService.set(cacheKey, result, {
            layer: cacheLayer,
            ttl,
            tags: ['graphql', `type:${operationType}`, `device:${clientInfo.deviceType}`]
        });
    }
    generateQueryHash(fieldNode) {
        const queryString = this.serializeFieldNode(fieldNode);
        return crypto.createHash('md5').update(queryString).digest('hex').substring(0, 16);
    }
    serializeFieldNode(fieldNode) {
        if (!fieldNode)
            return '';
        const parts = [fieldNode.name?.value || ''];
        if (fieldNode.arguments && fieldNode.arguments.length > 0) {
            const args = fieldNode.arguments
                .map((arg) => `${arg.name.value}:${this.serializeValue(arg.value)}`)
                .sort()
                .join(',');
            parts.push(args);
        }
        if (fieldNode.selectionSet && fieldNode.selectionSet.selections) {
            const selections = fieldNode.selectionSet.selections
                .map((selection) => this.serializeFieldNode(selection))
                .sort()
                .join(',');
            parts.push(selections);
        }
        return parts.join('|');
    }
    serializeValue(value) {
        if (!value)
            return '';
        switch (value.kind) {
            case 'StringValue':
            case 'IntValue':
            case 'FloatValue':
            case 'BooleanValue':
                return value.value;
            case 'Variable':
                return `$${value.name.value}`;
            case 'ListValue':
                return `[${value.values.map((v) => this.serializeValue(v)).join(',')}]`;
            case 'ObjectValue':
                return `{${value.fields
                    .map((field) => `${field.name.value}:${this.serializeValue(field.value)}`)
                    .sort()
                    .join(',')}}`;
            default:
                return '';
        }
    }
    calculateQueryComplexity(info) {
        let complexity = 1;
        if (info.fieldNodes && info.fieldNodes.length > 0) {
            complexity += this.calculateFieldComplexity(info.fieldNodes[0]);
        }
        return complexity;
    }
    calculateFieldComplexity(fieldNode) {
        let complexity = 1;
        if (fieldNode.selectionSet && fieldNode.selectionSet.selections) {
            for (const selection of fieldNode.selectionSet.selections) {
                complexity += this.calculateFieldComplexity(selection);
            }
        }
        if (fieldNode.arguments && fieldNode.arguments.length > 0) {
            complexity += fieldNode.arguments.length;
        }
        return complexity;
    }
    countFields(fieldNode) {
        let count = 1;
        if (fieldNode.selectionSet && fieldNode.selectionSet.selections) {
            for (const selection of fieldNode.selectionSet.selections) {
                count += this.countFields(selection);
            }
        }
        return count;
    }
};
exports.GraphQLPerformanceInterceptor = GraphQLPerformanceInterceptor;
exports.GraphQLPerformanceInterceptor = GraphQLPerformanceInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [performance_metrics_service_1.PerformanceMetricsService,
        advanced_cache_service_1.AdvancedCacheService,
        mobile_optimization_service_1.MobileOptimizationService])
], GraphQLPerformanceInterceptor);
//# sourceMappingURL=graphql-performance.interceptor.js.map