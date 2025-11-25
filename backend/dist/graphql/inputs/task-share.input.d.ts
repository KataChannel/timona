import { SharePermission } from '@prisma/client';
export declare class ShareTaskInput {
    taskId: string;
    sharedWithId: string;
    permission: SharePermission;
}
export declare class UpdateTaskShareInput {
    shareId: string;
    permission: SharePermission;
}
