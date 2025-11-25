import { LessonType } from '@prisma/client';
export declare class CreateLessonInput {
    title: string;
    description?: string;
    type: LessonType;
    content?: string;
    duration?: number;
    moduleId: string;
    order?: number;
}
export declare class UpdateLessonInput {
    id: string;
    title?: string;
    description?: string;
    type?: LessonType;
    content?: string;
    duration?: number;
    order?: number;
}
export declare class ReorderLessonsInput {
    moduleId: string;
    lessonIds: string[];
}
