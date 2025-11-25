import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { RBACService } from '../services/rbac.service';
export declare class OwnershipGuard implements CanActivate {
    private reflector;
    private prisma;
    private rbacService;
    constructor(reflector: Reflector, prisma: PrismaService, rbacService: RBACService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private checkAllScopePermission;
    private methodToAction;
    private fetchResource;
    private checkOwnership;
    private getNestedProperty;
}
