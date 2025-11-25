import { PrismaService } from '../../prisma/prisma.service';
export interface DynamicQueryOptions {
    where?: any;
    select?: any;
    include?: any;
    orderBy?: any;
    skip?: number;
    take?: number;
    cursor?: any;
    distinct?: any;
}
export interface DynamicMutationOptions {
    data: any;
    where?: any;
    select?: any;
    include?: any;
}
export interface BulkOperationOptions {
    data?: any[];
    where?: any;
    skipDuplicates?: boolean;
}
export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}
export interface PaginatedResult<T> {
    data: T[];
    meta: PaginationMeta;
}
export interface OperationResult<T = any> {
    success: boolean;
    data?: T;
    count?: number;
    error?: string;
    meta?: any;
}
export declare class DynamicGraphQLEngine {
    private readonly prisma;
    private readonly logger;
    private readonly cache;
    private readonly CACHE_TTL;
    constructor(prisma: PrismaService);
    private getDelegate;
    getAvailableModels(): string[];
    private validateModel;
    private getCacheKey;
    private setCache;
    private getCache;
    private invalidateCache;
    clearAllCache(): void;
    findMany<T = any>(modelName: string, options?: DynamicQueryOptions): Promise<T[]>;
    findUnique<T = any>(modelName: string, where: any, options?: Omit<DynamicQueryOptions, 'where'>): Promise<T | null>;
    findFirst<T = any>(modelName: string, options?: DynamicQueryOptions): Promise<T | null>;
    findManyPaginated<T = any>(modelName: string, page?: number, limit?: number, options?: DynamicQueryOptions): Promise<PaginatedResult<T>>;
    count(modelName: string, where?: any): Promise<number>;
    aggregate(modelName: string, options: any): Promise<any>;
    groupBy(modelName: string, options: any): Promise<any>;
    create<T = any>(modelName: string, options: DynamicMutationOptions): Promise<T>;
    createMany(modelName: string, options: BulkOperationOptions): Promise<OperationResult>;
    update<T = any>(modelName: string, options: DynamicMutationOptions): Promise<T>;
    updateMany(modelName: string, options: DynamicMutationOptions): Promise<OperationResult>;
    delete<T = any>(modelName: string, where: any, options?: Omit<DynamicQueryOptions, 'where'>): Promise<T>;
    deleteMany(modelName: string, where?: any): Promise<OperationResult>;
    upsert<T = any>(modelName: string, options: {
        where: any;
        create: any;
        update: any;
        select?: any;
        include?: any;
    }): Promise<T>;
    transaction<T = any>(callback: (prisma: any) => Promise<T>): Promise<T>;
    executeRaw(query: string, params?: any[]): Promise<any>;
    queryRaw<T = any>(query: string, params?: any[]): Promise<T[]>;
}
