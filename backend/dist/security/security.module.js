"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityModule = void 0;
const common_1 = require("@nestjs/common");
const cache_module_1 = require("../cache/cache.module");
const prisma_module_1 = require("../prisma/prisma.module");
const mfa_service_1 = require("./services/mfa.service");
const rbac_service_1 = require("./services/rbac.service");
const security_audit_service_1 = require("./services/security-audit.service");
const rbac_seeder_service_1 = require("./services/rbac-seeder.service");
const security_monitoring_service_1 = require("./services/security-monitoring.service");
const security_controller_1 = require("./controllers/security.controller");
const rbac_controller_1 = require("./controllers/rbac.controller");
const compliance_controller_1 = require("./controllers/compliance.controller");
const security_dashboard_controller_1 = require("./controllers/security-dashboard.controller");
let SecurityModule = class SecurityModule {
};
exports.SecurityModule = SecurityModule;
exports.SecurityModule = SecurityModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            cache_module_1.CacheModule
        ],
        providers: [
            mfa_service_1.MfaService,
            rbac_service_1.RbacService,
            security_audit_service_1.SecurityAuditService,
            rbac_seeder_service_1.RbacSeederService,
            security_monitoring_service_1.SecurityMonitoringService
        ],
        controllers: [security_controller_1.SecurityController, rbac_controller_1.RbacController, compliance_controller_1.ComplianceController, security_dashboard_controller_1.SecurityDashboardController],
        exports: [
            mfa_service_1.MfaService,
            rbac_service_1.RbacService,
            security_audit_service_1.SecurityAuditService,
            security_monitoring_service_1.SecurityMonitoringService
        ]
    })
], SecurityModule);
//# sourceMappingURL=security.module.js.map