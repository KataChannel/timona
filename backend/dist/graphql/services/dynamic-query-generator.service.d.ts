import { PrismaService } from '../../prisma/prisma.service';
export interface DynamicQueryOptions {
    select?: Record<string, any>;
    where?: Record<string, any>;
    include?: Record<string, any>;
    orderBy?: Record<string, any> | Array<Record<string, any>>;
    skip?: number;
    take?: number;
    cursor?: Record<string, any>;
    distinct?: string | string[];
}
export interface DynamicQueryResult {
    data: any;
    count?: number;
    hasMore?: boolean;
    total?: number;
}
export declare class DynamicQueryGeneratorService {
    private prisma;
    private readonly logger;
    private readonly validModels;
    constructor(prisma: PrismaService);
    private validateModel;
    private getModelDelegate;
    findMany(modelName: string, options?: DynamicQueryOptions): Promise<DynamicQueryResult>;
    findUnique(modelName: string, where: Record<string, any>, options?: Omit<DynamicQueryOptions, 'where'>): Promise<any>;
    findFirst(modelName: string, options?: DynamicQueryOptions): Promise<any>;
    create(modelName: string, data: Record<string, any>, options?: Omit<DynamicQueryOptions, 'where'>): Promise<any>;
    createMany(modelName: string, data: Array<Record<string, any>>, skipDuplicates?: boolean): Promise<{
        count: number;
    }>;
    update(modelName: string, where: Record<string, any>, data: Record<string, any>, options?: Omit<DynamicQueryOptions, 'where'>): Promise<any>;
    updateMany(modelName: string, where: Record<string, any>, data: Record<string, any>): Promise<{
        count: number;
    }>;
    upsert(modelName: string, where: Record<string, any>, create: Record<string, any>, update: Record<string, any>, options?: Omit<DynamicQueryOptions, 'where'>): Promise<any>;
    delete(modelName: string, where: Record<string, any>, options?: Omit<DynamicQueryOptions, 'where'>): Promise<any>;
    deleteMany(modelName: string, where: Record<string, any>): Promise<{
        count: number;
    }>;
    count(modelName: string, where?: Record<string, any>): Promise<number>;
    aggregate(modelName: string, options: {
        where?: Record<string, any>;
        _count?: boolean | Record<string, boolean>;
        _sum?: Record<string, boolean>;
        _avg?: Record<string, boolean>;
        _min?: Record<string, boolean>;
        _max?: Record<string, boolean>;
    }): Promise<any>;
    groupBy(modelName: string, options: {
        by: string | string[];
        where?: Record<string, any>;
        having?: Record<string, any>;
        orderBy?: Record<string, any> | Array<Record<string, any>>;
        skip?: number;
        take?: number;
        _count?: boolean | Record<string, boolean>;
        _sum?: Record<string, boolean>;
        _avg?: Record<string, boolean>;
        _min?: Record<string, boolean>;
        _max?: Record<string, boolean>;
    }): Promise<any>;
    executeRaw(query: string, params?: any[]): Promise<any>;
    queryRaw(query: string, params?: any[]): Promise<any>;
    getAvailableModels(): string[];
    modelExists(modelName: string): boolean;
}
