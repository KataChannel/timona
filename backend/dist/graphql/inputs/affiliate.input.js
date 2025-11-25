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
exports.AffPaymentRequestSearchInput = exports.AffConversionSearchInput = exports.AffLinkSearchInput = exports.AffPaginationInput = exports.AffAnalyticsInput = exports.AffDateRangeInput = exports.ProcessPaymentRequestInput = exports.CreatePaymentRequestInput = exports.ReviewConversionInput = exports.TrackConversionInput = exports.UpdateAffLinkInput = exports.CreateAffLinkInput = exports.ReviewCampaignApplicationInput = exports.JoinCampaignInput = exports.CampaignSearchInput = exports.UpdateCampaignInput = exports.CreateCampaignInput = exports.UpdateAffUserInput = exports.CreateAffUserInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
let CreateAffUserInput = class CreateAffUserInput {
};
exports.CreateAffUserInput = CreateAffUserInput;
__decorate([
    (0, graphql_1.Field)(() => client_1.$Enums.AffUserRole),
    __metadata("design:type", String)
], CreateAffUserInput.prototype, "role", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateAffUserInput.prototype, "companyName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateAffUserInput.prototype, "businessType", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateAffUserInput.prototype, "website", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateAffUserInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.$Enums.AffPaymentMethod, { nullable: true }),
    __metadata("design:type", String)
], CreateAffUserInput.prototype, "paymentMethod", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateAffUserInput.prototype, "bankAccount", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateAffUserInput.prototype, "paypalEmail", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateAffUserInput.prototype, "taxId", void 0);
exports.CreateAffUserInput = CreateAffUserInput = __decorate([
    (0, graphql_1.InputType)()
], CreateAffUserInput);
let UpdateAffUserInput = class UpdateAffUserInput {
};
exports.UpdateAffUserInput = UpdateAffUserInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateAffUserInput.prototype, "companyName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateAffUserInput.prototype, "businessType", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateAffUserInput.prototype, "website", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateAffUserInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.$Enums.AffPaymentMethod, { nullable: true }),
    __metadata("design:type", String)
], UpdateAffUserInput.prototype, "paymentMethod", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateAffUserInput.prototype, "bankAccount", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateAffUserInput.prototype, "paypalEmail", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateAffUserInput.prototype, "taxId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], UpdateAffUserInput.prototype, "isActive", void 0);
exports.UpdateAffUserInput = UpdateAffUserInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateAffUserInput);
let CreateCampaignInput = class CreateCampaignInput {
};
exports.CreateCampaignInput = CreateCampaignInput;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CreateCampaignInput.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateCampaignInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CreateCampaignInput.prototype, "productName", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CreateCampaignInput.prototype, "productUrl", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateCampaignInput.prototype, "productImage", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], CreateCampaignInput.prototype, "commissionRate", void 0);
__decorate([
    (0, graphql_1.Field)({ defaultValue: 'percentage' }),
    __metadata("design:type", String)
], CreateCampaignInput.prototype, "commissionType", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], CreateCampaignInput.prototype, "fixedAmount", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], CreateCampaignInput.prototype, "startDate", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], CreateCampaignInput.prototype, "endDate", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], CreateCampaignInput.prototype, "maxAffiliates", void 0);
__decorate([
    (0, graphql_1.Field)({ defaultValue: true }),
    __metadata("design:type", Boolean)
], CreateCampaignInput.prototype, "requireApproval", void 0);
exports.CreateCampaignInput = CreateCampaignInput = __decorate([
    (0, graphql_1.InputType)()
], CreateCampaignInput);
let UpdateCampaignInput = class UpdateCampaignInput {
};
exports.UpdateCampaignInput = UpdateCampaignInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateCampaignInput.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateCampaignInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateCampaignInput.prototype, "productName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateCampaignInput.prototype, "productUrl", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateCampaignInput.prototype, "productImage", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], UpdateCampaignInput.prototype, "commissionRate", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateCampaignInput.prototype, "commissionType", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], UpdateCampaignInput.prototype, "fixedAmount", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.$Enums.AffCampaignStatus, { nullable: true }),
    __metadata("design:type", String)
], UpdateCampaignInput.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], UpdateCampaignInput.prototype, "startDate", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], UpdateCampaignInput.prototype, "endDate", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], UpdateCampaignInput.prototype, "maxAffiliates", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], UpdateCampaignInput.prototype, "requireApproval", void 0);
exports.UpdateCampaignInput = UpdateCampaignInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateCampaignInput);
let CampaignSearchInput = class CampaignSearchInput {
};
exports.CampaignSearchInput = CampaignSearchInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CampaignSearchInput.prototype, "query", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.$Enums.AffCampaignStatus, { nullable: true }),
    __metadata("design:type", String)
], CampaignSearchInput.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CampaignSearchInput.prototype, "creatorId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], CampaignSearchInput.prototype, "minCommissionRate", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], CampaignSearchInput.prototype, "maxCommissionRate", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { defaultValue: 1 }),
    __metadata("design:type", Number)
], CampaignSearchInput.prototype, "page", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { defaultValue: 20 }),
    __metadata("design:type", Number)
], CampaignSearchInput.prototype, "size", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CampaignSearchInput.prototype, "sortBy", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CampaignSearchInput.prototype, "sortOrder", void 0);
exports.CampaignSearchInput = CampaignSearchInput = __decorate([
    (0, graphql_1.InputType)()
], CampaignSearchInput);
let JoinCampaignInput = class JoinCampaignInput {
};
exports.JoinCampaignInput = JoinCampaignInput;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], JoinCampaignInput.prototype, "campaignId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], JoinCampaignInput.prototype, "message", void 0);
exports.JoinCampaignInput = JoinCampaignInput = __decorate([
    (0, graphql_1.InputType)()
], JoinCampaignInput);
let ReviewCampaignApplicationInput = class ReviewCampaignApplicationInput {
};
exports.ReviewCampaignApplicationInput = ReviewCampaignApplicationInput;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ReviewCampaignApplicationInput.prototype, "applicationId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ReviewCampaignApplicationInput.prototype, "action", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], ReviewCampaignApplicationInput.prototype, "reason", void 0);
exports.ReviewCampaignApplicationInput = ReviewCampaignApplicationInput = __decorate([
    (0, graphql_1.InputType)()
], ReviewCampaignApplicationInput);
let CreateAffLinkInput = class CreateAffLinkInput {
};
exports.CreateAffLinkInput = CreateAffLinkInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Campaign ID is required' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAffLinkInput.prototype, "campaignId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)({}, { message: 'Original URL must be a valid URL' }),
    __metadata("design:type", String)
], CreateAffLinkInput.prototype, "originalUrl", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 100, { message: 'Custom alias must be between 1 and 100 characters' }),
    (0, class_validator_1.Matches)(/^[a-z0-9-]+$/, { message: 'Custom alias must be lowercase alphanumeric with hyphens only' }),
    __metadata("design:type", String)
], CreateAffLinkInput.prototype, "customAlias", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 200, { message: 'Title must be between 1 and 200 characters' }),
    __metadata("design:type", String)
], CreateAffLinkInput.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAffLinkInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAffLinkInput.prototype, "utmSource", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAffLinkInput.prototype, "utmMedium", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAffLinkInput.prototype, "utmCampaign", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateAffLinkInput.prototype, "utmContent", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], CreateAffLinkInput.prototype, "expiresAt", void 0);
exports.CreateAffLinkInput = CreateAffLinkInput = __decorate([
    (0, graphql_1.InputType)()
], CreateAffLinkInput);
let UpdateAffLinkInput = class UpdateAffLinkInput {
};
exports.UpdateAffLinkInput = UpdateAffLinkInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateAffLinkInput.prototype, "utmSource", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateAffLinkInput.prototype, "utmMedium", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateAffLinkInput.prototype, "utmCampaign", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateAffLinkInput.prototype, "utmContent", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], UpdateAffLinkInput.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], UpdateAffLinkInput.prototype, "expiresAt", void 0);
exports.UpdateAffLinkInput = UpdateAffLinkInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateAffLinkInput);
let TrackConversionInput = class TrackConversionInput {
};
exports.TrackConversionInput = TrackConversionInput;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], TrackConversionInput.prototype, "trackingCode", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], TrackConversionInput.prototype, "orderId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], TrackConversionInput.prototype, "customerEmail", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], TrackConversionInput.prototype, "saleAmount", void 0);
__decorate([
    (0, graphql_1.Field)({ defaultValue: 'sale' }),
    __metadata("design:type", String)
], TrackConversionInput.prototype, "conversionType", void 0);
exports.TrackConversionInput = TrackConversionInput = __decorate([
    (0, graphql_1.InputType)()
], TrackConversionInput);
let ReviewConversionInput = class ReviewConversionInput {
};
exports.ReviewConversionInput = ReviewConversionInput;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ReviewConversionInput.prototype, "conversionId", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.$Enums.AffConversionStatus),
    __metadata("design:type", String)
], ReviewConversionInput.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], ReviewConversionInput.prototype, "notes", void 0);
exports.ReviewConversionInput = ReviewConversionInput = __decorate([
    (0, graphql_1.InputType)()
], ReviewConversionInput);
let CreatePaymentRequestInput = class CreatePaymentRequestInput {
};
exports.CreatePaymentRequestInput = CreatePaymentRequestInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], CreatePaymentRequestInput.prototype, "amount", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.$Enums.AffPaymentMethod),
    __metadata("design:type", String)
], CreatePaymentRequestInput.prototype, "paymentMethod", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreatePaymentRequestInput.prototype, "accountDetails", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], CreatePaymentRequestInput.prototype, "periodStart", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], CreatePaymentRequestInput.prototype, "periodEnd", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreatePaymentRequestInput.prototype, "notes", void 0);
exports.CreatePaymentRequestInput = CreatePaymentRequestInput = __decorate([
    (0, graphql_1.InputType)()
], CreatePaymentRequestInput);
let ProcessPaymentRequestInput = class ProcessPaymentRequestInput {
};
exports.ProcessPaymentRequestInput = ProcessPaymentRequestInput;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ProcessPaymentRequestInput.prototype, "paymentRequestId", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.$Enums.AffPaymentStatus),
    __metadata("design:type", String)
], ProcessPaymentRequestInput.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], ProcessPaymentRequestInput.prototype, "transactionId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], ProcessPaymentRequestInput.prototype, "adminNotes", void 0);
exports.ProcessPaymentRequestInput = ProcessPaymentRequestInput = __decorate([
    (0, graphql_1.InputType)()
], ProcessPaymentRequestInput);
let AffDateRangeInput = class AffDateRangeInput {
};
exports.AffDateRangeInput = AffDateRangeInput;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], AffDateRangeInput.prototype, "startDate", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], AffDateRangeInput.prototype, "endDate", void 0);
exports.AffDateRangeInput = AffDateRangeInput = __decorate([
    (0, graphql_1.InputType)()
], AffDateRangeInput);
let AffAnalyticsInput = class AffAnalyticsInput {
};
exports.AffAnalyticsInput = AffAnalyticsInput;
__decorate([
    (0, graphql_1.Field)(() => AffDateRangeInput, { nullable: true }),
    __metadata("design:type", AffDateRangeInput)
], AffAnalyticsInput.prototype, "dateRange", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AffAnalyticsInput.prototype, "campaignId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AffAnalyticsInput.prototype, "affiliateId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AffAnalyticsInput.prototype, "groupBy", void 0);
exports.AffAnalyticsInput = AffAnalyticsInput = __decorate([
    (0, graphql_1.InputType)()
], AffAnalyticsInput);
let AffPaginationInput = class AffPaginationInput {
};
exports.AffPaginationInput = AffPaginationInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { defaultValue: 1 }),
    __metadata("design:type", Number)
], AffPaginationInput.prototype, "page", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { defaultValue: 20 }),
    __metadata("design:type", Number)
], AffPaginationInput.prototype, "size", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AffPaginationInput.prototype, "sortBy", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AffPaginationInput.prototype, "sortOrder", void 0);
exports.AffPaginationInput = AffPaginationInput = __decorate([
    (0, graphql_1.InputType)()
], AffPaginationInput);
let AffLinkSearchInput = class AffLinkSearchInput {
};
exports.AffLinkSearchInput = AffLinkSearchInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AffLinkSearchInput.prototype, "campaignId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], AffLinkSearchInput.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)(() => AffPaginationInput, { nullable: true }),
    __metadata("design:type", AffPaginationInput)
], AffLinkSearchInput.prototype, "pagination", void 0);
exports.AffLinkSearchInput = AffLinkSearchInput = __decorate([
    (0, graphql_1.InputType)()
], AffLinkSearchInput);
let AffConversionSearchInput = class AffConversionSearchInput {
};
exports.AffConversionSearchInput = AffConversionSearchInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AffConversionSearchInput.prototype, "campaignId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AffConversionSearchInput.prototype, "affiliateId", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.$Enums.AffConversionStatus, { nullable: true }),
    __metadata("design:type", String)
], AffConversionSearchInput.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(() => AffDateRangeInput, { nullable: true }),
    __metadata("design:type", AffDateRangeInput)
], AffConversionSearchInput.prototype, "dateRange", void 0);
__decorate([
    (0, graphql_1.Field)(() => AffPaginationInput, { nullable: true }),
    __metadata("design:type", AffPaginationInput)
], AffConversionSearchInput.prototype, "pagination", void 0);
exports.AffConversionSearchInput = AffConversionSearchInput = __decorate([
    (0, graphql_1.InputType)()
], AffConversionSearchInput);
let AffPaymentRequestSearchInput = class AffPaymentRequestSearchInput {
};
exports.AffPaymentRequestSearchInput = AffPaymentRequestSearchInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AffPaymentRequestSearchInput.prototype, "affiliateId", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.$Enums.AffPaymentStatus, { nullable: true }),
    __metadata("design:type", String)
], AffPaymentRequestSearchInput.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(() => AffDateRangeInput, { nullable: true }),
    __metadata("design:type", AffDateRangeInput)
], AffPaymentRequestSearchInput.prototype, "dateRange", void 0);
__decorate([
    (0, graphql_1.Field)(() => AffPaginationInput, { nullable: true }),
    __metadata("design:type", AffPaginationInput)
], AffPaymentRequestSearchInput.prototype, "pagination", void 0);
exports.AffPaymentRequestSearchInput = AffPaymentRequestSearchInput = __decorate([
    (0, graphql_1.InputType)()
], AffPaymentRequestSearchInput);
//# sourceMappingURL=affiliate.input.js.map