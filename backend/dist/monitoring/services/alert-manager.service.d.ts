import { MetricsCollectorService } from './metrics-collector.service';
import { HealthCheckService } from './health-check.service';
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
    cooldownPeriod: number;
    lastTriggered?: Date;
}
export interface AlertCondition {
    metric: string;
    operator: 'gt' | 'lt' | 'eq' | 'ne' | 'gte' | 'lte';
    threshold: number;
    duration: number;
    evaluationWindow: number;
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
export declare class AlertManagerService {
    private readonly metricsCollector;
    private readonly healthCheck;
    private readonly logger;
    private alerts;
    private rules;
    private metricHistory;
    constructor(metricsCollector: MetricsCollectorService, healthCheck: HealthCheckService);
    createAlert(title: string, description: string, severity: Alert['severity'], category: Alert['category'], source: string, metrics?: Record<string, number>, correlationId?: string): Alert;
    acknowledgeAlert(alertId: string, user: string, comment?: string): Alert | null;
    resolveAlert(alertId: string, user: string, comment?: string): Alert | null;
    getActiveAlerts(): Alert[];
    getAlertSummary(): AlertSummary;
    addAlertRule(rule: Omit<AlertRule, 'id'>): AlertRule;
    getAlertRules(): AlertRule[];
    toggleAlertRule(ruleId: string, enabled: boolean): AlertRule | null;
    evaluateAlertRules(): Promise<void>;
    handleEscalations(): Promise<void>;
    private initializeDefaultRules;
    private evaluateRule;
    private getMetricValue;
    private evaluateCondition;
    private isConditionPersistent;
    private storeMetricsHistory;
    private checkEscalation;
    private sendNotifications;
    private sendEscalationNotifications;
    private generateAlertId;
    private generateRuleId;
}
