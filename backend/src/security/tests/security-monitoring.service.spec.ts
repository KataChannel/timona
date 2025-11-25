import { Test, TestingModule } from '@nestjs/testing';
import { SecurityMonitoringService } from '../services/security-monitoring.service';
import { SecurityAuditService } from '../services/security-audit.service';
import { RbacService } from '../services/rbac.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('SecurityMonitoringService', () => {
  let service: SecurityMonitoringService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SecurityMonitoringService,
        {
          provide: SecurityAuditService,
          useValue: {
            logSecurityEvent: jest.fn(),
            getSecurityEvents: jest.fn().mockResolvedValue({ events: [], total: 0 }),
            generateComplianceReport: jest.fn().mockResolvedValue({
              complianceScore: 85,
              status: 'compliant',
            }),
          },
        },
        {
          provide: RbacService,
          useValue: {
            checkPermission: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            user: {
              count: jest.fn().mockResolvedValue(10),
              findMany: jest.fn().mockResolvedValue([]),
            },
            securityEvent: {
              count: jest.fn().mockResolvedValue(5),
              findMany: jest.fn().mockResolvedValue([]),
            },
            auditLog: {
              count: jest.fn().mockResolvedValue(3),
            },
          },
        },
      ],
    }).compile();

    service = module.get<SecurityMonitoringService>(SecurityMonitoringService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should perform security assessment', async () => {
    const assessment = await service.performSecurityAssessment();
    
    expect(assessment).toHaveProperty('assessmentId');
    expect(assessment).toHaveProperty('overallScore');
    expect(assessment).toHaveProperty('riskLevel');
    expect(assessment).toHaveProperty('categories');
    expect(assessment).toHaveProperty('recommendations');
    expect(assessment).toHaveProperty('complianceStatus');
    
    expect(assessment.categories).toHaveProperty('authentication');
    expect(assessment.categories).toHaveProperty('authorization');
    expect(assessment.categories).toHaveProperty('dataProtection');
    expect(assessment.categories).toHaveProperty('auditLogging');
    expect(assessment.categories).toHaveProperty('incidentResponse');
  });

  it('should calculate overall score correctly', async () => {
    const assessment = await service.performSecurityAssessment();
    
    expect(assessment.overallScore).toBeGreaterThanOrEqual(0);
    expect(assessment.overallScore).toBeLessThanOrEqual(100);
  });

  it('should determine risk level correctly', async () => {
    const assessment = await service.performSecurityAssessment();
    
    expect(['low', 'medium', 'high', 'critical']).toContain(assessment.riskLevel);
  });

  it('should generate security recommendations', async () => {
    const assessment = await service.performSecurityAssessment();
    
    expect(Array.isArray(assessment.recommendations)).toBe(true);
    
    if (assessment.recommendations.length > 0) {
      const recommendation = assessment.recommendations[0];
      expect(recommendation).toHaveProperty('id');
      expect(recommendation).toHaveProperty('priority');
      expect(recommendation).toHaveProperty('title');
      expect(recommendation).toHaveProperty('description');
    }
  });

  it('should assess compliance status', async () => {
    const assessment = await service.performSecurityAssessment();
    
    expect(assessment.complianceStatus).toHaveProperty('gdpr');
    expect(assessment.complianceStatus).toHaveProperty('soc2');
    expect(assessment.complianceStatus).toHaveProperty('iso27001');
    
    expect(assessment.complianceStatus.gdpr).toHaveProperty('score');
    expect(assessment.complianceStatus.gdpr).toHaveProperty('status');
  });
});