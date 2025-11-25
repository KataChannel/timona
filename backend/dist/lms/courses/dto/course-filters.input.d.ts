import { CourseLevel, CourseStatus } from '@prisma/client';
export declare class CourseFiltersInput {
    search?: string;
    categoryId?: string;
    level?: CourseLevel;
    status?: CourseStatus;
    minPrice?: number;
    maxPrice?: number;
    instructorId?: string;
    tags?: string[];
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
}
