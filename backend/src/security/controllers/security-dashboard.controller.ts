import {
  Controller,
  Get,
  Post,
  Query,
  HttpStatus,
  HttpException,
  Logger,
} from '@nestjs/common';
import { SecurityMonitoringService } from '../services/security-monitoring.service';
import { SecurityAuditService } from '../services/security-audit.service';

export interface SecurityDashboardSummary {
  securityScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  lastAssessment: Date;
  complianceStatus: {
    gdpr: number;
    soc2: number;
    iso27001: number;
  };
  recentActivity: {
    auditLogsToday: number;
    securityEventsToday: number;
    criticalAlertsOpen: number;
  };
}

@Controller('security/dashboard')
export class SecurityDashboardController {
  private readonly logger = new Logger(SecurityDashboardController.name);

  constructor(
    private readonly monitoringService: SecurityMonitoringService,
    private readonly auditService: SecurityAuditService,
  ) {}

  @Get('summary')
  async getSecuritySummary(): Promise<SecurityDashboardSummary> {
    try {
      this.logger.log('Generating security dashboard summary');

      // Run security assessment
      const assessment = await this.monitoringService.performSecurityAssessment();
      
      // Get recent activity metrics
      const now = new Date();
      const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const recentAuditLogs = await this.auditService.getAuditLogs(
        undefined, // userId
        undefined, // action
        undefined, // resourceType
        1000,      // limit
        0          // offset
      );

      const recentSecurityEvents = await this.auditService.getSecurityEvents(
        undefined, // userId
        undefined, // eventType
        undefined, // resourceType
        undefined, // severity
        1000,      // limit
        0          // offset
      );

      const criticalEvents = await this.auditService.getSecurityEvents(
        undefined, // userId
        undefined, // eventType
        undefined, // resourceType
        'critical', // severity
        100,       // limit
        0          // offset
      );

      return {
        securityScore: assessment.overallScore,
        riskLevel: assessment.riskLevel,
        lastAssessment: assessment.timestamp,
        complianceStatus: {
          gdpr: assessment.complianceStatus.gdpr.score,
          soc2: assessment.complianceStatus.soc2.score,
          iso27001: assessment.complianceStatus.iso27001.score,
        },
        recentActivity: {
          auditLogsToday: recentAuditLogs.total,
          securityEventsToday: recentSecurityEvents.total,
          criticalAlertsOpen: criticalEvents.events.filter(e => !e.isResolved).length,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to generate security summary: ${error.message}`);
      throw new HttpException(
        'Failed to generate security summary',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('assessment')
  async runSecurityAssessment() {
    try {
      this.logger.log('Security assessment requested');
      
      const assessment = await this.monitoringService.performSecurityAssessment();
      
      return {
        success: true,
        assessment,
        message: 'Security assessment completed successfully',
      };
    } catch (error) {
      this.logger.error(`Security assessment failed: ${error.message}`);
      throw new HttpException(
        'Security assessment failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('compliance-report')
  async generateComplianceReport(
    @Query('days') days: string = '30',
  ) {
    try {
      const daysNum = Math.min(parseInt(days, 10) || 30, 365);
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - daysNum * 24 * 60 * 60 * 1000);

      this.logger.log(`Generating compliance report for ${daysNum} days`);
      
      const complianceReport = await this.auditService.generateComplianceReport(startDate, endDate);
      
      return {
        success: true,
        report: complianceReport,
        period: {
          startDate,
          endDate,
          days: daysNum,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to generate compliance report: ${error.message}`);
      throw new HttpException(
        'Failed to generate compliance report',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('alerts')
  async getSecurityAlerts(
    @Query('severity') severity?: 'low' | 'medium' | 'high' | 'critical',
    @Query('limit') limit: string = '50',
  ) {
    try {
      const limitNum = Math.min(parseInt(limit, 10) || 50, 100);
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const alerts = await this.auditService.getSecurityEvents(
        undefined, // userId
        undefined, // eventType
        undefined, // resourceType
        severity,  // severity
        limitNum,  // limit
        0          // offset
      );

      return {
        success: true,
        alerts: alerts.events,
        totalCount: alerts.total,
        unresolved: alerts.events.filter(event => !event.isResolved).length,
      };
    } catch (error) {
      this.logger.error(`Failed to get security alerts: ${error.message}`);
      throw new HttpException(
        'Failed to get security alerts',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('recommendations')
  async getSecurityRecommendations() {
    try {
      const assessment = await this.monitoringService.performSecurityAssessment();
      
      const criticalRecommendations = assessment.recommendations.filter(r => r.priority === 'critical');
      const highRecommendations = assessment.recommendations.filter(r => r.priority === 'high');
      
      return {
        success: true,
        recommendations: assessment.recommendations,
        summary: {
          total: assessment.recommendations.length,
          critical: criticalRecommendations.length,
          high: highRecommendations.length,
          medium: assessment.recommendations.filter(r => r.priority === 'medium').length,
          low: assessment.recommendations.filter(r => r.priority === 'low').length,
        },
        topRecommendations: [...criticalRecommendations, ...highRecommendations].slice(0, 5),
      };
    } catch (error) {
      this.logger.error(`Failed to get recommendations: ${error.message}`);
      throw new HttpException(
        'Failed to get recommendations',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('assessment/daily')
  async runDailyAssessment() {
    try {
      this.logger.log('Running daily security assessment');
      
      const assessment = await this.monitoringService.runDailySecurityAssessment();
      
      return {
        success: true,
        message: 'Daily security assessment completed',
        assessment: {
          id: assessment.assessmentId,
          score: assessment.overallScore,
          riskLevel: assessment.riskLevel,
          timestamp: assessment.timestamp,
        },
      };
    } catch (error) {
      this.logger.error(`Daily assessment failed: ${error.message}`);
      throw new HttpException(
        'Daily assessment failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('compliance/weekly-check')
  async runWeeklyComplianceCheck() {
    try {
      this.logger.log('Running weekly compliance check');
      
      const report = await this.monitoringService.runWeeklyComplianceCheck();
      
      return {
        success: true,
        message: 'Weekly compliance check completed',
        report: {
          complianceScore: report.complianceScore,
          status: report.status,
          timestamp: new Date(),
        },
      };
    } catch (error) {
      this.logger.error(`Weekly compliance check failed: ${error.message}`);
      throw new HttpException(
        'Weekly compliance check failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('health')
  async getSystemHealth() {
    try {
      const now = new Date();
      const uptime = process.uptime();
      
      // Basic health metrics
      const health = {
        status: 'healthy',
        uptime: Math.floor(uptime),
        uptimeFormatted: this.formatUptime(uptime),
        timestamp: now,
        services: {
          securityMonitoring: 'operational',
          auditLogging: 'operational',
          compliance: 'operational',
        },
      };

      return {
        success: true,
        health,
      };
    } catch (error) {
      this.logger.error(`Health check failed: ${error.message}`);
      throw new HttpException(
        'Health check failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ========== Helper Methods ==========

  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }
}