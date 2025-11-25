import { User } from './user.model';
import { SharePermission } from '@prisma/client';
export declare class TaskShare {
    id: string;
    permission: SharePermission;
    shareToken: string;
    expiresAt?: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    taskId: string;
    sharedByUser: User;
    sharedBy: string;
    sharedWithUser?: User;
    sharedWith?: string;
}
