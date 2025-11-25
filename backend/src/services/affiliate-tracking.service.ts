import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { $Enums } from '@prisma/client';
import {
  CreateAffLinkInput,
  UpdateAffLinkInput,
  TrackConversionInput,
  ReviewConversionInput,
  AffLinkSearchInput,
  AffConversionSearchInput,
} from '../graphql/inputs/affiliate.input';
import * as crypto from 'crypto';
import * as UAParser from 'ua-parser-js';

@Injectable()
export class AffiliateTrackingService {
  constructor(private readonly prisma: PrismaService) {}

  // Generate unique tracking code
  private generateTrackingCode(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  // Find link by tracking code (for click tracking endpoint)
  async findLinkByCode(trackingCode: string) {
    return this.prisma.affLink.findUnique({
      where: { trackingCode },
      include: {
        campaign: true,
        affiliate: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  // Create affiliate link
  async createAffiliateLink(affiliateUserId: string, input: CreateAffLinkInput) {
    // Input validation is handled by class-validator decorators
    
    // Get or create affiliate profile
    let affiliate = await this.prisma.affUser.findUnique({
      where: { userId: affiliateUserId },
    });

    if (!affiliate) {
      // Auto-create affiliate profile with default values
      affiliate = await this.prisma.affUser.create({
        data: {
          userId: affiliateUserId,
          role: 'AFFILIATE', // Default role
          isActive: true,
        },
      });
    }

    // Get campaign details
    const campaign = await this.prisma.affCampaign.findUnique({
      where: { id: input.campaignId },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    // Check if affiliate has joined this campaign
    let campaignJoin = await this.prisma.affCampaignAffiliate.findUnique({
      where: {
        campaignId_affiliateId: {
          campaignId: input.campaignId,
          affiliateId: affiliate.id,
        },
      },
    });

    // Auto-join if not already joined
    if (!campaignJoin) {
      const autoApprove = !campaign.requireApproval; // Auto-approve if campaign doesn't require approval
      
      campaignJoin = await this.prisma.affCampaignAffiliate.create({
        data: {
          campaignId: input.campaignId,
          affiliateId: affiliate.id,
          status: autoApprove ? 'approved' : 'pending',
          appliedAt: new Date(),
          approvedAt: autoApprove ? new Date() : null,
        },
      });
    }

    // Check approval status
    if (campaignJoin.status !== 'approved') {
      throw new BadRequestException(
        `Campaign application is ${campaignJoin.status}. ` +
        (campaignJoin.status === 'pending' ? 'Please wait for approval.' : 'Application was rejected.')
      );
    }

    // Generate unique tracking code
    let trackingCode: string;
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      trackingCode = this.generateTrackingCode();
      const existing = await this.prisma.affLink.findUnique({
        where: { trackingCode },
      });
      
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      throw new BadRequestException('Failed to generate unique tracking code');
    }

    return this.prisma.affLink.create({
      data: {
        campaignId: input.campaignId,
        affiliateId: affiliate.id,
        trackingCode,
        originalUrl: input.originalUrl || campaign.productUrl, // Use input or fallback to campaign URL
        customAlias: input.customAlias,
        title: input.title,
        description: input.description,
        utmSource: input.utmSource,
        utmMedium: input.utmMedium,
        utmCampaign: input.utmCampaign,
        utmContent: input.utmContent,
        expiresAt: input.expiresAt,
      },
      include: {
        campaign: true,
        affiliate: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  // Get affiliate links with search
  async getAffiliateLinks(affiliateUserId: string, input?: AffLinkSearchInput) {
    const affiliate = await this.prisma.affUser.findUnique({
      where: { userId: affiliateUserId },
    });

    if (!affiliate) {
      throw new BadRequestException('Affiliate profile required');
    }

    const where: any = {
      affiliateId: affiliate.id,
    };

    if (input?.campaignId) {
      where.campaignId = input.campaignId;
    }

    if (input?.isActive !== undefined) {
      where.isActive = input.isActive;
    }

    const page = input?.pagination?.page || 1;
    const size = input?.pagination?.size || 20;
    const sortBy = input?.pagination?.sortBy || 'createdAt';
    const sortOrder = input?.pagination?.sortOrder || 'desc';

    const [links, total] = await Promise.all([
      this.prisma.affLink.findMany({
        where,
        include: {
          campaign: true,
          _count: {
            select: {
              clicks: true,
              conversions: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip: (page - 1) * size,
        take: size,
      }),
      this.prisma.affLink.count({ where }),
    ]);

    return {
      links,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    };
  }

  // Update affiliate link
  async updateAffiliateLink(linkId: string, affiliateUserId: string, input: UpdateAffLinkInput) {
    const affiliate = await this.prisma.affUser.findUnique({
      where: { userId: affiliateUserId },
    });

    if (!affiliate) {
      throw new BadRequestException('Affiliate profile required');
    }

    const link = await this.prisma.affLink.findFirst({
      where: {
        id: linkId,
        affiliateId: affiliate.id,
      },
    });

    if (!link) {
      throw new NotFoundException('Link not found or access denied');
    }

    return this.prisma.affLink.update({
      where: { id: linkId },
      data: input,
      include: {
        campaign: true,
      },
    });
  }

  // Track click on affiliate link (simplified version for controller)
  async trackClick(clickData: {
    linkId: string;
    ipAddress: string;
    userAgent: string;
    referer?: string | null;
    device?: string;
    browser?: string;
    country?: string | null;
  }) {
    // Create click record
    const click = await this.prisma.affClick.create({
      data: {
        linkId: clickData.linkId,
        ipAddress: clickData.ipAddress,
        userAgent: clickData.userAgent,
        referer: clickData.referer,
        device: clickData.device || 'unknown',
        browser: clickData.browser || 'unknown',
        visitorId: crypto.randomUUID(), // Generate unique visitor ID
      },
    });

    // Update link stats
    await this.prisma.affLink.update({
      where: { id: clickData.linkId },
      data: {
        totalClicks: {
          increment: 1,
        },
      },
    });

    // Get campaign ID to update campaign stats
    const link = await this.prisma.affLink.findUnique({
      where: { id: clickData.linkId },
      select: { campaignId: true },
    });

    if (link) {
      await this.prisma.affCampaign.update({
        where: { id: link.campaignId },
        data: {
          totalClicks: {
            increment: 1,
          },
        },
      });
    }

    return click;
  }

  // Track click on affiliate link from tracking code and request (for controller)
  async trackClickFromRequest(trackingCode: string, request: any) {
    const link = await this.prisma.affLink.findUnique({
      where: { trackingCode },
      include: {
        campaign: true,
      },
    });

    if (!link) {
      throw new NotFoundException('Tracking link not found');
    }

    if (!link.isActive) {
      throw new BadRequestException('Link is inactive');
    }

    if (link.expiresAt && link.expiresAt < new Date()) {
      throw new BadRequestException('Link has expired');
    }

    // Parse user agent for device/browser info
    const parser = new (UAParser as any)(request.headers['user-agent'] || '');
    const result = parser.getResult();

    // Extract visitor info
    const ipAddress = request.ip || request.connection.remoteAddress;
    const userAgent = request.headers['user-agent'];
    const referer = request.headers.referer || request.headers.referrer;

    // Generate or retrieve visitor ID (could use cookies)
    const visitorId = request.headers['x-visitor-id'] || crypto.randomUUID();

    // Create click record
    const click = await this.prisma.affClick.create({
      data: {
        linkId: link.id,
        ipAddress,
        userAgent,
        referer,
        device: result.device.type || 'unknown',
        browser: result.browser.name || 'unknown',
        visitorId,
        sessionId: request.sessionID,
      },
    });

    // Update link stats
    await this.prisma.affLink.update({
      where: { id: link.id },
      data: {
        totalClicks: {
          increment: 1,
        },
      },
    });

    // Update campaign stats
    await this.prisma.affCampaign.update({
      where: { id: link.campaignId },
      data: {
        totalClicks: {
          increment: 1,
        },
      },
    });

    // Build redirect URL with UTM parameters
    let redirectUrl = link.originalUrl;
    const urlParams = new URLSearchParams();

    if (link.utmSource) urlParams.append('utm_source', link.utmSource);
    if (link.utmMedium) urlParams.append('utm_medium', link.utmMedium);
    if (link.utmCampaign) urlParams.append('utm_campaign', link.utmCampaign);
    if (link.utmContent) urlParams.append('utm_content', link.utmContent);
    
    // Add affiliate tracking parameter
    urlParams.append('aff_ref', trackingCode);

    if (urlParams.toString()) {
      const separator = redirectUrl.includes('?') ? '&' : '?';
      redirectUrl += separator + urlParams.toString();
    }

    return {
      clickId: click.id,
      redirectUrl,
      visitorId,
    };
  }

  // Track conversion (webhook from merchant)
  async trackConversion(input: TrackConversionInput) {
    const link = await this.prisma.affLink.findUnique({
      where: { trackingCode: input.trackingCode },
      include: {
        campaign: true,
        affiliate: true,
      },
    });

    if (!link) {
      throw new NotFoundException('Tracking code not found');
    }

    // Calculate commission
    let commission = 0;
    if (link.campaign.commissionType === 'percentage') {
      commission = (Number(link.campaign.commissionRate) / 100) * input.saleAmount;
    } else if (link.campaign.commissionType === 'fixed') {
      commission = Number(link.campaign.fixedAmount) || 0;
    }

    // Create conversion record
    const conversion = await this.prisma.affConversion.create({
      data: {
        linkId: link.id,
        campaignId: link.campaignId,
        affiliateId: link.affiliateId,
        orderId: input.orderId,
        customerEmail: input.customerEmail,
        saleAmount: input.saleAmount,
        commission,
        conversionType: input.conversionType,
        status: $Enums.AffConversionStatus.PENDING,
      },
      include: {
        link: true,
        campaign: true,
        affiliate: {
          include: {
            user: true,
          },
        },
      },
    });

    // Update stats (only increment, don't update totals until approved)
    await Promise.all([
      this.prisma.affLink.update({
        where: { id: link.id },
        data: {
          totalConversions: { increment: 1 },
        },
      }),
      this.prisma.affCampaign.update({
        where: { id: link.campaignId },
        data: {
          totalConversions: { increment: 1 },
        },
      }),
    ]);

    return conversion;
  }

  // Review conversion (admin/merchant)
  async reviewConversion(reviewerUserId: string, input: ReviewConversionInput) {
    const reviewer = await this.prisma.affUser.findUnique({
      where: { userId: reviewerUserId },
    });

    if (!reviewer) {
      throw new BadRequestException('Reviewer must have affiliate profile');
    }

    const conversion = await this.prisma.affConversion.findUnique({
      where: { id: input.conversionId },
      include: {
        campaign: true,
        link: true,
      },
    });

    if (!conversion) {
      throw new NotFoundException('Conversion not found');
    }

    // Check permissions
    const canReview = reviewer.role === $Enums.AffUserRole.ADMIN || 
                     (reviewer.role === $Enums.AffUserRole.MERCHANT && conversion.campaign.creatorId === reviewer.id);

    if (!canReview) {
      throw new BadRequestException('Access denied');
    }

    const updateData: any = {
      status: input.status,
      notes: input.notes,
      validatedBy: reviewerUserId,
    };

    if (input.status === $Enums.AffConversionStatus.APPROVED) {
      updateData.approvedAt = new Date();
      
      // Update campaign and link earnings
      await Promise.all([
        this.prisma.affCampaign.update({
          where: { id: conversion.campaignId },
          data: {
            totalRevenue: { increment: Number(conversion.saleAmount) },
            totalCommission: { increment: Number(conversion.commission) },
          },
        }),
        this.prisma.affLink.update({
          where: { id: conversion.linkId },
          data: {
            totalEarnings: { increment: Number(conversion.commission) },
          },
        }),
      ]);
    } else if (input.status === $Enums.AffConversionStatus.REJECTED) {
      updateData.rejectedAt = new Date();
    }

    return this.prisma.affConversion.update({
      where: { id: input.conversionId },
      data: updateData,
      include: {
        link: true,
        campaign: true,
        affiliate: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  // Get conversions with search
  async getConversions(input: AffConversionSearchInput, userRole?: $Enums.AffUserRole, userId?: string) {
    const where: any = {};

    if (input.campaignId) {
      where.campaignId = input.campaignId;
    }

    if (input.affiliateId) {
      where.affiliateId = input.affiliateId;
    }

    if (input.status) {
      where.status = input.status;
    }

    if (input.dateRange) {
      where.convertedAt = {
        gte: input.dateRange.startDate,
        lte: input.dateRange.endDate,
      };
    }

    // Apply user-based filtering
    if (userRole === $Enums.AffUserRole.AFFILIATE && userId) {
      const affiliate = await this.prisma.affUser.findUnique({ where: { userId } });
      if (affiliate) {
        where.affiliateId = affiliate.id;
      }
    } else if (userRole === $Enums.AffUserRole.MERCHANT && userId) {
      const merchant = await this.prisma.affUser.findUnique({ where: { userId } });
      if (merchant) {
        where.campaign = {
          creatorId: merchant.id,
        };
      }
    }

    const page = input.pagination?.page || 1;
    const size = input.pagination?.size || 20;
    const sortBy = input.pagination?.sortBy || 'convertedAt';
    const sortOrder = input.pagination?.sortOrder || 'desc';

    const [conversions, total] = await Promise.all([
      this.prisma.affConversion.findMany({
        where,
        include: {
          link: true,
          campaign: true,
          affiliate: {
            include: {
              user: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip: (page - 1) * size,
        take: size,
      }),
      this.prisma.affConversion.count({ where }),
    ]);

    return {
      conversions,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    };
  }

  // Generate tracking URL
  generateTrackingUrl(trackingCode: string, baseUrl: string = 'https://yoursite.com'): string {
    return `${baseUrl}/aff/${trackingCode}`;
  }

  // Generate QR code for tracking URL (placeholder - you'd implement with qrcode library)
  async generateQRCode(trackingUrl: string): Promise<string> {
    // This is a placeholder - implement with qrcode library
    return `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`;
  }
}