import { $Enums } from '@prisma/client';
export declare class CreateAffUserInput {
    role: $Enums.AffUserRole;
    companyName?: string;
    businessType?: string;
    website?: string;
    description?: string;
    paymentMethod?: $Enums.AffPaymentMethod;
    bankAccount?: string;
    paypalEmail?: string;
    taxId?: string;
}
export declare class UpdateAffUserInput {
    companyName?: string;
    businessType?: string;
    website?: string;
    description?: string;
    paymentMethod?: $Enums.AffPaymentMethod;
    bankAccount?: string;
    paypalEmail?: string;
    taxId?: string;
    isActive?: boolean;
}
export declare class CreateCampaignInput {
    name: string;
    description?: string;
    productName: string;
    productUrl: string;
    productImage?: string;
    commissionRate: number;
    commissionType: string;
    fixedAmount?: number;
    startDate?: Date;
    endDate?: Date;
    maxAffiliates?: number;
    requireApproval: boolean;
}
export declare class UpdateCampaignInput {
    name?: string;
    description?: string;
    productName?: string;
    productUrl?: string;
    productImage?: string;
    commissionRate?: number;
    commissionType?: string;
    fixedAmount?: number;
    status?: $Enums.AffCampaignStatus;
    startDate?: Date;
    endDate?: Date;
    maxAffiliates?: number;
    requireApproval?: boolean;
}
export declare class CampaignSearchInput {
    query?: string;
    status?: $Enums.AffCampaignStatus;
    creatorId?: string;
    minCommissionRate?: number;
    maxCommissionRate?: number;
    page: number;
    size: number;
    sortBy?: string;
    sortOrder?: string;
}
export declare class JoinCampaignInput {
    campaignId: string;
    message?: string;
}
export declare class ReviewCampaignApplicationInput {
    applicationId: string;
    action: string;
    reason?: string;
}
export declare class CreateAffLinkInput {
    campaignId: string;
    originalUrl?: string;
    customAlias?: string;
    title?: string;
    description?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmContent?: string;
    expiresAt?: Date;
}
export declare class UpdateAffLinkInput {
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmContent?: string;
    isActive?: boolean;
    expiresAt?: Date;
}
export declare class TrackConversionInput {
    trackingCode: string;
    orderId?: string;
    customerEmail?: string;
    saleAmount: number;
    conversionType: string;
}
export declare class ReviewConversionInput {
    conversionId: string;
    status: $Enums.AffConversionStatus;
    notes?: string;
}
export declare class CreatePaymentRequestInput {
    amount: number;
    paymentMethod: $Enums.AffPaymentMethod;
    accountDetails?: string;
    periodStart: Date;
    periodEnd: Date;
    notes?: string;
}
export declare class ProcessPaymentRequestInput {
    paymentRequestId: string;
    status: $Enums.AffPaymentStatus;
    transactionId?: string;
    adminNotes?: string;
}
export declare class AffDateRangeInput {
    startDate: Date;
    endDate: Date;
}
export declare class AffAnalyticsInput {
    dateRange?: AffDateRangeInput;
    campaignId?: string;
    affiliateId?: string;
    groupBy?: string;
}
export declare class AffPaginationInput {
    page: number;
    size: number;
    sortBy?: string;
    sortOrder?: string;
}
export declare class AffLinkSearchInput {
    campaignId?: string;
    isActive?: boolean;
    pagination?: AffPaginationInput;
}
export declare class AffConversionSearchInput {
    campaignId?: string;
    affiliateId?: string;
    status?: $Enums.AffConversionStatus;
    dateRange?: AffDateRangeInput;
    pagination?: AffPaginationInput;
}
export declare class AffPaymentRequestSearchInput {
    affiliateId?: string;
    status?: $Enums.AffPaymentStatus;
    dateRange?: AffDateRangeInput;
    pagination?: AffPaginationInput;
}
