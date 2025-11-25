"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackAffiliateConversion = trackAffiliateConversion;
exports.trackAffiliateConversionFromContext = trackAffiliateConversionFromContext;
exports.trackAffiliateConversionManual = trackAffiliateConversionManual;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function trackAffiliateConversion(options) {
    try {
        const affRef = options.request.cookies?.['aff_ref'];
        if (!affRef) {
            console.log('[Affiliate] No affiliate reference found in cookies');
            return {
                success: false,
                message: 'No affiliate reference found',
            };
        }
        console.log(`[Affiliate] Tracking conversion: order=${options.orderId}, affRef=${affRef}`);
        return await trackConversionInternal({
            affiliateRef: affRef,
            ...options,
        });
    }
    catch (error) {
        console.error('[Affiliate] Error tracking conversion:', error);
        return {
            success: false,
            message: `Error: ${error.message}`,
        };
    }
}
async function trackAffiliateConversionFromContext(options) {
    try {
        const req = options.context?.req;
        if (!req) {
            return {
                success: false,
                message: 'No request object in context',
            };
        }
        return await trackAffiliateConversion({
            orderId: options.orderId,
            saleAmount: options.saleAmount,
            request: req,
            customerEmail: options.customerEmail,
            conversionType: options.conversionType,
            currency: options.currency,
            metadata: options.metadata,
        });
    }
    catch (error) {
        console.error('[Affiliate] Error tracking conversion from context:', error);
        return {
            success: false,
            message: `Error: ${error.message}`,
        };
    }
}
async function trackAffiliateConversionManual(options) {
    try {
        console.log(`[Affiliate] Manual tracking: order=${options.orderId}, affRef=${options.affiliateRef}`);
        return await trackConversionInternal(options);
    }
    catch (error) {
        console.error('[Affiliate] Error in manual conversion tracking:', error);
        return {
            success: false,
            message: `Error: ${error.message}`,
        };
    }
}
async function trackConversionInternal(data) {
    const link = await prisma.affLink.findUnique({
        where: { trackingCode: data.affiliateRef },
        include: {
            campaign: true,
            affiliate: true,
        },
    });
    if (!link) {
        console.warn(`[Affiliate] Link not found: ${data.affiliateRef}`);
        return {
            success: false,
            message: `Link not found: ${data.affiliateRef}`,
        };
    }
    if (!link.isActive) {
        return {
            success: false,
            message: 'Link is inactive',
        };
    }
    if (link.campaign.status !== 'ACTIVE') {
        return {
            success: false,
            message: 'Campaign is not active',
        };
    }
    const existing = await prisma.affConversion.findFirst({
        where: {
            orderId: data.orderId,
            linkId: link.id,
        },
    });
    if (existing) {
        console.log(`[Affiliate] Conversion already recorded: ${data.orderId}`);
        return {
            success: false,
            message: 'Conversion already recorded',
        };
    }
    const cookieDuration = 30;
    const clickWindow = new Date(Date.now() - cookieDuration * 24 * 60 * 60 * 1000);
    const recentClick = await prisma.affClick.findFirst({
        where: {
            linkId: link.id,
            clickedAt: {
                gte: clickWindow,
            },
        },
        orderBy: {
            clickedAt: 'desc',
        },
    });
    const commission = calculateCommission(link.campaign, data.saleAmount);
    console.log(`[Affiliate] Commission calculated: ${commission} VND for sale: ${data.saleAmount} VND`);
    const conversion = await prisma.affConversion.create({
        data: {
            linkId: link.id,
            campaignId: link.campaignId,
            affiliateId: link.affiliateId,
            orderId: data.orderId,
            customerEmail: data.customerEmail,
            saleAmount: data.saleAmount,
            commission,
            clickId: recentClick?.id,
            conversionType: data.conversionType || 'sale',
            status: 'PENDING',
            currency: data.currency || 'VND',
            notes: data.metadata ? JSON.stringify(data.metadata) : null,
        },
    });
    console.log(`[Affiliate] Conversion recorded: ${conversion.id}`);
    await Promise.all([
        prisma.affLink.update({
            where: { id: link.id },
            data: {
                totalConversions: { increment: 1 },
                totalEarnings: { increment: commission },
            },
        }),
        prisma.affCampaign.update({
            where: { id: link.campaignId },
            data: {
                totalConversions: { increment: 1 },
                totalRevenue: { increment: data.saleAmount },
                totalCommission: { increment: commission },
            },
        }),
        prisma.affCampaignAffiliate.updateMany({
            where: {
                campaignId: link.campaignId,
                affiliateId: link.affiliateId,
            },
            data: {
                totalConversions: { increment: 1 },
                totalEarnings: { increment: commission },
            },
        }),
    ]);
    console.log(`[Affiliate] ✅ Conversion tracking complete for order: ${data.orderId}`);
    return {
        success: true,
        message: 'Conversion tracked successfully',
        commission,
    };
}
function calculateCommission(campaign, saleAmount) {
    if (campaign.commissionType === 'percentage') {
        const rate = Number(campaign.commissionRate) || 0;
        return Number((saleAmount * (rate / 100)).toFixed(2));
    }
    else if (campaign.commissionType === 'fixed') {
        return Number(campaign.fixedAmount) || 0;
    }
    return 0;
}
//# sourceMappingURL=affiliate-helper.js.map