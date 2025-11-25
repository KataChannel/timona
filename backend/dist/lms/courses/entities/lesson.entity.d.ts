import { LessonType } from '@prisma/client';
import { Quiz } from '../../quizzes/entities/quiz.entity';
export declare class Lesson {
    id: string;
    title: string;
    description?: string;
    type: LessonType;
    content?: string;
    duration?: number;
    order: number;
    moduleId: string;
    isFree: boolean;
    quizzes?: Quiz[];
    createdAt: Date;
    updatedAt: Date;
}
