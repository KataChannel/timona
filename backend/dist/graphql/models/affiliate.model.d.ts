import { $Enums } from '@prisma/client';
export declare class AffUser {
    id: string;
    userId: string;
    role: $Enums.AffUserRole;
    companyName?: string;
    businessType?: string;
    website?: string;
    description?: string;
    paymentMethod?: $Enums.AffPaymentMethod;
    bankAccount?: string;
    paypalEmail?: string;
    taxId?: string;
    isActive: boolean;
    joinedAt: Date;
    lastActiveAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    status?: string;
    businessName?: string;
    paymentEmail?: string;
    bankDetails?: string;
    socialProfiles?: string[];
    complianceDocuments?: string[];
    totalEarnings?: number;
    totalClicks?: number;
    totalConversions?: number;
    conversionRate?: number;
    averageOrderValue?: number;
    isVerified?: boolean;
    campaignsCreated?: AffCampaign[];
    campaignJoins?: AffCampaignAffiliate[];
    links?: AffLink[];
    conversions?: AffConversion[];
    paymentRequests?: AffPaymentRequest[];
}
export declare class AffCampaign {
    id: string;
    name: string;
    description?: string;
    productName: string;
    productUrl: string;
    productImage?: string;
    commissionRate: number;
    commissionType: string;
    fixedAmount?: number;
    status: $Enums.AffCampaignStatus;
    startDate?: Date;
    endDate?: Date;
    maxAffiliates?: number;
    requireApproval: boolean;
    totalClicks: number;
    totalConversions: number;
    totalRevenue: number;
    totalCommission: number;
    creatorId: string;
    createdAt: Date;
    updatedAt: Date;
    type?: string;
    cookieDuration?: number;
    minPayoutAmount?: number;
    maxPayoutAmount?: number;
    conversionRate?: number;
    averageOrderValue?: number;
    categories?: string[];
    targetCountries?: string[];
    creator?: AffUser;
    affiliates?: AffCampaignAffiliate[];
    links?: AffLink[];
    conversions?: AffConversion[];
}
export declare class AffCampaignAffiliate {
    id: string;
    campaignId: string;
    affiliateId: string;
    status: string;
    appliedAt: Date;
    approvedAt?: Date;
    rejectedAt?: Date;
    reason?: string;
    totalClicks: number;
    totalConversions: number;
    totalEarnings: number;
    createdAt: Date;
    updatedAt: Date;
    campaign?: AffCampaign;
    affiliate?: AffUser;
}
export declare class AffLink {
    id: string;
    campaignId: string;
    affiliateId: string;
    trackingCode: string;
    originalUrl: string;
    shortUrl?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmContent?: string;
    totalClicks: number;
    totalConversions: number;
    totalEarnings: number;
    isActive: boolean;
    expiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    affiliateUserId?: string;
    customAlias?: string;
    title?: string;
    description?: string;
    revenue?: number;
    commission?: number;
    conversionRate?: number;
    campaign?: AffCampaign;
    affiliate?: AffUser;
    clicks?: AffClick[];
    conversions?: AffConversion[];
}
export declare class AffClick {
    id: string;
    linkId: string;
    ipAddress?: string;
    userAgent?: string;
    referer?: string;
    country?: string;
    city?: string;
    device?: string;
    browser?: string;
    sessionId?: string;
    visitorId?: string;
    clickedAt: Date;
    link?: AffLink;
}
export declare class AffConversion {
    id: string;
    linkId: string;
    campaignId: string;
    affiliateId: string;
    orderId?: string;
    customerEmail?: string;
    saleAmount: number;
    commission: number;
    clickId?: string;
    conversionType: string;
    status: $Enums.AffConversionStatus;
    currency: string;
    convertedAt: Date;
    approvedAt?: Date;
    rejectedAt?: Date;
    paidAt?: Date;
    notes?: string;
    validatedBy?: string;
    createdAt: Date;
    updatedAt: Date;
    link?: AffLink;
    campaign?: AffCampaign;
    affiliate?: AffUser;
}
export declare class AffPaymentRequest {
    id: string;
    affiliateId: string;
    amount: number;
    currency: string;
    status: $Enums.AffPaymentStatus;
    paymentMethod: $Enums.AffPaymentMethod;
    accountDetails?: string;
    requestedAt: Date;
    processedAt?: Date;
    completedAt?: Date;
    failedAt?: Date;
    transactionId?: string;
    notes?: string;
    adminNotes?: string;
    processedBy?: string;
    periodStart: Date;
    periodEnd: Date;
    createdAt: Date;
    updatedAt: Date;
    affiliate?: AffUser;
}
export declare class AffDashboardStats {
    totalClicks: number;
    totalConversions: number;
    totalEarnings: number;
    pendingEarnings: number;
    paidEarnings: number;
    conversionRate: number;
    activeCampaigns: number;
    activeLinks: number;
}
export declare class AffMerchantStats {
    totalCampaigns: number;
    activeCampaigns: number;
    totalAffiliates: number;
    totalRevenue: number;
    totalCommissionPaid: number;
    pendingCommission: number;
    totalClicks: number;
    totalConversions: number;
    averageConversionRate: number;
}
export declare class AffCampaignSearchResult {
    campaigns: AffCampaign[];
    total: number;
    page: number;
    size: number;
    totalPages: number;
}
export declare class AffConversionsResponse {
    conversions: AffConversion[];
    total: number;
    page: number;
    size: number;
    totalPages: number;
}
export declare class AffEarningsReport {
    totalEarnings: number;
    totalConversions: number;
    approvedEarnings: number;
    approvedConversions: number;
    paidEarnings: number;
    paidConversions: number;
    pendingEarnings: number;
    pendingConversions: number;
    availableForWithdrawal: number;
}
export declare class AffTrackingUrl {
    trackingUrl: string;
    shortUrl: string;
    qrCode: string;
}
