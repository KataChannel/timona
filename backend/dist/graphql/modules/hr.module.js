"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HRModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const hr_service_1 = require("../../services/hr.service");
const user_service_1 = require("../../services/user.service");
const auth_module_1 = require("../../auth/auth.module");
const hr_1 = require("../resolvers/hr");
let HRModule = class HRModule {
};
exports.HRModule = HRModule;
exports.HRModule = HRModule = __decorate([
    (0, common_1.Module)({
        imports: [auth_module_1.AuthModule],
        providers: [
            prisma_service_1.PrismaService,
            hr_service_1.HRService,
            user_service_1.UserService,
            hr_1.EmployeeProfileResolver,
            hr_1.OnboardingResolver,
            hr_1.OffboardingResolver,
            hr_1.EmploymentHistoryResolver,
            hr_1.HRStatisticsResolver,
        ],
        exports: [hr_service_1.HRService],
    })
], HRModule);
//# sourceMappingURL=hr.module.js.map