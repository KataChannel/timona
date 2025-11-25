import { DynamicCRUDService } from '../../services/dynamic-crud.service';
import { UnifiedCreateInput, UnifiedUpdateInput, UnifiedDeleteInput, UnifiedBulkCreateInput, UnifiedBulkUpdateInput, UnifiedBulkDeleteInput, UnifiedFindManyInput, UnifiedFindByIdInput, UnifiedPaginatedInput } from '../inputs/unified-dynamic.inputs';
export declare enum SupportedModel {
    User = "user",
    Task = "task",
    Post = "post",
    Comment = "comment",
    Page = "page",
    PageBlock = "pageBlock",
    TaskComment = "taskComment",
    Notification = "notification",
    AuditLog = "auditLog",
    Role = "role",
    Permission = "permission"
}
export interface UnifiedResult<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}
export interface UnifiedPaginatedResult<T = any> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}
export declare class UnifiedDynamicResolver {
    private readonly dynamicCrud;
    constructor(dynamicCrud: DynamicCRUDService);
    findMany(modelName: string, input?: UnifiedFindManyInput, context?: any): Promise<any[]>;
    findManyPaginated(modelName: string, input?: UnifiedPaginatedInput, context?: any): Promise<UnifiedPaginatedResult>;
    findById(modelName: string, input: UnifiedFindByIdInput, context?: any): Promise<any>;
    count(modelName: string, where?: any, context?: any): Promise<number>;
    createOne(modelName: string, input: UnifiedCreateInput, context?: any): Promise<any>;
    updateOne(modelName: string, input: UnifiedUpdateInput, context?: any): Promise<any>;
    deleteOne(modelName: string, input: UnifiedDeleteInput, context?: any): Promise<any>;
    createMany(modelName: string, input: UnifiedBulkCreateInput, context?: any): Promise<any>;
    updateMany(modelName: string, input: UnifiedBulkUpdateInput, context?: any): Promise<any>;
    deleteMany(modelName: string, input: UnifiedBulkDeleteInput, context?: any): Promise<any>;
    exists(modelName: string, where: any, context?: any): Promise<boolean>;
    upsert(modelName: string, where: any, create: any, update: any, select?: any, include?: any, context?: any): Promise<any>;
}
