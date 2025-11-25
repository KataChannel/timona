export interface SystemMetrics {
    timestamp: Date;
    cpu: {
        usage: number;
        loadAverage: number[];
        cores: number;
    };
    memory: {
        used: number;
        free: number;
        total: number;
        usage: number;
    };
    disk: {
        used: number;
        free: number;
        total: number;
        usage: number;
    };
    network: {
        bytesReceived: number;
        bytesSent: number;
    };
}
export interface ApplicationMetrics {
    timestamp: Date;
    requests: {
        total: number;
        perSecond: number;
        errors: number;
        errorRate: number;
    };
    responses: {
        averageTime: number;
        p95Time: number;
        p99Time: number;
    };
    database: {
        connections: number;
        activeQueries: number;
        slowQueries: number;
        averageQueryTime: number;
    };
    cache: {
        hitRate: number;
        missRate: number;
        evictions: number;
        memory: number;
    };
}
export interface CustomMetrics {
    [key: string]: {
        value: number;
        unit: string;
        description: string;
        tags?: Record<string, string>;
    };
}
export declare class MetricsCollectorService {
    private readonly logger;
    private readonly registry;
    private readonly httpRequestsTotal;
    private readonly httpRequestDuration;
    private readonly activeConnections;
    private readonly databaseQueries;
    private readonly databaseQueryDuration;
    private readonly cacheOperations;
    private readonly systemCpuUsage;
    private readonly systemMemoryUsage;
    private readonly customMetricsGauge;
    private requestCount;
    private errorCount;
    private responseTimes;
    private lastNetworkStats;
    private customMetrics;
    constructor();
    recordHttpRequest(method: string, route: string, statusCode: number, duration: number): void;
    recordDatabaseQuery(operation: string, table: string, duration: number, isError?: boolean): void;
    recordCacheOperation(operation: 'get' | 'set' | 'del', result: 'hit' | 'miss' | 'success'): void;
    setActiveConnections(type: string, count: number): void;
    recordCustomMetric(name: string, value: number, unit?: string, description?: string, tags?: Record<string, string>): void;
    getSystemMetrics(): Promise<SystemMetrics>;
    getApplicationMetrics(): ApplicationMetrics;
    getCustomMetrics(): CustomMetrics[];
    getPrometheusMetrics(): Promise<string>;
    resetMetrics(): void;
    collectSystemMetrics(): Promise<void>;
    private getCpuUsage;
    private getDiskUsage;
    private getNetworkStats;
}
