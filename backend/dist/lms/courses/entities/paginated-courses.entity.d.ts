import { Course } from './course.entity';
export declare class PaginatedCourses {
    data: Course[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
