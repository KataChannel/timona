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
exports.OramaSearchResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const orama_service_1 = require("../../search/orama.service");
const orama_search_model_1 = require("../models/orama-search.model");
let OramaSearchResolver = class OramaSearchResolver {
    constructor(oramaService) {
        this.oramaService = oramaService;
    }
    async searchTasks(input, context) {
        const user = context.req.user;
        const query = {
            ...input,
            where: {
                ...input.where,
            },
        };
        return this.oramaService.searchTasks(query);
    }
    async searchUsers(input, context) {
        return this.oramaService.searchUsers(input);
    }
    async searchProjects(input, context) {
        return this.oramaService.searchProjects(input);
    }
    async searchAffiliateCampaigns(input, context) {
        return this.oramaService.searchAffiliateCampaigns(input);
    }
    async searchAffiliateLinks(input, context) {
        return this.oramaService.searchAffiliateLinks(input);
    }
    async universalSearch(input, context) {
        return this.oramaService.searchAll(input);
    }
    async oramaHealthCheck() {
        return this.oramaService.healthCheck();
    }
    async reindexAllData(context) {
        const user = context.req.user;
        try {
            await this.oramaService.reindexAll();
            return {
                success: true,
                message: 'Successfully reindexed all data',
            };
        }
        catch (error) {
            return {
                success: false,
                message: `Reindex failed: ${error.message}`,
            };
        }
    }
};
exports.OramaSearchResolver = OramaSearchResolver;
__decorate([
    (0, graphql_1.Query)(() => orama_search_model_1.OramaSearchResult, {
        description: 'Search tasks using Orama full-text search engine',
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [orama_search_model_1.OramaSearchInput, Object]),
    __metadata("design:returntype", Promise)
], OramaSearchResolver.prototype, "searchTasks", null);
__decorate([
    (0, graphql_1.Query)(() => orama_search_model_1.OramaSearchResult, {
        description: 'Search users using Orama full-text search engine',
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [orama_search_model_1.OramaSearchInput, Object]),
    __metadata("design:returntype", Promise)
], OramaSearchResolver.prototype, "searchUsers", null);
__decorate([
    (0, graphql_1.Query)(() => orama_search_model_1.OramaSearchResult, {
        description: 'Search projects using Orama full-text search engine',
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [orama_search_model_1.OramaSearchInput, Object]),
    __metadata("design:returntype", Promise)
], OramaSearchResolver.prototype, "searchProjects", null);
__decorate([
    (0, graphql_1.Query)(() => orama_search_model_1.OramaSearchResult, {
        description: 'Search affiliate campaigns using Orama full-text search engine',
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [orama_search_model_1.OramaSearchInput, Object]),
    __metadata("design:returntype", Promise)
], OramaSearchResolver.prototype, "searchAffiliateCampaigns", null);
__decorate([
    (0, graphql_1.Query)(() => orama_search_model_1.OramaSearchResult, {
        description: 'Search affiliate links using Orama full-text search engine',
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [orama_search_model_1.OramaSearchInput, Object]),
    __metadata("design:returntype", Promise)
], OramaSearchResolver.prototype, "searchAffiliateLinks", null);
__decorate([
    (0, graphql_1.Query)(() => orama_search_model_1.UniversalSearchResult, {
        description: 'Search across all entity types (tasks, users, projects, affiliate campaigns, affiliate links)',
    }),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [orama_search_model_1.OramaSearchInput, Object]),
    __metadata("design:returntype", Promise)
], OramaSearchResolver.prototype, "universalSearch", null);
__decorate([
    (0, graphql_1.Query)(() => orama_search_model_1.OramaHealthCheck, {
        description: 'Check Orama search engine health status',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OramaSearchResolver.prototype, "oramaHealthCheck", null);
__decorate([
    (0, graphql_1.Mutation)(() => orama_search_model_1.ReindexResult, {
        description: 'Reindex all data from database into Orama search indexes',
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OramaSearchResolver.prototype, "reindexAllData", null);
exports.OramaSearchResolver = OramaSearchResolver = __decorate([
    (0, graphql_1.Resolver)(),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: false,
    })),
    __metadata("design:paramtypes", [orama_service_1.OramaService])
], OramaSearchResolver);
//# sourceMappingURL=orama-search.resolver.js.map