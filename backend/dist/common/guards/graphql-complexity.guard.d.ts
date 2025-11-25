import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class GraphQLComplexityGuard implements CanActivate {
    private readonly maxDepth;
    constructor(maxDepth?: number);
    canActivate(context: ExecutionContext): boolean;
}
