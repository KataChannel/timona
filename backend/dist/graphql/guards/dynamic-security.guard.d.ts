import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { $Enums } from '@prisma/client';
export interface DynamicSecurityConfig {
    modelName: string;
    allowedOperations?: Array<'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'BULK_CREATE' | 'BULK_UPDATE' | 'BULK_DELETE'>;
    roleRequirements?: {
        [key in 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'BULK_CREATE' | 'BULK_UPDATE' | 'BULK_DELETE']?: $Enums.UserRoleType[];
    };
    ownershipCheck?: boolean;
    maxBulkSize?: number;
    allowedFields?: {
        create?: string[];
        update?: string[];
        read?: string[];
    };
    restrictedFields?: {
        create?: string[];
        update?: string[];
        read?: string[];
    };
}
export declare const DynamicSecurity: (config: DynamicSecurityConfig) => (target: any, propertyName: string, descriptor: PropertyDescriptor) => void;
export declare class DynamicSecurityGuard implements CanActivate {
    private reflector;
    constructor(reflector: Reflector);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private detectOperation;
    private extractBulkData;
    private checkFieldRestrictions;
    private extractOperationData;
    private checkOwnership;
}
export declare class DynamicValidationService {
    validateInput(modelName: string, operation: string, data: any): void;
    private validateUserInput;
    private validatePostInput;
    private validateTaskInput;
    private validateGenericInput;
    private isValidEmail;
    private checkForSQLInjection;
    private checkForXSS;
    validateBulkInput(modelName: string, operation: string, data: any[], maxSize?: number): void;
}
export declare class DynamicRateLimitService {
    private requestCounts;
    checkRateLimit(userId: string, operation: string, modelName: string): void;
    private getRateLimitWindow;
    private getMaxRequests;
}
export declare const ModelSecurityConfigs: {
    [key: string]: DynamicSecurityConfig;
};
