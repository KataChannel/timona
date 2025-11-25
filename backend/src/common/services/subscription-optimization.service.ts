import { Injectable, OnModuleInit } from '@nestjs/common';
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
  ttl?: number; // Time to live in milliseconds
}

@Injectable()
export class SubscriptionOptimizationService implements OnModuleInit {
  private readonly pubSub = new PubSub();
  private connections: Map<string, SubscriptionConnection> = new Map();
  private subscriptionGroups: Map<string, Set<string>> = new Map(); // topic -> connection IDs
  private batchBuffer: Map<string, SubscriptionEvent[]> = new Map(); // connection ID -> events
  private batchTimeouts: Map<string, NodeJS.Timeout> = new Map();
  
  // Performance optimization settings
  private readonly config = {
    maxConnectionsPerUser: 5,
    connectionTimeout: 30 * 60 * 1000, // 30 minutes
    batchDelay: 100, // ms - batch multiple events
    maxBatchSize: 10,
    priorityQueues: true,
    compressionThreshold: 1024, // bytes
    heartbeatInterval: 30000, // 30 seconds
  };

  // Statistics
  private stats = {
    totalConnections: 0,
    activeConnections: 0,
    totalSubscriptions: 0,
    eventsSent: 0,
    batchedEvents: 0,
    compressionSaves: 0,
    disconnectionsCleaned: 0,
  };

  constructor(
    private readonly cacheService: AdvancedCacheService,
    private readonly performanceService: PerformanceMetricsService,
  ) {}

  async onModuleInit() {
    this.startConnectionMonitoring();
    this.startPerformanceTracking();
  }

  /**
   * Register a new subscription connection
   */
  async registerConnection(connectionId: string, metadata: SubscriptionConnection['metadata'], userId?: string): Promise<void> {
    // Check connection limits
    if (userId) {
      const userConnections = Array.from(this.connections.values())
        .filter(conn => conn.userId === userId).length;
      
      if (userConnections >= this.config.maxConnectionsPerUser) {
        throw new Error(`Maximum connections exceeded for user ${userId}`);
      }
    }

    const connection: SubscriptionConnection = {
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

    // Track connection in performance metrics
    this.performanceService.incrementCounter('subscriptions.connections.total');
    
    console.log(`Subscription connection registered: ${connectionId} (User: ${userId || 'anonymous'})`);
  }

  /**
   * Unregister a subscription connection
   */
  async unregisterConnection(connectionId: string): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    // Remove from all subscription groups
    connection.subscriptions.forEach(topic => {
      const group = this.subscriptionGroups.get(topic);
      if (group) {
        group.delete(connectionId);
        if (group.size === 0) {
          this.subscriptionGroups.delete(topic);
        }
      }
    });

    // Clean up batch buffer and timeouts
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

  /**
   * Subscribe to a topic with optimized handling
   */
  async subscribe(connectionId: string, topic: string, variables?: any): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      throw new Error(`Connection ${connectionId} not found`);
    }

    // Update connection activity
    connection.lastActivity = Date.now();
    connection.subscriptions.add(topic);

    // Add to subscription group
    if (!this.subscriptionGroups.has(topic)) {
      this.subscriptionGroups.set(topic, new Set());
    }
    this.subscriptionGroups.get(topic)!.add(connectionId);

    this.stats.totalSubscriptions++;
    this.performanceService.incrementCounter('subscriptions.topics.total');

    // Cache subscription data for quick lookups
    await this.cacheSubscriptionData(connectionId, topic, variables);
    
