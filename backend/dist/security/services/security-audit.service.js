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
var SecurityAuditService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityAuditService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let SecurityAuditService = SecurityAuditService_1 = class SecurityAuditService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(SecurityAuditService_1.name);
    }
    normalizeUserId(userId) {
        return userId === 'anonymous' ? null : (userId || null);
    }
    async logSecurityEvent(eventDto) {
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
            if (eventDto.severity === 'critical') {
                this.logger.error(`CRITICAL SECURITY EVENT: ${eventDto.eventType}`, {
                    userId: eventDto.userId,
                    resourceType: eventDto.resourceType,
                    resourceId: eventDto.resourceId,
                    details: eventDto.details,
                });
            }
        }
        catch (error) {
            this.logger.error(`Failed to log security event: ${error.message}`, {
                eventType: eventDto.eventType,
                userId: eventDto.userId,
                error: error.message,
            });
        }
    }
    async logAudit(auditDto) {
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
        }
        catch (error) {
            this.logger.error(`Failed to log audit: ${error.message}`, {
                action: auditDto.action,
                userId: auditDto.userId,
                error: error.message,
            });
        }
    }
    async logAuditWithPerformance(auditDto) {
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
                    responseTime: auditDto.responseTime,
                    requestSize: auditDto.requestSize,
                    responseSize: auditDto.responseSize,
                    dbQueryTime: auditDto.dbQueryTime,
                    dbQueryCount: auditDto.dbQueryCount,
                    memoryUsage: auditDto.memoryUsage,
                    cpuUsage: auditDto.cpuUsage,
                    statusCode: auditDto.statusCode,
                    performanceData: auditDto.performanceData,
                    ipAddress: auditDto.ipAddress,
                    userAgent: auditDto.userAgent,
                    sessionId: auditDto.sessionId,
                    correlationId: auditDto.correlationId,
                    sessionInfo: auditDto.metadata || {},
                },
            });
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
        }
        catch (error) {
            this.logger.error(`Failed to log performance audit: ${error.message}`, {
                action: auditDto.action,
                userId: auditDto.userId,
                endpoint: auditDto.endpoint,
                error: error.message,
            });
        }
    }
    async getSecurityEvents(userId, eventType, resourceType, severity, limit = 100, offset = 0) {
        const where = {};
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
    async getAuditLogs(userId, action, resourceType, limit = 100, offset = 0) {
        const where = {};
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
    async getSecurityDashboard(timeframe = 'day') {
        const now = new Date();
        let startDate;
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
        const [totalEvents, criticalEvents, highEvents, eventsByType, eventsByUser, recentEvents,] = await Promise.all([
            this.prisma.securityEvent.count({
                where: whereClause,
            }),
            this.prisma.securityEvent.count({
                where: {
                    ...whereClause,
                    severity: 'critical',
                },
            }),
            this.prisma.securityEvent.count({
                where: {
                    ...whereClause,
                    severity: 'high',
                },
            }),
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
    calculateRiskScore(critical, high, total) {
        if (total === 0)
            return 0;
        const riskPoints = (critical * 10) + (high * 5);
        const maxPossiblePoints = total * 10;
        return Math.round((riskPoints / maxPossiblePoints) * 100);
    }
    async detectAnomalies(userId, timeframe = 'hour') {
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
        const eventCounts = events.reduce((acc, event) => {
            acc[event.eventType] = (acc[event.eventType] || 0) + 1;
            return acc;
        }, {});
        const thresholds = {
            login_attempt: timeframe === 'hour' ? 10 : 50,
            failed_login: timeframe === 'hour' ? 5 : 20,
            password_change: timeframe === 'hour' ? 3 : 10,
            mfa_setup: timeframe === 'hour' ? 2 : 5,
        };
        for (const [eventType, count] of Object.entries(eventCounts)) {
            const threshold = thresholds[eventType];
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
    calculateAnomalyRiskLevel(anomalies) {
        if (anomalies.length === 0)
            return 'low';
        const highSeverityCount = anomalies.filter(a => a.severity === 'high').length;
        const mediumSeverityCount = anomalies.filter(a => a.severity === 'medium').length;
        if (highSeverityCount >= 3)
            return 'critical';
        if (highSeverityCount >= 1)
            return 'high';
        if (mediumSeverityCount >= 3)
            return 'high';
        if (mediumSeverityCount >= 1)
            return 'medium';
        return 'low';
    }
    async generateComplianceReport(startDate, endDate) {
        const baseReport = await this.generateBaseComplianceReport(startDate, endDate);
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
    calculateOverallComplianceScore(report) {
        const criticalEvents = report.summary?.securityEventsBySeverity?.critical || 0;
        const highEvents = report.summary?.securityEventsBySeverity?.high || 0;
        const mediumEvents = report.summary?.securityEventsBySeverity?.medium || 0;
        let score = 100;
        score -= criticalEvents * 15;
        score -= highEvents * 8;
        score -= mediumEvents * 3;
        const accessChanges = report.summary?.accessControlChanges || 0;
        if (accessChanges > 50) {
            score -= (accessChanges - 50) * 0.5;
        }
        return Math.max(0, Math.min(100, Math.round(score)));
    }
    async generateBaseComplianceReport(startDate, endDate) {
        const [auditLogs, securityEvents, userActivities, accessChanges,] = await Promise.all([
            this.prisma.auditLog.count({
                where: {
                    createdAt: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
            }),
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
                }, {}),
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
};
exports.SecurityAuditService = SecurityAuditService;
exports.SecurityAuditService = SecurityAuditService = SecurityAuditService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SecurityAuditService);
//# sourceMappingURL=security-audit.service.js.map