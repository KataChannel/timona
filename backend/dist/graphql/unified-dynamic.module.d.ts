export declare class UnifiedDynamicModule {
}
export { UnifiedDynamicResolver } from './resolvers/unified-dynamic.resolver';
export { DynamicCRUDService } from '../services/dynamic-crud.service';
export * from './inputs/unified-dynamic.inputs';
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
export declare function isSupportedModel(modelName: string): boolean;
export declare function getSupportedModels(): string[];
