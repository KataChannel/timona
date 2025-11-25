import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface SecurityEventDto {
  userId: string;
  eventType: string;
  resourceType?: string;
  resourceId?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  metadata?: any;
}

export interface AuditLogDto {
  userId: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  oldValue?: any;
  newValue?: any;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  metadata?: any;
}

export interface PerformanceAuditLogDto extends AuditLogDto {
  method?: string;
  endpoint?: string;
  success?: boolean;
  errorMessage?: string;
  statusCode?: number;
  responseTime?: number;
  requestSize?: number;
  responseSize?: number;
  memoryUsage?: number;
  cpuUsage?: number;
  dbQueryTime?: number;
  dbQueryCount?: number;
  performanceData?: any;
  correlationId?: string;
}

@Injectable()
export class SecurityAuditService {
  private readonly logger = new Logger(SecurityAuditService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Converts 'anonymous' userId to null to avoid foreign key constraint violations
   */
  private normalizeUserId(userId?: string): string | null {
    return userId === 'anonymous' ? null : (userId || null);
  }

  // ========== Security Event Logging ==========

  async logSecurityEvent(eventDto: SecurityEventDto): Promise<void> {
    try {
      this.logger.log(`Security event: ${eventDto.eventType} by user ${eventDto.userId}`);

      await this.prisma.securityEvent.create({
        data: {
          userId: this.normalizeUserId(eventDto.userId),
          eventType: eventDto.eventType,
          description: `${eventDto.eventType} - ${eventDto.resourceType || 'system'}`,
          category: eventDto.resourceType || 'system',
          details: {
            ...(eventDto.details || {}),
            resourceType: eventDto.resourceType,
            resourceId: eventDto.resourceId,
          },
          ipAddress: eventDto.ipAddress || '0.0.0.0',
          userAgent: eventDto.userAgent,
          severity: eventDto.severity || 'low',
          correlationId: eventDto.metadata?.correlationId,
        },
      });

      // Log critical events immediately
      if (eventDto.severity === 'critical') {
        this.logger.error(`CRITICAL SECURITY EVENT: ${eventDto.eventType}`, {
          userId: eventDto.userId,
          resourceType: eventDto.resourceType,
          resourceId: eventDto.resourceId,
          details: eventDto.details,
        });
      }
    } catch (error) {
      this.logger.error(`Failed to log security event: ${error.message}`, {
        eventType: eventDto.eventType,
        userId: eventDto.userId,
        error: error.message,
      });
    }
  }

  async logAudit(auditDto: AuditLogDto): Promise<void> {
    try {
      this.logger.debug(`Audit log: ${auditDto.action} by user ${auditDto.userId}`);

      await this.prisma.auditLog.create({
        data: {
          userId: auditDto.userId === 'anonymous' ? null : auditDto.userId,
          action: auditDto.action,
          resourceType: auditDto.resourceType || 'unknown',
          resourceId: auditDto.resourceId,
          oldValues: auditDto.oldValue,
          newValues: auditDto.newValue,
          details: auditDto.details || {},
          ipAddress: auditDto.ipAddress,
          userAgent: auditDto.userAgent,
          sessionId: auditDto.sessionId,
          sessionInfo: auditDto.metadata || {},
        },
      });
    } catch (error) {
      this.logger.error(`Failed to log audit: ${error.message}`, {
        action: auditDto.action,
        userId: auditDto.userId,
        error: error.message,
      });
    }
  }

  async logAuditWithPerformance(auditDto: PerformanceAuditLogDto): Promise<void> {
    try {
      this.logger.debug(`Performance audit log: ${auditDto.action} by user ${auditDto.userId} - ${auditDto.responseTime}ms`);

      await this.prisma.auditLog.create({
        data: {
          userId: this.normalizeUserId(auditDto.userId),
          action: auditDto.action,
          resourceType: auditDto.resourceType || 'api_call',
          resourceId: auditDto.resourceId,
          method: auditDto.method,
          endpoint: auditDto.endpoint,
          oldValues: auditDto.oldValue,
          newValues: auditDto.newValue,
          details: auditDto.details || {},
          success: auditDto.success ?? true,
          errorMessage: auditDto.errorMessage,
          
          // Performance metrics
          responseTime: auditDto.responseTime,
          requestSize: auditDto.requestSize,
          responseSize: auditDto.responseSize,
          dbQueryTime: auditDto.dbQueryTime,
          dbQueryCount: auditDto.dbQueryCount,
          memoryUsage: auditDto.memoryUsage,
          cpuUsage: auditDto.cpuUsage,
          statusCode: auditDto.statusCode,
          performanceData: auditDto.performanceData,
          
          // Standard audit fields
          ipAddress: auditDto.ipAddress,
          userAgent: auditDto.userAgent,
          sessionId: auditDto.sessionId,
          correlationId: auditDto.correlationId,
          sessionInfo: auditDto.metadata || {},
        },
      });

      // Log performance alerts if thresholds are exceeded
      if (auditDto.responseTime && auditDto.responseTime > 5000) {
        this.logger.warn(`Very slow API response detected: ${auditDto.endpoint} took ${auditDto.responseTime}ms`, {
          userId: auditDto.userId,
          endpoint: auditDto.endpoint,
          responseTime: auditDto.responseTime,
          memoryUsage: auditDto.memoryUsage,
        });
      }

      if (auditDto.memoryUsage && auditDto.memoryUsage > 100) {
        this.logger.warn(`High memory usage detected: ${auditDto.memoryUsage}MB`, {
          userId: auditDto.userId,
          endpoint: auditDto.endpoint,
          memoryUsage: auditDto.memoryUsage,
        });
      }

    } catch (error) {
      this.logger.error(`Failed to log performance audit: ${error.message}`, {
        action: auditDto.action,
        userId: auditDto.userId,
        endpoint: auditDto.endpoint,
        error: error.message,
      });
    }
  }

  // ========== Security Event Retrieval ==========

  async getSecurityEvents(
    userId?: string,
    eventType?: string,
    resourceType?: string,
    severity?: string,
    limit = 100,
    offset = 0
  ) {
    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (eventType) {
      where.eventType = eventType;
    }

    if (resourceType) {
      where.resourceType = resourceType;
    }

    if (severity) {
      where.severity = severity;
    }

    const [events, total] = await Promise.all([
      this.prisma.securityEvent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.securityEvent.count({ where }),
    ]);

    return {
      events,
      total,
      limit,
      offset,
    };
  }

  async getAuditLogs(
    userId?: string,
    action?: string,
    resourceType?: string,
    limit = 100,
    offset = 0
  ) {
    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (action) {
      where.action = action;
    }

    if (resourceType) {
      where.resourceType = resourceType;
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      logs,
      total,
      limit,
      offset,
    };
  }

  // ========== Security Analytics ==========

  async getSecurityDashboard(timeframe: 'day' | 'week' | 'month' = 'day') {
    const now = new Date();
    let startDate: Date;

    switch (timeframe) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    const whereClause = {
      createdAt: {
        gte: startDate,
      },
    };

    const [
      totalEvents,
      criticalEvents,
      highEvents,
      eventsByType,
      eventsByUser,
      recentEvents,
    ] = await Promise.all([
      // Total security events
      this.prisma.securityEvent.count({
        where: whereClause,
      }),

      // Critical events
      this.prisma.securityEvent.count({
        where: {
          ...whereClause,
          severity: 'critical',
        },
      }),

      // High severity events
      this.prisma.securityEvent.count({
        where: {
          ...whereClause,
          severity: 'high',
        },
      }),

      // Events by type
      this.prisma.securityEvent.groupBy({
        by: ['eventType'],
        where: whereClause,
        _count: {
          eventType: true,
        },
        orderBy: {
          _count: {
            eventType: 'desc',
          },
        },
        take: 10,
      }),

      // Events by user
      this.prisma.securityEvent.groupBy({
        by: ['userId'],
        where: whereClause,
        _count: {
          userId: true,
        },
        orderBy: {
          _count: {
            userId: 'desc',
          },
        },
        take: 10,
      }),

      // Recent critical/high events
      this.prisma.securityEvent.findMany({
        where: {
          ...whereClause,
          severity: {
            in: ['critical', 'high'],
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
      }),
    ]);

    return {
      timeframe,
      summary: {
        totalEvents,
        criticalEvents,
        highEvents,
        riskScore: this.calculateRiskScore(criticalEvents, highEvents, totalEvents),
      },
      eventsByType: eventsByType.map(item => ({
        eventType: item.eventType,
        count: item._count.eventType,
      })),
      eventsByUser: eventsByUser.map(item => ({
        userId: item.userId,
        count: item._count.userId,
      })),
      recentEvents,
    };
  }

  private calculateRiskScore(critical: number, high: number, total: number): number {
    if (total === 0) return 0;
    
    // Risk score calculation: critical events worth 10 points, high worth 5 points
    const riskPoints = (critical * 10) + (high * 5);
    const maxPossiblePoints = total * 10; // If all events were critical
    
    return Math.round((riskPoints / maxPossiblePoints) * 100);
  }

  // ========== Security Monitoring ==========

  async detectAnomalies(userId: string, timeframe: 'hour' | 'day' = 'hour') {
    const now = new Date();
    const timeframMs = timeframe === 'hour' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    const startDate = new Date(now.getTime() - timeframMs);

    const events = await this.prisma.securityEvent.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const anomalies = [];

    // Check for unusual activity patterns
    const eventCounts = events.reduce((acc, event) => {
      acc[event.eventType] = (acc[event.eventType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Define normal thresholds
    const thresholds = {
      login_attempt: timeframe === 'hour' ? 10 : 50,
      failed_login: timeframe === 'hour' ? 5 : 20,
      password_change: timeframe === 'hour' ? 3 : 10,
      mfa_setup: timeframe === 'hour' ? 2 : 5,
    };

    for (const [eventType, count] of Object.entries(eventCounts)) {
      const threshold = thresholds[eventType as keyof typeof thresholds];
      if (threshold && count > threshold) {
        anomalies.push({
          type: 'unusual_frequency',
          eventType,
          count,
          threshold,
          severity: count > threshold * 2 ? 'high' : 'medium',
          message: `Unusual frequency of ${eventType} events: ${count} in ${timeframe}`,
        });
      }
    }

    // Check for multiple IP addresses
    const uniqueIPs = new Set(events.map(e => e.ipAddress).filter(Boolean));
    if (uniqueIPs.size > 3) {
      anomalies.push({
        type: 'multiple_ips',
        count: uniqueIPs.size,
        severity: uniqueIPs.size > 5 ? 'high' : 'medium',
        message: `Activity from ${uniqueIPs.size} different IP addresses in ${timeframe}`,
        details: Array.from(uniqueIPs),
      });
    }

    // Check for suspicious login patterns
    const loginEvents = events.filter(e => e.eventType.includes('login'));
    if (loginEvents.length > 0) {
      const userAgents = new Set(loginEvents.map(e => e.userAgent).filter(Boolean));
      if (userAgents.size > 3) {
        anomalies.push({
          type: 'multiple_user_agents',
          count: userAgents.size,
          severity: userAgents.size > 5 ? 'high' : 'medium',
          message: `Login attempts from ${userAgents.size} different user agents in ${timeframe}`,
        });
      }
    }

    return {
      userId,
      timeframe,
      anomaliesDetected: anomalies.length,
      anomalies,
      riskLevel: this.calculateAnomalyRiskLevel(anomalies),
    };
  }

  private calculateAnomalyRiskLevel(anomalies: any[]): 'low' | 'medium' | 'high' | 'critical' {
    if (anomalies.length === 0) return 'low';
    
    const highSeverityCount = anomalies.filter(a => a.severity === 'high').length;
    const mediumSeverityCount = anomalies.filter(a => a.severity === 'medium').length;
    
    if (highSeverityCount >= 3) return 'critical';
    if (highSeverityCount >= 1) return 'high';
    if (mediumSeverityCount >= 3) return 'high';
    if (mediumSeverityCount >= 1) return 'medium';
    
    return 'low';
  }

  // ========== Compliance Reporting ==========

  async generateComplianceReport(startDate: Date, endDate: Date) {
    const baseReport = await this.generateBaseComplianceReport(startDate, endDate);
    
    // Calculate compliance score based on security events and audit data
    const complianceScore = this.calculateOverallComplianceScore(baseReport);
    const status = complianceScore >= 90 ? 'compliant' : complianceScore >= 70 ? 'partial' : 'non-compliant';
    
    return {
      ...baseReport,
      complianceScore,
      status,
      reportId: `compliance-${Date.now()}`,
      generatedAt: new Date(),
    };
  }

  private calculateOverallComplianceScore(report: any): number {
    const criticalEvents = report.summary?.securityEventsBySeverity?.critical || 0;
    const highEvents = report.summary?.securityEventsBySeverity?.high || 0;
    const mediumEvents = report.summary?.securityEventsBySeverity?.medium || 0;
    
    // Start with perfect score and deduct for issues
    let score = 100;
    score -= criticalEvents * 15; // Critical events are severe
    score -= highEvents * 8;
    score -= mediumEvents * 3;
    
    // Factor in access control changes (too many might indicate issues)
    const accessChanges = report.summary?.accessControlChanges || 0;
    if (accessChanges > 50) {
      score -= (accessChanges - 50) * 0.5;
    }
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private async generateBaseComplianceReport(startDate: Date, endDate: Date) {
    const [
      auditLogs,
      securityEvents,
      userActivities,
      accessChanges,
    ] = await Promise.all([
      // All audit logs in period
      this.prisma.auditLog.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),

      // Security events by severity
      this.prisma.securityEvent.groupBy({
        by: ['severity'],
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        _count: {
          severity: true,
        },
      }),

      // User activity summary
      this.prisma.securityEvent.groupBy({
        by: ['userId', 'eventType'],
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          eventType: {
            in: ['login_success', 'login_failed', 'logout', 'password_change'],
          },
        },
        _count: true,
      }),

      // Access control changes
      this.prisma.auditLog.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          action: {
            in: ['role_assigned', 'role_removed', 'permission_granted', 'permission_revoked'],
          },
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
      }),
    ]);

    return {
      reportPeriod: {
        startDate,
        endDate,
      },
      summary: {
        totalAuditLogs: auditLogs,
        securityEventsBySeverity: securityEvents.reduce((acc, item) => {
          acc[item.severity] = item._count.severity;
          return acc;
        }, {} as Record<string, number>),
        accessControlChanges: accessChanges.length,
      },
      userActivities: userActivities.map(activity => ({
        userId: activity.userId,
        eventType: activity.eventType,
        count: activity._count,
      })),
      accessChanges: accessChanges.map(change => ({
        id: change.id,
        action: change.action,
        userId: change.userId,
        user: change.user,
        resourceType: change.resourceType,
        resourceId: change.resourceId,
        timestamp: change.createdAt,
        details: change.details,
      })),
    };
  }
}