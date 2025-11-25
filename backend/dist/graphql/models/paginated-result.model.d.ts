import { Task } from './task.model';
export declare class PaginationInfo {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}
export declare class TasksPaginatedResult {
    data: Task[];
    meta: PaginationInfo;
}
