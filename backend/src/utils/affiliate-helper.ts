/**
 * Affiliate Conversion Tracking Helper
 * 
 * This utility provides easy integration of affiliate conversion tracking
 * into any part of your application where sales/orders occur.
 * 
 * Usage Examples:
 * 
 * 1. In Order/Invoice Service:
 * ```typescript
 * import { trackAffiliateConversion } from './utils/affiliate-helper';
 * 
 * async completeOrder(orderId: string, amount: number, req: Request) {
 *   // Complete your order logic...
 *   
 *   // Track affiliate conversion
 *   await trackAffiliateConversion({
 *     orderId,
 *     saleAmount: amount,
 *     request: req,
 *     customerEmail: 'customer@example.com',
 *   });
 * }
 * ```
 * 
 * 2. In GraphQL Resolver:
 * ```typescript
 * @Mutation(() => Invoice)
 * async completeInvoice(@Args('id') id: string, @Context() context: any) {
 *   const invoice = await this.invoiceService.complete(id);
 *   
 *   // Track conversion
 *   await trackAffiliateConversionFromContext({
 *     orderId: invoice.id,
 *     saleAmount: invoice.total,
 *     context,
 *   });
 *   
 *   return invoice;
 * }
 * ```
 * 
 * 3. Manual Tracking (with tracking code):
 * ```typescript
 * await trackAffiliateConversionManual({
 *   affiliateRef: 'abc123',
 *   orderId: 'ORDER-001',
 *   saleAmount: 1000000,
 *   customerEmail: 'customer@example.com',
 * });
 * ```
 */

import { PrismaClient } from '@prisma/client';
import { Request } from 'express';

const prisma = new PrismaClient();

export interface TrackConversionOptions {
  orderId: string;
  saleAmount: number;
  request: Request;
  customerEmail?: string;
  conversionType?: string;
  currency?: string;
  metadata?: Record<string, any>;
}

export interface TrackConversionFromContextOptions {
  orderId: string;
  saleAmount: number;
  context: any; // GraphQL context
  customerEmail?: string;
  conversionType?: string;
  currency?: string;
  metadata?: Record<string, any>;
}

export interface TrackConversionManualOptions {
  affiliateRef: string;
  orderId: string;
  saleAmount: number;
  customerEmail?: string;
  conversionType?: string;
  currency?: string;
  metadata?: Record<string, any>;
}

/**
 * Track affiliate conversion from HTTP request (Express)
 * Extracts affiliate cookie from request
 */
export async function trackAffiliateConversion(
  options: TrackConversionOptions
): Promise<{ success: boolean; message: string; commission?: number }> {
  try {
    // Extract affiliate reference from cookie
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
  } catch (error) {
    console.error('[Affiliate] Error tracking conversion:', error);
    return {
      success: false,
      message: `Error: ${error.message}`,
    };
  }
}

/**
 * Track affiliate conversion from GraphQL context
 * Extracts affiliate cookie from context.req
 */
export async function trackAffiliateConversionFromContext(
  options: TrackConversionFromContextOptions
): Promise<{ success: boolean; message: string; commission?: number }> {
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
  } catch (error) {
    console.error('[Affiliate] Error tracking conversion from context:', error);
    return {
      success: false,
      message: `Error: ${error.message}`,
    };
  }
}

/**
 * Track affiliate conversion manually with tracking code
 * Use when you have the tracking code but not the request object
 */
export async function trackAffiliateConversionManual(
  options: TrackConversionManualOptions
): Promise<{ success: boolean; message: string; commission?: number }> {
  try {
    console.log(`[Affiliate] Manual tracking: order=${options.orderId}, affRef=${options.affiliateRef}`);

    return await trackConversionInternal(options);
  } catch (error) {
    console.error('[Affiliate] Error in manual conversion tracking:', error);
    return {
      success: false,
      message: `Error: ${error.message}`,
    };
  }
}

/**
 * Internal conversion tracking logic
 */
async function trackConversionInternal(
  data: TrackConversionManualOptions
): Promise<{ success: boolean; message: string; commission?: number }> {
  // 1. Find link by tracking code
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

  // 2. Validate link and campaign
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

  // 3. Check for duplicate
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

  // 4. Find recent click
  const cookieDuration = 30; // days
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

  // 5. Calculate commission
  const commission = calculateCommission(link.campaign, data.saleAmount);

  console.log(`[Affiliate] Commission calculated: ${commission} VND for sale: ${data.saleAmount} VND`);

  // 6. Record conversion
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
      status: 'PENDING', // Needs merchant approval
      currency: data.currency || 'VND',
      notes: data.metadata ? JSON.stringify(data.metadata) : null,
    },
  });

  console.log(`[Affiliate] Conversion recorded: ${conversion.id}`);

  // 7. Update stats
  await Promise.all([
    // Link stats
    prisma.affLink.update({
      where: { id: link.id },
      data: {
        totalConversions: { increment: 1 },
        totalEarnings: { increment: commission },
      },
    }),

    // Campaign stats
    prisma.affCampaign.update({
      where: { id: link.campaignId },
      data: {
        totalConversions: { increment: 1 },
        totalRevenue: { increment: data.saleAmount },
        totalCommission: { increment: commission },
      },
    }),

    // Affiliate stats
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

/**
 * Calculate commission based on campaign settings
 */
function calculateCommission(campaign: any, saleAmount: number): number {
  if (campaign.commissionType === 'percentage') {
    const rate = Number(campaign.commissionRate) || 0;
    return Number((saleAmount * (rate / 100)).toFixed(2));
  } else if (campaign.commissionType === 'fixed') {
    return Number(campaign.fixedAmount) || 0;
  }
  return 0;
}
