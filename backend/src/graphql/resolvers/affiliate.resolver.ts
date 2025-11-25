import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';

import { AffUser, AffCampaign, AffLink, AffPaymentRequest, AffConversionsResponse, AffEarningsReport } from '../models/affiliate.model';
import { $Enums } from '@prisma/client';
import { 
  CreateAffUserInput, 
  UpdateAffUserInput,
  CreateCampaignInput,
  UpdateCampaignInput,
  CreateAffLinkInput,
  CreatePaymentRequestInput,
  CampaignSearchInput,
  AffLinkSearchInput,
  AffConversionSearchInput,
  AffPaymentRequestSearchInput,
  JoinCampaignInput,
  ReviewCampaignApplicationInput
} from '../inputs/affiliate.input';

import { AffiliateUserService, AffiliateCampaignService } from '../../services/affiliate.service';
import { AffiliateTrackingService } from '../../services/affiliate-tracking.service';
import { AffiliatePaymentService } from '../../services/affiliate-payment.service';
import { AffiliateConversionService } from '../../services/affiliate-conversion.service';

// Helper function to map Decimal to number and compute additional fields
const mapDecimalFields = (data: any): any => {
  if (!data) return data;
  const mapped = { ...data };
  
  // Convert Decimal fields to numbers
  if (mapped.commissionRate) mapped.commissionRate = Number(mapped.commissionRate);
  if (mapped.fixedAmount) mapped.fixedAmount = Number(mapped.fixedAmount);
  if (mapped.totalRevenue) mapped.totalRevenue = Number(mapped.totalRevenue);
  if (mapped.totalCommission) mapped.totalCommission = Number(mapped.totalCommission);
  if (mapped.totalEarnings) mapped.totalEarnings = Number(mapped.totalEarnings);
  if (mapped.saleAmount) mapped.saleAmount = Number(mapped.saleAmount);
  if (mapped.commission) mapped.commission = Number(mapped.commission);
  if (mapped.amount) mapped.amount = Number(mapped.amount);
  
  // Compute additional fields for AffCampaign
  if (data.totalClicks !== undefined && data.totalConversions !== undefined) {
    // Compute conversion rate as percentage
    mapped.conversionRate = data.totalClicks > 0 
      ? Number(((data.totalConversions / data.totalClicks) * 100).toFixed(2))
      : 0;
    
    // Compute average order value
    mapped.averageOrderValue = data.totalConversions > 0
      ? Number((Number(data.totalRevenue || 0) / data.totalConversions).toFixed(2))
      : 0;
  }
  
  // Set default values for optional fields
  if (mapped.type === undefined) mapped.type = 'standard';
  if (mapped.cookieDuration === undefined) mapped.cookieDuration = 30; // 30 days default
  if (mapped.minPayoutAmount === undefined) mapped.minPayoutAmount = 50; // $50 minimum
  if (mapped.categories === undefined) mapped.categories = [];
  if (mapped.targetCountries === undefined) mapped.targetCountries = [];
  
  return mapped;
};

@Resolver(() => AffUser)
export class AffiliateUserResolver {
  constructor(private affiliateUserService: AffiliateUserService) {}

  @Mutation(() => AffUser, { name: 'createAffiliateUser' })
  @UseGuards(JwtAuthGuard)
  async createAffiliateUser(
    @Args('input') input: CreateAffUserInput,
    @Context() context: any,
  ): Promise<AffUser> {
    const userId = context.req.user.id;
    const result = await this.affiliateUserService.createAffiliateUser(userId, input);
    return mapDecimalFields(result);
  }

  @Query(() => AffUser, { name: 'affiliateUser', nullable: true })
  @UseGuards(JwtAuthGuard)
  async getAffiliateUser(@Context() context: any): Promise<AffUser | null> {
    const userId = context.req.user.id;
    const result = await this.affiliateUserService.getAffiliateUser(userId);
    return result ? mapDecimalFields(result) : null;
  }

