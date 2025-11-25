import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../services/audit-log.service';
export declare class RBACGuard implements CanActivate {
    private reflector;
    private prisma;
    private auditLogService;
    constructor(reflector: Reflector, prisma: PrismaService, auditLogService: AuditLogService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private checkUserHasRole;
    private checkUserHasPermissions;
    private checkSinglePermission;
}
