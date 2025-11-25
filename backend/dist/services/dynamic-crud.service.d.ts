import { PrismaService } from '../prisma/prisma.service';
export interface BulkOperationResult<T> {
    success: boolean;
    count: number;
    data?: T[];
    errors?: Array<{
        index: number;
        error: string;
        data?: any;
    }>;
}
export interface DynamicFilterInput {
    where?: any;
    orderBy?: any;
    skip?: number;
    take?: number;
    select?: any;
    include?: any;
}
export interface BulkCreateInput<T> {
    data: T[];
    skipDuplicates?: boolean;
}
export interface BulkUpdateInput<T> {
    where: any;
    data: Partial<T>;
}
export interface BulkDeleteInput {
    where: any;
}
export declare class DynamicCRUDService {
    private readonly prisma;
    private cache;
    private readonly CACHE_TTL;
    constructor(prisma: PrismaService);
    private getModelDelegate;
    private getCacheKey;
    private setCache;
    private getCache;
    private clearModelCache;
    create<T>(modelName: string, data: any, options?: {
        select?: any;
        include?: any;
    }, context?: any): Promise<T>;
    createBulk<T>(modelName: string, input: BulkCreateInput<T>, options?: {
        select?: any;
        include?: any;
    }, context?: any): Promise<BulkOperationResult<T>>;
    findById<T>(modelName: string, id: string, options?: {
        select?: any;
        include?: any;
    }): Promise<T | null>;
    findMany<T>(modelName: string, input?: DynamicFilterInput | {
        where?: any;
        orderBy?: any;
        skip?: number;
        take?: number;
        select?: any;
        include?: any;
    }): Promise<T[]>;
    findManyWithMeta<T>(modelName: string, filter?: DynamicFilterInput): Promise<{
        data: T[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
        };
    }>;
    update<T>(modelName: string, id: string, data: any, options?: {
        select?: any;
        include?: any;
    }): Promise<T>;
    updateBulk<T>(modelName: string, input: BulkUpdateInput<T>, options?: {
        select?: any;
        include?: any;
    }): Promise<BulkOperationResult<T>>;
    delete<T>(modelName: string, id: string, options?: {
        select?: any;
        include?: any;
    }): Promise<T>;
    deleteBulk<T>(modelName: string, input: BulkDeleteInput, options?: {
        select?: any;
        include?: any;
    }): Promise<BulkOperationResult<T>>;
    count(modelName: string, where?: any): Promise<number>;
    exists(modelName: string, where: any): Promise<boolean>;
    upsert<T>(modelName: string, where: any, create: any, update: any, options?: {
        select?: any;
        include?: any;
    }): Promise<T>;
    findManyPaginated<T>(modelName: string, input?: {
        where?: any;
        orderBy?: any;
        page?: number;
        limit?: number;
        select?: any;
        include?: any;
    }): Promise<{
        data: T[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
        };
    }>;
    bulkCreate<T>(modelName: string, data: any[], options?: {
        skipDuplicates?: boolean;
        select?: any;
        include?: any;
    }, context?: any): Promise<BulkOperationResult<T>>;
    bulkUpdate<T>(modelName: string, where: any, data: any, options?: {
        select?: any;
        include?: any;
    }): Promise<BulkOperationResult<T>>;
    bulkDelete<T>(modelName: string, where: any, options?: {
        select?: any;
        include?: any;
    }): Promise<BulkOperationResult<T>>;
}
