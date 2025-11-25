"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamicGraphQLModule = void 0;
const common_1 = require("@nestjs/common");
const dynamic_graphql_engine_1 = require("./core/dynamic-graphql.engine");
const universal_dynamic_resolver_1 = require("./resolvers/universal-dynamic.resolver");
const prisma_module_1 = require("../prisma/prisma.module");
const auth_module_1 = require("../auth/auth.module");
let DynamicGraphQLModule = class DynamicGraphQLModule {
};
exports.DynamicGraphQLModule = DynamicGraphQLModule;
exports.DynamicGraphQLModule = DynamicGraphQLModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, auth_module_1.AuthModule],
        providers: [
            dynamic_graphql_engine_1.DynamicGraphQLEngine,
            universal_dynamic_resolver_1.UniversalDynamicResolver,
        ],
        exports: [
            dynamic_graphql_engine_1.DynamicGraphQLEngine,
            universal_dynamic_resolver_1.UniversalDynamicResolver,
        ],
    })
], DynamicGraphQLModule);
//# sourceMappingURL=dynamic-graphql.module.v2.js.map