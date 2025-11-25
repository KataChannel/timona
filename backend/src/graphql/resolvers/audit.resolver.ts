import { Resolver, Query, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { EnhancedAuditService } from 'src/services/enhanced-audit.service';
import { AuditLog, PaginatedAuditLogs, AuditLogFilter, AuditLogStats } from './audit-log.types';


@Resolver(() => AuditLog)
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditResolver {
  constructor(private readonly auditService: EnhancedAuditService) {}

  @Query(() => PaginatedAuditLogs)
  @Roles('ADMIN')
  async getAuditLogs(
    @Args('filters', { nullable: true }) filters?: AuditLogFilter,
    @Context() context?: any
  ): Promise<PaginatedAuditLogs> {
    const result = await this.auditService.getAuditLogs({
      userId: filters?.userId,
      resourceType: filters?.resourceType,
      resourceId: filters?.resourceId,
      action: filters?.action,
      operationType: filters?.operationType,
      severity: filters?.severity,
      tags: filters?.tags,
      dateFrom: filters?.dateFrom,
      dateTo: filters?.dateTo,
      correlationId: filters?.correlationId,
      batchId: filters?.batchId,
      sensitiveData: filters?.sensitiveData,
      requiresReview: filters?.requiresReview,
      page: filters?.page,
      limit: filters?.limit
    });

    return {
      logs: result.logs,
      pagination: result.pagination
    };
  }

  @Query(() => PaginatedAuditLogs)
  @Roles('USER')
  async getMyAuditLogs(
    @Args('filters', { nullable: true }) filters?: Omit<AuditLogFilter, 'userId'>,
    @Context() context?: any
  ): Promise<PaginatedAuditLogs> {
    const userId = context.req.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const result = await this.auditService.getAuditLogs({
      ...filters,
      userId,
      // Regular users can't see sensitive data
      sensitiveData: false
    });

    return {
      logs: result.logs,
      pagination: result.pagination
    };
  }

  @Query(() => AuditLogStats)
  @Roles('ADMIN')
  async getAuditStats(
    @Args('userId', { nullable: true }) userId?: string,
    @Args('dateFrom', { nullable: true }) dateFrom?: Date,
    @Args('dateTo', { nullable: true }) dateTo?: Date
  ): Promise<AuditLogStats> {
    return this.auditService.getAuditStats({
      userId,
      dateFrom,
      dateTo
    });
  }

  @Query(() => AuditLogStats)
  @Roles('USER')
  async getMyAuditStats(
    @Args('dateFrom', { nullable: true }) dateFrom?: Date,
    @Args('dateTo', { nullable: true }) dateTo?: Date,
    @Context() context?: any
  ): Promise<AuditLogStats> {
    const userId = context.req.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    return this.auditService.getAuditStats({
      userId,
      dateFrom,
      dateTo
    });
  }
}