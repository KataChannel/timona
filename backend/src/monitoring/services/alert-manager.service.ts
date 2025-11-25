import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MetricsCollectorService, SystemMetrics, ApplicationMetrics } from './metrics-collector.service';
import { HealthCheckService, HealthStatus } from './health-check.service';

export interface Alert {
  id: string;
  timestamp: Date;
  severity: 'info' | 'warning' | 'error' | 'critical';
  category: 'performance' | 'availability' | 'security' | 'business';
  title: string;
  description: string;
  source: string;
  metrics: Record<string, number>;
  status: 'active' | 'acknowledged' | 'resolved';
  assignedTo?: string;
  escalationLevel: number;
  correlationId?: string;
  actions: AlertAction[];
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  category: Alert['category'];
  severity: Alert['severity'];
  condition: AlertCondition;
  enabled: boolean;
  escalationPolicy: EscalationPolicy;
  notifications: NotificationChannel[];
  cooldownPeriod: number; // minutes
  lastTriggered?: Date;
}

export interface AlertCondition {
  metric: string;
  operator: 'gt' | 'lt' | 'eq' | 'ne' | 'gte' | 'lte';
  threshold: number;
  duration: number; // minutes - how long condition must persist
  evaluationWindow: number; // minutes - time window to evaluate
}

export interface EscalationPolicy {
  levels: EscalationLevel[];
}

export interface EscalationLevel {
  level: number;
  delayMinutes: number;
  notifications: NotificationChannel[];
  assignTo?: string[];
}

export interface NotificationChannel {
  type: 'email' | 'slack' | 'webhook' | 'sms';
  target: string;
  enabled: boolean;
  severity: Alert['severity'][];
}

export interface AlertAction {
  timestamp: Date;
  type: 'created' | 'acknowledged' | 'escalated' | 'resolved' | 'commented';
  user: string;
  comment?: string;
  metadata?: Record<string, any>;
}

export interface AlertSummary {
  total: number;
  byStatus: Record<Alert['status'], number>;
  bySeverity: Record<Alert['severity'], number>;
  byCategory: Record<Alert['category'], number>;
  recentAlerts: Alert[];
  topIssues: {
    metric: string;
    count: number;
    lastOccurred: Date;
  }[];
}

@Injectable()
export class AlertManagerService {
  private readonly logger = new Logger(AlertManagerService.name);
  private alerts: Map<string, Alert> = new Map();
  private rules: Map<string, AlertRule> = new Map();
  private metricHistory: Map<string, { timestamp: Date; value: number }[]> = new Map();

  constructor(
    private readonly metricsCollector: MetricsCollectorService,
    private readonly healthCheck: HealthCheckService
  ) {
    this.initializeDefaultRules();
    this.logger.log('AlertManagerService initialized with default rules');
  }

