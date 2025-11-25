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
var DynamicGraphQLModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamicGraphQLModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const dynamic_crud_service_1 = require("../services/dynamic-crud.service");
const dynamic_resolver_1 = require("./resolvers/dynamic.resolver");
const prisma_service_1 = require("../prisma/prisma.service");
const dynamic_inputs_1 = require("./inputs/dynamic.inputs");
let DynamicGraphQLModule = DynamicGraphQLModule_1 = class DynamicGraphQLModule {
    constructor() {
        (0, dynamic_inputs_1.setupCommonInputTypes)();
    }
    static forModels(models) {
        return {
            module: DynamicGraphQLModule_1,
            providers: [
                prisma_service_1.PrismaService,
                dynamic_crud_service_1.DynamicCRUDService,
                dynamic_resolver_1.DynamicResolverService,
                dynamic_resolver_1.UniversalDynamicResolver,
                ...models.map(({ name, modelClass, options }) => ({
                    provide: `DYNAMIC_RESOLVER_${name.toUpperCase()}`,
                    useFactory: (prismaService) => {
                        const resolverService = new dynamic_resolver_1.DynamicResolverService(new dynamic_crud_service_1.DynamicCRUDService(prismaService));
                        return resolverService.registerResolver(name, modelClass, options);
                    },
                    inject: [prisma_service_1.PrismaService],
                }))
            ],
            exports: [
                dynamic_crud_service_1.DynamicCRUDService,
                dynamic_resolver_1.DynamicResolverService,
                dynamic_resolver_1.UniversalDynamicResolver
            ]
        };
    }
};
exports.DynamicGraphQLModule = DynamicGraphQLModule;
exports.DynamicGraphQLModule = DynamicGraphQLModule = DynamicGraphQLModule_1 = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [config_1.ConfigModule],
        providers: [
            prisma_service_1.PrismaService,
            dynamic_crud_service_1.DynamicCRUDService,
            dynamic_resolver_1.DynamicResolverService,
            dynamic_resolver_1.UniversalDynamicResolver
        ],
        exports: [
            dynamic_crud_service_1.DynamicCRUDService,
            dynamic_resolver_1.DynamicResolverService,
            dynamic_resolver_1.UniversalDynamicResolver
        ]
    }),
    __metadata("design:paramtypes", [])
], DynamicGraphQLModule);
//# sourceMappingURL=dynamic-graphql.module.js.map