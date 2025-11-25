/**
 * Audit Log Service
 * Service để log tất cả RBAC operations cho security và compliance
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export enum AuditAction {
  // Role Management
  ASSIGN_ROLE = 'ASSIGN_ROLE',
  REMOVE_ROLE = 'REMOVE_ROLE',
  CREATE_ROLE = 'CREATE_ROLE',
  UPDATE_ROLE = 'UPDATE_ROLE',
  DELETE_ROLE = 'DELETE_ROLE',

  // Permission Management
  CREATE_PERMISSION = 'CREATE_PERMISSION',
  UPDATE_PERMISSION = 'UPDATE_PERMISSION',
  DELETE_PERMISSION = 'DELETE_PERMISSION',
  ASSIGN_PERMISSION = 'ASSIGN_PERMISSION',
  REMOVE_PERMISSION = 'REMOVE_PERMISSION',

  // Access Control
  ACCESS_GRANTED = 'ACCESS_GRANTED',
  ACCESS_DENIED = 'ACCESS_DENIED',
  PERMISSION_CHECK = 'PERMISSION_CHECK',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  ADMIN_BYPASS = 'ADMIN_BYPASS',
}

interface AuditLogData {
  action: AuditAction;
  userId: string;
  targetUserId?: string;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  success?: boolean;
  errorMessage?: string;
  severity?: 'info' | 'warn' | 'error' | 'critical';
}

interface GetAuditLogsParams {
  userId?: string;
  action?: AuditAction;
  resourceType?: string;
  success?: boolean;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  pageSize?: number;
}

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  /**
   * Log an RBAC audit event
   */
  async log(data: AuditLogData): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          action: data.action,
          userId: data.userId,
          resourceType: data.resourceType || 'rbac',
          resourceId: data.targetUserId,
          details: data.metadata,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          success: data.success ?? true,
          errorMessage: data.errorMessage,
          severity: data.severity || 'info',
          operationType: 'PERMISSION',
        },
      });
    } catch (error) {
      // Don't throw - audit logging should not break application flow
      console.error('Failed to create audit log:', error);
    }
  }

  /**
   * Log role assignment
   */
  async logRoleAssignment(
    actorId: string,
    targetId: string,
    roleId: string,
    roleName: string,
    expiresAt?: Date,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.log({
      action: AuditAction.ASSIGN_ROLE,
      userId: actorId,
      targetUserId: targetId,
      resourceType: 'role',
      resourceId: roleId,
      metadata: {
        roleId,
        roleName,
        targetUserId: targetId,
        expiresAt: expiresAt?.toISOString(),
      },
      ipAddress,
      userAgent,
      success: true,
      severity: 'info',
    });
  }

  /**
   * Log role removal
   */
  async logRoleRemoval(
    actorId: string,
    targetId: string,
    roleId: string,
    roleName: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.log({
      action: AuditAction.REMOVE_ROLE,
      userId: actorId,
      targetUserId: targetId,
      resourceType: 'role',
      resourceId: roleId,
      metadata: {
        roleId,
        roleName,
        targetUserId: targetId,
      },
      ipAddress,
      userAgent,
      success: true,
      severity: 'info',
    });
  }

  /**
   * Log access granted
   */
  async logAccessGranted(
    userId: string,
    resource: string,
    action: string,
    scope: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.log({
      action: AuditAction.ACCESS_GRANTED,
      userId,
      resourceType: resource,
      metadata: {
        action,
        scope,
      },
      ipAddress,
      userAgent,
      success: true,
      severity: 'info',
    });
  }

  /**
   * Log access denied
   */
  async logAccessDenied(
    userId: string,
    resource: string,
    action: string,
    scope: string,
    reason: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.log({
      action: AuditAction.ACCESS_DENIED,
      userId,
      resourceType: resource,
      metadata: {
        action,
        scope,
        reason,
      },
      ipAddress,
      userAgent,
      success: false,
      errorMessage: reason,
      severity: 'warn',
    });
  }

  /**
   * Log admin bypass (when ADMIN role bypasses permission checks)
   */
  async logAdminBypass(
    userId: string,
    resource: string,
    action: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.log({
      action: AuditAction.ADMIN_BYPASS,
      userId,
      resourceType: resource,
      metadata: {
        action,
      },
      ipAddress,
      userAgent,
      success: true,
      severity: 'info',
    });
  }

  /**
   * Get audit logs with filtering and pagination
   */
  async getAuditLogs(params: GetAuditLogsParams = {}) {
    const {
      userId,
      action,
      resourceType,
      success,
      startDate,
      endDate,
      page = 1,
      pageSize = 50,
    } = params;

    const where: any = {};

    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (resourceType) where.resourceType = resourceType;
    if (success !== undefined) where.success = success;
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = startDate;
      if (endDate) where.timestamp.lte = endDate;
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          timestamp: 'desc',
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      logs,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * Get suspicious activities (multiple access denied in short time)
   */
  async getSuspiciousActivities(days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const deniedAttempts = await this.prisma.auditLog.groupBy({
      by: ['userId', 'resourceType'],
      where: {
        action: AuditAction.ACCESS_DENIED,
        timestamp: {
          gte: startDate,
        },
      },
      _count: {
        id: true,
      },
      having: {
        id: {
          _count: {
            gt: 5, // More than 5 denied attempts
          },
        },
      },
    });

    return deniedAttempts;
  }
}
