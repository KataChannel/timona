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
exports.CallCenterResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const callcenter_model_1 = require("../models/callcenter.model");
const callcenter_input_1 = require("../inputs/callcenter.input");
const pagination_model_1 = require("../models/pagination.model");
const callcenter_service_1 = require("../../services/callcenter.service");
let CallCenterResolver = class CallCenterResolver {
    constructor(callCenterService) {
        this.callCenterService = callCenterService;
    }
    async getConfig() {
        return this.callCenterService.getConfig();
    }
    async createConfig(input) {
        return this.callCenterService.createConfig(input);
    }
    async updateConfig(id, input) {
        return this.callCenterService.updateConfig(id, input);
    }
    async deleteConfig(id) {
        return this.callCenterService.deleteConfig(id);
    }
    async syncData(input) {
        return this.callCenterService.syncCallCenterData(input);
    }
    async getRecords(pagination, filters) {
        return this.callCenterService.getRecords(pagination, filters);
    }
    async getRecordById(id) {
        return this.callCenterService.getRecordById(id);
    }
    async getSyncLogs(pagination) {
        const result = await this.callCenterService.getSyncLogs(pagination);
        return result.items;
    }
};
exports.CallCenterResolver = CallCenterResolver;
__decorate([
    (0, graphql_1.Query)(() => callcenter_model_1.CallCenterConfig, { name: 'getCallCenterConfig' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CallCenterResolver.prototype, "getConfig", null);
__decorate([
    (0, graphql_1.Mutation)(() => callcenter_model_1.CallCenterConfig, { name: 'createCallCenterConfig' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [callcenter_input_1.CreateCallCenterConfigInput]),
    __metadata("design:returntype", Promise)
], CallCenterResolver.prototype, "createConfig", null);
__decorate([
    (0, graphql_1.Mutation)(() => callcenter_model_1.CallCenterConfig, { name: 'updateCallCenterConfig' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, callcenter_input_1.UpdateCallCenterConfigInput]),
    __metadata("design:returntype", Promise)
], CallCenterResolver.prototype, "updateConfig", null);
__decorate([
    (0, graphql_1.Mutation)(() => callcenter_model_1.CallCenterConfig, { name: 'deleteCallCenterConfig' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CallCenterResolver.prototype, "deleteConfig", null);
__decorate([
    (0, graphql_1.Mutation)(() => callcenter_model_1.SyncCallCenterResponse, { name: 'syncCallCenterData' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('input', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [callcenter_input_1.SyncCallCenterInput]),
    __metadata("design:returntype", Promise)
], CallCenterResolver.prototype, "syncData", null);
__decorate([
    (0, graphql_1.Query)(() => callcenter_model_1.PaginatedCallCenterRecords, { name: 'getCallCenterRecords' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('pagination', { defaultValue: { page: 1, limit: 20 } })),
    __param(1, (0, graphql_1.Args)('filters', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_model_1.PaginationInput,
        callcenter_input_1.CallCenterRecordFiltersInput]),
    __metadata("design:returntype", Promise)
], CallCenterResolver.prototype, "getRecords", null);
__decorate([
    (0, graphql_1.Query)(() => callcenter_model_1.CallCenterRecord, { name: 'getCallCenterRecordById' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CallCenterResolver.prototype, "getRecordById", null);
__decorate([
    (0, graphql_1.Query)(() => [callcenter_model_1.CallCenterSyncLog], { name: 'getCallCenterSyncLogs' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('pagination', { defaultValue: { page: 1, limit: 20 } })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_model_1.PaginationInput]),
    __metadata("design:returntype", Promise)
], CallCenterResolver.prototype, "getSyncLogs", null);
exports.CallCenterResolver = CallCenterResolver = __decorate([
    (0, graphql_1.Resolver)(() => callcenter_model_1.CallCenterRecord),
    __metadata("design:paramtypes", [callcenter_service_1.CallCenterService])
], CallCenterResolver);
//# sourceMappingURL=callcenter.resolver.js.map