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
exports.EmployeeProfileResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../../auth/jwt-auth.guard");
const roles_guard_1 = require("../../../auth/roles.guard");
const roles_decorator_1 = require("../../../auth/roles.decorator");
const hr_service_1 = require("../../../services/hr.service");
const employee_profile_model_1 = require("../../models/hr/employee-profile.model");
const employee_profile_input_1 = require("../../inputs/hr/employee-profile.input");
const get_user_decorator_1 = require("../../../auth/get-user.decorator");
let EmployeeProfileResolver = class EmployeeProfileResolver {
    constructor(hrService) {
        this.hrService = hrService;
    }
    async createEmployeeProfile(input, currentUser) {
        return this.hrService.createEmployeeProfile(input);
    }
    async employeeProfile(id) {
        return this.hrService.getEmployeeProfile(id);
    }
    async employeeProfileByUserId(userId) {
        return this.hrService.getEmployeeProfileByUserId(userId);
    }
    async employeeProfileByCode(employeeCode) {
        return this.hrService.getEmployeeProfileByCode(employeeCode);
    }
    async listEmployeeProfiles(department, position, isActive, skip, take) {
        return this.hrService.listEmployeeProfiles({
            department,
            position,
            isActive,
            skip,
            take,
        });
    }
    async updateEmployeeProfile(id, input, currentUser) {
        return this.hrService.updateEmployeeProfile(id, input);
    }
    async deleteEmployeeProfile(id) {
        return this.hrService.deleteEmployeeProfile(id);
    }
};
exports.EmployeeProfileResolver = EmployeeProfileResolver;
__decorate([
    (0, graphql_1.Mutation)(() => employee_profile_model_1.EmployeeProfile),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [employee_profile_input_1.CreateEmployeeProfileInput, Object]),
    __metadata("design:returntype", Promise)
], EmployeeProfileResolver.prototype, "createEmployeeProfile", null);
__decorate([
    (0, graphql_1.Query)(() => employee_profile_model_1.EmployeeProfile),
    (0, roles_decorator_1.Roles)('ADMIN', 'USER'),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmployeeProfileResolver.prototype, "employeeProfile", null);
__decorate([
    (0, graphql_1.Query)(() => employee_profile_model_1.EmployeeProfile),
    (0, roles_decorator_1.Roles)('ADMIN', 'USER'),
    __param(0, (0, graphql_1.Args)('userId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmployeeProfileResolver.prototype, "employeeProfileByUserId", null);
__decorate([
    (0, graphql_1.Query)(() => employee_profile_model_1.EmployeeProfile),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, graphql_1.Args)('employeeCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmployeeProfileResolver.prototype, "employeeProfileByCode", null);
__decorate([
    (0, graphql_1.Query)(() => EmployeeListResponse),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, graphql_1.Args)('department', { nullable: true })),
    __param(1, (0, graphql_1.Args)('position', { nullable: true })),
    __param(2, (0, graphql_1.Args)('isActive', { nullable: true })),
    __param(3, (0, graphql_1.Args)('skip', { nullable: true })),
    __param(4, (0, graphql_1.Args)('take', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Boolean, Number, Number]),
    __metadata("design:returntype", Promise)
], EmployeeProfileResolver.prototype, "listEmployeeProfiles", null);
__decorate([
    (0, graphql_1.Mutation)(() => employee_profile_model_1.EmployeeProfile),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('input')),
    __param(2, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, employee_profile_input_1.UpdateEmployeeProfileInput, Object]),
    __metadata("design:returntype", Promise)
], EmployeeProfileResolver.prototype, "updateEmployeeProfile", null);
__decorate([
    (0, graphql_1.Mutation)(() => DeleteResponse),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmployeeProfileResolver.prototype, "deleteEmployeeProfile", null);
exports.EmployeeProfileResolver = EmployeeProfileResolver = __decorate([
    (0, graphql_1.Resolver)(() => employee_profile_model_1.EmployeeProfile),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [hr_service_1.HRService])
], EmployeeProfileResolver);
const graphql_2 = require("@nestjs/graphql");
let EmployeeListResponse = class EmployeeListResponse {
};
__decorate([
    (0, graphql_2.Field)(() => [employee_profile_model_1.EmployeeProfile]),
    __metadata("design:type", Array)
], EmployeeListResponse.prototype, "employees", void 0);
__decorate([
    (0, graphql_2.Field)(() => graphql_2.Int),
    __metadata("design:type", Number)
], EmployeeListResponse.prototype, "total", void 0);
__decorate([
    (0, graphql_2.Field)(),
    __metadata("design:type", Boolean)
], EmployeeListResponse.prototype, "hasMore", void 0);
EmployeeListResponse = __decorate([
    (0, graphql_2.ObjectType)()
], EmployeeListResponse);
let DeleteResponse = class DeleteResponse {
};
__decorate([
    (0, graphql_2.Field)(),
    __metadata("design:type", Boolean)
], DeleteResponse.prototype, "success", void 0);
__decorate([
    (0, graphql_2.Field)(),
    __metadata("design:type", String)
], DeleteResponse.prototype, "message", void 0);
DeleteResponse = __decorate([
    (0, graphql_2.ObjectType)()
], DeleteResponse);
//# sourceMappingURL=employee-profile.resolver.js.map