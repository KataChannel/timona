import { Injectable, Logger } from '@nestjs/common';
import { MetricsCollectorService } from './metrics-collector.service';
import * as process from 'process';
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

@Injectable()
export class PerformanceProfilerService {
  private readonly logger = new Logger(PerformanceProfilerService.name);
  private profilingActive = false;
  private profileStartTime: Date | null = null;
  private startCpuUsage: NodeJS.CpuUsage | null = null;
  private startMemoryUsage: NodeJS.MemoryUsage | null = null;
  private gcEvents: GCEvent[] = [];
  private eventLoopMonitor: NodeJS.Timeout | null = null;
  private memorySnapshots: MemoryProfile[] = [];

  constructor(private readonly metricsCollector: MetricsCollectorService) {
    this.setupGCMonitoring();
    this.logger.log('PerformanceProfilerService initialized');
  }

  /**
   * Start performance profiling
   */
  startProfiling(): void {
    if (this.profilingActive) {
      this.logger.warn('Profiling is already active');
      return;
    }

    this.logger.log('Starting performance profiling');
    this.profilingActive = true;
    this.profileStartTime = new Date();
    this.startCpuUsage = process.cpuUsage();
    this.startMemoryUsage = process.memoryUsage();
    this.gcEvents = [];
    this.memorySnapshots = [];

    // Start event loop monitoring
    this.startEventLoopMonitoring();
    
    // Take initial memory snapshot
    this.takeMemorySnapshot();

    this.metricsCollector.recordCustomMetric('profiling_started', 1, 'count', 'Performance profiling started');
  }

  /**
   * Stop performance profiling and generate report
   */
  async stopProfiling(): Promise<PerformanceProfile> {
    if (!this.profilingActive) {
      throw new Error('Profiling is not active');
    }

    this.logger.log('Stopping performance profiling');
    this.profilingActive = false;
    
    const endTime = new Date();
    const duration = this.profileStartTime ? endTime.getTime() - this.profileStartTime.getTime() : 0;

    // Stop event loop monitoring
    this.stopEventLoopMonitoring();

    // Generate profiles
    const cpuProfile = await this.generateCpuProfile();
    const memoryProfile = await this.generateMemoryProfile();
    const eventLoopProfile = this.generateEventLoopProfile();
    const gcProfile = this.generateGarbageCollectionProfile();

    // Analyze bottlenecks and generate recommendations
    const bottlenecks = this.analyzeBottlenecks(cpuProfile, memoryProfile, eventLoopProfile);
    const recommendations = this.generateRecommendations(bottlenecks, cpuProfile, memoryProfile);

    const profile: PerformanceProfile = {
      timestamp: endTime,
      duration,
      profiles: {
        cpu: cpuProfile,
        memory: memoryProfile,
        event_loop: eventLoopProfile,
        gc: gcProfile
      },
      bottlenecks,
      recommendations
    };

    this.metricsCollector.recordCustomMetric('profiling_completed', 1, 'count', 'Performance profiling completed');
    this.metricsCollector.recordCustomMetric('profiling_duration', duration, 'milliseconds', 'Performance profiling duration');

    this.logger.log(`Performance profiling completed in ${duration}ms with ${bottlenecks.length} bottlenecks identified`);
    return profile;
  }

