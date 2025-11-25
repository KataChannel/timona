import { CourseLevel, CourseStatus } from '@prisma/client';
export declare class CreateCourseInput {
    title: string;
    description?: string;
    thumbnail?: string;
    trailer?: string;
    price: number;
    level: CourseLevel;
    status: CourseStatus;
    duration?: number;
    metaTitle?: string;
    metaDescription?: string;
    tags: string[];
    whatYouWillLearn: string[];
    requirements: string[];
    targetAudience: string[];
    categoryId?: string;
}
