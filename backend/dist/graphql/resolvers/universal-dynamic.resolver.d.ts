import { DynamicGraphQLEngine } from '../core/dynamic-graphql.engine';
export declare class UniversalDynamicResolver {
    private readonly engine;
    private readonly logger;
    constructor(engine: DynamicGraphQLEngine);
    findMany(model: string, where?: any, orderBy?: any, skip?: number, take?: number, select?: any, include?: any, distinct?: any, context?: any): Promise<any[]>;
    findUnique(model: string, where: any, select?: any, include?: any, context?: any): Promise<any | null>;
    findFirst(model: string, where?: any, orderBy?: any, select?: any, include?: any, context?: any): Promise<any | null>;
    findManyPaginated(model: string, page: number, limit: number, where?: any, orderBy?: any, select?: any, include?: any, context?: any): Promise<any>;
    count(model: string, where?: any, context?: any): Promise<number>;
    aggregate(model: string, options: any, context?: any): Promise<any>;
    groupBy(model: string, options: any, context?: any): Promise<any>;
    createOne(model: string, data: any, select?: any, include?: any, context?: any): Promise<any>;
    createMany(model: string, data: any[], skipDuplicates?: boolean, context?: any): Promise<any>;
    updateOne(model: string, where: any, data: any, select?: any, include?: any, context?: any): Promise<any>;
    updateMany(model: string, where: any, data: any, context?: any): Promise<any>;
    deleteOne(model: string, where: any, select?: any, context?: any): Promise<any>;
    deleteMany(model: string, where?: any, context?: any): Promise<any>;
    upsert(model: string, where: any, create: any, update: any, select?: any, include?: any, context?: any): Promise<any>;
    getAvailableModels(): Promise<string[]>;
    clearCache(): Promise<boolean>;
}
