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
var AlertManagerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertManagerService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const metrics_collector_service_1 = require("./metrics-collector.service");
const health_check_service_1 = require("./health-check.service");
let AlertManagerService = AlertManagerService_1 = class AlertManagerService {
    constructor(metricsCollector, healthCheck) {
        this.metricsCollector = metricsCollector;
        this.healthCheck = healthCheck;
        this.logger = new common_1.Logger(AlertManagerService_1.name);
        this.alerts = new Map();
        this.rules = new Map();
        this.metricHistory = new Map();
        this.initializeDefaultRules();
        this.logger.log('AlertManagerService initialized with default rules');
    }
    createAlert(title, description, severity, category, source, metrics = {}, correlationId) {
        const alert = {
            id: this.generateAlertId(),
            timestamp: new Date(),
            severity,
            category,
            title,
            description,
            source,
            metrics,
            status: 'active',
            escalationLevel: 0,
            correlationId,
            actions: [{
                    timestamp: new Date(),
                    type: 'created',
                    user: 'system'
                }]
        };
        this.alerts.set(alert.id, alert);
        this.logger.warn(`Alert created: ${alert.title} [${alert.severity}]`, { alertId: alert.id });
        this.sendNotifications(alert);
        this.metricsCollector.recordCustomMetric('alerts_created', 1, 'count', 'Alert created');
        this.metricsCollector.recordCustomMetric(`alerts_${severity}`, 1, 'count', `${severity} alert created`);
        return alert;
    }
    acknowledgeAlert(alertId, user, comment) {
        const alert = this.alerts.get(alertId);
        if (!alert) {
            this.logger.error(`Alert not found: ${alertId}`);
            return null;
        }
        if (alert.status !== 'active') {
            this.logger.warn(`Alert ${alertId} is not active (status: ${alert.status})`);
            return alert;
        }
        alert.status = 'acknowledged';
        alert.assignedTo = user;
        alert.actions.push({
            timestamp: new Date(),
            type: 'acknowledged',
            user,
            comment
        });
        this.logger.log(`Alert acknowledged by ${user}: ${alert.title}`, { alertId });
        this.metricsCollector.recordCustomMetric('alerts_acknowledged', 1, 'count', 'Alert acknowledged');
        return alert;
    }
    resolveAlert(alertId, user, comment) {
        const alert = this.alerts.get(alertId);
        if (!alert) {
            this.logger.error(`Alert not found: ${alertId}`);
            return null;
        }
        alert.status = 'resolved';
        alert.actions.push({
            timestamp: new Date(),
            type: 'resolved',
            user,
            comment
        });
        this.logger.log(`Alert resolved by ${user}: ${alert.title}`, { alertId });
        this.metricsCollector.recordCustomMetric('alerts_resolved', 1, 'count', 'Alert resolved');
        return alert;
    }
    getActiveAlerts() {
        return Array.from(this.alerts.values()).filter(alert => alert.status === 'active');
    }
    getAlertSummary() {
        const allAlerts = Array.from(this.alerts.values());
        const recentAlerts = allAlerts
            .filter(alert => Date.now() - alert.timestamp.getTime() < 24 * 60 * 60 * 1000)
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, 10);
        const byStatus = allAlerts.reduce((acc, alert) => {
            acc[alert.status] = (acc[alert.status] || 0) + 1;
            return acc;
        }, {});
        const bySeverity = allAlerts.reduce((acc, alert) => {
            acc[alert.severity] = (acc[alert.severity] || 0) + 1;
            return acc;
        }, {});
        const byCategory = allAlerts.reduce((acc, alert) => {
            acc[alert.category] = (acc[alert.category] || 0) + 1;
            return acc;
        }, {});
        const topIssues = Object.entries(bySeverity)
            .map(([severity, count]) => ({
            metric: `${severity}_alerts`,
            count,
            lastOccurred: recentAlerts.find(a => a.severity === severity)?.timestamp || new Date()
        }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        return {
            total: allAlerts.length,
            byStatus,
            bySeverity,
            byCategory,
            recentAlerts,
            topIssues
        };
    }
    addAlertRule(rule) {
        const alertRule = {
            ...rule,
            id: this.generateRuleId()
        };
        this.rules.set(alertRule.id, alertRule);
        this.logger.log(`Alert rule added: ${alertRule.name}`, { ruleId: alertRule.id });
        return alertRule;
    }
    getAlertRules() {
        return Array.from(this.rules.values());
    }
    toggleAlertRule(ruleId, enabled) {
        const rule = this.rules.get(ruleId);
        if (!rule) {
            this.logger.error(`Alert rule not found: ${ruleId}`);
            return null;
        }
        rule.enabled = enabled;
        this.logger.log(`Alert rule ${enabled ? 'enabled' : 'disabled'}: ${rule.name}`, { ruleId });
        return rule;
    }
    async evaluateAlertRules() {
        try {
            const [systemMetrics, appMetrics, healthStatus] = await Promise.all([
                this.metricsCollector.getSystemMetrics(),
                this.metricsCollector.getApplicationMetrics(),
                this.healthCheck.getSimpleHealthStatus()
            ]);
            this.storeMetricsHistory(systemMetrics, appMetrics);
            for (const rule of this.rules.values()) {
                if (rule.enabled) {
                    await this.evaluateRule(rule, systemMetrics, appMetrics, healthStatus);
                }
            }
        }
        catch (error) {
            this.logger.error('Failed to evaluate alert rules:', error);
        }
    }
    async handleEscalations() {
        try {
            const activeAlerts = this.getActiveAlerts();
            for (const alert of activeAlerts) {
                await this.checkEscalation(alert);
            }
        }
        catch (error) {
            this.logger.error('Failed to handle escalations:', error);
        }
    }
    initializeDefaultRules() {
        const defaultRules = [
            {
                name: 'High CPU Usage',
                description: 'CPU usage is above 80% for 5 minutes',
                category: 'performance',
                severity: 'warning',
                condition: {
                    metric: 'cpu_usage',
                    operator: 'gt',
                    threshold: 80,
                    duration: 5,
                    evaluationWindow: 10
                },
                enabled: true,
                escalationPolicy: {
                    levels: [
                        {
                            level: 1,
                            delayMinutes: 0,
                            notifications: [
                                { type: 'email', target: 'ops@example.com', enabled: true, severity: ['warning', 'error', 'critical'] }
                            ]
                        },
                        {
                            level: 2,
                            delayMinutes: 15,
                            notifications: [
                                { type: 'slack', target: '#alerts', enabled: true, severity: ['error', 'critical'] }
                            ]
                        }
                    ]
                },
                notifications: [
                    { type: 'email', target: 'ops@example.com', enabled: true, severity: ['warning', 'error', 'critical'] }
                ],
                cooldownPeriod: 30
            },
            {
                name: 'High Memory Usage',
                description: 'Memory usage is above 90% for 3 minutes',
                category: 'performance',
                severity: 'error',
                condition: {
                    metric: 'memory_usage',
                    operator: 'gt',
                    threshold: 90,
                    duration: 3,
                    evaluationWindow: 5
                },
                enabled: true,
                escalationPolicy: {
                    levels: [
                        {
                            level: 1,
                            delayMinutes: 0,
                            notifications: [
                                { type: 'email', target: 'ops@example.com', enabled: true, severity: ['error', 'critical'] }
                            ]
                        }
                    ]
                },
                notifications: [
                    { type: 'email', target: 'ops@example.com', enabled: true, severity: ['error', 'critical'] }
                ],
                cooldownPeriod: 15
            },
            {
                name: 'Application Down',
                description: 'Application health check is failing',
                category: 'availability',
                severity: 'critical',
                condition: {
                    metric: 'health_status',
                    operator: 'eq',
                    threshold: 0,
                    duration: 1,
                    evaluationWindow: 2
                },
                enabled: true,
                escalationPolicy: {
                    levels: [
                        {
                            level: 1,
                            delayMinutes: 0,
                            notifications: [
                                { type: 'email', target: 'ops@example.com', enabled: true, severity: ['critical'] },
                                { type: 'slack', target: '#critical-alerts', enabled: true, severity: ['critical'] }
                            ]
                        }
                    ]
                },
                notifications: [
                    { type: 'email', target: 'ops@example.com', enabled: true, severity: ['critical'] }
                ],
                cooldownPeriod: 5
            }
        ];
        defaultRules.forEach(rule => {
            this.addAlertRule(rule);
        });
        this.logger.log(`Initialized ${defaultRules.length} default alert rules`);
    }
    async evaluateRule(rule, systemMetrics, appMetrics, healthStatus) {
        const metricValue = this.getMetricValue(rule.condition.metric, systemMetrics, appMetrics, healthStatus);
        if (metricValue === null) {
            return;
        }
        const conditionMet = this.evaluateCondition(rule.condition, metricValue);
        if (conditionMet && (await this.isConditionPersistent(rule))) {
            if (rule.lastTriggered &&
                Date.now() - rule.lastTriggered.getTime() < rule.cooldownPeriod * 60 * 1000) {
                return;
            }
            const alert = this.createAlert(rule.name, `${rule.description}. Current value: ${metricValue}`, rule.severity, rule.category, 'alert-rule', { [rule.condition.metric]: metricValue }, rule.id);
            rule.lastTriggered = new Date();
            this.logger.debug(`Alert rule triggered: ${rule.name}`, { ruleId: rule.id, alertId: alert.id });
        }
    }
    getMetricValue(metric, systemMetrics, appMetrics, healthStatus) {
        switch (metric) {
            case 'cpu_usage':
                return systemMetrics.cpu.usage;
            case 'memory_usage':
                return systemMetrics.memory.usage;
            case 'disk_usage':
                return systemMetrics.disk.usage;
            case 'response_time':
                return appMetrics.responses.averageTime;
            case 'error_rate':
                return appMetrics.requests.errorRate;
            case 'health_status':
                return healthStatus.status === 'ok' ? 1 : 0;
            default:
                this.logger.warn(`Unknown metric: ${metric}`);
                return null;
        }
    }
    evaluateCondition(condition, value) {
        switch (condition.operator) {
            case 'gt': return value > condition.threshold;
            case 'gte': return value >= condition.threshold;
            case 'lt': return value < condition.threshold;
            case 'lte': return value <= condition.threshold;
            case 'eq': return value === condition.threshold;
            case 'ne': return value !== condition.threshold;
            default: return false;
        }
    }
    async isConditionPersistent(rule) {
        const history = this.metricHistory.get(rule.condition.metric) || [];
        const durationMs = rule.condition.duration * 60 * 1000;
        const cutoffTime = Date.now() - durationMs;
        const recentHistory = history.filter(h => h.timestamp.getTime() >= cutoffTime);
        if (recentHistory.length < 2) {
            return false;
        }
        return recentHistory.every(h => this.evaluateCondition(rule.condition, h.value));
    }
    storeMetricsHistory(systemMetrics, appMetrics) {
        const timestamp = new Date();
        const metrics = {
            cpu_usage: systemMetrics.cpu.usage,
            memory_usage: systemMetrics.memory.usage,
            disk_usage: systemMetrics.disk.usage,
            response_time: appMetrics.responses.averageTime,
            error_rate: appMetrics.requests.errorRate
        };
        for (const [metric, value] of Object.entries(metrics)) {
            if (!this.metricHistory.has(metric)) {
                this.metricHistory.set(metric, []);
            }
            const history = this.metricHistory.get(metric);
            history.push({ timestamp, value });
            const cutoffTime = Date.now() - 60 * 60 * 1000;
            this.metricHistory.set(metric, history.filter(h => h.timestamp.getTime() >= cutoffTime));
        }
    }
    async checkEscalation(alert) {
        const rule = this.rules.get(alert.correlationId || '');
        if (!rule)
            return;
        const timeSinceCreated = Date.now() - alert.timestamp.getTime();
        const currentLevel = alert.escalationLevel + 1;
        const escalationLevel = rule.escalationPolicy.levels.find(l => l.level === currentLevel);
        if (!escalationLevel)
            return;
        const shouldEscalate = timeSinceCreated >= escalationLevel.delayMinutes * 60 * 1000;
        if (shouldEscalate && alert.status === 'active') {
            alert.escalationLevel = currentLevel;
            alert.actions.push({
                timestamp: new Date(),
                type: 'escalated',
                user: 'system',
                metadata: { level: currentLevel }
            });
            this.logger.warn(`Alert escalated to level ${currentLevel}: ${alert.title}`, { alertId: alert.id });
            this.sendEscalationNotifications(alert, escalationLevel);
        }
    }
    sendNotifications(alert) {
        this.logger.log(`Sending notifications for alert: ${alert.title}`, {
            alertId: alert.id,
            severity: alert.severity
        });
    }
    sendEscalationNotifications(alert, escalationLevel) {
        this.logger.log(`Sending escalation notifications for alert: ${alert.title}`, {
            alertId: alert.id,
            level: escalationLevel.level
        });
    }
    generateAlertId() {
        return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    generateRuleId() {
        return `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
};
exports.AlertManagerService = AlertManagerService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_MINUTE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AlertManagerService.prototype, "evaluateAlertRules", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_5_MINUTES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AlertManagerService.prototype, "handleEscalations", null);
exports.AlertManagerService = AlertManagerService = AlertManagerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [metrics_collector_service_1.MetricsCollectorService,
        health_check_service_1.HealthCheckService])
], AlertManagerService);
//# sourceMappingURL=alert-manager.service.js.map