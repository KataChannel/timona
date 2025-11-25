import { AffUser, AffCampaign, AffLink, AffPaymentRequest, AffConversionsResponse, AffEarningsReport } from '../models/affiliate.model';
import { CreateAffUserInput, UpdateAffUserInput, CreateCampaignInput, UpdateCampaignInput, CreateAffLinkInput, CreatePaymentRequestInput, CampaignSearchInput, AffLinkSearchInput, AffConversionSearchInput, AffPaymentRequestSearchInput, JoinCampaignInput, ReviewCampaignApplicationInput } from '../inputs/affiliate.input';
import { AffiliateUserService, AffiliateCampaignService } from '../../services/affiliate.service';
import { AffiliateTrackingService } from '../../services/affiliate-tracking.service';
import { AffiliatePaymentService } from '../../services/affiliate-payment.service';
import { AffiliateConversionService } from '../../services/affiliate-conversion.service';
export declare class AffiliateUserResolver {
    private affiliateUserService;
    constructor(affiliateUserService: AffiliateUserService);
    createAffiliateUser(input: CreateAffUserInput, context: any): Promise<AffUser>;
    getAffiliateUser(context: any): Promise<AffUser | null>;
    updateAffiliateUser(input: UpdateAffUserInput, context: any): Promise<AffUser>;
}
export declare class AffiliateCampaignResolver {
    private campaignService;
    constructor(campaignService: AffiliateCampaignService);
    createCampaign(input: CreateCampaignInput, context: any): Promise<AffCampaign>;
    getCampaigns(search?: CampaignSearchInput): Promise<AffCampaign[]>;
    getCampaign(id: string): Promise<AffCampaign | null>;
    updateCampaign(id: string, input: UpdateCampaignInput, context: any): Promise<AffCampaign>;
    deleteCampaign(id: string, context: any): Promise<boolean>;
    joinCampaign(input: JoinCampaignInput, context: any): Promise<any>;
    reviewApplication(input: ReviewCampaignApplicationInput, context: any): Promise<any>;
}
export declare class AffiliateTrackingResolver {
    private trackingService;
    constructor(trackingService: AffiliateTrackingService);
    createLink(input: CreateAffLinkInput, context: any): Promise<AffLink>;
    getLinks(search?: AffLinkSearchInput, context?: any): Promise<AffLink[]>;
    getConversions(search?: AffConversionSearchInput, context?: any): Promise<AffConversionsResponse>;
}
export declare class AffiliatePaymentResolver {
    private paymentService;
    constructor(paymentService: AffiliatePaymentService);
    createPaymentRequest(input: CreatePaymentRequestInput, context: any): Promise<AffPaymentRequest>;
    getPaymentRequests(search?: AffPaymentRequestSearchInput, context?: any): Promise<AffPaymentRequest[]>;
    getEarningsReport(startDate?: Date, endDate?: Date, context?: any): Promise<AffEarningsReport>;
    processPaymentRequest(id: string, status: string, context: any): Promise<AffPaymentRequest>;
}
export declare class AffiliateConversionResolver {
    private conversionService;
    constructor(conversionService: AffiliateConversionService);
    approveConversion(id: string, context: any): Promise<boolean>;
    rejectConversion(id: string, reason?: string, context?: any): Promise<boolean>;
}
