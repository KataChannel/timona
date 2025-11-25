"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HRStatisticsResolver = exports.EmploymentHistoryResolver = exports.OffboardingResolver = exports.OnboardingResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../../auth/jwt-auth.guard");
const roles_guard_1 = require("../../../auth/roles.guard");
const roles_decorator_1 = require("../../../auth/roles.decorator");
const get_user_decorator_1 = require("../../../auth/get-user.decorator");
const hr_service_1 = require("../../../services/hr.service");
const onboarding_checklist_model_1 = require("../../models/hr/onboarding-checklist.model");
const offboarding_process_model_1 = require("../../models/hr/offboarding-process.model");
const employment_history_model_1 = require("../../models/hr/employment-history.model");
const onboarding_checklist_input_1 = require("../../inputs/hr/onboarding-checklist.input");
const offboarding_process_input_1 = require("../../inputs/hr/offboarding-process.input");
const employment_history_input_1 = require("../../inputs/hr/employment-history.input");
const enums_model_1 = require("../../models/hr/enums.model");
let OnboardingStats = class OnboardingStats {
};
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], OnboardingStats.prototype, "pending", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], OnboardingStats.prototype, "inProgress", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], OnboardingStats.prototype, "total", void 0);
OnboardingStats = __decorate([
    (0, graphql_1.ObjectType)()
], OnboardingStats);
let OffboardingStats = class OffboardingStats {
};
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], OffboardingStats.prototype, "pending", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], OffboardingStats.prototype, "inProgress", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], OffboardingStats.prototype, "total", void 0);
OffboardingStats = __decorate([
    (0, graphql_1.ObjectType)()
], OffboardingStats);
let HRStatistics = class HRStatistics {
};
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], HRStatistics.prototype, "totalEmployees", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], HRStatistics.prototype, "activeEmployees", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], HRStatistics.prototype, "inactiveEmployees", void 0);
__decorate([
    (0, graphql_1.Field)(() => OnboardingStats),
    __metadata("design:type", OnboardingStats)
], HRStatistics.prototype, "onboarding", void 0);
__decorate([
    (0, graphql_1.Field)(() => OffboardingStats),
    __metadata("design:type", OffboardingStats)
], HRStatistics.prototype, "offboarding", void 0);
HRStatistics = __decorate([
    (0, graphql_1.ObjectType)()
], HRStatistics);
let OnboardingListResponse = class OnboardingListResponse {
};
__decorate([
    (0, graphql_1.Field)(() => [onboarding_checklist_model_1.OnboardingChecklist]),
    __metadata("design:type", Array)
], OnboardingListResponse.prototype, "checklists", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], OnboardingListResponse.prototype, "total", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], OnboardingListResponse.prototype, "hasMore", void 0);
OnboardingListResponse = __decorate([
    (0, graphql_1.ObjectType)()
], OnboardingListResponse);
let OffboardingListResponse = class OffboardingListResponse {
};
__decorate([
    (0, graphql_1.Field)(() => [offboarding_process_model_1.OffboardingProcess]),
    __metadata("design:type", Array)
], OffboardingListResponse.prototype, "processes", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], OffboardingListResponse.prototype, "total", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], OffboardingListResponse.prototype, "hasMore", void 0);
OffboardingListResponse = __decorate([
    (0, graphql_1.ObjectType)()
], OffboardingListResponse);
let OnboardingResolver = class OnboardingResolver {
    constructor(hrService) {
        this.hrService = hrService;
    }
    async createOnboardingChecklist(input, currentUser) {
        return this.hrService.createOnboardingChecklist({
            ...input,
            createdBy: currentUser.id,
        });
    }
    async onboardingChecklist(id) {
        return this.hrService.getOnboardingChecklist(id);
    }
    async onboardingChecklistByEmployee(employeeProfileId) {
        return this.hrService.getOnboardingChecklistByEmployee(employeeProfileId);
    }
    async listOnboardingChecklists(status, skip, take) {
        return this.hrService.listOnboardingChecklists({ status, skip, take });
    }
    async updateOnboardingChecklist(id, input) {
        return this.hrService.updateOnboardingChecklist(id, input);
    }
    async completeOnboardingTask(checklistId, taskId, currentUser) {
        return this.hrService.completeOnboardingTask(checklistId, taskId, currentUser.id);
    }
};
exports.OnboardingResolver = OnboardingResolver;
__decorate([
    (0, graphql_1.Mutation)(() => onboarding_checklist_model_1.OnboardingChecklist),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [onboarding_checklist_input_1.CreateOnboardingChecklistInput, Object]),
    __metadata("design:returntype", Promise)
], OnboardingResolver.prototype, "createOnboardingChecklist", null);
__decorate([
    (0, graphql_1.Query)(() => onboarding_checklist_model_1.OnboardingChecklist),
    (0, roles_decorator_1.Roles)('ADMIN', 'USER'),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OnboardingResolver.prototype, "onboardingChecklist", null);
__decorate([
    (0, graphql_1.Query)(() => onboarding_checklist_model_1.OnboardingChecklist),
    (0, roles_decorator_1.Roles)('ADMIN', 'USER'),
    __param(0, (0, graphql_1.Args)('employeeProfileId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OnboardingResolver.prototype, "onboardingChecklistByEmployee", null);
__decorate([
    (0, graphql_1.Query)(() => OnboardingListResponse),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, graphql_1.Args)('status', { type: () => enums_model_1.OnboardingStatus, nullable: true })),
    __param(1, (0, graphql_1.Args)('skip', { type: () => graphql_1.Int, nullable: true })),
    __param(2, (0, graphql_1.Args)('take', { type: () => graphql_1.Int, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], OnboardingResolver.prototype, "listOnboardingChecklists", null);
__decorate([
    (0, graphql_1.Mutation)(() => onboarding_checklist_model_1.OnboardingChecklist),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, onboarding_checklist_input_1.UpdateOnboardingChecklistInput]),
    __metadata("design:returntype", Promise)
], OnboardingResolver.prototype, "updateOnboardingChecklist", null);
__decorate([
    (0, graphql_1.Mutation)(() => onboarding_checklist_model_1.OnboardingChecklist),
    (0, roles_decorator_1.Roles)('ADMIN', 'USER'),
    __param(0, (0, graphql_1.Args)('checklistId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('taskId', { type: () => graphql_1.ID })),
    __param(2, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], OnboardingResolver.prototype, "completeOnboardingTask", null);
exports.OnboardingResolver = OnboardingResolver = __decorate([
    (0, graphql_1.Resolver)(() => onboarding_checklist_model_1.OnboardingChecklist),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [hr_service_1.HRService])
], OnboardingResolver);
let OffboardingResolver = class OffboardingResolver {
    constructor(hrService) {
        this.hrService = hrService;
    }
    async createOffboardingProcess(input) {
        return this.hrService.createOffboardingProcess(input);
    }
    async offboardingProcess(id) {
        return this.hrService.getOffboardingProcess(id);
    }
    async listOffboardingProcesses(status, clearanceStatus, skip, take) {
        return this.hrService.listOffboardingProcesses({ status, clearanceStatus, skip, take });
    }
    async updateOffboardingProcess(id, input) {
        return this.hrService.updateOffboardingProcess(id, input);
    }
    async completeOffboarding(id, currentUser) {
        return this.hrService.completeOffboarding(id, currentUser.id);
    }
};
exports.OffboardingResolver = OffboardingResolver;
__decorate([
    (0, graphql_1.Mutation)(() => offboarding_process_model_1.OffboardingProcess),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [offboarding_process_input_1.CreateOffboardingProcessInput]),
    __metadata("design:returntype", Promise)
], OffboardingResolver.prototype, "createOffboardingProcess", null);
__decorate([
    (0, graphql_1.Query)(() => offboarding_process_model_1.OffboardingProcess),
    (0, roles_decorator_1.Roles)('ADMIN', 'USER'),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OffboardingResolver.prototype, "offboardingProcess", null);
__decorate([
    (0, graphql_1.Query)(() => OffboardingListResponse),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, graphql_1.Args)('status', { type: () => enums_model_1.OffboardingStatus, nullable: true })),
    __param(1, (0, graphql_1.Args)('clearanceStatus', { type: () => enums_model_1.ClearanceStatus, nullable: true })),
    __param(2, (0, graphql_1.Args)('skip', { type: () => graphql_1.Int, nullable: true })),
    __param(3, (0, graphql_1.Args)('take', { type: () => graphql_1.Int, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], OffboardingResolver.prototype, "listOffboardingProcesses", null);
__decorate([
    (0, graphql_1.Mutation)(() => offboarding_process_model_1.OffboardingProcess),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, offboarding_process_input_1.UpdateOffboardingProcessInput]),
    __metadata("design:returntype", Promise)
], OffboardingResolver.prototype, "updateOffboardingProcess", null);
__decorate([
    (0, graphql_1.Mutation)(() => offboarding_process_model_1.OffboardingProcess),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OffboardingResolver.prototype, "completeOffboarding", null);
exports.OffboardingResolver = OffboardingResolver = __decorate([
    (0, graphql_1.Resolver)(() => offboarding_process_model_1.OffboardingProcess),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [hr_service_1.HRService])
], OffboardingResolver);
let EmploymentHistoryResolver = class EmploymentHistoryResolver {
    constructor(hrService) {
        this.hrService = hrService;
    }
    async createEmploymentHistory(input) {
        return this.hrService.createEmploymentHistory(input);
    }
    async employmentHistory(employeeProfileId) {
        return this.hrService.getEmploymentHistory(employeeProfileId);
    }
    async updateEmploymentHistory(id, input) {
        return this.hrService.updateEmploymentHistory(id, input);
    }
};
exports.EmploymentHistoryResolver = EmploymentHistoryResolver;
__decorate([
    (0, graphql_1.Mutation)(() => employment_history_model_1.EmploymentHistory),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [employment_history_input_1.CreateEmploymentHistoryInput]),
    __metadata("design:returntype", Promise)
], EmploymentHistoryResolver.prototype, "createEmploymentHistory", null);
__decorate([
    (0, graphql_1.Query)(() => [employment_history_model_1.EmploymentHistory]),
    (0, roles_decorator_1.Roles)('ADMIN', 'USER'),
    __param(0, (0, graphql_1.Args)('employeeProfileId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmploymentHistoryResolver.prototype, "employmentHistory", null);
__decorate([
    (0, graphql_1.Mutation)(() => employment_history_model_1.EmploymentHistory),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, employment_history_input_1.UpdateEmploymentHistoryInput]),
    __metadata("design:returntype", Promise)
], EmploymentHistoryResolver.prototype, "updateEmploymentHistory", null);
exports.EmploymentHistoryResolver = EmploymentHistoryResolver = __decorate([
    (0, graphql_1.Resolver)(() => employment_history_model_1.EmploymentHistory),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [hr_service_1.HRService])
], EmploymentHistoryResolver);
let HRStatisticsResolver = class HRStatisticsResolver {
    constructor(hrService) {
        this.hrService = hrService;
    }
    async hrStatistics() {
        return this.hrService.getHRStatistics();
    }
};
exports.HRStatisticsResolver = HRStatisticsResolver;
__decorate([
    (0, graphql_1.Query)(() => HRStatistics),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HRStatisticsResolver.prototype, "hrStatistics", null);
exports.HRStatisticsResolver = HRStatisticsResolver = __decorate([
    (0, graphql_1.Resolver)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [hr_service_1.HRService])
], HRStatisticsResolver);
//# sourceMappingURL=hr.resolver.js.map