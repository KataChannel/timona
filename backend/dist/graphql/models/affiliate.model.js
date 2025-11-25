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
exports.AffTrackingUrl = exports.AffEarningsReport = exports.AffConversionsResponse = exports.AffCampaignSearchResult = exports.AffMerchantStats = exports.AffDashboardStats = exports.AffPaymentRequest = exports.AffConversion = exports.AffClick = exports.AffLink = exports.AffCampaignAffiliate = exports.AffCampaign = exports.AffUser = void 0;
const graphql_1 = require("@nestjs/graphql");
const client_1 = require("@prisma/client");
(0, graphql_1.registerEnumType)(client_1.$Enums.AffUserRole, {
    name: 'AffUserRole',
    description: 'Affiliate user roles',
});
(0, graphql_1.registerEnumType)(client_1.$Enums.AffCampaignStatus, {
    name: 'AffCampaignStatus',
    description: 'Affiliate campaign status',
});
(0, graphql_1.registerEnumType)(client_1.$Enums.AffConversionStatus, {
    name: 'AffConversionStatus',
    description: 'Affiliate conversion status',
});
(0, graphql_1.registerEnumType)(client_1.$Enums.AffPaymentStatus, {
    name: 'AffPaymentStatus',
    description: 'Affiliate payment status',
});
(0, graphql_1.registerEnumType)(client_1.$Enums.AffPaymentMethod, {
    name: 'AffPaymentMethod',
    description: 'Affiliate payment methods',
});
let AffUser = class AffUser {
};
exports.AffUser = AffUser;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], AffUser.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AffUser.prototype, "userId", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.$Enums.AffUserRole),
    __metadata("design:type", String)
], AffUser.prototype, "role", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AffUser.prototype, "companyName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AffUser.prototype, "businessType", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AffUser.prototype, "website", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AffUser.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.$Enums.AffPaymentMethod, { nullable: true }),
    __metadata("design:type", String)
], AffUser.prototype, "paymentMethod", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AffUser.prototype, "bankAccount", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AffUser.prototype, "paypalEmail", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AffUser.prototype, "taxId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], AffUser.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], AffUser.prototype, "joinedAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], AffUser.prototype, "lastActiveAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], AffUser.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], AffUser.prototype, "updatedAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AffUser.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AffUser.prototype, "businessName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AffUser.prototype, "paymentEmail", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AffUser.prototype, "bankDetails", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], AffUser.prototype, "socialProfiles", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], AffUser.prototype, "complianceDocuments", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], AffUser.prototype, "totalEarnings", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], AffUser.prototype, "totalClicks", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], AffUser.prototype, "totalConversions", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], AffUser.prototype, "conversionRate", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], AffUser.prototype, "averageOrderValue", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], AffUser.prototype, "isVerified", void 0);
__decorate([
    (0, graphql_1.Field)(() => [AffCampaign], { nullable: true }),
    __metadata("design:type", Array)
], AffUser.prototype, "campaignsCreated", void 0);
__decorate([
    (0, graphql_1.Field)(() => [AffCampaignAffiliate], { nullable: true }),
    __metadata("design:type", Array)
], AffUser.prototype, "campaignJoins", void 0);
__decorate([
    (0, graphql_1.Field)(() => [AffLink], { nullable: true }),
    __metadata("design:type", Array)
], AffUser.prototype, "links", void 0);
__decorate([
    (0, graphql_1.Field)(() => [AffConversion], { nullable: true }),
    __metadata("design:type", Array)
], AffUser.prototype, "conversions", void 0);
__decorate([
    (0, graphql_1.Field)(() => [AffPaymentRequest], { nullable: true }),
    __metadata("design:type", Array)
], AffUser.prototype, "paymentRequests", void 0);
exports.AffUser = AffUser = __decorate([
    (0, graphql_1.ObjectType)()
], AffUser);
let AffCampaign = class AffCampaign {
};
exports.AffCampaign = AffCampaign;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], AffCampaign.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AffCampaign.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AffCampaign.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AffCampaign.prototype, "productName", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AffCampaign.prototype, "productUrl", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AffCampaign.prototype, "productImage", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], AffCampaign.prototype, "commissionRate", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AffCampaign.prototype, "commissionType", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], AffCampaign.prototype, "fixedAmount", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.$Enums.AffCampaignStatus),
    __metadata("design:type", String)
], AffCampaign.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], AffCampaign.prototype, "startDate", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], AffCampaign.prototype, "endDate", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], AffCampaign.prototype, "maxAffiliates", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], AffCampaign.prototype, "requireApproval", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AffCampaign.prototype, "totalClicks", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AffCampaign.prototype, "totalConversions", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], AffCampaign.prototype, "totalRevenue", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], AffCampaign.prototype, "totalCommission", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AffCampaign.prototype, "creatorId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], AffCampaign.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], AffCampaign.prototype, "updatedAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AffCampaign.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], AffCampaign.prototype, "cookieDuration", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], AffCampaign.prototype, "minPayoutAmount", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], AffCampaign.prototype, "maxPayoutAmount", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], AffCampaign.prototype, "conversionRate", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], AffCampaign.prototype, "averageOrderValue", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], AffCampaign.prototype, "categories", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], AffCampaign.prototype, "targetCountries", void 0);
__decorate([
    (0, graphql_1.Field)(() => AffUser, { nullable: true }),
    __metadata("design:type", AffUser)
], AffCampaign.prototype, "creator", void 0);
__decorate([
    (0, graphql_1.Field)(() => [AffCampaignAffiliate], { nullable: true }),
    __metadata("design:type", Array)
], AffCampaign.prototype, "affiliates", void 0);
__decorate([
    (0, graphql_1.Field)(() => [AffLink], { nullable: true }),
    __metadata("design:type", Array)
], AffCampaign.prototype, "links", void 0);
__decorate([
    (0, graphql_1.Field)(() => [AffConversion], { nullable: true }),
    __metadata("design:type", Array)
], AffCampaign.prototype, "conversions", void 0);
exports.AffCampaign = AffCampaign = __decorate([
    (0, graphql_1.ObjectType)()
], AffCampaign);
let AffCampaignAffiliate = class AffCampaignAffiliate {
};
exports.AffCampaignAffiliate = AffCampaignAffiliate;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], AffCampaignAffiliate.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AffCampaignAffiliate.prototype, "campaignId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AffCampaignAffiliate.prototype, "affiliateId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AffCampaignAffiliate.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], AffCampaignAffiliate.prototype, "appliedAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], AffCampaignAffiliate.prototype, "approvedAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], AffCampaignAffiliate.prototype, "rejectedAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AffCampaignAffiliate.prototype, "reason", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AffCampaignAffiliate.prototype, "totalClicks", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AffCampaignAffiliate.prototype, "totalConversions", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], AffCampaignAffiliate.prototype, "totalEarnings", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], AffCampaignAffiliate.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], AffCampaignAffiliate.prototype, "updatedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => AffCampaign, { nullable: true }),
    __metadata("design:type", AffCampaign)
], AffCampaignAffiliate.prototype, "campaign", void 0);
__decorate([
    (0, graphql_1.Field)(() => AffUser, { nullable: true }),
    __metadata("design:type", AffUser)
], AffCampaignAffiliate.prototype, "affiliate", void 0);
exports.AffCampaignAffiliate = AffCampaignAffiliate = __decorate([
    (0, graphql_1.ObjectType)()
], AffCampaignAffiliate);
let AffLink = class AffLink {
};
exports.AffLink = AffLink;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], AffLink.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AffLink.prototype, "campaignId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AffLink.prototype, "affiliateId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AffLink.prototype, "trackingCode", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AffLink.prototype, "originalUrl", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AffLink.prototype, "shortUrl", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AffLink.prototype, "utmSource", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AffLink.prototype, "utmMedium", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AffLink.prototype, "utmCampaign", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AffLink.prototype, "utmContent", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AffLink.prototype, "totalClicks", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AffLink.prototype, "totalConversions", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], AffLink.prototype, "totalEarnings", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], AffLink.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], AffLink.prototype, "expiresAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], AffLink.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], AffLink.prototype, "updatedAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AffLink.prototype, "affiliateUserId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AffLink.prototype, "customAlias", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AffLink.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AffLink.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], AffLink.prototype, "revenue", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], AffLink.prototype, "commission", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], AffLink.prototype, "conversionRate", void 0);
__decorate([
    (0, graphql_1.Field)(() => AffCampaign, { nullable: true }),
    __metadata("design:type", AffCampaign)
], AffLink.prototype, "campaign", void 0);
__decorate([
    (0, graphql_1.Field)(() => AffUser, { nullable: true }),
    __metadata("design:type", AffUser)
], AffLink.prototype, "affiliate", void 0);
__decorate([
    (0, graphql_1.Field)(() => [AffClick], { nullable: true }),
    __metadata("design:type", Array)
], AffLink.prototype, "clicks", void 0);
__decorate([
    (0, graphql_1.Field)(() => [AffConversion], { nullable: true }),
    __metadata("design:type", Array)
], AffLink.prototype, "conversions", void 0);
exports.AffLink = AffLink = __decorate([
    (0, graphql_1.ObjectType)()
], AffLink);
let AffClick = class AffClick {
};
exports.AffClick = AffClick;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], AffClick.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AffClick.prototype, "linkId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AffClick.prototype, "ipAddress", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AffClick.prototype, "userAgent", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AffClick.prototype, "referer", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AffClick.prototype, "country", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AffClick.prototype, "city", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AffClick.prototype, "device", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AffClick.prototype, "browser", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AffClick.prototype, "sessionId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AffClick.prototype, "visitorId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], AffClick.prototype, "clickedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => AffLink, { nullable: true }),
    __metadata("design:type", AffLink)
], AffClick.prototype, "link", void 0);
exports.AffClick = AffClick = __decorate([
    (0, graphql_1.ObjectType)()
], AffClick);
let AffConversion = class AffConversion {
};
exports.AffConversion = AffConversion;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], AffConversion.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AffConversion.prototype, "linkId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AffConversion.prototype, "campaignId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AffConversion.prototype, "affiliateId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AffConversion.prototype, "orderId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AffConversion.prototype, "customerEmail", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], AffConversion.prototype, "saleAmount", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], AffConversion.prototype, "commission", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AffConversion.prototype, "clickId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AffConversion.prototype, "conversionType", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.$Enums.AffConversionStatus),
    __metadata("design:type", String)
], AffConversion.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AffConversion.prototype, "currency", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], AffConversion.prototype, "convertedAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], AffConversion.prototype, "approvedAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], AffConversion.prototype, "rejectedAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], AffConversion.prototype, "paidAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AffConversion.prototype, "notes", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AffConversion.prototype, "validatedBy", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], AffConversion.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], AffConversion.prototype, "updatedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => AffLink, { nullable: true }),
    __metadata("design:type", AffLink)
], AffConversion.prototype, "link", void 0);
__decorate([
    (0, graphql_1.Field)(() => AffCampaign, { nullable: true }),
    __metadata("design:type", AffCampaign)
], AffConversion.prototype, "campaign", void 0);
__decorate([
    (0, graphql_1.Field)(() => AffUser, { nullable: true }),
    __metadata("design:type", AffUser)
], AffConversion.prototype, "affiliate", void 0);
exports.AffConversion = AffConversion = __decorate([
    (0, graphql_1.ObjectType)()
], AffConversion);
let AffPaymentRequest = class AffPaymentRequest {
};
exports.AffPaymentRequest = AffPaymentRequest;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], AffPaymentRequest.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AffPaymentRequest.prototype, "affiliateId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], AffPaymentRequest.prototype, "amount", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AffPaymentRequest.prototype, "currency", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.$Enums.AffPaymentStatus),
    __metadata("design:type", String)
], AffPaymentRequest.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.$Enums.AffPaymentMethod),
    __metadata("design:type", String)
], AffPaymentRequest.prototype, "paymentMethod", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AffPaymentRequest.prototype, "accountDetails", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], AffPaymentRequest.prototype, "requestedAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], AffPaymentRequest.prototype, "processedAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], AffPaymentRequest.prototype, "completedAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], AffPaymentRequest.prototype, "failedAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AffPaymentRequest.prototype, "transactionId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AffPaymentRequest.prototype, "notes", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AffPaymentRequest.prototype, "adminNotes", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AffPaymentRequest.prototype, "processedBy", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], AffPaymentRequest.prototype, "periodStart", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], AffPaymentRequest.prototype, "periodEnd", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], AffPaymentRequest.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], AffPaymentRequest.prototype, "updatedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => AffUser, { nullable: true }),
    __metadata("design:type", AffUser)
], AffPaymentRequest.prototype, "affiliate", void 0);
exports.AffPaymentRequest = AffPaymentRequest = __decorate([
    (0, graphql_1.ObjectType)()
], AffPaymentRequest);
let AffDashboardStats = class AffDashboardStats {
};
exports.AffDashboardStats = AffDashboardStats;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AffDashboardStats.prototype, "totalClicks", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AffDashboardStats.prototype, "totalConversions", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], AffDashboardStats.prototype, "totalEarnings", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], AffDashboardStats.prototype, "pendingEarnings", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], AffDashboardStats.prototype, "paidEarnings", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], AffDashboardStats.prototype, "conversionRate", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AffDashboardStats.prototype, "activeCampaigns", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AffDashboardStats.prototype, "activeLinks", void 0);
exports.AffDashboardStats = AffDashboardStats = __decorate([
    (0, graphql_1.ObjectType)()
], AffDashboardStats);
let AffMerchantStats = class AffMerchantStats {
};
exports.AffMerchantStats = AffMerchantStats;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AffMerchantStats.prototype, "totalCampaigns", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AffMerchantStats.prototype, "activeCampaigns", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AffMerchantStats.prototype, "totalAffiliates", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], AffMerchantStats.prototype, "totalRevenue", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], AffMerchantStats.prototype, "totalCommissionPaid", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], AffMerchantStats.prototype, "pendingCommission", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AffMerchantStats.prototype, "totalClicks", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AffMerchantStats.prototype, "totalConversions", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], AffMerchantStats.prototype, "averageConversionRate", void 0);
exports.AffMerchantStats = AffMerchantStats = __decorate([
    (0, graphql_1.ObjectType)()
], AffMerchantStats);
let AffCampaignSearchResult = class AffCampaignSearchResult {
};
exports.AffCampaignSearchResult = AffCampaignSearchResult;
__decorate([
    (0, graphql_1.Field)(() => [AffCampaign]),
    __metadata("design:type", Array)
], AffCampaignSearchResult.prototype, "campaigns", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AffCampaignSearchResult.prototype, "total", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AffCampaignSearchResult.prototype, "page", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AffCampaignSearchResult.prototype, "size", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AffCampaignSearchResult.prototype, "totalPages", void 0);
exports.AffCampaignSearchResult = AffCampaignSearchResult = __decorate([
    (0, graphql_1.ObjectType)()
], AffCampaignSearchResult);
let AffConversionsResponse = class AffConversionsResponse {
};
exports.AffConversionsResponse = AffConversionsResponse;
__decorate([
    (0, graphql_1.Field)(() => [AffConversion]),
    __metadata("design:type", Array)
], AffConversionsResponse.prototype, "conversions", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AffConversionsResponse.prototype, "total", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AffConversionsResponse.prototype, "page", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AffConversionsResponse.prototype, "size", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AffConversionsResponse.prototype, "totalPages", void 0);
exports.AffConversionsResponse = AffConversionsResponse = __decorate([
    (0, graphql_1.ObjectType)()
], AffConversionsResponse);
let AffEarningsReport = class AffEarningsReport {
};
exports.AffEarningsReport = AffEarningsReport;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], AffEarningsReport.prototype, "totalEarnings", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AffEarningsReport.prototype, "totalConversions", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], AffEarningsReport.prototype, "approvedEarnings", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AffEarningsReport.prototype, "approvedConversions", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], AffEarningsReport.prototype, "paidEarnings", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AffEarningsReport.prototype, "paidConversions", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], AffEarningsReport.prototype, "pendingEarnings", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AffEarningsReport.prototype, "pendingConversions", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], AffEarningsReport.prototype, "availableForWithdrawal", void 0);
exports.AffEarningsReport = AffEarningsReport = __decorate([
    (0, graphql_1.ObjectType)()
], AffEarningsReport);
let AffTrackingUrl = class AffTrackingUrl {
};
exports.AffTrackingUrl = AffTrackingUrl;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AffTrackingUrl.prototype, "trackingUrl", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AffTrackingUrl.prototype, "shortUrl", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AffTrackingUrl.prototype, "qrCode", void 0);
exports.AffTrackingUrl = AffTrackingUrl = __decorate([
    (0, graphql_1.ObjectType)()
], AffTrackingUrl);
//# sourceMappingURL=affiliate.model.js.map