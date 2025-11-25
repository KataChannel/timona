export declare const OWNERSHIP_KEY = "ownership";
export interface OwnershipRequirement {
    resource: string;
    ownershipField: string | string[];
    paramName?: string;
    allowWithAllScope?: boolean;
}
export declare const RequireOwnership: (requirement: OwnershipRequirement) => import("@nestjs/common").CustomDecorator<string>;
