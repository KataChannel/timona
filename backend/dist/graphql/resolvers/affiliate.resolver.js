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
exports.AffiliateConversionResolver = exports.AffiliatePaymentResolver = exports.AffiliateTrackingResolver = exports.AffiliateCampaignResolver = exports.AffiliateUserResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const roles_guard_1 = require("../../auth/roles.guard");
const roles_decorator_1 = require("../../auth/roles.decorator");
const affiliate_model_1 = require("../models/affiliate.model");
const client_1 = require("@prisma/client");
const affiliate_input_1 = require("../inputs/affiliate.input");
const affiliate_service_1 = require("../../services/affiliate.service");
const affiliate_tracking_service_1 = require("../../services/affiliate-tracking.service");
const affiliate_payment_service_1 = require("../../services/affiliate-payment.service");
const affiliate_conversion_service_1 = require("../../services/affiliate-conversion.service");
const mapDecimalFields = (data) => {
    if (!data)
        return data;
    const mapped = { ...data };
    if (mapped.commissionRate)
        mapped.commissionRate = Number(mapped.commissionRate);
    if (mapped.fixedAmount)
        mapped.fixedAmount = Number(mapped.fixedAmount);
    if (mapped.totalRevenue)
        mapped.totalRevenue = Number(mapped.totalRevenue);
    if (mapped.totalCommission)
        mapped.totalCommission = Number(mapped.totalCommission);
    if (mapped.totalEarnings)
        mapped.totalEarnings = Number(mapped.totalEarnings);
    if (mapped.saleAmount)
        mapped.saleAmount = Number(mapped.saleAmount);
    if (mapped.commission)
        mapped.commission = Number(mapped.commission);
    if (mapped.amount)
        mapped.amount = Number(mapped.amount);
    if (data.totalClicks !== undefined && data.totalConversions !== undefined) {
        mapped.conversionRate = data.totalClicks > 0
            ? Number(((data.totalConversions / data.totalClicks) * 100).toFixed(2))
            : 0;
        mapped.averageOrderValue = data.totalConversions > 0
            ? Number((Number(data.totalRevenue || 0) / data.totalConversions).toFixed(2))
            : 0;
    }
    if (mapped.type === undefined)
        mapped.type = 'standard';
    if (mapped.cookieDuration === undefined)
        mapped.cookieDuration = 30;
    if (mapped.minPayoutAmount === undefined)
        mapped.minPayoutAmount = 50;
    if (mapped.categories === undefined)
        mapped.categories = [];
    if (mapped.targetCountries === undefined)
        mapped.targetCountries = [];
    return mapped;
};
let AffiliateUserResolver = class AffiliateUserResolver {
    constructor(affiliateUserService) {
        this.affiliateUserService = affiliateUserService;
    }
    async createAffiliateUser(input, context) {
        const userId = context.req.user.id;
        const result = await this.affiliateUserService.createAffiliateUser(userId, input);
        return mapDecimalFields(result);
    }
    async getAffiliateUser(context) {
        const userId = context.req.user.id;
        const result = await this.affiliateUserService.getAffiliateUser(userId);
        return result ? mapDecimalFields(result) : null;
    }
    async updateAffiliateUser(input, context) {
        const userId = context.req.user.id;
        const result = await this.affiliateUserService.updateAffiliateUser(userId, input);
        return mapDecimalFields(result);
    }
};
exports.AffiliateUserResolver = AffiliateUserResolver;
__decorate([
    (0, graphql_1.Mutation)(() => affiliate_model_1.AffUser, { name: 'createAffiliateUser' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [affiliate_input_1.CreateAffUserInput, Object]),
    __metadata("design:returntype", Promise)
], AffiliateUserResolver.prototype, "createAffiliateUser", null);
__decorate([
    (0, graphql_1.Query)(() => affiliate_model_1.AffUser, { name: 'affiliateUser', nullable: true }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AffiliateUserResolver.prototype, "getAffiliateUser", null);
__decorate([
    (0, graphql_1.Mutation)(() => affiliate_model_1.AffUser, { name: 'updateAffiliateUser' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [affiliate_input_1.UpdateAffUserInput, Object]),
    __metadata("design:returntype", Promise)
], AffiliateUserResolver.prototype, "updateAffiliateUser", null);
exports.AffiliateUserResolver = AffiliateUserResolver = __decorate([
    (0, graphql_1.Resolver)(() => affiliate_model_1.AffUser),
    __metadata("design:paramtypes", [affiliate_service_1.AffiliateUserService])
], AffiliateUserResolver);
let AffiliateCampaignResolver = class AffiliateCampaignResolver {
    constructor(campaignService) {
        this.campaignService = campaignService;
    }
    async createCampaign(input, context) {
        const userId = context.req.user.id;
        const result = await this.campaignService.createCampaign(userId, input);
        return mapDecimalFields(result);
    }
    async getCampaigns(search) {
        const searchInput = search || { page: 1, size: 20 };
        const results = await this.campaignService.searchCampaigns(searchInput);
        return results.campaigns.map(mapDecimalFields);
    }
    async getCampaign(id) {
        const result = await this.campaignService.getCampaign(id);
        return result ? mapDecimalFields(result) : null;
    }
    async updateCampaign(id, input, context) {
        const userId = context.req.user.id;
        const result = await this.campaignService.updateCampaign(id, userId, input);
        return mapDecimalFields(result);
    }
    async deleteCampaign(id, context) {
        const userId = context.req.user.id;
        await this.campaignService.deleteCampaign(id, userId);
        return true;
    }
    async joinCampaign(input, context) {
        const userId = context.req.user.id;
        const result = await this.campaignService.joinCampaign(userId, input);
        return mapDecimalFields(result);
    }
    async reviewApplication(input, context) {
        const userId = context.req.user.id;
        const result = await this.campaignService.reviewCampaignApplication(userId, input);
        return mapDecimalFields(result);
    }
};
exports.AffiliateCampaignResolver = AffiliateCampaignResolver;
__decorate([
    (0, graphql_1.Mutation)(() => affiliate_model_1.AffCampaign, { name: 'createAffiliateCampaign' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRoleType.USER, client_1.$Enums.UserRoleType.ADMIN),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [affiliate_input_1.CreateCampaignInput, Object]),
    __metadata("design:returntype", Promise)
], AffiliateCampaignResolver.prototype, "createCampaign", null);
__decorate([
    (0, graphql_1.Query)(() => [affiliate_model_1.AffCampaign], { name: 'affiliateCampaigns' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('search', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [affiliate_input_1.CampaignSearchInput]),
    __metadata("design:returntype", Promise)
], AffiliateCampaignResolver.prototype, "getCampaigns", null);
__decorate([
    (0, graphql_1.Query)(() => affiliate_model_1.AffCampaign, { name: 'affiliateCampaign', nullable: true }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AffiliateCampaignResolver.prototype, "getCampaign", null);
__decorate([
    (0, graphql_1.Mutation)(() => affiliate_model_1.AffCampaign, { name: 'updateAffiliateCampaign' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRoleType.USER, client_1.$Enums.UserRoleType.ADMIN),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('input')),
    __param(2, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, affiliate_input_1.UpdateCampaignInput, Object]),
    __metadata("design:returntype", Promise)
], AffiliateCampaignResolver.prototype, "updateCampaign", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean, { name: 'deleteAffiliateCampaign' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRoleType.USER, client_1.$Enums.UserRoleType.ADMIN),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AffiliateCampaignResolver.prototype, "deleteCampaign", null);
__decorate([
    (0, graphql_1.Mutation)(() => String, { name: 'joinCampaign' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [affiliate_input_1.JoinCampaignInput, Object]),
    __metadata("design:returntype", Promise)
], AffiliateCampaignResolver.prototype, "joinCampaign", null);
__decorate([
    (0, graphql_1.Mutation)(() => String, { name: 'reviewCampaignApplication' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRoleType.USER, client_1.$Enums.UserRoleType.ADMIN),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [affiliate_input_1.ReviewCampaignApplicationInput, Object]),
    __metadata("design:returntype", Promise)
], AffiliateCampaignResolver.prototype, "reviewApplication", null);
exports.AffiliateCampaignResolver = AffiliateCampaignResolver = __decorate([
    (0, graphql_1.Resolver)(() => affiliate_model_1.AffCampaign),
    __metadata("design:paramtypes", [affiliate_service_1.AffiliateCampaignService])
], AffiliateCampaignResolver);
let AffiliateTrackingResolver = class AffiliateTrackingResolver {
    constructor(trackingService) {
        this.trackingService = trackingService;
    }
    async createLink(input, context) {
        const userId = context.req.user.id;
        const result = await this.trackingService.createAffiliateLink(userId, input);
        return mapDecimalFields(result);
    }
    async getLinks(search, context) {
        const userId = context?.req?.user?.id;
        const results = await this.trackingService.getAffiliateLinks(userId, search);
        return results.links.map(mapDecimalFields);
    }
    async getConversions(search, context) {
        const userId = context?.req?.user?.id;
        const results = await this.trackingService.getConversions(search, undefined, userId);
        return {
            conversions: results.conversions.map(mapDecimalFields),
            total: results.total,
            page: results.page,
            size: results.size,
            totalPages: results.totalPages
        };
    }
};
exports.AffiliateTrackingResolver = AffiliateTrackingResolver;
__decorate([
    (0, graphql_1.Mutation)(() => affiliate_model_1.AffLink, { name: 'createAffiliateLink' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [affiliate_input_1.CreateAffLinkInput, Object]),
    __metadata("design:returntype", Promise)
], AffiliateTrackingResolver.prototype, "createLink", null);
__decorate([
    (0, graphql_1.Query)(() => [affiliate_model_1.AffLink], { name: 'affiliateLinks' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('search', { nullable: true })),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [affiliate_input_1.AffLinkSearchInput, Object]),
    __metadata("design:returntype", Promise)
], AffiliateTrackingResolver.prototype, "getLinks", null);
__decorate([
    (0, graphql_1.Query)(() => affiliate_model_1.AffConversionsResponse, { name: 'affiliateConversions' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('search', { nullable: true })),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [affiliate_input_1.AffConversionSearchInput, Object]),
    __metadata("design:returntype", Promise)
], AffiliateTrackingResolver.prototype, "getConversions", null);
exports.AffiliateTrackingResolver = AffiliateTrackingResolver = __decorate([
    (0, graphql_1.Resolver)(() => affiliate_model_1.AffLink),
    __metadata("design:paramtypes", [affiliate_tracking_service_1.AffiliateTrackingService])
], AffiliateTrackingResolver);
let AffiliatePaymentResolver = class AffiliatePaymentResolver {
    constructor(paymentService) {
        this.paymentService = paymentService;
    }
    async createPaymentRequest(input, context) {
        const userId = context.req.user.id;
        const result = await this.paymentService.createPaymentRequest(userId, input);
        return mapDecimalFields(result);
    }
    async getPaymentRequests(search, context) {
        const userId = context?.req?.user?.id;
        const results = await this.paymentService.getPaymentRequests(search, undefined, userId);
        return results.requests.map(mapDecimalFields);
    }
    async getEarningsReport(startDate, endDate, context) {
        const userId = context?.req?.user?.id;
        const dateRange = startDate && endDate ? { startDate, endDate } : undefined;
        const result = await this.paymentService.getAffiliateEarnings(userId, dateRange);
        return mapDecimalFields(result);
    }
    async processPaymentRequest(id, status, context) {
        const adminId = context.req.user.id;
        const result = await this.paymentService.processPaymentRequest(adminId, { paymentRequestId: id, status: status });
        return mapDecimalFields(result);
    }
};
exports.AffiliatePaymentResolver = AffiliatePaymentResolver;
__decorate([
    (0, graphql_1.Mutation)(() => affiliate_model_1.AffPaymentRequest, { name: 'createPaymentRequest' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [affiliate_input_1.CreatePaymentRequestInput, Object]),
    __metadata("design:returntype", Promise)
], AffiliatePaymentResolver.prototype, "createPaymentRequest", null);
__decorate([
    (0, graphql_1.Query)(() => [affiliate_model_1.AffPaymentRequest], { name: 'affiliatePaymentRequests' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('search', { nullable: true })),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [affiliate_input_1.AffPaymentRequestSearchInput, Object]),
    __metadata("design:returntype", Promise)
], AffiliatePaymentResolver.prototype, "getPaymentRequests", null);
__decorate([
    (0, graphql_1.Query)(() => affiliate_model_1.AffEarningsReport, { name: 'affiliateEarningsReport' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('startDate', { nullable: true })),
    __param(1, (0, graphql_1.Args)('endDate', { nullable: true })),
    __param(2, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Date,
        Date, Object]),
    __metadata("design:returntype", Promise)
], AffiliatePaymentResolver.prototype, "getEarningsReport", null);
__decorate([
    (0, graphql_1.Mutation)(() => affiliate_model_1.AffPaymentRequest, { name: 'processPaymentRequest' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRoleType.ADMIN),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('status')),
    __param(2, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AffiliatePaymentResolver.prototype, "processPaymentRequest", null);
exports.AffiliatePaymentResolver = AffiliatePaymentResolver = __decorate([
    (0, graphql_1.Resolver)(() => affiliate_model_1.AffPaymentRequest),
    __metadata("design:paramtypes", [affiliate_payment_service_1.AffiliatePaymentService])
], AffiliatePaymentResolver);
let AffiliateConversionResolver = class AffiliateConversionResolver {
    constructor(conversionService) {
        this.conversionService = conversionService;
    }
    async approveConversion(id, context) {
        const userId = context.req.user.id;
        await this.conversionService.approveConversion(id, userId);
        return true;
    }
    async rejectConversion(id, reason, context) {
        const userId = context?.req?.user?.id;
        await this.conversionService.rejectConversion(id, userId, reason);
        return true;
    }
};
exports.AffiliateConversionResolver = AffiliateConversionResolver;
__decorate([
    (0, graphql_1.Mutation)(() => Boolean, { name: 'approveConversion' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRoleType.ADMIN),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AffiliateConversionResolver.prototype, "approveConversion", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean, { name: 'rejectConversion' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRoleType.ADMIN),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('reason', { nullable: true })),
    __param(2, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AffiliateConversionResolver.prototype, "rejectConversion", null);
exports.AffiliateConversionResolver = AffiliateConversionResolver = __decorate([
    (0, graphql_1.Resolver)('AffConversion'),
    __metadata("design:paramtypes", [affiliate_conversion_service_1.AffiliateConversionService])
], AffiliateConversionResolver);
//# sourceMappingURL=affiliate.resolver.js.map