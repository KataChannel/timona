import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TerminusModule } from '@nestjs/terminus';
import { PrismaModule } from '../prisma/prisma.module';
import { MetricsCollectorService } from './services/metrics-collector.service';
import { HealthCheckService } from './services/health-check.service';
import { PerformanceProfilerService } from './services/performance-profiler.service';
import { AlertManagerService } from './services/alert-manager.service';
import { MonitoringController } from './controllers/monitoring.controller';

@Module({
  imports: [
    // ScheduleModule.forRoot(), // Moved to AppModule
    TerminusModule,
    PrismaModule
  ],
  providers: [
    MetricsCollectorService,
    HealthCheckService,
    PerformanceProfilerService,
    AlertManagerService
  ],
  controllers: [MonitoringController],
  exports: [
    MetricsCollectorService,
    HealthCheckService,
    PerformanceProfilerService,
    AlertManagerService
  ]
})
export class MonitoringModule {}