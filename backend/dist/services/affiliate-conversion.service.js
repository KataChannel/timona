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
var AffiliateConversionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AffiliateConversionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let AffiliateConversionService = AffiliateConversionService_1 = class AffiliateConversionService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(AffiliateConversionService_1.name);
    }
    async trackConversion(data) {
        this.logger.log(`Tracking conversion for order: ${data.orderId}`);
        try {
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
            const cookieDuration = 30;
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
            const commission = this.calculateCommission(link.campaign, data.saleAmount);
            this.logger.log(`Calculated commission: ${commission} for sale amount: ${data.saleAmount}`);
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
                    status: client_1.AffConversionStatus.PENDING,
                    currency: data.currency || 'VND',
                    notes: data.metadata ? JSON.stringify(data.metadata) : null,
                },
            });
            this.logger.log(`Conversion recorded: ${conversion.id}`);
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
        }
        catch (error) {
            this.logger.error(`Error tracking conversion: ${error.message}`, error.stack);
            return {
                success: false,
                message: `Error tracking conversion: ${error.message}`,
            };
        }
    }
    async trackConversionFromRequest(orderId, saleAmount, request, options) {
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
    calculateCommission(campaign, saleAmount) {
        if (campaign.commissionType === 'percentage') {
            const rate = Number(campaign.commissionRate) || 0;
            return Number((saleAmount * (rate / 100)).toFixed(2));
        }
        else if (campaign.commissionType === 'fixed') {
            return Number(campaign.fixedAmount) || 0;
        }
        return 0;
    }
    async approveConversion(conversionId, approvedBy) {
        const conversion = await this.prisma.affConversion.findUnique({
            where: { id: conversionId },
        });
        if (!conversion) {
            throw new common_1.BadRequestException('Conversion not found');
        }
        if (conversion.status !== client_1.AffConversionStatus.PENDING) {
            throw new common_1.BadRequestException(`Conversion is already ${conversion.status.toLowerCase()}`);
        }
        return this.prisma.affConversion.update({
            where: { id: conversionId },
            data: {
                status: client_1.AffConversionStatus.APPROVED,
                approvedAt: new Date(),
                validatedBy: approvedBy,
            },
        });
    }
    async rejectConversion(conversionId, rejectedBy, reason) {
        const conversion = await this.prisma.affConversion.findUnique({
            where: { id: conversionId },
            include: {
                link: true,
                campaign: true,
            },
        });
        if (!conversion) {
            throw new common_1.BadRequestException('Conversion not found');
        }
        if (conversion.status !== client_1.AffConversionStatus.PENDING) {
            throw new common_1.BadRequestException(`Conversion is already ${conversion.status.toLowerCase()}`);
        }
        await Promise.all([
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
        return this.prisma.affConversion.update({
            where: { id: conversionId },
            data: {
                status: client_1.AffConversionStatus.REJECTED,
                rejectedAt: new Date(),
                validatedBy: rejectedBy,
                notes: reason || 'Rejected by merchant',
            },
        });
    }
    async getConversionStats(campaignId) {
        const [total, pending, approved, rejected, totalRevenue, totalCommission,] = await Promise.all([
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
    async getRecentConversions(limit = 20) {
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
};
exports.AffiliateConversionService = AffiliateConversionService;
exports.AffiliateConversionService = AffiliateConversionService = AffiliateConversionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AffiliateConversionService);
//# sourceMappingURL=affiliate-conversion.service.js.map