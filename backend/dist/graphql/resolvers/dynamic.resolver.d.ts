import { Type } from '@nestjs/common';
import { DynamicCRUDService, DynamicFilterInput, BulkCreateInput, BulkUpdateInput, BulkDeleteInput } from '../../services/dynamic-crud.service';
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
export declare function createDynamicResolver<TModel>(modelName: string, ModelClass: Type<TModel>, options?: {
    enableAuth?: boolean;
    enableBulkOps?: boolean;
    enablePagination?: boolean;
    customResolvers?: any[];
}): {
    new (dynamicCRUDService: DynamicCRUDService): {
        readonly dynamicCRUDService: DynamicCRUDService;
        findAll(filter?: DynamicFilterInput, context?: any): Promise<TModel[]>;
        findAllPaginated(filter?: DynamicFilterInput, context?: any): Promise<PaginatedResult<TModel>>;
        findById(id: string, options?: {
            select?: any;
            include?: any;
        }, context?: any): Promise<TModel | null>;
        create(data: any, options?: {
            select?: any;
            include?: any;
        }, context?: any): Promise<TModel>;
        createBulk(input: BulkCreateInput<any>, options?: {
            select?: any;
            include?: any;
        }, context?: any): Promise<any>;
        update(id: string, data: any, options?: {
            select?: any;
            include?: any;
        }, context?: any): Promise<TModel>;
        updateBulk(input: BulkUpdateInput<any>, options?: {
            select?: any;
            include?: any;
        }, context?: any): Promise<any>;
        delete(id: string, options?: {
            select?: any;
            include?: any;
        }, context?: any): Promise<TModel>;
        deleteBulk(input: BulkDeleteInput, options?: {
            select?: any;
            include?: any;
        }, context?: any): Promise<any>;
        upsert(where: any, create: any, update: any, options?: {
            select?: any;
            include?: any;
        }, context?: any): Promise<TModel>;
        count(where?: any, context?: any): Promise<number>;
        exists(where: any, context?: any): Promise<boolean>;
    };
};
export declare class DynamicResolverService {
    private readonly dynamicCRUDService;
    private resolvers;
    constructor(dynamicCRUDService: DynamicCRUDService);
    registerResolver<TModel>(modelName: string, ModelClass: Type<TModel>, options?: {
        enableAuth?: boolean;
        enableBulkOps?: boolean;
        enablePagination?: boolean;
        customResolvers?: any[];
    }): Type<any>;
    getResolver(modelName: string): any;
    getAllResolvers(): any[];
}
export declare class UniversalDynamicResolver {
    private readonly dynamicCRUDService;
    constructor(dynamicCRUDService: DynamicCRUDService);
    dynamicFindMany(modelName: string, filter?: DynamicFilterInput, context?: any): Promise<any[]>;
    dynamicFindById(modelName: string, id: string, options?: {
        select?: any;
        include?: any;
    }, context?: any): Promise<any | null>;
    dynamicCreate(modelName: string, data: any, options?: {
        select?: any;
        include?: any;
    }, context?: any): Promise<any>;
    dynamicUpdate(modelName: string, id: string, data: any, options?: {
        select?: any;
        include?: any;
    }, context?: any): Promise<any>;
    dynamicDelete(modelName: string, id: string, options?: {
        select?: any;
        include?: any;
    }, context?: any): Promise<any>;
    dynamicCreateBulk(modelName: string, input: BulkCreateInput<any>, options?: {
        select?: any;
        include?: any;
    }, context?: any): Promise<any>;
    dynamicUpdateBulk(modelName: string, input: BulkUpdateInput<any>, options?: {
        select?: any;
        include?: any;
    }, context?: any): Promise<any>;
    dynamicDeleteBulk(modelName: string, input: BulkDeleteInput, options?: {
        select?: any;
        include?: any;
    }, context?: any): Promise<any>;
}
