import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// Import all Phase 2 services
import { AdvancedCacheService } from './services/advanced-cache.service';
import { PerformanceMetricsService } from './services/performance-metrics.service';
import { RealTimeMonitoringService } from './services/real-time-monitoring.service';
import { SubscriptionOptimizationService } from './services/subscription-optimization.service';
import { MobileOptimizationService } from './services/mobile-optimization.service';
import { AnalyticsDashboardService } from './services/analytics-dashboard.service';

// Import RBAC services
import { RBACService } from './services/rbac.service';
import { RBACCacheService } from './services/rbac-cache.service';
import { AuditLogService } from './services/audit-log.service';

// Import guards
import { RBACGuard } from './guards/rbac.guard';
import { OwnershipGuard } from './guards/ownership.guard';

// Import controllers
import { MonitoringController } from './controllers/monitoring.controller';
import { AnalyticsController } from './controllers/analytics.controller';

// Import existing services that Phase 2 depends on
import { PrismaService } from '../prisma/prisma.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    // Core infrastructure services
    PrismaService,
    
    // Phase 2 Advanced Services
    AdvancedCacheService,
    PerformanceMetricsService,
    RealTimeMonitoringService,
    SubscriptionOptimizationService,
    MobileOptimizationService,
    AnalyticsDashboardService,
    
    // RBAC Services & Guards
    RBACService,
    RBACCacheService,
    AuditLogService,
    RBACGuard,
    OwnershipGuard,
  ],
  controllers: [
    MonitoringController,
    AnalyticsController,
  ],
  exports: [
    // Export all services for use in other modules
    AdvancedCacheService,
    PerformanceMetricsService,
    RealTimeMonitoringService,
    SubscriptionOptimizationService,
    MobileOptimizationService,
    AnalyticsDashboardService,
    PrismaService,
    
    // Export RBAC Services & Guards
    RBACService,
    RBACCacheService,
    AuditLogService,
    RBACGuard,
    OwnershipGuard,
  ],
})
export class CommonServicesModule {}