  /**
   * Create a new alert
   */
  createAlert(
    title: string,
    description: string,
    severity: Alert['severity'],
    category: Alert['category'],
    source: string,
    metrics: Record<string, number> = {},
    correlationId?: string
  ): Alert {
    const alert: Alert = {
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

    // Send notifications
    this.sendNotifications(alert);

    // Record metrics
    this.metricsCollector.recordCustomMetric('alerts_created', 1, 'count', 'Alert created');
    this.metricsCollector.recordCustomMetric(`alerts_${severity}`, 1, 'count', `${severity} alert created`);

    return alert;
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId: string, user: string, comment?: string): Alert | null {
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

  /**
   * Resolve an alert
   */
  resolveAlert(alertId: string, user: string, comment?: string): Alert | null {
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

  /**
   * Get all active alerts
   */
  getActiveAlerts(): Alert[] {
    return Array.from(this.alerts.values()).filter(alert => alert.status === 'active');
  }

  /**
   * Get alert summary
   */
  getAlertSummary(): AlertSummary {
    const allAlerts = Array.from(this.alerts.values());
    const recentAlerts = allAlerts
      .filter(alert => Date.now() - alert.timestamp.getTime() < 24 * 60 * 60 * 1000) // Last 24 hours
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);

    // Count by status
    const byStatus = allAlerts.reduce((acc, alert) => {
      acc[alert.status] = (acc[alert.status] || 0) + 1;
      return acc;
    }, {} as Record<Alert['status'], number>);

    // Count by severity
    const bySeverity = allAlerts.reduce((acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      return acc;
    }, {} as Record<Alert['severity'], number>);

    // Count by category
    const byCategory = allAlerts.reduce((acc, alert) => {
      acc[alert.category] = (acc[alert.category] || 0) + 1;
      return acc;
    }, {} as Record<Alert['category'], number>);

    // Top issues (simplified)
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

  /**
   * Add custom alert rule
   */
  addAlertRule(rule: Omit<AlertRule, 'id'>): AlertRule {
    const alertRule: AlertRule = {
      ...rule,
      id: this.generateRuleId()
    };

    this.rules.set(alertRule.id, alertRule);
    this.logger.log(`Alert rule added: ${alertRule.name}`, { ruleId: alertRule.id });
    
    return alertRule;
  }

  /**
   * Get all alert rules
   */
  getAlertRules(): AlertRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Enable/disable alert rule
   */
  toggleAlertRule(ruleId: string, enabled: boolean): AlertRule | null {
    const rule = this.rules.get(ruleId);
    if (!rule) {
      this.logger.error(`Alert rule not found: ${ruleId}`);
      return null;
    }

    rule.enabled = enabled;
    this.logger.log(`Alert rule ${enabled ? 'enabled' : 'disabled'}: ${rule.name}`, { ruleId });
    
    return rule;
  }

  /**
   * Scheduled task to evaluate alert rules
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async evaluateAlertRules(): Promise<void> {
    try {
      const [systemMetrics, appMetrics, healthStatus] = await Promise.all([
        this.metricsCollector.getSystemMetrics(),
        this.metricsCollector.getApplicationMetrics(),
        this.healthCheck.getSimpleHealthStatus()
      ]);

      // Store metrics history
      this.storeMetricsHistory(systemMetrics, appMetrics);

      // Evaluate each enabled rule
      for (const rule of this.rules.values()) {
        if (rule.enabled) {
          await this.evaluateRule(rule, systemMetrics, appMetrics, healthStatus);
        }
      }
    } catch (error) {
      this.logger.error('Failed to evaluate alert rules:', error);
    }
  }

  /**
   * Scheduled task to handle alert escalations
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleEscalations(): Promise<void> {
    try {
      const activeAlerts = this.getActiveAlerts();
      
      for (const alert of activeAlerts) {
        await this.checkEscalation(alert);
      }
    } catch (error) {
      this.logger.error('Failed to handle escalations:', error);
    }
  }

  /**
   * Initialize default alert rules
   */
  private initializeDefaultRules(): void {
    const defaultRules: Omit<AlertRule, 'id'>[] = [
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
          threshold: 0, // 0 = error, 1 = ok
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

  /**
   * Evaluate a single alert rule
   */
  private async evaluateRule(
    rule: AlertRule,
    systemMetrics: SystemMetrics,
    appMetrics: ApplicationMetrics,
    healthStatus: { status: string }
  ): Promise<void> {
    const metricValue = this.getMetricValue(rule.condition.metric, systemMetrics, appMetrics, healthStatus);
    if (metricValue === null) {
      return; // Metric not found
    }

    const conditionMet = this.evaluateCondition(rule.condition, metricValue);
    
    // Check if condition has been met for required duration
    if (conditionMet && (await this.isConditionPersistent(rule))) {
      // Check cooldown period
      if (rule.lastTriggered && 
          Date.now() - rule.lastTriggered.getTime() < rule.cooldownPeriod * 60 * 1000) {
        return; // Still in cooldown
      }

      // Create alert
      const alert = this.createAlert(
        rule.name,
        `${rule.description}. Current value: ${metricValue}`,
        rule.severity,
        rule.category,
        'alert-rule',
        { [rule.condition.metric]: metricValue },
        rule.id
      );

      rule.lastTriggered = new Date();
      this.logger.debug(`Alert rule triggered: ${rule.name}`, { ruleId: rule.id, alertId: alert.id });
    }
  }

  /**
   * Get metric value from collected metrics
   */
  private getMetricValue(
    metric: string,
    systemMetrics: SystemMetrics,
    appMetrics: ApplicationMetrics,
    healthStatus: { status: string }
  ): number | null {
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

  /**
   * Evaluate alert condition
   */
  private evaluateCondition(condition: AlertCondition, value: number): boolean {
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

  /**
   * Check if condition has been persistent for required duration
   */
  private async isConditionPersistent(rule: AlertRule): Promise<boolean> {
    const history = this.metricHistory.get(rule.condition.metric) || [];
    const durationMs = rule.condition.duration * 60 * 1000;
    const cutoffTime = Date.now() - durationMs;
    
    const recentHistory = history.filter(h => h.timestamp.getTime() >= cutoffTime);
    
    // If we don't have enough history, assume condition is not persistent
    if (recentHistory.length < 2) {
      return false;
    }

    // Check if all recent values meet the condition
    return recentHistory.every(h => this.evaluateCondition(rule.condition, h.value));
  }

  /**
   * Store metrics history for rule evaluation
   */
  private storeMetricsHistory(systemMetrics: SystemMetrics, appMetrics: ApplicationMetrics): void {
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

      const history = this.metricHistory.get(metric)!;
      history.push({ timestamp, value });

      // Keep only last 60 minutes of history
      const cutoffTime = Date.now() - 60 * 60 * 1000;
      this.metricHistory.set(metric, history.filter(h => h.timestamp.getTime() >= cutoffTime));
    }
  }

  /**
   * Check if alert needs escalation
   */
  private async checkEscalation(alert: Alert): Promise<void> {
    const rule = this.rules.get(alert.correlationId || '');
    if (!rule) return;

    const timeSinceCreated = Date.now() - alert.timestamp.getTime();
    const currentLevel = alert.escalationLevel + 1;
    
    const escalationLevel = rule.escalationPolicy.levels.find(l => l.level === currentLevel);
    if (!escalationLevel) return;

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

  /**
   * Send alert notifications
   */
  private sendNotifications(alert: Alert): void {
    // Mock notification sending - implement actual notification logic
    this.logger.log(`Sending notifications for alert: ${alert.title}`, {
      alertId: alert.id,
      severity: alert.severity
    });
  }

  /**
   * Send escalation notifications
   */
  private sendEscalationNotifications(alert: Alert, escalationLevel: EscalationLevel): void {
    // Mock escalation notification sending
    this.logger.log(`Sending escalation notifications for alert: ${alert.title}`, {
      alertId: alert.id,
      level: escalationLevel.level
    });
  }

  /**
   * Generate unique alert ID
   */
  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique rule ID
   */
  private generateRuleId(): string {
    return `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}