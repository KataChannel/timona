import { PrismaService } from '../prisma/prisma.service';
export interface ConversionTrackingData {
    affiliateRef: string;
    orderId: string;
    saleAmount: number;
    customerEmail?: string;
    conversionType?: string;
    currency?: string;
    metadata?: Record<string, any>;
}
export interface ConversionResult {
    success: boolean;
    conversion?: any;
    commission?: number;
    message: string;
    linkId?: string;
    campaignId?: string;
    affiliateId?: string;
}
export declare class AffiliateConversionService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    trackConversion(data: ConversionTrackingData): Promise<ConversionResult>;
    trackConversionFromRequest(orderId: string, saleAmount: number, request: any, options?: {
        customerEmail?: string;
        conversionType?: string;
        currency?: string;
        metadata?: Record<string, any>;
    }): Promise<ConversionResult>;
    private calculateCommission;
    approveConversion(conversionId: string, approvedBy: string): Promise<any>;
    rejectConversion(conversionId: string, rejectedBy: string, reason?: string): Promise<any>;
    getConversionStats(campaignId: string): Promise<{
        total: number;
        pending: number;
        approved: number;
        rejected: number;
        approvalRate: string;
        totalRevenue: number;
        totalCommission: number;
    }>;
    getRecentConversions(limit?: number): Promise<({
        link: {
            campaign: {
                productImage: string | null;
                id: string;
                createdAt: Date;
                name: string;
                updatedAt: Date;
                description: string | null;
                status: import("@prisma/client").$Enums.AffCampaignStatus;
                startDate: Date | null;
                endDate: Date | null;
                commissionType: string;
                productName: string;
                productUrl: string;
                commissionRate: import("@prisma/client/runtime/library").Decimal;
                fixedAmount: import("@prisma/client/runtime/library").Decimal | null;
                maxAffiliates: number | null;
                requireApproval: boolean;
                totalClicks: number;
                totalConversions: number;
                totalRevenue: import("@prisma/client/runtime/library").Decimal;
                totalCommission: import("@prisma/client/runtime/library").Decimal;
                creatorId: string;
            };
            affiliate: {
                user: {
                    id: string;
                    email: string;
                    firstName: string;
                    lastName: string;
                };
            } & {
                role: import("@prisma/client").$Enums.AffUserRole;
                id: string;
                createdAt: Date;
                isActive: boolean;
                userId: string;
                updatedAt: Date;
                description: string | null;
                website: string | null;
                joinedAt: Date;
                companyName: string | null;
                businessType: string | null;
                paymentMethod: import("@prisma/client").$Enums.AffPaymentMethod | null;
                bankAccount: string | null;
                paypalEmail: string | null;
                taxId: string | null;
                lastActiveAt: Date | null;
            };
        } & {
            id: string;
            createdAt: Date;
            expiresAt: Date | null;
            isActive: boolean;
            updatedAt: Date;
            description: string | null;
            title: string | null;
            campaignId: string;
            totalClicks: number;
            totalConversions: number;
            affiliateId: string;
            trackingCode: string;
            originalUrl: string;
            shortUrl: string | null;
            customAlias: string | null;
            utmSource: string | null;
            utmMedium: string | null;
            utmCampaign: string | null;
            utmContent: string | null;
            totalEarnings: import("@prisma/client/runtime/library").Decimal;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.AffConversionStatus;
        campaignId: string;
        affiliateId: string;
        notes: string | null;
        orderId: string | null;
        customerEmail: string | null;
        saleAmount: import("@prisma/client/runtime/library").Decimal;
        conversionType: string;
        approvedAt: Date | null;
        rejectedAt: Date | null;
        linkId: string;
        commission: import("@prisma/client/runtime/library").Decimal;
        clickId: string | null;
        currency: string;
        convertedAt: Date;
        paidAt: Date | null;
        validatedBy: string | null;
    })[]>;
}
