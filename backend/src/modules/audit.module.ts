import { Module, Global } from '@nestjs/common';
import { EnhancedAuditService } from '../services/enhanced-audit.service';
import { AuditInterceptor } from '../interceptors/audit.interceptor';
import { AuditResolver } from '../graphql/resolvers/audit.resolver';
import { PrismaModule } from '../prisma/prisma.module';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [
    EnhancedAuditService,
    AuditInterceptor,
    AuditResolver,
  ],
  exports: [
    EnhancedAuditService,
    AuditInterceptor,
  ],
})
export class AuditModule {}