import { Controller, Get, Post, Query, Request, Body, UseGuards } from '@nestjs/common';
import { SecurityAuditService } from '../services/security-audit.service';

export interface ComplianceReportRequest {
  framework: 'GDPR' | 'SOC2' | 'ISO27001';
  startDate: string;
  endDate: string;
}

@Controller('api/security/compliance')
export class ComplianceController {
  constructor(private readonly auditService: SecurityAuditService) {}

  @Post('reports/gdpr')
  async generateGDPRReport(@Request() req: any, @Body() body: ComplianceReportRequest) {
    try {
      const startDate = new Date(body.startDate);
      const endDate = new Date(body.endDate);

      const complianceReport = await this.auditService.generateComplianceReport(startDate, endDate);

      // Log compliance report generation
      await this.auditService.logSecurityEvent({
        userId: req.user?.id || 'system',
        eventType: 'gdpr_compliance_report_generated',
        severity: 'low',
        details: {
          framework: 'GDPR',
          period: { startDate, endDate },
          complianceScore: complianceReport.complianceScore,
        },
      });

      return {
        success: true,
        data: complianceReport,
        message: 'GDPR compliance report generated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to generate GDPR compliance report',
      };
    }
  }

  @Post('reports/soc2')
  async generateSOC2Report(@Request() req: any, @Body() body: ComplianceReportRequest) {
    try {
      const startDate = new Date(body.startDate);
      const endDate = new Date(body.endDate);

      const complianceReport = await this.auditService.generateComplianceReport(startDate, endDate);

      // Customize for SOC2
      const soc2Report = {
        ...complianceReport,
        framework: 'SOC2',
        reportId: `soc2-${Date.now()}`,
        trustServicesCriteria: {
          security: complianceReport.complianceScore >= 90,
          availability: true, // Would need actual availability metrics
          processingIntegrity: true,
          confidentiality: complianceReport.complianceScore >= 95,
        },
      };

      await this.auditService.logSecurityEvent({
        userId: req.user?.id || 'system',
        eventType: 'soc2_compliance_report_generated',
        severity: 'low',
        details: {
          framework: 'SOC2',
          period: { startDate, endDate },
          complianceScore: complianceReport.complianceScore,
        },
      });

      return {
        success: true,
        data: soc2Report,
        message: 'SOC2 compliance report generated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to generate SOC2 compliance report',
      };
    }
  }

  @Get('dashboard')
  async getComplianceDashboard(@Request() req: any, @Query('timeframe') timeframe?: string) {
    try {
      const dashboardData = await this.auditService.getSecurityDashboard(
        (timeframe as any) || 'month'
      );

      // Calculate compliance metrics
      const complianceMetrics = {
        ...dashboardData,
        gdprCompliance: {
          score: Math.max(90 - dashboardData.summary.criticalEvents * 5, 0),
          status: dashboardData.summary.criticalEvents === 0 ? 'compliant' : 'partial',
          lastAssessment: new Date(),
        },
        soc2Compliance: {
          score: Math.max(85 - dashboardData.summary.highEvents * 3, 0),
          status: dashboardData.summary.highEvents <= 2 ? 'compliant' : 'partial',
          lastAssessment: new Date(),
        },
        securityPosture: {
          riskLevel: dashboardData.summary.riskScore > 50 ? 'high' : 
                    dashboardData.summary.riskScore > 25 ? 'medium' : 'low',
          improvementAreas: this.identifyImprovementAreas(dashboardData),
        },
      };

      return {
        success: true,
        data: complianceMetrics,
        message: 'Compliance dashboard data retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve compliance dashboard data',
      };
    }
  }

  @Get('audit-logs')
  async getComplianceAuditLogs(
    @Request() req: any,
    @Query('action') action?: string,
    @Query('resourceType') resourceType?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    try {
      const auditLogs = await this.auditService.getAuditLogs(
        undefined, // userId
        action,
        resourceType,
        parseInt(limit || '50'),
        parseInt(offset || '0')
      );

      return {
        success: true,
        data: auditLogs,
        message: 'Compliance audit logs retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve compliance audit logs',
      };
    }
  }

  @Get('security-events')
  async getSecurityEvents(
    @Request() req: any,
    @Query('eventType') eventType?: string,
    @Query('severity') severity?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    try {
      const securityEvents = await this.auditService.getSecurityEvents(
        undefined, // userId
        eventType,
        undefined, // resourceType
        severity,
        parseInt(limit || '50'),
        parseInt(offset || '0')
      );

      return {
        success: true,
        data: securityEvents,
        message: 'Security events retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve security events',
      };
    }
  }

  @Get('anomalies/:userId')
  async getUserAnomalies(
    @Request() req: any,
    @Query('timeframe') timeframe?: string
  ) {
    try {
      const anomalies = await this.auditService.detectAnomalies(
        req.params.userId,
        (timeframe as 'hour' | 'day') || 'day'
      );

      return {
        success: true,
        data: anomalies,
        message: 'User anomalies detected successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to detect user anomalies',
      };
    }
  }

  private identifyImprovementAreas(dashboardData: any): string[] {
    const areas: string[] = [];

    if (dashboardData.summary.criticalEvents > 0) {
      areas.push('Critical security incidents require immediate attention');
    }

    if (dashboardData.summary.highEvents > 5) {
      areas.push('High number of high-severity events indicates systemic issues');
    }

    if (dashboardData.summary.riskScore > 30) {
      areas.push('Overall risk score is elevated - review security controls');
    }

    // Check for common event types that indicate issues
    const failedLoginEvents = dashboardData.eventsByType.find(
      (event: any) => event.eventType === 'failed_login'
    );
    if (failedLoginEvents && failedLoginEvents.count > 100) {
      areas.push('High number of failed login attempts - consider implementing rate limiting');
    }

    if (areas.length === 0) {
      areas.push('Security posture appears healthy - maintain current controls');
    }

    return areas;
  }
}