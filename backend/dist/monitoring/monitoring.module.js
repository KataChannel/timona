"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringModule = void 0;
const common_1 = require("@nestjs/common");
const terminus_1 = require("@nestjs/terminus");
const prisma_module_1 = require("../prisma/prisma.module");
const metrics_collector_service_1 = require("./services/metrics-collector.service");
const health_check_service_1 = require("./services/health-check.service");
const performance_profiler_service_1 = require("./services/performance-profiler.service");
const alert_manager_service_1 = require("./services/alert-manager.service");
const monitoring_controller_1 = require("./controllers/monitoring.controller");
let MonitoringModule = class MonitoringModule {
};
exports.MonitoringModule = MonitoringModule;
exports.MonitoringModule = MonitoringModule = __decorate([
    (0, common_1.Module)({
        imports: [
            terminus_1.TerminusModule,
            prisma_module_1.PrismaModule
        ],
        providers: [
            metrics_collector_service_1.MetricsCollectorService,
            health_check_service_1.HealthCheckService,
            performance_profiler_service_1.PerformanceProfilerService,
            alert_manager_service_1.AlertManagerService
        ],
        controllers: [monitoring_controller_1.MonitoringController],
        exports: [
            metrics_collector_service_1.MetricsCollectorService,
            health_check_service_1.HealthCheckService,
            performance_profiler_service_1.PerformanceProfilerService,
            alert_manager_service_1.AlertManagerService
        ]
    })
], MonitoringModule);
//# sourceMappingURL=monitoring.module.js.map