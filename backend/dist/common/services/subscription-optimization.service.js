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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionOptimizationService = void 0;
const common_1 = require("@nestjs/common");
const graphql_subscriptions_1 = require("graphql-subscriptions");
const advanced_cache_service_1 = require("./advanced-cache.service");
const performance_metrics_service_1 = require("./performance-metrics.service");
let SubscriptionOptimizationService = class SubscriptionOptimizationService {
    constructor(cacheService, performanceService) {
        this.cacheService = cacheService;
        this.performanceService = performanceService;
        this.pubSub = new graphql_subscriptions_1.PubSub();
        this.connections = new Map();
        this.subscriptionGroups = new Map();
        this.batchBuffer = new Map();
        this.batchTimeouts = new Map();
        this.config = {
            maxConnectionsPerUser: 5,
            connectionTimeout: 30 * 60 * 1000,
            batchDelay: 100,
            maxBatchSize: 10,
            priorityQueues: true,
            compressionThreshold: 1024,
            heartbeatInterval: 30000,
        };
        this.stats = {
            totalConnections: 0,
            activeConnections: 0,
            totalSubscriptions: 0,
            eventsSent: 0,
            batchedEvents: 0,
            compressionSaves: 0,
            disconnectionsCleaned: 0,
        };
    }
    async onModuleInit() {
        this.startConnectionMonitoring();
        this.startPerformanceTracking();
    }
    async registerConnection(connectionId, metadata, userId) {
        if (userId) {
            const userConnections = Array.from(this.connections.values())
                .filter(conn => conn.userId === userId).length;
            if (userConnections >= this.config.maxConnectionsPerUser) {
                throw new Error(`Maximum connections exceeded for user ${userId}`);
            }
        }
        const connection = {
            id: connectionId,
            userId,
            queries: [],
            lastActivity: Date.now(),
            connectionTime: Date.now(),
            subscriptions: new Set(),
            metadata
        };
        this.connections.set(connectionId, connection);
        this.stats.totalConnections++;
        this.stats.activeConnections++;
        this.performanceService.incrementCounter('subscriptions.connections.total');
        console.log(`Subscription connection registered: ${connectionId} (User: ${userId || 'anonymous'})`);
    }
    async unregisterConnection(connectionId) {
        const connection = this.connections.get(connectionId);
        if (!connection)
            return;
        connection.subscriptions.forEach(topic => {
            const group = this.subscriptionGroups.get(topic);
            if (group) {
                group.delete(connectionId);
                if (group.size === 0) {
                    this.subscriptionGroups.delete(topic);
                }
            }
        });
        this.batchBuffer.delete(connectionId);
        const timeout = this.batchTimeouts.get(connectionId);
        if (timeout) {
            clearTimeout(timeout);
            this.batchTimeouts.delete(connectionId);
        }
        this.connections.delete(connectionId);
        this.stats.activeConnections--;
        this.stats.disconnectionsCleaned++;
        console.log(`Subscription connection unregistered: ${connectionId}`);
    }
    async subscribe(connectionId, topic, variables) {
        const connection = this.connections.get(connectionId);
        if (!connection) {
            throw new Error(`Connection ${connectionId} not found`);
        }
        connection.lastActivity = Date.now();
        connection.subscriptions.add(topic);
        if (!this.subscriptionGroups.has(topic)) {
            this.subscriptionGroups.set(topic, new Set());
        }
        this.subscriptionGroups.get(topic).add(connectionId);
        this.stats.totalSubscriptions++;
        this.performanceService.incrementCounter('subscriptions.topics.total');
        await this.cacheSubscriptionData(connectionId, topic, variables);
        console.log(`Connection ${connectionId} subscribed to ${topic}`);
    }
    async unsubscribe(connectionId, topic) {
        const connection = this.connections.get(connectionId);
        if (!connection)
            return;
        connection.subscriptions.delete(topic);
        const group = this.subscriptionGroups.get(topic);
        if (group) {
            group.delete(connectionId);
            if (group.size === 0) {
                this.subscriptionGroups.delete(topic);
            }
        }
        await this.removeCachedSubscriptionData(connectionId, topic);
        console.log(`Connection ${connectionId} unsubscribed from ${topic}`);
    }
    async publish(topic, event) {
        const subscriptionEvent = {
            type: topic,
            ...event
        };
        const targetConnections = this.getTargetConnections(topic, event);
        if (targetConnections.length === 0) {
            return;
        }
        if (event.priority === 'critical') {
            await this.sendToConnections(targetConnections, subscriptionEvent);
        }
        else {
            await this.batchEventForConnections(targetConnections, subscriptionEvent);
        }
        this.stats.eventsSent += targetConnections.length;
        this.performanceService.incrementCounter('subscriptions.events.published', targetConnections.length);
    }
    getSubscriptionStats() {
        const topicCounts = Array.from(this.subscriptionGroups.entries())
            .map(([topic, connections]) => ({ topic, subscribers: connections.size }))
            .sort((a, b) => b.subscribers - a.subscribers)
            .slice(0, 10);
        const deviceCounts = { web: 0, mobile: 0, desktop: 0 };
        this.connections.forEach(conn => {
            if (conn.metadata.deviceType) {
                deviceCounts[conn.metadata.deviceType]++;
            }
        });
        return {
            connections: this.stats.totalConnections,
            activeConnections: this.stats.activeConnections,
            totalSubscriptions: this.stats.totalSubscriptions,
            eventsSent: this.stats.eventsSent,
            batchedEvents: this.stats.batchedEvents,
            compressionSaves: this.stats.compressionSaves,
            topTopics: topicCounts,
            connectionsByDevice: deviceCounts
        };
    }
    getTargetConnections(topic, event) {
        let targetConnections = [];
        const topicSubscribers = this.subscriptionGroups.get(topic);
        if (!topicSubscribers) {
            return targetConnections;
        }
        if (event.targetUsers && event.targetUsers.length > 0) {
            targetConnections = Array.from(topicSubscribers).filter(connectionId => {
                const connection = this.connections.get(connectionId);
                return connection && event.targetUsers.includes(connection.userId || '');
            });
        }
        else if (event.targetConnections && event.targetConnections.length > 0) {
            targetConnections = Array.from(topicSubscribers).filter(connectionId => event.targetConnections.includes(connectionId));
        }
        else {
            targetConnections = Array.from(topicSubscribers);
        }
        return targetConnections;
    }
    async batchEventForConnections(connectionIds, event) {
        for (const connectionId of connectionIds) {
            if (!this.batchBuffer.has(connectionId)) {
                this.batchBuffer.set(connectionId, []);
            }
            const batch = this.batchBuffer.get(connectionId);
            batch.push(event);
            if (batch.length >= this.config.maxBatchSize) {
                await this.flushBatch(connectionId);
            }
            else if (!this.batchTimeouts.has(connectionId)) {
                const timeout = setTimeout(() => {
                    this.flushBatch(connectionId);
                }, this.config.batchDelay);
                this.batchTimeouts.set(connectionId, timeout);
            }
        }
    }
    async flushBatch(connectionId) {
        const batch = this.batchBuffer.get(connectionId);
        if (!batch || batch.length === 0)
            return;
        const timeout = this.batchTimeouts.get(connectionId);
        if (timeout) {
            clearTimeout(timeout);
            this.batchTimeouts.delete(connectionId);
        }
        await this.sendToConnection(connectionId, batch);
        this.batchBuffer.delete(connectionId);
        if (batch.length > 1) {
            this.stats.batchedEvents += batch.length - 1;
        }
    }
    async sendToConnections(connectionIds, event) {
        const promises = connectionIds.map(connectionId => this.sendToConnection(connectionId, [event]));
        await Promise.all(promises);
    }
    async sendToConnection(connectionId, events) {
        const connection = this.connections.get(connectionId);
        if (!connection)
            return;
        try {
            let payload = events.length === 1 ? events[0] : events;
            let payloadSize = JSON.stringify(payload).length;
            if (payloadSize > this.config.compressionThreshold) {
                this.stats.compressionSaves++;
            }
            connection.lastActivity = Date.now();
            this.pubSub.publish(`connection_${connectionId}`, payload);
            this.performanceService.recordMetric({
                name: 'subscription.event.sent',
                value: events.length,
                timestamp: Date.now(),
                unit: 'count'
            });
        }
        catch (error) {
            console.error(`Error sending to connection ${connectionId}:`, error);
        }
    }
    async cacheSubscriptionData(connectionId, topic, variables) {
        const cacheKey = `sub:${connectionId}:${topic}`;
        await this.cacheService.set(cacheKey, { topic, variables, timestamp: Date.now() }, {
            ttl: this.config.connectionTimeout,
            tags: [`connection:${connectionId}`, `topic:${topic}`]
        });
    }
    async removeCachedSubscriptionData(connectionId, topic) {
        const cacheKey = `sub:${connectionId}:${topic}`;
        await this.cacheService.delete(cacheKey);
    }
    startConnectionMonitoring() {
        setInterval(() => {
            this.cleanupInactiveConnections();
        }, 60000);
        setInterval(() => {
            this.sendHeartbeat();
        }, this.config.heartbeatInterval);
    }
    cleanupInactiveConnections() {
        const now = Date.now();
        const inactiveConnections = [];
        this.connections.forEach((connection, connectionId) => {
            if (now - connection.lastActivity > this.config.connectionTimeout) {
                inactiveConnections.push(connectionId);
            }
        });
        inactiveConnections.forEach(connectionId => {
            this.unregisterConnection(connectionId);
        });
        if (inactiveConnections.length > 0) {
            console.log(`Cleaned up ${inactiveConnections.length} inactive connections`);
        }
    }
    sendHeartbeat() {
        const heartbeatEvent = {
            type: 'heartbeat',
            payload: { timestamp: Date.now() },
            priority: 'low'
        };
        this.connections.forEach((connection, connectionId) => {
            this.sendToConnection(connectionId, [heartbeatEvent]);
        });
    }
    startPerformanceTracking() {
        setInterval(() => {
            const stats = this.getSubscriptionStats();
            this.performanceService.recordMetric({
                name: 'subscriptions.active_connections',
                value: stats.activeConnections,
                timestamp: Date.now(),
                unit: 'count'
            });
            this.performanceService.recordMetric({
                name: 'subscriptions.total_subscriptions',
                value: stats.totalSubscriptions,
                timestamp: Date.now(),
                unit: 'count'
            });
        }, 30000);
    }
    getPubSub() {
        return this.pubSub;
    }
};
exports.SubscriptionOptimizationService = SubscriptionOptimizationService;
exports.SubscriptionOptimizationService = SubscriptionOptimizationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [advanced_cache_service_1.AdvancedCacheService,
        performance_metrics_service_1.PerformanceMetricsService])
], SubscriptionOptimizationService);
//# sourceMappingURL=subscription-optimization.service.js.map