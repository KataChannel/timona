import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { $Enums } from '@prisma/client';
import {
  CreatePaymentRequestInput,
  ProcessPaymentRequestInput,
  AffPaymentRequestSearchInput,
  AffDateRangeInput,
} from '../graphql/inputs/affiliate.input';

@Injectable()
export class AffiliatePaymentService {
  constructor(private readonly prisma: PrismaService) {}

  // Create payment request (Affiliate only)
  async createPaymentRequest(affiliateUserId: string, input: CreatePaymentRequestInput) {
    const affiliate = await this.prisma.affUser.findUnique({
      where: { userId: affiliateUserId },
    });

    if (!affiliate) {
      throw new BadRequestException('Affiliate profile required');
    }

    if (affiliate.role !== $Enums.AffUserRole.AFFILIATE) {
      throw new BadRequestException('Only affiliates can request payments');
    }

    // Calculate available earnings in the period
    const availableEarnings = await this.prisma.affConversion.aggregate({
      where: {
        affiliateId: affiliate.id,
        status: $Enums.AffConversionStatus.APPROVED,
        convertedAt: {
          gte: input.periodStart,
          lte: input.periodEnd,
        },
        // Exclude already paid conversions
        paidAt: null,
      },
      _sum: {
        commission: true,
      },
    });

    const totalAvailable = Number(availableEarnings._sum.commission) || 0;

    if (input.amount > totalAvailable) {
      throw new BadRequestException(`Insufficient earnings. Available: ${totalAvailable}`);
    }

    // Check for pending payment requests in the same period
    const existingRequest = await this.prisma.affPaymentRequest.findFirst({
      where: {
        affiliateId: affiliate.id,
        status: {
          in: [$Enums.AffPaymentStatus.PENDING, $Enums.AffPaymentStatus.PROCESSING],
        },
        periodStart: input.periodStart,
        periodEnd: input.periodEnd,
      },
    });

    if (existingRequest) {
      throw new BadRequestException('Already have pending payment request for this period');
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

  // Get payment requests with search
  async getPaymentRequests(input: AffPaymentRequestSearchInput, userRole?: $Enums.AffUserRole, userId?: string) {
    const where: any = {};

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

    // Apply user-based filtering
    if (userRole === $Enums.AffUserRole.AFFILIATE && userId) {
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

  // Process payment request (Admin only)
  async processPaymentRequest(adminUserId: string, input: ProcessPaymentRequestInput) {
    const admin = await this.prisma.affUser.findUnique({
      where: { userId: adminUserId },
    });

    if (!admin || admin.role !== $Enums.AffUserRole.ADMIN) {
      throw new BadRequestException('Only admins can process payments');
    }

    const paymentRequest = await this.prisma.affPaymentRequest.findUnique({
      where: { id: input.paymentRequestId },
      include: {
        affiliate: true,
      },
    });

    if (!paymentRequest) {
      throw new NotFoundException('Payment request not found');
    }

    if (paymentRequest.status !== $Enums.AffPaymentStatus.PENDING) {
      throw new BadRequestException('Payment request is not pending');
    }

    const updateData: any = {
      status: input.status,
      processedBy: adminUserId,
      processedAt: new Date(),
      transactionId: input.transactionId,
      adminNotes: input.adminNotes,
    };

    if (input.status === $Enums.AffPaymentStatus.COMPLETED) {
      updateData.completedAt = new Date();
      
      // Mark related conversions as paid
      await this.prisma.affConversion.updateMany({
        where: {
          affiliateId: paymentRequest.affiliateId,
          status: $Enums.AffConversionStatus.APPROVED,
          convertedAt: {
            gte: paymentRequest.periodStart,
            lte: paymentRequest.periodEnd,
          },
          paidAt: null,
        },
        data: {
          status: $Enums.AffConversionStatus.PAID,
          paidAt: new Date(),
        },
      });
    } else if (input.status === $Enums.AffPaymentStatus.FAILED) {
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

  // Get affiliate earnings summary
  async getAffiliateEarnings(affiliateUserId: string, dateRange?: AffDateRangeInput) {
    const affiliate = await this.prisma.affUser.findUnique({
      where: { userId: affiliateUserId },
    });

    if (!affiliate) {
      // Return empty report for users without affiliate profile
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

    const where: any = {
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
            in: [$Enums.AffConversionStatus.APPROVED, $Enums.AffConversionStatus.PAID],
          },
        },
        _sum: { commission: true },
        _count: true,
      }),
      this.prisma.affConversion.aggregate({
        where: {
          ...where,
          status: $Enums.AffConversionStatus.APPROVED,
        },
        _sum: { commission: true },
        _count: true,
      }),
      this.prisma.affConversion.aggregate({
        where: {
          ...where,
          status: $Enums.AffConversionStatus.PAID,
        },
        _sum: { commission: true },
        _count: true,
      }),
      this.prisma.affConversion.aggregate({
        where: {
          ...where,
          status: $Enums.AffConversionStatus.PENDING,
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

  // Get payment history for affiliate
  async getPaymentHistory(affiliateUserId: string, pagination?: { page: number; size: number }) {
    const affiliate = await this.prisma.affUser.findUnique({
      where: { userId: affiliateUserId },
    });

    if (!affiliate) {
      throw new BadRequestException('Affiliate profile required');
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

  // Calculate monthly commission report
  async getMonthlyCommissionReport(merchantUserId: string, year: number, month: number) {
    const merchant = await this.prisma.affUser.findUnique({
      where: { userId: merchantUserId },
    });

    if (!merchant || merchant.role !== $Enums.AffUserRole.MERCHANT) {
      throw new BadRequestException('Only merchants can access commission reports');
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
          in: [$Enums.AffConversionStatus.APPROVED, $Enums.AffConversionStatus.PAID],
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
    }, {} as any);

    return {
      period: { year, month, startDate, endDate },
      commissions,
      summary: Object.values(summary).map((item: any) => ({
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
}