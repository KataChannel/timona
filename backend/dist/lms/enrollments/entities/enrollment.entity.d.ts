import { EnrollmentStatus } from '@prisma/client';
import { LessonProgress } from './lesson-progress.entity';
import { Course } from '../../courses/entities/course.entity';
export declare class Enrollment {
    id: string;
    userId: string;
    courseId: string;
    status: EnrollmentStatus;
    progress: number;
    enrolledAt: Date;
    completedAt?: Date;
    expiresAt?: Date;
    lastAccessedAt?: Date;
    course?: Course;
    lessonProgress?: LessonProgress[];
}
