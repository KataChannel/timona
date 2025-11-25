"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AffiliateCampaignService = exports.AffiliateUserService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let AffiliateUserService = class AffiliateUserService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createAffiliateUser(userId, input) {
        const existingProfile = await this.prisma.affUser.findUnique({
            where: { userId },
        });
        if (existingProfile) {
            throw new common_1.BadRequestException('User already has affiliate profile');
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
    async getAffiliateUser(userId) {
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
        if (!profile) {
            return null;
        }
        return profile;
    }
    async updateAffiliateUser(userId, input) {
        const profile = await this.prisma.affUser.findUnique({
            where: { userId },
        });
        if (!profile) {
            throw new common_1.NotFoundException('Affiliate profile not found');
        }
        return this.prisma.affUser.update({
            where: { userId },
            data: input,
            include: {
                user: true,
            },
        });
    }
    async getAllAffiliates(filters) {
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
    async getAffiliateStats(userId) {
        const profile = await this.prisma.affUser.findUnique({
            where: { userId },
        });
        if (!profile) {
            throw new common_1.NotFoundException('Affiliate profile not found');
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
            .filter(conv => conv.status === client_1.$Enums.AffConversionStatus.APPROVED || conv.status === client_1.$Enums.AffConversionStatus.PAID)
            .reduce((sum, conv) => sum + Number(conv.commission), 0) || 0;
        const pendingEarnings = stats?.conversions
            .filter(conv => conv.status === client_1.$Enums.AffConversionStatus.APPROVED)
            .reduce((sum, conv) => sum + Number(conv.commission), 0) || 0;
        const paidEarnings = stats?.conversions
            .filter(conv => conv.status === client_1.$Enums.AffConversionStatus.PAID)
            .reduce((sum, conv) => sum + Number(conv.commission), 0) || 0;
        const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
        const activeCampaigns = stats?.campaignJoins.filter(join => join.campaign.status === client_1.$Enums.AffCampaignStatus.ACTIVE).length || 0;
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
};
exports.AffiliateUserService = AffiliateUserService;
exports.AffiliateUserService = AffiliateUserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AffiliateUserService);
let AffiliateCampaignService = class AffiliateCampaignService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createCampaign(creatorUserId, input) {
        const creator = await this.prisma.affUser.findUnique({
            where: { userId: creatorUserId },
        });
        if (!creator) {
            throw new common_1.BadRequestException('Creator must have affiliate profile');
        }
        if (creator.role !== client_1.$Enums.AffUserRole.MERCHANT) {
            throw new common_1.BadRequestException('Only merchants can create campaigns');
        }
        return this.prisma.affCampaign.create({
            data: {
                ...input,
                creatorId: creator.id,
                status: client_1.$Enums.AffCampaignStatus.DRAFT,
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
    async updateCampaign(campaignId, creatorUserId, input) {
        const creator = await this.prisma.affUser.findUnique({
            where: { userId: creatorUserId },
        });
        if (!creator) {
            throw new common_1.BadRequestException('Creator must have affiliate profile');
        }
        const campaign = await this.prisma.affCampaign.findFirst({
            where: {
                id: campaignId,
                creatorId: creator.id,
            },
        });
        if (!campaign) {
            throw new common_1.NotFoundException('Campaign not found or access denied');
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
    async deleteCampaign(campaignId, creatorUserId) {
        const creator = await this.prisma.affUser.findUnique({
            where: { userId: creatorUserId },
        });
        if (!creator) {
            throw new common_1.BadRequestException('Creator must have affiliate profile');
        }
        const campaign = await this.prisma.affCampaign.findFirst({
            where: {
                id: campaignId,
                creatorId: creator.id,
            },
        });
        if (!campaign) {
            throw new common_1.NotFoundException('Campaign not found or access denied');
        }
        const hasActiveData = await this.prisma.affConversion.count({
            where: {
                campaignId,
                status: {
                    in: ['PENDING', 'APPROVED'],
                },
            },
        });
        if (hasActiveData > 0) {
            throw new common_1.BadRequestException('Cannot delete campaign with pending or approved conversions. Archive it instead.');
        }
        return this.prisma.affCampaign.update({
            where: { id: campaignId },
            data: {
                status: client_1.$Enums.AffCampaignStatus.CANCELLED,
            },
        });
    }
    async getCampaign(campaignId) {
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
            throw new common_1.NotFoundException('Campaign not found');
        }
        return campaign;
    }
    async searchCampaigns(input) {
        const { query, status, creatorId, minCommissionRate, maxCommissionRate, sortBy, sortOrder } = input;
        const page = input.page || 1;
        const size = input.size || 20;
        const where = {};
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
        const orderBy = {};
        if (sortBy) {
            orderBy[sortBy] = sortOrder || 'desc';
        }
        else {
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
    async joinCampaign(affiliateUserId, input) {
        const affiliate = await this.prisma.affUser.findUnique({
            where: { userId: affiliateUserId },
        });
        if (!affiliate) {
            throw new common_1.BadRequestException('Affiliate profile required');
        }
        if (affiliate.role !== client_1.$Enums.AffUserRole.AFFILIATE) {
            throw new common_1.BadRequestException('Only affiliates can join campaigns');
        }
        const campaign = await this.prisma.affCampaign.findUnique({
            where: { id: input.campaignId },
        });
        if (!campaign) {
            throw new common_1.NotFoundException('Campaign not found');
        }
        if (campaign.status !== client_1.$Enums.AffCampaignStatus.ACTIVE) {
            throw new common_1.BadRequestException('Campaign is not active');
        }
        const existingJoin = await this.prisma.affCampaignAffiliate.findUnique({
            where: {
                campaignId_affiliateId: {
                    campaignId: input.campaignId,
                    affiliateId: affiliate.id,
                },
            },
        });
        if (existingJoin) {
            throw new common_1.BadRequestException('Already joined this campaign');
        }
        if (campaign.maxAffiliates) {
            const currentCount = await this.prisma.affCampaignAffiliate.count({
                where: {
                    campaignId: input.campaignId,
                    status: 'approved',
                },
            });
            if (currentCount >= campaign.maxAffiliates) {
                throw new common_1.BadRequestException('Campaign has reached maximum affiliates');
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
    async reviewCampaignApplication(merchantUserId, input) {
        const merchant = await this.prisma.affUser.findUnique({
            where: { userId: merchantUserId },
        });
        if (!merchant || merchant.role !== client_1.$Enums.AffUserRole.MERCHANT) {
            throw new common_1.BadRequestException('Only merchants can review applications');
        }
        const application = await this.prisma.affCampaignAffiliate.findUnique({
            where: { id: input.applicationId },
            include: {
                campaign: true,
            },
        });
        if (!application) {
            throw new common_1.NotFoundException('Application not found');
        }
        if (application.campaign.creatorId !== merchant.id) {
            throw new common_1.BadRequestException('Access denied');
        }
        const updateData = {
            status: input.action,
            reason: input.reason,
        };
        if (input.action === 'approved') {
            updateData.approvedAt = new Date();
        }
        else if (input.action === 'rejected') {
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
    async getMerchantStats(merchantUserId) {
        const merchant = await this.prisma.affUser.findUnique({
            where: { userId: merchantUserId },
        });
        if (!merchant || merchant.role !== client_1.$Enums.AffUserRole.MERCHANT) {
            throw new common_1.BadRequestException('Only merchants can access merchant stats');
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
        const activeCampaigns = campaigns.filter(c => c.status === client_1.$Enums.AffCampaignStatus.ACTIVE).length;
        const totalAffiliates = campaigns.reduce((sum, c) => sum + c.affiliates.length, 0);
        const totalRevenue = campaigns.reduce((sum, c) => sum + Number(c.totalRevenue), 0);
        const totalCommissionPaid = campaigns.reduce((sum, c) => sum + Number(c.totalCommission), 0);
        const allConversions = campaigns.flatMap(c => c.conversions);
        const pendingCommission = allConversions
            .filter(conv => conv.status === client_1.$Enums.AffConversionStatus.APPROVED)
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
};
exports.AffiliateCampaignService = AffiliateCampaignService;
exports.AffiliateCampaignService = AffiliateCampaignService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AffiliateCampaignService);
//# sourceMappingURL=affiliate.service.js.map