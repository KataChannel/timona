"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonServicesModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const advanced_cache_service_1 = require("./services/advanced-cache.service");
const performance_metrics_service_1 = require("./services/performance-metrics.service");
const real_time_monitoring_service_1 = require("./services/real-time-monitoring.service");
const subscription_optimization_service_1 = require("./services/subscription-optimization.service");
const mobile_optimization_service_1 = require("./services/mobile-optimization.service");
const analytics_dashboard_service_1 = require("./services/analytics-dashboard.service");
const rbac_service_1 = require("./services/rbac.service");
const rbac_cache_service_1 = require("./services/rbac-cache.service");
const audit_log_service_1 = require("./services/audit-log.service");
const rbac_guard_1 = require("./guards/rbac.guard");
const ownership_guard_1 = require("./guards/ownership.guard");
const monitoring_controller_1 = require("./controllers/monitoring.controller");
const analytics_controller_1 = require("./controllers/analytics.controller");
const prisma_service_1 = require("../prisma/prisma.service");
let CommonServicesModule = class CommonServicesModule {
};
exports.CommonServicesModule = CommonServicesModule;
exports.CommonServicesModule = CommonServicesModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [config_1.ConfigModule],
        providers: [
            prisma_service_1.PrismaService,
            advanced_cache_service_1.AdvancedCacheService,
            performance_metrics_service_1.PerformanceMetricsService,
            real_time_monitoring_service_1.RealTimeMonitoringService,
            subscription_optimization_service_1.SubscriptionOptimizationService,
            mobile_optimization_service_1.MobileOptimizationService,
            analytics_dashboard_service_1.AnalyticsDashboardService,
            rbac_service_1.RBACService,
            rbac_cache_service_1.RBACCacheService,
            audit_log_service_1.AuditLogService,
            rbac_guard_1.RBACGuard,
            ownership_guard_1.OwnershipGuard,
        ],
        controllers: [
            monitoring_controller_1.MonitoringController,
            analytics_controller_1.AnalyticsController,
        ],
        exports: [
            advanced_cache_service_1.AdvancedCacheService,
            performance_metrics_service_1.PerformanceMetricsService,
            real_time_monitoring_service_1.RealTimeMonitoringService,
            subscription_optimization_service_1.SubscriptionOptimizationService,
            mobile_optimization_service_1.MobileOptimizationService,
            analytics_dashboard_service_1.AnalyticsDashboardService,
            prisma_service_1.PrismaService,
            rbac_service_1.RBACService,
            rbac_cache_service_1.RBACCacheService,
            audit_log_service_1.AuditLogService,
            rbac_guard_1.RBACGuard,
            ownership_guard_1.OwnershipGuard,
        ],
    })
], CommonServicesModule);
//# sourceMappingURL=common-services.module.js.map