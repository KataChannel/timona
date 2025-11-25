import { MetricsCollectorService } from './metrics-collector.service';
import * as v8 from 'v8';
export interface PerformanceProfile {
    timestamp: Date;
    duration: number;
    profiles: {
        cpu: CpuProfile;
        memory: MemoryProfile;
        event_loop: EventLoopProfile;
        gc: GarbageCollectionProfile;
    };
    bottlenecks: PerformanceBottleneck[];
    recommendations: PerformanceRecommendation[];
}
export interface CpuProfile {
    totalTime: number;
    userTime: number;
    systemTime: number;
    usage: number;
    topFunctions: ProfiledFunction[];
}
export interface MemoryProfile {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
    heapUtilization: number;
    v8HeapStatistics: v8.HeapInfo;
    memoryLeaks: MemoryLeak[];
}
export interface EventLoopProfile {
    delay: number;
    utilization: number;
    lag: number;
    activeHandles: number;
    activeRequests: number;
}
export interface GarbageCollectionProfile {
    totalCollections: number;
    totalTime: number;
    averageTime: number;
    collections: GCEvent[];
}
export interface ProfiledFunction {
    name: string;
    file: string;
    line: number;
    selfTime: number;
    totalTime: number;
    callCount: number;
}
export interface MemoryLeak {
    type: string;
    size: number;
    growthRate: number;
    location: string;
    severity: 'low' | 'medium' | 'high';
}
export interface GCEvent {
    timestamp: Date;
    type: string;
    duration: number;
    heapBefore: number;
    heapAfter: number;
    freedMemory: number;
}
export interface PerformanceBottleneck {
    type: 'cpu' | 'memory' | 'io' | 'database' | 'network';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    impact: string;
    location?: string;
    metrics: Record<string, number>;
}
export interface PerformanceRecommendation {
    category: 'optimization' | 'scaling' | 'refactoring' | 'monitoring';
    priority: 'low' | 'medium' | 'high';
    title: string;
    description: string;
    expectedImpact: string;
    effort: 'low' | 'medium' | 'high';
    steps: string[];
}
export declare class PerformanceProfilerService {
    private readonly metricsCollector;
    private readonly logger;
    private profilingActive;
    private profileStartTime;
    private startCpuUsage;
    private startMemoryUsage;
    private gcEvents;
    private eventLoopMonitor;
    private memorySnapshots;
    constructor(metricsCollector: MetricsCollectorService);
    startProfiling(): void;
    stopProfiling(): Promise<PerformanceProfile>;
    getPerformanceSnapshot(): Promise<Partial<PerformanceProfile>>;
    private generateCpuProfile;
    private generateMemoryProfile;
    private generateEventLoopProfile;
    private generateGarbageCollectionProfile;
    private analyzeBottlenecks;
    private generateRecommendations;
    private setupGCMonitoring;
    private startEventLoopMonitoring;
    private stopEventLoopMonitoring;
    private getCurrentCpuUsage;
    private getCurrentEventLoopMetrics;
    private takeMemorySnapshot;
    private detectMemoryLeaks;
    private getTopFunctions;
}
