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
exports.AffiliatePaymentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let AffiliatePaymentService = class AffiliatePaymentService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createPaymentRequest(affiliateUserId, input) {
        const affiliate = await this.prisma.affUser.findUnique({
            where: { userId: affiliateUserId },
        });
        if (!affiliate) {
            throw new common_1.BadRequestException('Affiliate profile required');
        }
        if (affiliate.role !== client_1.$Enums.AffUserRole.AFFILIATE) {
            throw new common_1.BadRequestException('Only affiliates can request payments');
        }
        const availableEarnings = await this.prisma.affConversion.aggregate({
            where: {
                affiliateId: affiliate.id,
                status: client_1.$Enums.AffConversionStatus.APPROVED,
                convertedAt: {
                    gte: input.periodStart,
                    lte: input.periodEnd,
                },
                paidAt: null,
            },
            _sum: {
                commission: true,
            },
        });
        const totalAvailable = Number(availableEarnings._sum.commission) || 0;
        if (input.amount > totalAvailable) {
            throw new common_1.BadRequestException(`Insufficient earnings. Available: ${totalAvailable}`);
        }
        const existingRequest = await this.prisma.affPaymentRequest.findFirst({
            where: {
                affiliateId: affiliate.id,
                status: {
                    in: [client_1.$Enums.AffPaymentStatus.PENDING, client_1.$Enums.AffPaymentStatus.PROCESSING],
                },
                periodStart: input.periodStart,
                periodEnd: input.periodEnd,
            },
        });
        if (existingRequest) {
            throw new common_1.BadRequestException('Already have pending payment request for this period');
        }
        return this.prisma.affPaymentRequest.create({
            data: {
                affiliateId: affiliate.id,
                amount: input.amount,
                paymentMethod: input.paymentMethod,
                accountDetails: input.accountDetails,
                periodStart: input.periodStart,
                periodEnd: input.periodEnd,
                notes: input.notes,
            },
            include: {
                affiliate: {
                    include: {
                        user: true,
                    },
                },
            },
        });
    }
    async getPaymentRequests(input, userRole, userId) {
        const where = {};
        if (input.affiliateId) {
            where.affiliateId = input.affiliateId;
        }
        if (input.status) {
            where.status = input.status;
        }
        if (input.dateRange) {
            where.requestedAt = {
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
        const page = input.pagination?.page || 1;
        const size = input.pagination?.size || 20;
        const sortBy = input.pagination?.sortBy || 'requestedAt';
        const sortOrder = input.pagination?.sortOrder || 'desc';
        const [requests, total] = await Promise.all([
            this.prisma.affPaymentRequest.findMany({
                where,
                include: {
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
            this.prisma.affPaymentRequest.count({ where }),
        ]);
        return {
            requests,
            total,
            page,
            size,
            totalPages: Math.ceil(total / size),
        };
    }
    async processPaymentRequest(adminUserId, input) {
        const admin = await this.prisma.affUser.findUnique({
            where: { userId: adminUserId },
        });
        if (!admin || admin.role !== client_1.$Enums.AffUserRole.ADMIN) {
            throw new common_1.BadRequestException('Only admins can process payments');
        }
        const paymentRequest = await this.prisma.affPaymentRequest.findUnique({
            where: { id: input.paymentRequestId },
            include: {
                affiliate: true,
            },
        });
        if (!paymentRequest) {
            throw new common_1.NotFoundException('Payment request not found');
        }
        if (paymentRequest.status !== client_1.$Enums.AffPaymentStatus.PENDING) {
            throw new common_1.BadRequestException('Payment request is not pending');
        }
        const updateData = {
            status: input.status,
            processedBy: adminUserId,
            processedAt: new Date(),
            transactionId: input.transactionId,
            adminNotes: input.adminNotes,
        };
        if (input.status === client_1.$Enums.AffPaymentStatus.COMPLETED) {
            updateData.completedAt = new Date();
            await this.prisma.affConversion.updateMany({
                where: {
                    affiliateId: paymentRequest.affiliateId,
                    status: client_1.$Enums.AffConversionStatus.APPROVED,
                    convertedAt: {
                        gte: paymentRequest.periodStart,
                        lte: paymentRequest.periodEnd,
                    },
                    paidAt: null,
                },
                data: {
                    status: client_1.$Enums.AffConversionStatus.PAID,
                    paidAt: new Date(),
                },
            });
        }
        else if (input.status === client_1.$Enums.AffPaymentStatus.FAILED) {
            updateData.failedAt = new Date();
        }
        return this.prisma.affPaymentRequest.update({
            where: { id: input.paymentRequestId },
            data: updateData,
            include: {
                affiliate: {
                    include: {
                        user: true,
                    },
                },
            },
        });
    }
    async getAffiliateEarnings(affiliateUserId, dateRange) {
        const affiliate = await this.prisma.affUser.findUnique({
            where: { userId: affiliateUserId },
        });
        if (!affiliate) {
            return {
                totalConversions: 0,
                totalEarnings: 0,
                pendingConversions: 0,
                pendingEarnings: 0,
                approvedConversions: 0,
                approvedEarnings: 0,
                paidConversions: 0,
                paidEarnings: 0,
                availableForWithdrawal: 0,
            };
        }
        const where = {
            affiliateId: affiliate.id,
        };
        if (dateRange) {
            where.convertedAt = {
                gte: dateRange.startDate,
                lte: dateRange.endDate,
            };
        }
        const [totalEarnings, approvedEarnings, paidEarnings, pendingEarnings] = await Promise.all([
            this.prisma.affConversion.aggregate({
                where: {
                    ...where,
                    status: {
                        in: [client_1.$Enums.AffConversionStatus.APPROVED, client_1.$Enums.AffConversionStatus.PAID],
                    },
                },
                _sum: { commission: true },
                _count: true,
            }),
            this.prisma.affConversion.aggregate({
                where: {
                    ...where,
                    status: client_1.$Enums.AffConversionStatus.APPROVED,
                },
                _sum: { commission: true },
                _count: true,
            }),
            this.prisma.affConversion.aggregate({
                where: {
                    ...where,
                    status: client_1.$Enums.AffConversionStatus.PAID,
                },
                _sum: { commission: true },
                _count: true,
            }),
            this.prisma.affConversion.aggregate({
                where: {
                    ...where,
                    status: client_1.$Enums.AffConversionStatus.PENDING,
                },
                _sum: { commission: true },
                _count: true,
            }),
        ]);
        return {
            totalEarnings: Number(totalEarnings._sum.commission) || 0,
            totalConversions: totalEarnings._count,
            approvedEarnings: Number(approvedEarnings._sum.commission) || 0,
            approvedConversions: approvedEarnings._count,
            paidEarnings: Number(paidEarnings._sum.commission) || 0,
            paidConversions: paidEarnings._count,
            pendingEarnings: Number(pendingEarnings._sum.commission) || 0,
            pendingConversions: pendingEarnings._count,
            availableForWithdrawal: Number(approvedEarnings._sum.commission) || 0,
        };
    }
    async getPaymentHistory(affiliateUserId, pagination) {
        const affiliate = await this.prisma.affUser.findUnique({
            where: { userId: affiliateUserId },
        });
        if (!affiliate) {
            throw new common_1.BadRequestException('Affiliate profile required');
        }
        const page = pagination?.page || 1;
        const size = pagination?.size || 20;
        const [payments, total] = await Promise.all([
            this.prisma.affPaymentRequest.findMany({
                where: {
                    affiliateId: affiliate.id,
                },
                orderBy: {
                    requestedAt: 'desc',
                },
                skip: (page - 1) * size,
                take: size,
            }),
            this.prisma.affPaymentRequest.count({
                where: {
                    affiliateId: affiliate.id,
                },
            }),
        ]);
        return {
            payments,
            total,
            page,
            size,
            totalPages: Math.ceil(total / size),
        };
    }
    async getMonthlyCommissionReport(merchantUserId, year, month) {
        const merchant = await this.prisma.affUser.findUnique({
            where: { userId: merchantUserId },
        });
        if (!merchant || merchant.role !== client_1.$Enums.AffUserRole.MERCHANT) {
            throw new common_1.BadRequestException('Only merchants can access commission reports');
        }
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);
        const commissions = await this.prisma.affConversion.findMany({
            where: {
                campaign: {
                    creatorId: merchant.id,
                },
                convertedAt: {
                    gte: startDate,
                    lte: endDate,
                },
                status: {
                    in: [client_1.$Enums.AffConversionStatus.APPROVED, client_1.$Enums.AffConversionStatus.PAID],
                },
            },
            include: {
                affiliate: {
                    include: {
                        user: true,
                    },
                },
                campaign: true,
            },
            orderBy: {
                convertedAt: 'desc',
            },
        });
        const summary = commissions.reduce((acc, conv) => {
            const affiliateId = conv.affiliateId;
            if (!acc[affiliateId]) {
                acc[affiliateId] = {
                    affiliate: conv.affiliate,
                    totalCommission: 0,
                    totalSales: 0,
                    conversions: 0,
                    campaigns: new Set(),
                };
            }
            acc[affiliateId].totalCommission += Number(conv.commission);
            acc[affiliateId].totalSales += Number(conv.saleAmount);
            acc[affiliateId].conversions++;
            acc[affiliateId].campaigns.add(conv.campaign.name);
            return acc;
        }, {});
        return {
            period: { year, month, startDate, endDate },
            commissions,
            summary: Object.values(summary).map((item) => ({
                ...item,
                campaigns: Array.from(item.campaigns),
            })),
            totals: {
                totalCommission: commissions.reduce((sum, conv) => sum + Number(conv.commission), 0),
                totalSales: commissions.reduce((sum, conv) => sum + Number(conv.saleAmount), 0),
                totalConversions: commissions.length,
                uniqueAffiliates: Object.keys(summary).length,
            },
        };
    }
};
exports.AffiliatePaymentService = AffiliatePaymentService;
exports.AffiliatePaymentService = AffiliatePaymentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AffiliatePaymentService);
//# sourceMappingURL=affiliate-payment.service.js.map