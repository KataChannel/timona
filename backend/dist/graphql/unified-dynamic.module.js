"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupportedModel = exports.DynamicCRUDService = exports.UnifiedDynamicResolver = exports.UnifiedDynamicModule = void 0;
exports.isSupportedModel = isSupportedModel;
exports.getSupportedModels = getSupportedModels;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const unified_dynamic_resolver_1 = require("./resolvers/unified-dynamic.resolver");
const dynamic_crud_service_1 = require("../services/dynamic-crud.service");
const prisma_service_1 = require("../prisma/prisma.service");
const user_service_1 = require("../services/user.service");
const auth_module_1 = require("../auth/auth.module");
let UnifiedDynamicModule = class UnifiedDynamicModule {
};
exports.UnifiedDynamicModule = UnifiedDynamicModule;
exports.UnifiedDynamicModule = UnifiedDynamicModule = __decorate([
    (0, common_1.Module)({
        imports: [
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET || 'your-secret-key',
                signOptions: { expiresIn: '24h' },
            }),
            auth_module_1.AuthModule,
        ],
        providers: [
            unified_dynamic_resolver_1.UnifiedDynamicResolver,
            dynamic_crud_service_1.DynamicCRUDService,
            prisma_service_1.PrismaService,
            user_service_1.UserService
        ],
        exports: [
            unified_dynamic_resolver_1.UnifiedDynamicResolver,
            dynamic_crud_service_1.DynamicCRUDService
        ]
    })
], UnifiedDynamicModule);
var unified_dynamic_resolver_2 = require("./resolvers/unified-dynamic.resolver");
Object.defineProperty(exports, "UnifiedDynamicResolver", { enumerable: true, get: function () { return unified_dynamic_resolver_2.UnifiedDynamicResolver; } });
var dynamic_crud_service_2 = require("../services/dynamic-crud.service");
Object.defineProperty(exports, "DynamicCRUDService", { enumerable: true, get: function () { return dynamic_crud_service_2.DynamicCRUDService; } });
__exportStar(require("./inputs/unified-dynamic.inputs"), exports);
var SupportedModel;
(function (SupportedModel) {
    SupportedModel["User"] = "user";
    SupportedModel["Task"] = "task";
    SupportedModel["Post"] = "post";
    SupportedModel["Comment"] = "comment";
    SupportedModel["Page"] = "page";
    SupportedModel["PageBlock"] = "pageBlock";
    SupportedModel["TaskComment"] = "taskComment";
    SupportedModel["Notification"] = "notification";
    SupportedModel["AuditLog"] = "auditLog";
    SupportedModel["Role"] = "role";
    SupportedModel["Permission"] = "permission";
})(SupportedModel || (exports.SupportedModel = SupportedModel = {}));
function isSupportedModel(modelName) {
    return Object.values(SupportedModel).includes(modelName);
}
function getSupportedModels() {
    return Object.values(SupportedModel);
}
//# sourceMappingURL=unified-dynamic.module.js.map