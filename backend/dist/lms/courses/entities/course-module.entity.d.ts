import { Lesson } from './lesson.entity';
export declare class CourseModule {
    id: string;
    title: string;
    description?: string;
    order: number;
    courseId: string;
    lessons?: Lesson[];
    createdAt: Date;
    updatedAt: Date;
}
