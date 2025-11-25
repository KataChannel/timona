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
exports.SupportAnalyticsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const support_analytics_service_1 = require("../services/support-analytics.service");
const support_analytics_entity_1 = require("../entities/support-analytics.entity");
let SupportAnalyticsResolver = class SupportAnalyticsResolver {
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
    }
    async getSupportAnalytics() {
        return this.analyticsService.getAnalytics();
    }
};
exports.SupportAnalyticsResolver = SupportAnalyticsResolver;
__decorate([
    (0, graphql_1.Query)(() => support_analytics_entity_1.SupportAnalytics, { name: 'supportAnalytics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SupportAnalyticsResolver.prototype, "getSupportAnalytics", null);
exports.SupportAnalyticsResolver = SupportAnalyticsResolver = __decorate([
    (0, graphql_1.Resolver)(() => support_analytics_entity_1.SupportAnalytics),
    __metadata("design:paramtypes", [support_analytics_service_1.SupportAnalyticsService])
], SupportAnalyticsResolver);
//# sourceMappingURL=support-analytics.resolver.js.map