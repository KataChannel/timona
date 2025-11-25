import { OnModuleInit } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { AdvancedCacheService } from './advanced-cache.service';
import { PerformanceMetricsService } from './performance-metrics.service';
export interface SubscriptionConnection {
    id: string;
    userId?: string;
    queries: string[];
    lastActivity: number;
    connectionTime: number;
    subscriptions: Set<string>;
    metadata: {
        userAgent?: string;
        ip?: string;
        deviceType?: 'web' | 'mobile' | 'desktop';
        version?: string;
    };
}
export interface SubscriptionEvent {
    type: string;
    payload: any;
    targetUsers?: string[];
    targetConnections?: string[];
    priority: 'low' | 'normal' | 'high' | 'critical';
    ttl?: number;
}
export declare class SubscriptionOptimizationService implements OnModuleInit {
    private readonly cacheService;
    private readonly performanceService;
    private readonly pubSub;
    private connections;
    private subscriptionGroups;
    private batchBuffer;
    private batchTimeouts;
    private readonly config;
    private stats;
    constructor(cacheService: AdvancedCacheService, performanceService: PerformanceMetricsService);
    onModuleInit(): Promise<void>;
    registerConnection(connectionId: string, metadata: SubscriptionConnection['metadata'], userId?: string): Promise<void>;
    unregisterConnection(connectionId: string): Promise<void>;
    subscribe(connectionId: string, topic: string, variables?: any): Promise<void>;
    unsubscribe(connectionId: string, topic: string): Promise<void>;
    publish(topic: string, event: Omit<SubscriptionEvent, 'type'>): Promise<void>;
    getSubscriptionStats(): {
        connections: number;
        activeConnections: number;
        totalSubscriptions: number;
        eventsSent: number;
        batchedEvents: number;
        compressionSaves: number;
        topTopics: Array<{
            topic: string;
            subscribers: number;
        }>;
        connectionsByDevice: {
            web: number;
            mobile: number;
            desktop: number;
        };
    };
    private getTargetConnections;
    private batchEventForConnections;
    private flushBatch;
    private sendToConnections;
    private sendToConnection;
    private cacheSubscriptionData;
    private removeCachedSubscriptionData;
    private startConnectionMonitoring;
    private cleanupInactiveConnections;
    private sendHeartbeat;
    private startPerformanceTracking;
    getPubSub(): PubSub;
}
