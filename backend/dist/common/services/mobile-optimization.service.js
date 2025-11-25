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
exports.MobileOptimizationService = void 0;
const common_1 = require("@nestjs/common");
const advanced_cache_service_1 = require("./advanced-cache.service");
const performance_metrics_service_1 = require("./performance-metrics.service");
const zlib = __importStar(require("zlib"));
const util_1 = require("util");
const gzip = (0, util_1.promisify)(zlib.gzip);
const gunzip = (0, util_1.promisify)(zlib.gunzip);
let MobileOptimizationService = class MobileOptimizationService {
    constructor(cacheService, performanceService) {
        this.cacheService = cacheService;
        this.performanceService = performanceService;
        this.mobileQueries = new Map();
        this.optimizationPresets = {
            'low-end-mobile': {
                maxImageSize: 50 * 1024,
                maxResponseSize: 100 * 1024,
                compressionThreshold: 1024,
                maxComplexity: 50,
                batchSize: 3,
                cacheStrategy: 'aggressive'
            },
            'mid-range-mobile': {
                maxImageSize: 200 * 1024,
                maxResponseSize: 500 * 1024,
                compressionThreshold: 2048,
                maxComplexity: 100,
                batchSize: 5,
                cacheStrategy: 'normal'
            },
            'high-end-mobile': {
                maxImageSize: 500 * 1024,
                maxResponseSize: 1024 * 1024,
                compressionThreshold: 4096,
                maxComplexity: 200,
                batchSize: 10,
                cacheStrategy: 'normal'
            },
            'tablet': {
                maxImageSize: 1024 * 1024,
                maxResponseSize: 2 * 1024 * 1024,
                compressionThreshold: 8192,
                maxComplexity: 300,
                batchSize: 15,
                cacheStrategy: 'minimal'
            }
        };
        this.stats = {
            totalRequests: 0,
            mobileRequests: 0,
            compressionSavings: 0,
            cacheSavings: 0,
            averageResponseSize: 0,
            optimizationHits: 0,
        };
    }
    async optimizeQuery(query, variables, clientInfo, context) {
        const startTime = Date.now();
        this.stats.totalRequests++;
        if (this.isMobileClient(clientInfo)) {
            this.stats.mobileRequests++;
        }
        const optimization = this.getOptimizationForClient(clientInfo);
        const cacheKey = this.generateMobileCacheKey(query, variables, clientInfo);
        const cached = await this.cacheService.get(cacheKey, {
            layer: optimization.cacheStrategy === 'aggressive' ? 'L1_FAST' : 'L2_MEDIUM',
            tags: ['mobile', `platform:${clientInfo.platform}`, `device:${clientInfo.deviceType}`]
        });
        if (cached) {
            this.stats.cacheSavings++;
            cached.cacheHit = true;
            return cached;
        }
        const optimizedQuery = this.optimizeQueryForMobile(query, optimization);
        const optimizedVariables = this.optimizeVariablesForMobile(variables, clientInfo);
        const queryResult = await this.executeOptimizedQuery(optimizedQuery, optimizedVariables, context);
        const transformedData = this.transformDataForMobile(queryResult, clientInfo, optimization);
        const originalSize = JSON.stringify(queryResult).length;
        let responseData = JSON.stringify(transformedData);
        let compressed = false;
        let compressionRatio = 1;
        if (optimization.compressionEnabled && responseData.length > this.getCompressionThreshold(clientInfo)) {
            const compressedData = await this.compressResponse(responseData);
            if (compressedData.length < responseData.length * 0.8) {
                responseData = compressedData.toString('base64');
                compressed = true;
                compressionRatio = originalSize / compressedData.length;
                this.stats.compressionSavings += (originalSize - compressedData.length);
            }
        }
        const response = {
            data: compressed ? responseData : transformedData,
            compressed,
            size: responseData.length,
            originalSize,
            compressionRatio,
            cacheHit: false,
            executionTime: Date.now() - startTime,
            metadata: {
                fieldsSelected: this.countSelectedFields(optimizedQuery),
                totalFields: this.countSelectedFields(query),
                compressionSavings: compressed ? originalSize - responseData.length : 0
            }
        };
        const cacheOptions = {
            layer: optimization.cacheStrategy === 'aggressive' ? 'L1_FAST' : 'L2_MEDIUM',
            ttl: this.getCacheTtlForClient(clientInfo),
            tags: ['mobile', `platform:${clientInfo.platform}`, `device:${clientInfo.deviceType}`]
        };
        await this.cacheService.set(cacheKey, response, cacheOptions);
        this.updatePerformanceMetrics(response, clientInfo);
        return response;
    }
    async batchQueries(queries, clientInfo, context) {
        const optimization = this.getOptimizationForClient(clientInfo);
        const batchSize = Math.min(queries.length, optimization.batchSize || 5);
        const results = [];
        for (let i = 0; i < queries.length; i += batchSize) {
            const batch = queries.slice(i, i + batchSize);
            const batchPromises = batch.map(({ query, variables }) => this.optimizeQuery(query, variables, clientInfo, context));
            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);
        }
        return results;
    }
    getMobileFieldSelection(query, clientInfo) {
        const optimization = this.getOptimizationForClient(clientInfo);
        const mobileFields = this.extractMobileOptimizedFields(query, clientInfo);
        return {
            optimizedQuery: this.buildOptimizedQuery(query, mobileFields),
            selectedFields: mobileFields
        };
    }
    getMobileStats() {
        return {
            totalRequests: this.stats.totalRequests,
            mobileRequests: this.stats.mobileRequests,
            mobilePercentage: this.stats.totalRequests > 0
                ? (this.stats.mobileRequests / this.stats.totalRequests) * 100
                : 0,
            compressionSavings: this.stats.compressionSavings,
            cacheSavings: this.stats.cacheSavings,
            averageResponseSize: this.stats.averageResponseSize,
            optimizationEfficiency: this.stats.optimizationHits / Math.max(this.stats.mobileRequests, 1) * 100
        };
    }
    isMobileClient(clientInfo) {
        return clientInfo.deviceType === 'mobile' ||
            (clientInfo.deviceType === 'tablet' && clientInfo.screenResolution &&
                clientInfo.screenResolution.width < 768);
    }
    getOptimizationForClient(clientInfo) {
        if (clientInfo.deviceType === 'tablet') {
            return this.optimizationPresets['tablet'];
        }
        if (clientInfo.deviceType === 'mobile') {
            const connectionScore = this.getConnectionScore(clientInfo.connectionType);
            const batteryScore = clientInfo.batteryLevel ? clientInfo.batteryLevel / 100 : 1;
            const overallScore = connectionScore * batteryScore;
            if (overallScore < 0.3)
                return this.optimizationPresets['low-end-mobile'];
            if (overallScore < 0.7)
                return this.optimizationPresets['mid-range-mobile'];
            return this.optimizationPresets['high-end-mobile'];
        }
        return this.optimizationPresets['high-end-mobile'];
    }
    getConnectionScore(connectionType) {
        switch (connectionType) {
            case 'wifi': return 1.0;
            case '4g': return 0.8;
            case '3g': return 0.5;
            case '2g': return 0.2;
            default: return 0.7;
        }
    }
    generateMobileCacheKey(query, variables, clientInfo) {
        const key = `mobile:${clientInfo.platform}:${clientInfo.deviceType}:${clientInfo.connectionType || 'unknown'}`;
        const queryHash = this.hashQuery(query + JSON.stringify(variables));
        return `${key}:${queryHash}`;
    }
    hashQuery(input) {
        let hash = 0;
        for (let i = 0; i < input.length; i++) {
            const char = input.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    }
    optimizeQueryForMobile(query, optimization) {
        let optimizedQuery = query;
        if (optimization.cacheStrategy === 'aggressive') {
            optimizedQuery = this.removeHeavyFields(optimizedQuery);
        }
        return optimizedQuery;
    }
    removeHeavyFields(query) {
        const heavyFields = ['fullDescription', 'largeImages', 'metadata', 'auditLogs'];
        let result = query;
        heavyFields.forEach(field => {
            const fieldRegex = new RegExp(`\\s*${field}\\s*`, 'g');
            result = result.replace(fieldRegex, '');
        });
        return result;
    }
    optimizeVariablesForMobile(variables, clientInfo) {
        const optimized = { ...variables };
        const preset = this.getOptimizationForClient(clientInfo);
        if (optimized.limit && optimized.limit > 20) {
            optimized.limit = Math.min(optimized.limit, 20);
        }
        if (optimized.imageSize) {
            optimized.imageSize = Math.min(optimized.imageSize, preset.maxImageSize);
        }
        return optimized;
    }
    async executeOptimizedQuery(query, variables, context) {
        return {
            todos: [
                { id: '1', title: 'Sample Todo', completed: false },
                { id: '2', title: 'Another Todo', completed: true }
            ]
        };
    }
    transformDataForMobile(data, clientInfo, optimization) {
        if (!data)
            return data;
        const transformed = JSON.parse(JSON.stringify(data));
        if (clientInfo.deviceType === 'mobile') {
            this.simplifyNestedObjects(transformed, 3);
        }
        return transformed;
    }
    simplifyNestedObjects(obj, maxDepth, currentDepth = 0) {
        if (currentDepth >= maxDepth || !obj || typeof obj !== 'object') {
            return;
        }
        Object.keys(obj).forEach(key => {
            if (Array.isArray(obj[key])) {
                if (obj[key].length > 10) {
                    obj[key] = obj[key].slice(0, 10);
                }
            }
            else if (typeof obj[key] === 'object' && obj[key] !== null) {
                this.simplifyNestedObjects(obj[key], maxDepth, currentDepth + 1);
            }
        });
    }
    async compressResponse(data) {
        return await gzip(Buffer.from(data, 'utf8'));
    }
    getCompressionThreshold(clientInfo) {
        const preset = this.getOptimizationForClient(clientInfo);
        return preset.compressionThreshold;
    }
    extractMobileOptimizedFields(query, clientInfo) {
        const mobileOptimizedFields = [
            'id', 'title', 'completed', 'createdAt', 'updatedAt',
            'userId', 'priority', 'dueDate'
        ];
        return mobileOptimizedFields;
    }
    buildOptimizedQuery(originalQuery, selectedFields) {
        return originalQuery;
    }
    countSelectedFields(query) {
        const fieldMatches = query.match(/\w+/g) || [];
        return fieldMatches.length;
    }
    getCacheTtlForClient(clientInfo) {
        if (clientInfo.deviceType === 'mobile' &&
            (clientInfo.connectionType === '2g' || clientInfo.connectionType === '3g')) {
            return 600000;
        }
        return 300000;
    }
    updatePerformanceMetrics(response, clientInfo) {
        this.stats.averageResponseSize = ((this.stats.averageResponseSize * (this.stats.totalRequests - 1)) + response.size) / this.stats.totalRequests;
        if (response.compressionRatio > 1.2) {
            this.stats.optimizationHits++;
        }
        this.performanceService.recordMetric({
            name: 'mobile.response.size',
            value: response.size,
            timestamp: Date.now(),
            tags: {
                platform: clientInfo.platform,
                deviceType: clientInfo.deviceType,
                compressed: response.compressed.toString()
            },
            unit: 'bytes'
        });
        this.performanceService.recordMetric({
            name: 'mobile.response.execution_time',
            value: response.executionTime,
            timestamp: Date.now(),
            tags: {
                platform: clientInfo.platform,
                deviceType: clientInfo.deviceType
            },
            unit: 'ms'
        });
    }
};
exports.MobileOptimizationService = MobileOptimizationService;
exports.MobileOptimizationService = MobileOptimizationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [advanced_cache_service_1.AdvancedCacheService,
        performance_metrics_service_1.PerformanceMetricsService])
], MobileOptimizationService);
//# sourceMappingURL=mobile-optimization.service.js.map