  /**
   * Get current performance snapshot without full profiling
   */
  async getPerformanceSnapshot(): Promise<Partial<PerformanceProfile>> {
    const timestamp = new Date();
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    const snapshot: Partial<PerformanceProfile> = {
      timestamp,
      profiles: {
        cpu: {
          totalTime: (cpuUsage.user + cpuUsage.system) / 1000,
          userTime: cpuUsage.user / 1000,
          systemTime: cpuUsage.system / 1000,
          usage: await this.getCurrentCpuUsage(),
          topFunctions: [] // Not available in snapshot mode
        },
        memory: {
          heapUsed: memoryUsage.heapUsed,
          heapTotal: memoryUsage.heapTotal,
          external: memoryUsage.external,
          rss: memoryUsage.rss,
          heapUtilization: (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100,
          v8HeapStatistics: v8.getHeapStatistics(),
          memoryLeaks: [] // Not available in snapshot mode
        },
        event_loop: this.getCurrentEventLoopMetrics(),
        gc: {
          totalCollections: this.gcEvents.length,
          totalTime: this.gcEvents.reduce((sum, event) => sum + event.duration, 0),
          averageTime: this.gcEvents.length > 0 ? 
            this.gcEvents.reduce((sum, event) => sum + event.duration, 0) / this.gcEvents.length : 0,
          collections: this.gcEvents.slice(-10) // Last 10 GC events
        }
      }
    };

    return snapshot;
  }

  /**
   * Generate CPU profile
   */
  private async generateCpuProfile(): Promise<CpuProfile> {
    const endCpuUsage = process.cpuUsage(this.startCpuUsage!);
    const currentUsage = await this.getCurrentCpuUsage();

    return {
      totalTime: (endCpuUsage.user + endCpuUsage.system) / 1000,
      userTime: endCpuUsage.user / 1000,
      systemTime: endCpuUsage.system / 1000,
      usage: currentUsage,
      topFunctions: this.getTopFunctions() // Mock implementation
    };
  }

  /**
   * Generate memory profile
   */
  private async generateMemoryProfile(): Promise<MemoryProfile> {
    const currentMemory = process.memoryUsage();
    const heapStats = v8.getHeapStatistics();
    
    // Take final memory snapshot
    this.takeMemorySnapshot();
    
    const memoryLeaks = this.detectMemoryLeaks();

    return {
      heapUsed: currentMemory.heapUsed,
      heapTotal: currentMemory.heapTotal,
      external: currentMemory.external,
      rss: currentMemory.rss,
      heapUtilization: (currentMemory.heapUsed / currentMemory.heapTotal) * 100,
      v8HeapStatistics: heapStats,
      memoryLeaks
    };
  }

  /**
   * Generate event loop profile
   */
  private generateEventLoopProfile(): EventLoopProfile {
    return this.getCurrentEventLoopMetrics();
  }

  /**
   * Generate garbage collection profile
   */
  private generateGarbageCollectionProfile(): GarbageCollectionProfile {
    const totalTime = this.gcEvents.reduce((sum, event) => sum + event.duration, 0);
    const averageTime = this.gcEvents.length > 0 ? totalTime / this.gcEvents.length : 0;

    return {
      totalCollections: this.gcEvents.length,
      totalTime,
      averageTime,
      collections: [...this.gcEvents]
    };
  }

  /**
   * Analyze performance bottlenecks
   */
  private analyzeBottlenecks(
    cpu: CpuProfile,
    memory: MemoryProfile,
    eventLoop: EventLoopProfile
  ): PerformanceBottleneck[] {
    const bottlenecks: PerformanceBottleneck[] = [];

    // CPU bottlenecks
    if (cpu.usage > 80) {
      bottlenecks.push({
        type: 'cpu',
        severity: cpu.usage > 95 ? 'critical' : 'high',
        description: `High CPU usage detected: ${cpu.usage.toFixed(2)}%`,
        impact: 'Application responsiveness may be degraded',
        metrics: { cpuUsage: cpu.usage, userTime: cpu.userTime, systemTime: cpu.systemTime }
      });
    }

    // Memory bottlenecks
    if (memory.heapUtilization > 85) {
      bottlenecks.push({
        type: 'memory',
        severity: memory.heapUtilization > 95 ? 'critical' : 'high',
        description: `High memory usage detected: ${memory.heapUtilization.toFixed(2)}%`,
        impact: 'Risk of out-of-memory errors and increased GC pressure',
        metrics: { heapUtilization: memory.heapUtilization, heapUsed: memory.heapUsed }
      });
    }

    // Event loop bottlenecks
    if (eventLoop.delay > 100) {
      bottlenecks.push({
        type: 'io',
        severity: eventLoop.delay > 500 ? 'critical' : eventLoop.delay > 200 ? 'high' : 'medium',
        description: `Event loop delay detected: ${eventLoop.delay.toFixed(2)}ms`,
        impact: 'Request handling and real-time features may be affected',
        metrics: { eventLoopDelay: eventLoop.delay, utilization: eventLoop.utilization }
      });
    }

    // Memory leak detection
    memory.memoryLeaks.forEach(leak => {
      if (leak.severity === 'high') {
        bottlenecks.push({
          type: 'memory',
          severity: 'high',
          description: `Memory leak detected: ${leak.type}`,
          impact: `Memory usage growing at ${leak.growthRate.toFixed(2)} MB/hour`,
          location: leak.location,
          metrics: { leakSize: leak.size, growthRate: leak.growthRate }
        });
      }
    });

    return bottlenecks;
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(
    bottlenecks: PerformanceBottleneck[],
    cpu: CpuProfile,
    memory: MemoryProfile
  ): PerformanceRecommendation[] {
    const recommendations: PerformanceRecommendation[] = [];

    // CPU optimization recommendations
    if (cpu.usage > 70) {
      recommendations.push({
        category: 'optimization',
        priority: cpu.usage > 90 ? 'high' : 'medium',
        title: 'Optimize CPU-intensive operations',
        description: 'High CPU usage detected. Consider optimizing computational algorithms and adding caching.',
        expectedImpact: 'Reduce CPU usage by 20-30% and improve response times',
        effort: 'medium',
        steps: [
          'Profile CPU-intensive functions using Node.js profiler',
          'Implement caching for expensive calculations',
          'Consider moving heavy computations to worker threads',
          'Optimize database queries and reduce N+1 query problems'
        ]
      });
    }

    // Memory optimization recommendations
    if (memory.heapUtilization > 80) {
      recommendations.push({
        category: 'optimization',
        priority: 'high',
        title: 'Optimize memory usage',
        description: 'High memory utilization detected. Implement memory optimizations to prevent OOM errors.',
        expectedImpact: 'Reduce memory usage by 15-25% and improve stability',
        effort: 'medium',
        steps: [
          'Analyze memory heap dumps to identify large objects',
          'Implement object pooling for frequently created objects',
          'Add memory limits and monitoring alerts',
          'Consider implementing data pagination for large datasets'
        ]
      });
    }

    // Event loop recommendations
    const eventLoopBottleneck = bottlenecks.find(b => b.type === 'io');
    if (eventLoopBottleneck) {
      recommendations.push({
        category: 'optimization',
        priority: 'high',
        title: 'Optimize event loop performance',
        description: 'Event loop blocking detected. Improve asynchronous operation handling.',
        expectedImpact: 'Reduce response times by 30-50% and improve concurrency',
        effort: 'high',
        steps: [
          'Identify and optimize blocking synchronous operations',
          'Implement proper async/await patterns',
          'Use worker threads for CPU-intensive tasks',
          'Optimize database connection pooling'
        ]
      });
    }

    // General monitoring recommendations
    recommendations.push({
      category: 'monitoring',
      priority: 'medium',
      title: 'Implement continuous performance monitoring',
      description: 'Set up automated performance monitoring and alerting.',
      expectedImpact: 'Proactive identification of performance issues',
      effort: 'low',
      steps: [
        'Set up performance metrics dashboards',
        'Configure alerts for performance thresholds',
        'Implement automated performance testing',
        'Regular performance review sessions'
      ]
    });

    return recommendations;
  }

  /**
   * Setup garbage collection monitoring
   */
  private setupGCMonitoring(): void {
    // Note: In production, you would use performance hooks or other GC monitoring tools
    // This is a simplified mock implementation
    setInterval(() => {
      if (this.profilingActive) {
        const memoryBefore = process.memoryUsage().heapUsed;
        // Mock GC event
        setTimeout(() => {
          const memoryAfter = process.memoryUsage().heapUsed;
          this.gcEvents.push({
            timestamp: new Date(),
            type: 'mark-sweep',
            duration: Math.random() * 10, // Mock duration
            heapBefore: memoryBefore,
            heapAfter: memoryAfter,
            freedMemory: Math.max(0, memoryBefore - memoryAfter)
          });
        }, 1);
      }
    }, 5000); // Check every 5 seconds
  }

  /**
   * Start event loop monitoring
   */
  private startEventLoopMonitoring(): void {
    this.eventLoopMonitor = setInterval(() => {
      if (this.profilingActive) {
        // Monitor event loop delay
        const start = process.hrtime.bigint();
        setImmediate(() => {
          const delay = Number(process.hrtime.bigint() - start) / 1000000; // Convert to ms
          this.metricsCollector.recordCustomMetric('event_loop_delay', delay, 'milliseconds');
        });
      }
    }, 1000);
  }

  /**
   * Stop event loop monitoring
   */
  private stopEventLoopMonitoring(): void {
    if (this.eventLoopMonitor) {
      clearInterval(this.eventLoopMonitor);
      this.eventLoopMonitor = null;
    }
  }

  /**
   * Get current CPU usage
   */
  private async getCurrentCpuUsage(): Promise<number> {
    return new Promise((resolve) => {
      const startUsage = process.cpuUsage();
      setTimeout(() => {
        const endUsage = process.cpuUsage(startUsage);
        const totalUsage = endUsage.user + endUsage.system;
        const cpuPercent = (totalUsage / 100000) * 100; // Convert to percentage
        resolve(Math.min(100, Math.max(0, cpuPercent)));
      }, 100);
    });
  }

  /**
   * Get current event loop metrics
   */
  private getCurrentEventLoopMetrics(): EventLoopProfile {
    // Mock implementation - in production, use actual event loop monitoring
    return {
      delay: Math.random() * 50, // Mock delay
      utilization: Math.random() * 100,
      lag: Math.random() * 20,
      activeHandles: 0, // process._getActiveHandles() is not available in types
      activeRequests: 0  // process._getActiveRequests() is not available in types
    };
  }

  /**
   * Take memory snapshot for leak detection
   */
  private takeMemorySnapshot(): void {
    const memory = process.memoryUsage();
    const heapStats = v8.getHeapStatistics();
    
    const snapshot: MemoryProfile = {
      heapUsed: memory.heapUsed,
      heapTotal: memory.heapTotal,
      external: memory.external,
      rss: memory.rss,
      heapUtilization: (memory.heapUsed / memory.heapTotal) * 100,
      v8HeapStatistics: heapStats,
      memoryLeaks: []
    };
    
    this.memorySnapshots.push(snapshot);
    
    // Keep only last 10 snapshots
    if (this.memorySnapshots.length > 10) {
      this.memorySnapshots = this.memorySnapshots.slice(-10);
    }
  }

  /**
   * Detect memory leaks
   */
  private detectMemoryLeaks(): MemoryLeak[] {
    const leaks: MemoryLeak[] = [];
    
    if (this.memorySnapshots.length < 3) {
      return leaks; // Not enough data
    }
    
    const recent = this.memorySnapshots.slice(-3);
    const memoryGrowth = recent[2].heapUsed - recent[0].heapUsed;
    const timeSpan = 3; // 3 snapshots
    const growthRate = memoryGrowth / timeSpan / (1024 * 1024); // MB per snapshot
    
    if (growthRate > 5) { // Growing by more than 5MB per snapshot
      leaks.push({
        type: 'heap_growth',
        size: memoryGrowth,
        growthRate: growthRate * 60, // Extrapolate to MB per hour
        location: 'unknown',
        severity: growthRate > 20 ? 'high' : growthRate > 10 ? 'medium' : 'low'
      });
    }
    
    return leaks;
  }

  /**
   * Get top CPU-consuming functions (mock implementation)
   */
  private getTopFunctions(): ProfiledFunction[] {
    // Mock implementation - in production, use V8 profiler or similar
    return [
      {
        name: 'processingFunction',
        file: '/src/services/heavy-computation.service.ts',
        line: 42,
        selfTime: 150.5,
        totalTime: 200.3,
        callCount: 1250
      },
      {
        name: 'databaseQuery',
        file: '/src/database/query-builder.ts',
        line: 89,
        selfTime: 95.2,
        totalTime: 120.8,
        callCount: 3400
      }
    ];
  }
}