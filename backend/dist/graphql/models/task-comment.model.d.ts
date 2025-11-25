import { User } from './user.model';
export declare class TaskComment {
    id: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    taskId: string;
    user: User;
    userId: string;
    parentId?: string;
    parent?: TaskComment;
    replies?: TaskComment[];
}
