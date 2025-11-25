"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallCenterModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../prisma/prisma.module");
const auth_module_1 = require("../auth/auth.module");
const callcenter_service_1 = require("../services/callcenter.service");
const callcenter_resolver_1 = require("../graphql/resolvers/callcenter.resolver");
const user_service_1 = require("../services/user.service");
let CallCenterModule = class CallCenterModule {
};
exports.CallCenterModule = CallCenterModule;
exports.CallCenterModule = CallCenterModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
        ],
        providers: [callcenter_service_1.CallCenterService, callcenter_resolver_1.CallCenterResolver, user_service_1.UserService],
        exports: [callcenter_service_1.CallCenterService],
    })
], CallCenterModule);
//# sourceMappingURL=callcenter.module.js.map