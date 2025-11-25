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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphQLCachePlugin = void 0;
const apollo_1 = require("@nestjs/apollo");
const common_1 = require("@nestjs/common");
const graphql_cache_service_1 = require("../services/graphql-cache.service");
let GraphQLCachePlugin = class GraphQLCachePlugin {
    constructor(cacheService) {
        this.cacheService = cacheService;
    }
    async requestDidStart() {
        const cacheService = this.cacheService;
        return {
            async didResolveOperation(requestContext) {
                const { request } = requestContext;
                if (!request.query || !cacheService.shouldCacheQuery(request.query)) {
                    return;
                }
                const userId = requestContext.contextValue?.req?.user?.id || 'anonymous';
                const cacheKey = cacheService.generateCacheKey(request.query, request.variables, request.operationName, userId);
                const cachedResult = await cacheService.getCachedResult(cacheKey);
                if (cachedResult) {
                    requestContext.response.body = {
                        kind: 'single',
                        singleResult: cachedResult
                    };
                    return;
                }
                requestContext.request.extensions = requestContext.request.extensions || {};
                requestContext.request.extensions.cacheKey = cacheKey;
            },
            async willSendResponse(requestContext) {
                const cacheKey = requestContext.request.extensions?.cacheKey;
                if (!cacheKey) {
                    return;
                }
                const response = requestContext.response;
                if (response.body?.kind === 'single' && response.body.singleResult) {
                    const result = response.body.singleResult;
                    if (result && !result.errors) {
                        const ttl = cacheService.getTTLForQuery(requestContext.request.query || '');
                        await cacheService.setCachedResult(cacheKey, result, ttl);
                    }
                }
            },
            async didEncounterErrors(requestContext) {
                const errors = requestContext.errors;
                if (errors && errors.length > 0) {
                    console.warn('GraphQL execution errors:', {
                        operationName: requestContext.request.operationName,
                        errors: errors.map(e => ({
                            message: e.message,
                            path: e.path,
                            locations: e.locations
                        }))
                    });
                }
            }
        };
    }
};
exports.GraphQLCachePlugin = GraphQLCachePlugin;
exports.GraphQLCachePlugin = GraphQLCachePlugin = __decorate([
    (0, common_1.Injectable)(),
    (0, apollo_1.Plugin)(),
    __metadata("design:paramtypes", [graphql_cache_service_1.GraphQLCacheService])
], GraphQLCachePlugin);
//# sourceMappingURL=graphql-cache.plugin.js.map