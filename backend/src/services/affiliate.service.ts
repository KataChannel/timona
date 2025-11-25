import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { $Enums } from '@prisma/client';
import {
  CreateAffUserInput,
  UpdateAffUserInput,
  CreateCampaignInput,
  UpdateCampaignInput,
  CampaignSearchInput,
  JoinCampaignInput,
  ReviewCampaignApplicationInput,
} from '../graphql/inputs/affiliate.input';

@Injectable()
export class AffiliateUserService {
  constructor(private readonly prisma: PrismaService) {}

  // Create affiliate user profile
  async createAffiliateUser(userId: string, input: CreateAffUserInput) {
    // Check if user already has affiliate profile
    const existingProfile = await this.prisma.affUser.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      throw new BadRequestException('User already has affiliate profile');
    }

    return this.prisma.affUser.create({
      data: {
        userId,
        ...input,
      },
      include: {
        user: true,
      },
    });
  }

  // Get affiliate user profile
  async getAffiliateUser(userId: string): Promise<any | null> {
    const profile = await this.prisma.affUser.findUnique({
      where: { userId },
      include: {
        user: true,
        campaignsCreated: {
          include: {
            affiliates: true,
          },
        },
        campaignJoins: {
          include: {
            campaign: true,
          },
        },
        links: {
          include: {
            campaign: true,
          },
        },
      },
    });

    // Return null if profile doesn't exist (not an error - user may not be an affiliate)
    if (!profile) {
      return null;
    }

    return profile;
  }

  // Update affiliate user profile
  async updateAffiliateUser(userId: string, input: UpdateAffUserInput) {
    const profile = await this.prisma.affUser.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Affiliate profile not found');
    }

    return this.prisma.affUser.update({
      where: { userId },
      data: input,
      include: {
        user: true,
      },
    });
  }

  // Get all affiliates (admin only)
  async getAllAffiliates(filters?: { role?: $Enums.AffUserRole; isActive?: boolean }) {
    return this.prisma.affUser.findMany({
      where: filters,
      include: {
        user: true,
        _count: {
          select: {
            campaignsCreated: true,
            campaignJoins: true,
            links: true,
            conversions: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Get affiliate dashboard stats
  async getAffiliateStats(userId: string) {
    const profile = await this.prisma.affUser.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Affiliate profile not found');
    }

    const stats = await this.prisma.affUser.findUnique({
      where: { id: profile.id },
      include: {
        links: {
          select: {
            totalClicks: true,
            totalConversions: true,
            totalEarnings: true,
            isActive: true,
          },
        },
        conversions: {
          select: {
            commission: true,
            status: true,
          },
        },
        campaignJoins: {
          where: {
            status: 'approved',
          },
          select: {
            campaign: {
              select: {
                status: true,
              },
            },
          },
        },
      },
    });

    const totalClicks = stats?.links.reduce((sum, link) => sum + link.totalClicks, 0) || 0;
    const totalConversions = stats?.links.reduce((sum, link) => sum + link.totalConversions, 0) || 0;
    const totalEarnings = stats?.conversions
      .filter(conv => conv.status === $Enums.AffConversionStatus.APPROVED || conv.status === $Enums.AffConversionStatus.PAID)
      .reduce((sum, conv) => sum + Number(conv.commission), 0) || 0;
    
    const pendingEarnings = stats?.conversions
      .filter(conv => conv.status === $Enums.AffConversionStatus.APPROVED)
      .reduce((sum, conv) => sum + Number(conv.commission), 0) || 0;
    
    const paidEarnings = stats?.conversions
      .filter(conv => conv.status === $Enums.AffConversionStatus.PAID)
      .reduce((sum, conv) => sum + Number(conv.commission), 0) || 0;

    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
    const activeCampaigns = stats?.campaignJoins.filter(join => join.campaign.status === $Enums.AffCampaignStatus.ACTIVE).length || 0;
    const activeLinks = stats?.links.filter(link => link.isActive).length || 0;

    return {
      totalClicks,
      totalConversions,
      totalEarnings,
      pendingEarnings,
      paidEarnings,
      conversionRate,
      activeCampaigns,
      activeLinks,
    };
  }
}

@Injectable()
export class AffiliateCampaignService {
  constructor(private readonly prisma: PrismaService) {}

  // Create campaign (Merchant only)
  async createCampaign(creatorUserId: string, input: CreateCampaignInput) {
    // Get creator's affiliate profile
    const creator = await this.prisma.affUser.findUnique({
      where: { userId: creatorUserId },
    });

    if (!creator) {
      throw new BadRequestException('Creator must have affiliate profile');
    }

    if (creator.role !== $Enums.AffUserRole.MERCHANT) {
      throw new BadRequestException('Only merchants can create campaigns');
    }

    return this.prisma.affCampaign.create({
      data: {
        ...input,
        creatorId: creator.id,
        status: $Enums.AffCampaignStatus.DRAFT,
      },
      include: {
        creator: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  // Update campaign
  async updateCampaign(campaignId: string, creatorUserId: string, input: UpdateCampaignInput) {
    const creator = await this.prisma.affUser.findUnique({
      where: { userId: creatorUserId },
    });

    if (!creator) {
      throw new BadRequestException('Creator must have affiliate profile');
    }

    const campaign = await this.prisma.affCampaign.findFirst({
      where: {
        id: campaignId,
        creatorId: creator.id,
      },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found or access denied');
    }

    return this.prisma.affCampaign.update({
      where: { id: campaignId },
      data: input,
      include: {
        creator: {
          include: {
            user: true,
          },
        },
        affiliates: true,
      },
    });
  }

  // Delete campaign
  async deleteCampaign(campaignId: string, creatorUserId: string) {
    const creator = await this.prisma.affUser.findUnique({
      where: { userId: creatorUserId },
    });

    if (!creator) {
      throw new BadRequestException('Creator must have affiliate profile');
    }

    const campaign = await this.prisma.affCampaign.findFirst({
      where: {
        id: campaignId,
        creatorId: creator.id,
      },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found or access denied');
    }

    // Check if campaign has active conversions or pending payouts
    const hasActiveData = await this.prisma.affConversion.count({
      where: {
        campaignId,
        status: {
          in: ['PENDING', 'APPROVED'],
        },
      },
    });

    if (hasActiveData > 0) {
      throw new BadRequestException(
        'Cannot delete campaign with pending or approved conversions. Archive it instead.'
      );
    }

    // Soft delete by marking as cancelled instead of hard delete
    return this.prisma.affCampaign.update({
      where: { id: campaignId },
      data: {
        status: $Enums.AffCampaignStatus.CANCELLED,
      },
    });
  }

  // Get campaign by ID
  async getCampaign(campaignId: string) {
    const campaign = await this.prisma.affCampaign.findUnique({
      where: { id: campaignId },
      include: {
        creator: {
          include: {
            user: true,
          },
        },
        affiliates: {
          include: {
            affiliate: {
              include: {
                user: true,
              },
            },
          },
        },
        links: true,
        conversions: true,
      },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    return campaign;
  }

  // Search campaigns with filters
  async searchCampaigns(input: CampaignSearchInput) {
    const { query, status, creatorId, minCommissionRate, maxCommissionRate, sortBy, sortOrder } = input;
    const page = input.page || 1;
    const size = input.size || 20;

    const where: any = {};

    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { productName: { contains: query, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (creatorId) {
      where.creatorId = creatorId;
    }

    if (minCommissionRate !== undefined) {
      where.commissionRate = { gte: minCommissionRate };
    }

    if (maxCommissionRate !== undefined) {
      where.commissionRate = { ...where.commissionRate, lte: maxCommissionRate };
    }

    const orderBy: any = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder || 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const [campaigns, total] = await Promise.all([
      this.prisma.affCampaign.findMany({
        where,
        include: {
          creator: {
            include: {
              user: true,
            },
          },
          _count: {
            select: {
              affiliates: true,
              links: true,
              conversions: true,
            },
          },
        },
        orderBy,
        skip: (page - 1) * size,
        take: size,
      }),
      this.prisma.affCampaign.count({ where }),
    ]);

    return {
      campaigns,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    };
  }

  // Join campaign (Affiliate only)
  async joinCampaign(affiliateUserId: string, input: JoinCampaignInput) {
    const affiliate = await this.prisma.affUser.findUnique({
      where: { userId: affiliateUserId },
    });

    if (!affiliate) {
      throw new BadRequestException('Affiliate profile required');
    }

    if (affiliate.role !== $Enums.AffUserRole.AFFILIATE) {
      throw new BadRequestException('Only affiliates can join campaigns');
    }

    const campaign = await this.prisma.affCampaign.findUnique({
      where: { id: input.campaignId },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    if (campaign.status !== $Enums.AffCampaignStatus.ACTIVE) {
      throw new BadRequestException('Campaign is not active');
    }

    // Check if already joined
    const existingJoin = await this.prisma.affCampaignAffiliate.findUnique({
      where: {
        campaignId_affiliateId: {
          campaignId: input.campaignId,
          affiliateId: affiliate.id,
        },
      },
    });

    if (existingJoin) {
      throw new BadRequestException('Already joined this campaign');
    }

    // Check max affiliates limit
    if (campaign.maxAffiliates) {
      const currentCount = await this.prisma.affCampaignAffiliate.count({
        where: {
          campaignId: input.campaignId,
          status: 'approved',
        },
      });

      if (currentCount >= campaign.maxAffiliates) {
        throw new BadRequestException('Campaign has reached maximum affiliates');
      }
    }

    return this.prisma.affCampaignAffiliate.create({
      data: {
        campaignId: input.campaignId,
        affiliateId: affiliate.id,
        status: campaign.requireApproval ? 'pending' : 'approved',
        reason: input.message,
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

  // Review campaign application (Merchant only)
  async reviewCampaignApplication(merchantUserId: string, input: ReviewCampaignApplicationInput) {
    const merchant = await this.prisma.affUser.findUnique({
      where: { userId: merchantUserId },
    });

    if (!merchant || merchant.role !== $Enums.AffUserRole.MERCHANT) {
      throw new BadRequestException('Only merchants can review applications');
    }

    const application = await this.prisma.affCampaignAffiliate.findUnique({
      where: { id: input.applicationId },
      include: {
        campaign: true,
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.campaign.creatorId !== merchant.id) {
      throw new BadRequestException('Access denied');
    }

    const updateData: any = {
      status: input.action,
      reason: input.reason,
    };

    if (input.action === 'approved') {
      updateData.approvedAt = new Date();
    } else if (input.action === 'rejected') {
      updateData.rejectedAt = new Date();
    }

    return this.prisma.affCampaignAffiliate.update({
      where: { id: input.applicationId },
      data: updateData,
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

  // Get merchant stats
  async getMerchantStats(merchantUserId: string) {
    const merchant = await this.prisma.affUser.findUnique({
      where: { userId: merchantUserId },
    });

    if (!merchant || merchant.role !== $Enums.AffUserRole.MERCHANT) {
      throw new BadRequestException('Only merchants can access merchant stats');
    }

    const stats = await this.prisma.affUser.findUnique({
      where: { id: merchant.id },
      include: {
        campaignsCreated: {
          include: {
            affiliates: {
              where: {
                status: 'approved',
              },
            },
            conversions: true,
            _count: {
              select: {
                affiliates: true,
              },
            },
          },
        },
      },
    });

    const campaigns = stats?.campaignsCreated || [];

    const totalCampaigns = campaigns.length;
    const activeCampaigns = campaigns.filter(c => c.status === $Enums.AffCampaignStatus.ACTIVE).length;
    const totalAffiliates = campaigns.reduce((sum, c) => sum + c.affiliates.length, 0);
    const totalRevenue = campaigns.reduce((sum, c) => sum + Number(c.totalRevenue), 0);
    const totalCommissionPaid = campaigns.reduce((sum, c) => sum + Number(c.totalCommission), 0);
    
    const allConversions = campaigns.flatMap(c => c.conversions);
    const pendingCommission = allConversions
      .filter(conv => conv.status === $Enums.AffConversionStatus.APPROVED)
      .reduce((sum, conv) => sum + Number(conv.commission), 0);

    const totalClicks = campaigns.reduce((sum, c) => sum + c.totalClicks, 0);
    const totalConversions = campaigns.reduce((sum, c) => sum + c.totalConversions, 0);
    const averageConversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

    return {
      totalCampaigns,
      activeCampaigns,
      totalAffiliates,
      totalRevenue,
      totalCommissionPaid,
      pendingCommission,
      totalClicks,
      totalConversions,
      averageConversionRate,
    };
  }
}