    console.log(`Connection ${connectionId} subscribed to ${topic}`);
  }

  /**
   * Unsubscribe from a topic
   */
  async unsubscribe(connectionId: string, topic: string): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    connection.subscriptions.delete(topic);
    
    const group = this.subscriptionGroups.get(topic);
    if (group) {
      group.delete(connectionId);
      if (group.size === 0) {
        this.subscriptionGroups.delete(topic);
      }
    }

    // Remove from cache
    await this.removeCachedSubscriptionData(connectionId, topic);
    
    console.log(`Connection ${connectionId} unsubscribed from ${topic}`);
  }

  /**
   * Publish event with intelligent routing and batching
   */
  async publish(topic: string, event: Omit<SubscriptionEvent, 'type'>): Promise<void> {
    const subscriptionEvent: SubscriptionEvent = {
      type: topic,
      ...event
    };

    const targetConnections = this.getTargetConnections(topic, event);
    
    if (targetConnections.length === 0) {
      return; // No active subscribers
    }

    // Batch events for performance
    if (event.priority === 'critical') {
      // Send immediately for critical events
      await this.sendToConnections(targetConnections, subscriptionEvent);
    } else {
      // Batch other events
      await this.batchEventForConnections(targetConnections, subscriptionEvent);
    }

    this.stats.eventsSent += targetConnections.length;
    this.performanceService.incrementCounter('subscriptions.events.published', targetConnections.length);
  }

  /**
   * Get active subscription statistics
   */
  getSubscriptionStats(): {
    connections: number;
    activeConnections: number;
    totalSubscriptions: number;
    eventsSent: number;
    batchedEvents: number;
    compressionSaves: number;
    topTopics: Array<{ topic: string; subscribers: number }>;
    connectionsByDevice: { web: number; mobile: number; desktop: number };
  } {
    // Get top topics by subscriber count
    const topicCounts = Array.from(this.subscriptionGroups.entries())
      .map(([topic, connections]) => ({ topic, subscribers: connections.size }))
      .sort((a, b) => b.subscribers - a.subscribers)
      .slice(0, 10);

    // Count connections by device type
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

  /**
   * Get target connections for an event
   */
  private getTargetConnections(topic: string, event: Omit<SubscriptionEvent, 'type'>): string[] {
    let targetConnections: string[] = [];

    // Get all subscribers to this topic
    const topicSubscribers = this.subscriptionGroups.get(topic);
    if (!topicSubscribers) {
      return targetConnections;
    }

    // Filter by target users if specified
    if (event.targetUsers && event.targetUsers.length > 0) {
      targetConnections = Array.from(topicSubscribers).filter(connectionId => {
        const connection = this.connections.get(connectionId);
        return connection && event.targetUsers!.includes(connection.userId || '');
      });
    } 
    // Filter by target connections if specified
    else if (event.targetConnections && event.targetConnections.length > 0) {
      targetConnections = Array.from(topicSubscribers).filter(connectionId => 
        event.targetConnections!.includes(connectionId)
      );
    } 
    // Send to all topic subscribers
    else {
      targetConnections = Array.from(topicSubscribers);
    }

    return targetConnections;
  }

  /**
   * Batch events for improved performance
   */
  private async batchEventForConnections(connectionIds: string[], event: SubscriptionEvent): Promise<void> {
    for (const connectionId of connectionIds) {
      if (!this.batchBuffer.has(connectionId)) {
        this.batchBuffer.set(connectionId, []);
      }

      const batch = this.batchBuffer.get(connectionId)!;
      batch.push(event);

      // Send immediately if batch is full
      if (batch.length >= this.config.maxBatchSize) {
        await this.flushBatch(connectionId);
      } 
      // Schedule batch flush if not already scheduled
      else if (!this.batchTimeouts.has(connectionId)) {
        const timeout = setTimeout(() => {
          this.flushBatch(connectionId);
        }, this.config.batchDelay);
        
        this.batchTimeouts.set(connectionId, timeout);
      }
    }
  }

  /**
   * Flush batched events for a connection
   */
  private async flushBatch(connectionId: string): Promise<void> {
    const batch = this.batchBuffer.get(connectionId);
    if (!batch || batch.length === 0) return;

    // Clear timeout
    const timeout = this.batchTimeouts.get(connectionId);
    if (timeout) {
      clearTimeout(timeout);
      this.batchTimeouts.delete(connectionId);
    }

    // Send batch
    await this.sendToConnection(connectionId, batch);
    
    // Clear buffer
    this.batchBuffer.delete(connectionId);
    
    if (batch.length > 1) {
      this.stats.batchedEvents += batch.length - 1;
    }
  }

  /**
   * Send events directly to connections
   */
  private async sendToConnections(connectionIds: string[], event: SubscriptionEvent): Promise<void> {
    const promises = connectionIds.map(connectionId => 
      this.sendToConnection(connectionId, [event])
    );
    
    await Promise.all(promises);
  }

  /**
   * Send event to a single connection
   */
  private async sendToConnection(connectionId: string, events: SubscriptionEvent[]): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    try {
      // Compress large payloads
      let payload = events.length === 1 ? events[0] : events;
      let payloadSize = JSON.stringify(payload).length;
      
      if (payloadSize > this.config.compressionThreshold) {
        // In a real implementation, you would compress the payload
        this.stats.compressionSaves++;
      }

      // Update connection activity
      connection.lastActivity = Date.now();

      // Use PubSub to emit to specific connection
      // Note: In a real implementation, you would use connection-specific channels
      this.pubSub.publish(`connection_${connectionId}`, payload);

      this.performanceService.recordMetric({
        name: 'subscription.event.sent',
        value: events.length,
        timestamp: Date.now(),
        unit: 'count'
      });

    } catch (error) {
      console.error(`Error sending to connection ${connectionId}:`, error);
    }
  }

  /**
   * Cache subscription data for performance
   */
  private async cacheSubscriptionData(connectionId: string, topic: string, variables?: any): Promise<void> {
    const cacheKey = `sub:${connectionId}:${topic}`;
    await this.cacheService.set(cacheKey, { topic, variables, timestamp: Date.now() }, {
      ttl: this.config.connectionTimeout,
      tags: [`connection:${connectionId}`, `topic:${topic}`]
    });
  }

  /**
   * Remove cached subscription data
   */
  private async removeCachedSubscriptionData(connectionId: string, topic: string): Promise<void> {
    const cacheKey = `sub:${connectionId}:${topic}`;
    await this.cacheService.delete(cacheKey);
  }

  /**
   * Start connection monitoring and cleanup
   */
  private startConnectionMonitoring(): void {
    setInterval(() => {
      this.cleanupInactiveConnections();
    }, 60000); // Check every minute

    // Heartbeat for active connections
    setInterval(() => {
      this.sendHeartbeat();
    }, this.config.heartbeatInterval);
  }

  /**
   * Clean up inactive connections
   */
  private cleanupInactiveConnections(): void {
    const now = Date.now();
    const inactiveConnections: string[] = [];

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

  /**
   * Send heartbeat to active connections
   */
  private sendHeartbeat(): void {
    const heartbeatEvent: SubscriptionEvent = {
      type: 'heartbeat',
      payload: { timestamp: Date.now() },
      priority: 'low'
    };

    this.connections.forEach((connection, connectionId) => {
      this.sendToConnection(connectionId, [heartbeatEvent]);
    });
  }

  /**
   * Start performance tracking
   */
  private startPerformanceTracking(): void {
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
    }, 30000); // Every 30 seconds
  }

  /**
   * Get PubSub instance for GraphQL subscriptions
   */
  getPubSub(): PubSub {
    return this.pubSub;
  }
}