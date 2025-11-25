import { User } from './user.model';
import { TaskMedia } from './task-media.model';
import { TaskShare } from './task-share.model';
import { TaskComment } from './task-comment.model';
import { TaskCategory, TaskPriority, TaskStatus } from '@prisma/client';
export declare class TaskCount {
    comments: number;
    subtasks: number;
}
export declare class Task {
    id: string;
    title: string;
    description?: string;
    category: TaskCategory;
    priority: TaskPriority;
    status: TaskStatus;
    dueDate?: Date;
    completedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    user: User;
    userId: string;
    parentId?: string;
    parent?: Task;
    subtasks?: Task[];
    progress?: number;
    media?: TaskMedia[];
    shares?: TaskShare[];
    comments?: TaskComment[];
    projectId?: string;
    assignedTo?: string[];
    mentions?: string[];
    tags?: string[];
    order?: number;
    _count?: TaskCount;
}
