"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReleaseHubModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const auth_module_1 = require("../auth/auth.module");
const prisma_module_1 = require("../prisma/prisma.module");
const ecommerce_module_1 = require("../ecommerce/ecommerce.module");
const user_module_1 = require("../user/user.module");
const system_release_service_1 = require("./services/system-release.service");
const technical_support_service_1 = require("./services/technical-support.service");
const system_guide_service_1 = require("./services/system-guide.service");
const system_release_resolver_1 = require("./resolvers/system-release.resolver");
const technical_support_resolver_1 = require("./resolvers/technical-support.resolver");
const system_guide_resolver_1 = require("./resolvers/system-guide.resolver");
let ReleaseHubModule = class ReleaseHubModule {
};
exports.ReleaseHubModule = ReleaseHubModule;
exports.ReleaseHubModule = ReleaseHubModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            prisma_module_1.PrismaModule,
            ecommerce_module_1.EcommerceModule,
            user_module_1.UserModule,
            auth_module_1.AuthModule,
        ],
        providers: [
            system_release_service_1.SystemReleaseService,
            technical_support_service_1.TechnicalSupportService,
            system_guide_service_1.SystemGuideService,
            system_release_resolver_1.SystemReleaseResolver,
            technical_support_resolver_1.TechnicalSupportResolver,
            system_guide_resolver_1.SystemGuideResolver,
        ],
        exports: [system_release_service_1.SystemReleaseService, technical_support_service_1.TechnicalSupportService, system_guide_service_1.SystemGuideService],
    })
], ReleaseHubModule);
//# sourceMappingURL=release-hub.module.js.map