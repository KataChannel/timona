import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AffConversionStatus } from '@prisma/client';
import * as crypto from 'crypto';

export interface ConversionTrackingData {
  // Required fields
  affiliateRef: string; // From cookie or URL parameter
  orderId: string; // Unique order/transaction ID
  saleAmount: number; // Total sale amount

  // Optional fields
  customerEmail?: string;
  conversionType?: string; // 'sale', 'lead', 'signup', etc.
  currency?: string;
  metadata?: Record<string, any>; // Additional data
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

@Injectable()
export class AffiliateConversionService {
  private readonly logger = new Logger(AffiliateConversionService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Track affiliate conversion from sale/order
   * This is the main entry point for conversion tracking
   */
  async trackConversion(data: ConversionTrackingData): Promise<ConversionResult> {
    this.logger.log(`Tracking conversion for order: ${data.orderId}`);

    try {
      // 1. Find link by tracking code (from cookie or URL param)
      const link = await this.prisma.affLink.findUnique({
        where: { trackingCode: data.affiliateRef },
        include: {
          campaign: true,
          affiliate: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!link) {
        this.logger.warn(`Affiliate link not found: ${data.affiliateRef}`);
        return {
          success: false,
          message: `Affiliate link not found: ${data.affiliateRef}`,
        };
      }

      // 2. Validate link and campaign are active
      if (!link.isActive) {
        this.logger.warn(`Affiliate link is inactive: ${data.affiliateRef}`);
        return {
          success: false,
          message: 'Affiliate link is inactive',
        };
      }

      if (link.campaign.status !== 'ACTIVE') {
        this.logger.warn(`Campaign is not active: ${link.campaign.id}`);
        return {
          success: false,
          message: 'Campaign is not active',
        };
      }

      // 3. Check for duplicate conversion (same orderId)
      const existingConversion = await this.prisma.affConversion.findFirst({
        where: {
          orderId: data.orderId,
          linkId: link.id,
        },
      });

      if (existingConversion) {
        this.logger.warn(`Conversion already recorded for order: ${data.orderId}`);
        return {
          success: false,
          message: `Conversion already recorded for order: ${data.orderId}`,
          conversion: existingConversion,
        };
      }

      // 4. Find recent click from this link (last 30 days by default)
      const cookieDuration = 30; // days
      const clickWindow = new Date(Date.now() - cookieDuration * 24 * 60 * 60 * 1000);
      
      const recentClick = await this.prisma.affClick.findFirst({
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
      const commission = this.calculateCommission(link.campaign, data.saleAmount);

      this.logger.log(`Calculated commission: ${commission} for sale amount: ${data.saleAmount}`);

      // 6. Record conversion
      const conversion = await this.prisma.affConversion.create({
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
          status: AffConversionStatus.PENDING, // Needs merchant approval
          currency: data.currency || 'VND',
          notes: data.metadata ? JSON.stringify(data.metadata) : null,
        },
      });

      this.logger.log(`Conversion recorded: ${conversion.id}`);

      // 7. Update link stats
      await this.prisma.affLink.update({
        where: { id: link.id },
        data: {
          totalConversions: {
            increment: 1,
          },
          totalEarnings: {
            increment: commission,
          },
        },
      });

      // 8. Update campaign stats
      await this.prisma.affCampaign.update({
        where: { id: link.campaignId },
        data: {
          totalConversions: {
            increment: 1,
          },
          totalRevenue: {
            increment: data.saleAmount,
          },
          totalCommission: {
            increment: commission,
          },
        },
      });

      // 9. Update affiliate's campaign join stats
      await this.prisma.affCampaignAffiliate.updateMany({
        where: {
          campaignId: link.campaignId,
          affiliateId: link.affiliateId,
        },
        data: {
          totalConversions: {
            increment: 1,
          },
          totalEarnings: {
            increment: commission,
          },
        },
      });

      this.logger.log(`✅ Conversion tracking complete for order: ${data.orderId}`);

      return {
        success: true,
        conversion,
        commission,
        message: 'Conversion tracked successfully',
        linkId: link.id,
        campaignId: link.campaignId,
        affiliateId: link.affiliateId,
      };
    } catch (error) {
      this.logger.error(`Error tracking conversion: ${error.message}`, error.stack);
      return {
        success: false,
        message: `Error tracking conversion: ${error.message}`,
      };
    }
  }

  /**
   * Track conversion from HTTP request (extracts affiliate ref from cookie)
   */
  async trackConversionFromRequest(
    orderId: string,
    saleAmount: number,
    request: any,
    options?: {
      customerEmail?: string;
      conversionType?: string;
      currency?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<ConversionResult> {
    // Extract affiliate reference from cookie
    const affRef = request.cookies?.['aff_ref'];

    if (!affRef) {
      this.logger.debug('No affiliate reference found in cookies');
      return {
        success: false,
        message: 'No affiliate reference found',
      };
    }

    return this.trackConversion({
      affiliateRef: affRef,
      orderId,
      saleAmount,
      customerEmail: options?.customerEmail,
      conversionType: options?.conversionType,
      currency: options?.currency,
      metadata: options?.metadata,
    });
  }

  /**
   * Calculate commission based on campaign settings
   */
  private calculateCommission(campaign: any, saleAmount: number): number {
    if (campaign.commissionType === 'percentage') {
      const rate = Number(campaign.commissionRate) || 0;
      return Number((saleAmount * (rate / 100)).toFixed(2));
    } else if (campaign.commissionType === 'fixed') {
      return Number(campaign.fixedAmount) || 0;
    }
    return 0;
  }

  /**
   * Approve a pending conversion
   */
  async approveConversion(conversionId: string, approvedBy: string): Promise<any> {
    const conversion = await this.prisma.affConversion.findUnique({
      where: { id: conversionId },
    });

    if (!conversion) {
      throw new BadRequestException('Conversion not found');
    }

    if (conversion.status !== AffConversionStatus.PENDING) {
      throw new BadRequestException(`Conversion is already ${conversion.status.toLowerCase()}`);
    }

    return this.prisma.affConversion.update({
      where: { id: conversionId },
      data: {
        status: AffConversionStatus.APPROVED,
        approvedAt: new Date(),
        validatedBy: approvedBy,
      },
    });
  }

  /**
   * Reject a pending conversion
   */
  async rejectConversion(
    conversionId: string,
    rejectedBy: string,
    reason?: string
  ): Promise<any> {
    const conversion = await this.prisma.affConversion.findUnique({
      where: { id: conversionId },
      include: {
        link: true,
        campaign: true,
      },
    });

    if (!conversion) {
      throw new BadRequestException('Conversion not found');
    }

    if (conversion.status !== AffConversionStatus.PENDING) {
      throw new BadRequestException(`Conversion is already ${conversion.status.toLowerCase()}`);
    }

    // Revert stats when rejecting
    await Promise.all([
      // Revert link stats
      this.prisma.affLink.update({
        where: { id: conversion.linkId },
        data: {
          totalConversions: {
            decrement: 1,
          },
          totalEarnings: {
            decrement: Number(conversion.commission),
          },
        },
      }),

      // Revert campaign stats
      this.prisma.affCampaign.update({
        where: { id: conversion.campaignId },
        data: {
          totalConversions: {
            decrement: 1,
          },
          totalRevenue: {
            decrement: Number(conversion.saleAmount),
          },
          totalCommission: {
            decrement: Number(conversion.commission),
          },
        },
      }),

      // Revert affiliate join stats
      this.prisma.affCampaignAffiliate.updateMany({
        where: {
          campaignId: conversion.campaignId,
          affiliateId: conversion.affiliateId,
        },
        data: {
          totalConversions: {
            decrement: 1,
          },
          totalEarnings: {
            decrement: Number(conversion.commission),
          },
        },
      }),
    ]);

    // Update conversion status
    return this.prisma.affConversion.update({
      where: { id: conversionId },
      data: {
        status: AffConversionStatus.REJECTED,
        rejectedAt: new Date(),
        validatedBy: rejectedBy,
        notes: reason || 'Rejected by merchant',
      },
    });
  }

  /**
   * Get conversion statistics for a campaign
   */
  async getConversionStats(campaignId: string) {
    const [
      total,
      pending,
      approved,
      rejected,
      totalRevenue,
      totalCommission,
    ] = await Promise.all([
      this.prisma.affConversion.count({ where: { campaignId } }),
      this.prisma.affConversion.count({ where: { campaignId, status: 'PENDING' } }),
      this.prisma.affConversion.count({ where: { campaignId, status: 'APPROVED' } }),
      this.prisma.affConversion.count({ where: { campaignId, status: 'REJECTED' } }),
      this.prisma.affConversion.aggregate({
        where: { campaignId, status: 'APPROVED' },
        _sum: { saleAmount: true },
      }),
      this.prisma.affConversion.aggregate({
        where: { campaignId, status: 'APPROVED' },
        _sum: { commission: true },
      }),
    ]);

    return {
      total,
      pending,
      approved,
      rejected,
      approvalRate: total > 0 ? ((approved / total) * 100).toFixed(2) + '%' : '0%',
      totalRevenue: Number(totalRevenue._sum.saleAmount || 0),
      totalCommission: Number(totalCommission._sum.commission || 0),
    };
  }

  /**
   * Get recent conversions
   */
  async getRecentConversions(limit: number = 20) {
    return this.prisma.affConversion.findMany({
      take: limit,
      orderBy: { convertedAt: 'desc' },
      include: {
        link: {
          include: {
            campaign: true,
            affiliate: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }
}