  @Mutation(() => AffUser, { name: 'updateAffiliateUser' })
  @UseGuards(JwtAuthGuard)
  async updateAffiliateUser(
    @Args('input') input: UpdateAffUserInput,
    @Context() context: any,
  ): Promise<AffUser> {
    const userId = context.req.user.id;
    const result = await this.affiliateUserService.updateAffiliateUser(userId, input);
    return mapDecimalFields(result);
  }
}

@Resolver(() => AffCampaign)
export class AffiliateCampaignResolver {
  constructor(private campaignService: AffiliateCampaignService) {}

  @Mutation(() => AffCampaign, { name: 'createAffiliateCampaign' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRoleType.USER, $Enums.UserRoleType.ADMIN)
  async createCampaign(
    @Args('input') input: CreateCampaignInput,
    @Context() context: any,
  ): Promise<AffCampaign> {
    const userId = context.req.user.id;
    const result = await this.campaignService.createCampaign(userId, input);
    return mapDecimalFields(result);
  }

  @Query(() => [AffCampaign], { name: 'affiliateCampaigns' })
  @UseGuards(JwtAuthGuard)
  async getCampaigns(
    @Args('search', { nullable: true }) search?: CampaignSearchInput,
  ): Promise<AffCampaign[]> {
    const searchInput = search || { page: 1, size: 20 };
    const results = await this.campaignService.searchCampaigns(searchInput);
    return results.campaigns.map(mapDecimalFields);
  }

  @Query(() => AffCampaign, { name: 'affiliateCampaign', nullable: true })
  @UseGuards(JwtAuthGuard)
  async getCampaign(@Args('id') id: string): Promise<AffCampaign | null> {
    const result = await this.campaignService.getCampaign(id);
    return result ? mapDecimalFields(result) : null;
  }

  @Mutation(() => AffCampaign, { name: 'updateAffiliateCampaign' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRoleType.USER, $Enums.UserRoleType.ADMIN)
  async updateCampaign(
    @Args('id') id: string,
    @Args('input') input: UpdateCampaignInput,
    @Context() context: any,
  ): Promise<AffCampaign> {
    const userId = context.req.user.id;
    const result = await this.campaignService.updateCampaign(id, userId, input);
    return mapDecimalFields(result);
  }

  @Mutation(() => Boolean, { name: 'deleteAffiliateCampaign' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRoleType.USER, $Enums.UserRoleType.ADMIN)
  async deleteCampaign(
    @Args('id') id: string,
    @Context() context: any,
  ): Promise<boolean> {
    const userId = context.req.user.id;
    await this.campaignService.deleteCampaign(id, userId);
    return true;
  }

  @Mutation(() => String, { name: 'joinCampaign' })
  @UseGuards(JwtAuthGuard)
  async joinCampaign(
    @Args('input') input: JoinCampaignInput,
    @Context() context: any,
  ): Promise<any> {
    const userId = context.req.user.id;
    const result = await this.campaignService.joinCampaign(userId, input);
    return mapDecimalFields(result);
  }

  @Mutation(() => String, { name: 'reviewCampaignApplication' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRoleType.USER, $Enums.UserRoleType.ADMIN)
  async reviewApplication(
    @Args('input') input: ReviewCampaignApplicationInput,
    @Context() context: any,
  ): Promise<any> {
    const userId = context.req.user.id;
    const result = await this.campaignService.reviewCampaignApplication(userId, input);
    return mapDecimalFields(result);
  }
}

@Resolver(() => AffLink)
export class AffiliateTrackingResolver {
  constructor(private trackingService: AffiliateTrackingService) {}

  @Mutation(() => AffLink, { name: 'createAffiliateLink' })
  @UseGuards(JwtAuthGuard)
  async createLink(
    @Args('input') input: CreateAffLinkInput,
    @Context() context: any,
  ): Promise<AffLink> {
    const userId = context.req.user.id;
    const result = await this.trackingService.createAffiliateLink(userId, input);
    return mapDecimalFields(result);
  }

  @Query(() => [AffLink], { name: 'affiliateLinks' })
  @UseGuards(JwtAuthGuard)
  async getLinks(
    @Args('search', { nullable: true }) search?: AffLinkSearchInput,
    @Context() context?: any
  ): Promise<AffLink[]> {
    const userId = context?.req?.user?.id;
    const results = await this.trackingService.getAffiliateLinks(userId, search);
    return results.links.map(mapDecimalFields);
  }

  @Query(() => AffConversionsResponse, { name: 'affiliateConversions' })
  @UseGuards(JwtAuthGuard)
  async getConversions(
    @Args('search', { nullable: true }) search?: AffConversionSearchInput,
    @Context() context?: any
  ): Promise<AffConversionsResponse> {
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
}

@Resolver(() => AffPaymentRequest)
export class AffiliatePaymentResolver {
  constructor(private paymentService: AffiliatePaymentService) {}

  @Mutation(() => AffPaymentRequest, { name: 'createPaymentRequest' })
  @UseGuards(JwtAuthGuard)
  async createPaymentRequest(
    @Args('input') input: CreatePaymentRequestInput,
    @Context() context: any,
  ): Promise<AffPaymentRequest> {
    const userId = context.req.user.id;
    const result = await this.paymentService.createPaymentRequest(userId, input);
    return mapDecimalFields(result);
  }

  @Query(() => [AffPaymentRequest], { name: 'affiliatePaymentRequests' })
  @UseGuards(JwtAuthGuard)
  async getPaymentRequests(
    @Args('search', { nullable: true }) search?: AffPaymentRequestSearchInput,
    @Context() context?: any
  ): Promise<AffPaymentRequest[]> {
    const userId = context?.req?.user?.id;
    const results = await this.paymentService.getPaymentRequests(search, undefined, userId);
    return results.requests.map(mapDecimalFields);
  }

  @Query(() => AffEarningsReport, { name: 'affiliateEarningsReport' })
  @UseGuards(JwtAuthGuard)
  async getEarningsReport(
    @Args('startDate', { nullable: true }) startDate?: Date,
    @Args('endDate', { nullable: true }) endDate?: Date,
    @Context() context?: any
  ): Promise<AffEarningsReport> {
    const userId = context?.req?.user?.id;
    const dateRange = startDate && endDate ? { startDate, endDate } : undefined;
    const result = await this.paymentService.getAffiliateEarnings(userId, dateRange);
    return mapDecimalFields(result);
  }

  @Mutation(() => AffPaymentRequest, { name: 'processPaymentRequest' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRoleType.ADMIN)
  async processPaymentRequest(
    @Args('id') id: string,
    @Args('status') status: string,
    @Context() context: any,
  ): Promise<AffPaymentRequest> {
    const adminId = context.req.user.id;
    const result = await this.paymentService.processPaymentRequest(adminId, { paymentRequestId: id, status: status as any });
    return mapDecimalFields(result);
  }
}

@Resolver('AffConversion')
export class AffiliateConversionResolver {
  constructor(private conversionService: AffiliateConversionService) {}

  @Mutation(() => Boolean, { name: 'approveConversion' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRoleType.ADMIN)
  async approveConversion(
    @Args('id') id: string,
    @Context() context: any,
  ): Promise<boolean> {
    const userId = context.req.user.id;
    await this.conversionService.approveConversion(id, userId);
    return true;
  }

  @Mutation(() => Boolean, { name: 'rejectConversion' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRoleType.ADMIN)
  async rejectConversion(
    @Args('id') id: string,
    @Args('reason', { nullable: true }) reason?: string,
    @Context() context?: any,
  ): Promise<boolean> {
    const userId = context?.req?.user?.id;
    await this.conversionService.rejectConversion(id, userId, reason);
    return true;
  }
}
