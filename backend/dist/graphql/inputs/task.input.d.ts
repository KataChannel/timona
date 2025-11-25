import { TaskCategory, TaskPriority, TaskStatus } from '@prisma/client';
export declare class CreateTaskInput {
    title: string;
    description?: string;
    category: TaskCategory;
    priority: TaskPriority;
    status?: TaskStatus;
    dueDate?: string;
    parentId?: string;
    assignedTo?: string[];
    mentions?: string[];
    tags?: string[];
    order?: number;
}
export declare class UpdateTaskInput {
    id: string;
    title?: string;
    description?: string;
    category?: TaskCategory;
    priority?: TaskPriority;
    status?: TaskStatus;
    dueDate?: string;
}
export declare class TaskFilterInput {
    category?: TaskCategory;
    priority?: TaskPriority;
    status?: TaskStatus;
    search?: string;
    dueBefore?: string;
    dueAfter?: string;
}
