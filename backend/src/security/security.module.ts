import { Module } from '@nestjs/common';
import { CacheModule } from '../cache/cache.module';
import { PrismaModule } from '../prisma/prisma.module';
import { MfaService } from './services/mfa.service';
import { RbacService } from './services/rbac.service';
import { SecurityAuditService } from './services/security-audit.service';
import { RbacSeederService } from './services/rbac-seeder.service';
import { SecurityMonitoringService } from './services/security-monitoring.service';
import { SecurityController } from './controllers/security.controller';
import { RbacController } from './controllers/rbac.controller';
import { ComplianceController } from './controllers/compliance.controller';
import { SecurityDashboardController } from './controllers/security-dashboard.controller';

@Module({
  imports: [
    PrismaModule,
    CacheModule
  ],
  providers: [
    MfaService,
    RbacService,
    SecurityAuditService,
    RbacSeederService,
    SecurityMonitoringService
  ],
  controllers: [SecurityController, RbacController, ComplianceController, SecurityDashboardController],
  exports: [
    MfaService,
    RbacService,
    SecurityAuditService,
    SecurityMonitoringService
  ]
})
export class SecurityModule {}