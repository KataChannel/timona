"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AffiliateTrackingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const crypto = __importStar(require("crypto"));
const UAParser = __importStar(require("ua-parser-js"));
let AffiliateTrackingService = class AffiliateTrackingService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    generateTrackingCode() {
        return crypto.randomBytes(16).toString('hex');
    }
    async findLinkByCode(trackingCode) {
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
    async createAffiliateLink(affiliateUserId, input) {
        let affiliate = await this.prisma.affUser.findUnique({
            where: { userId: affiliateUserId },
        });
        if (!affiliate) {
            affiliate = await this.prisma.affUser.create({
                data: {
                    userId: affiliateUserId,
                    role: 'AFFILIATE',
                    isActive: true,
                },
            });
        }
        const campaign = await this.prisma.affCampaign.findUnique({
            where: { id: input.campaignId },
        });
        if (!campaign) {
            throw new common_1.NotFoundException('Campaign not found');
        }
        let campaignJoin = await this.prisma.affCampaignAffiliate.findUnique({
            where: {
                campaignId_affiliateId: {
                    campaignId: input.campaignId,
                    affiliateId: affiliate.id,
                },
            },
        });
        if (!campaignJoin) {
            const autoApprove = !campaign.requireApproval;
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
        if (campaignJoin.status !== 'approved') {
            throw new common_1.BadRequestException(`Campaign application is ${campaignJoin.status}. ` +
                (campaignJoin.status === 'pending' ? 'Please wait for approval.' : 'Application was rejected.'));
        }
        let trackingCode;
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
            throw new common_1.BadRequestException('Failed to generate unique tracking code');
        }
        return this.prisma.affLink.create({
            data: {
                campaignId: input.campaignId,
                affiliateId: affiliate.id,
                trackingCode,
                originalUrl: input.originalUrl || campaign.productUrl,
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
    async getAffiliateLinks(affiliateUserId, input) {
        const affiliate = await this.prisma.affUser.findUnique({
            where: { userId: affiliateUserId },
        });
        if (!affiliate) {
            throw new common_1.BadRequestException('Affiliate profile required');
        }
        const where = {
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
    async updateAffiliateLink(linkId, affiliateUserId, input) {
        const affiliate = await this.prisma.affUser.findUnique({
            where: { userId: affiliateUserId },
        });
        if (!affiliate) {
            throw new common_1.BadRequestException('Affiliate profile required');
        }
        const link = await this.prisma.affLink.findFirst({
            where: {
                id: linkId,
                affiliateId: affiliate.id,
            },
        });
        if (!link) {
            throw new common_1.NotFoundException('Link not found or access denied');
        }
        return this.prisma.affLink.update({
            where: { id: linkId },
            data: input,
            include: {
                campaign: true,
            },
        });
    }
    async trackClick(clickData) {
        const click = await this.prisma.affClick.create({
            data: {
                linkId: clickData.linkId,
                ipAddress: clickData.ipAddress,
                userAgent: clickData.userAgent,
                referer: clickData.referer,
                device: clickData.device || 'unknown',
                browser: clickData.browser || 'unknown',
                visitorId: crypto.randomUUID(),
            },
        });
        await this.prisma.affLink.update({
            where: { id: clickData.linkId },
            data: {
                totalClicks: {
                    increment: 1,
                },
            },
        });
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
    async trackClickFromRequest(trackingCode, request) {
        const link = await this.prisma.affLink.findUnique({
            where: { trackingCode },
            include: {
                campaign: true,
            },
        });
        if (!link) {
            throw new common_1.NotFoundException('Tracking link not found');
        }
        if (!link.isActive) {
            throw new common_1.BadRequestException('Link is inactive');
        }
        if (link.expiresAt && link.expiresAt < new Date()) {
            throw new common_1.BadRequestException('Link has expired');
        }
        const parser = new UAParser(request.headers['user-agent'] || '');
        const result = parser.getResult();
        const ipAddress = request.ip || request.connection.remoteAddress;
        const userAgent = request.headers['user-agent'];
        const referer = request.headers.referer || request.headers.referrer;
        const visitorId = request.headers['x-visitor-id'] || crypto.randomUUID();
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
        await this.prisma.affLink.update({
            where: { id: link.id },
            data: {
                totalClicks: {
                    increment: 1,
                },
            },
        });
        await this.prisma.affCampaign.update({
            where: { id: link.campaignId },
            data: {
                totalClicks: {
                    increment: 1,
                },
            },
        });
        let redirectUrl = link.originalUrl;
        const urlParams = new URLSearchParams();
        if (link.utmSource)
            urlParams.append('utm_source', link.utmSource);
        if (link.utmMedium)
            urlParams.append('utm_medium', link.utmMedium);
        if (link.utmCampaign)
            urlParams.append('utm_campaign', link.utmCampaign);
        if (link.utmContent)
            urlParams.append('utm_content', link.utmContent);
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
    async trackConversion(input) {
        const link = await this.prisma.affLink.findUnique({
            where: { trackingCode: input.trackingCode },
            include: {
                campaign: true,
                affiliate: true,
            },
        });
        if (!link) {
            throw new common_1.NotFoundException('Tracking code not found');
        }
        let commission = 0;
        if (link.campaign.commissionType === 'percentage') {
            commission = (Number(link.campaign.commissionRate) / 100) * input.saleAmount;
        }
        else if (link.campaign.commissionType === 'fixed') {
            commission = Number(link.campaign.fixedAmount) || 0;
        }
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
                status: client_1.$Enums.AffConversionStatus.PENDING,
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
    async reviewConversion(reviewerUserId, input) {
        const reviewer = await this.prisma.affUser.findUnique({
            where: { userId: reviewerUserId },
        });
        if (!reviewer) {
            throw new common_1.BadRequestException('Reviewer must have affiliate profile');
        }
        const conversion = await this.prisma.affConversion.findUnique({
            where: { id: input.conversionId },
            include: {
                campaign: true,
                link: true,
            },
        });
        if (!conversion) {
            throw new common_1.NotFoundException('Conversion not found');
        }
        const canReview = reviewer.role === client_1.$Enums.AffUserRole.ADMIN ||
            (reviewer.role === client_1.$Enums.AffUserRole.MERCHANT && conversion.campaign.creatorId === reviewer.id);
        if (!canReview) {
            throw new common_1.BadRequestException('Access denied');
        }
        const updateData = {
            status: input.status,
            notes: input.notes,
            validatedBy: reviewerUserId,
        };
        if (input.status === client_1.$Enums.AffConversionStatus.APPROVED) {
            updateData.approvedAt = new Date();
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
        }
        else if (input.status === client_1.$Enums.AffConversionStatus.REJECTED) {
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
    async getConversions(input, userRole, userId) {
        const where = {};
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
        if (userRole === client_1.$Enums.AffUserRole.AFFILIATE && userId) {
            const affiliate = await this.prisma.affUser.findUnique({ where: { userId } });
            if (affiliate) {
                where.affiliateId = affiliate.id;
            }
        }
        else if (userRole === client_1.$Enums.AffUserRole.MERCHANT && userId) {
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
    generateTrackingUrl(trackingCode, baseUrl = 'https://yoursite.com') {
        return `${baseUrl}/aff/${trackingCode}`;
    }
    async generateQRCode(trackingUrl) {
        return `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`;
    }
};
exports.AffiliateTrackingService = AffiliateTrackingService;
exports.AffiliateTrackingService = AffiliateTrackingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AffiliateTrackingService);
//# sourceMappingURL=affiliate-tracking.service.js.map