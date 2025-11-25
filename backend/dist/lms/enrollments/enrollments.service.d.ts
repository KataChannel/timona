import { PrismaService } from '../../prisma/prisma.service';
export declare class EnrollmentsService {
    private prisma;
    constructor(prisma: PrismaService);
    enroll(userId: string, courseId: string): Promise<{
        course: {
            level: import("@prisma/client").$Enums.CourseLevel;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tags: string[];
            description: string | null;
            title: string;
            slug: string;
            status: import("@prisma/client").$Enums.CourseStatus;
            publishedAt: Date | null;
            thumbnail: string | null;
            categoryId: string | null;
            metaTitle: string | null;
            metaDescription: string | null;
            price: import("@prisma/client/runtime/library").Decimal;
            viewCount: number;
            duration: number | null;
            trailer: string | null;
            whatYouWillLearn: string[];
            requirements: string[];
            targetAudience: string[];
            instructorId: string;
            language: string | null;
            avgRating: number;
            reviewCount: number;
            enrollmentCount: number;
        };
    } & {
        id: string;
        expiresAt: Date | null;
        userId: string;
        status: import("@prisma/client").$Enums.EnrollmentStatus;
        completedAt: Date | null;
        progress: number;
        paymentMethod: string | null;
        courseId: string;
        paymentAmount: import("@prisma/client/runtime/library").Decimal | null;
        enrolledAt: Date;
        lastAccessedAt: Date | null;
    }>;
    getMyEnrollments(userId: string): Promise<({
        course: {
            category: {
                id: string;
                createdAt: Date;
                name: string;
                updatedAt: Date;
                description: string | null;
                parentId: string | null;
                slug: string;
                icon: string | null;
            };
            instructor: {
                id: string;
                username: string;
                firstName: string;
                lastName: string;
                avatar: string;
            };
        } & {
            level: import("@prisma/client").$Enums.CourseLevel;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tags: string[];
            description: string | null;
            title: string;
            slug: string;
            status: import("@prisma/client").$Enums.CourseStatus;
            publishedAt: Date | null;
            thumbnail: string | null;
            categoryId: string | null;
            metaTitle: string | null;
            metaDescription: string | null;
            price: import("@prisma/client/runtime/library").Decimal;
            viewCount: number;
            duration: number | null;
            trailer: string | null;
            whatYouWillLearn: string[];
            requirements: string[];
            targetAudience: string[];
            instructorId: string;
            language: string | null;
            avgRating: number;
            reviewCount: number;
            enrollmentCount: number;
        };
    } & {
        id: string;
        expiresAt: Date | null;
        userId: string;
        status: import("@prisma/client").$Enums.EnrollmentStatus;
        completedAt: Date | null;
        progress: number;
        paymentMethod: string | null;
        courseId: string;
        paymentAmount: import("@prisma/client/runtime/library").Decimal | null;
        enrolledAt: Date;
        lastAccessedAt: Date | null;
    })[]>;
    getEnrollment(userId: string, courseId: string): Promise<{
        course: {
            modules: ({
                lessons: {
                    order: number;
                    type: import("@prisma/client").$Enums.LessonType;
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    description: string | null;
                    title: string;
                    content: string | null;
                    duration: number | null;
                    moduleId: string;
                    isPreview: boolean;
                    isFree: boolean;
                    attachments: import("@prisma/client/runtime/library").JsonValue | null;
                }[];
            } & {
                order: number;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                title: string;
                isPublished: boolean;
                courseId: string;
            })[];
        } & {
            level: import("@prisma/client").$Enums.CourseLevel;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tags: string[];
            description: string | null;
            title: string;
            slug: string;
            status: import("@prisma/client").$Enums.CourseStatus;
            publishedAt: Date | null;
            thumbnail: string | null;
            categoryId: string | null;
            metaTitle: string | null;
            metaDescription: string | null;
            price: import("@prisma/client/runtime/library").Decimal;
            viewCount: number;
            duration: number | null;
            trailer: string | null;
            whatYouWillLearn: string[];
            requirements: string[];
            targetAudience: string[];
            instructorId: string;
            language: string | null;
            avgRating: number;
            reviewCount: number;
            enrollmentCount: number;
        };
        lessonProgress: ({
            lesson: {
                order: number;
                type: import("@prisma/client").$Enums.LessonType;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                title: string;
                content: string | null;
                duration: number | null;
                moduleId: string;
                isPreview: boolean;
                isFree: boolean;
                attachments: import("@prisma/client/runtime/library").JsonValue | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            completedAt: Date | null;
            completed: boolean;
            lessonId: string;
            enrollmentId: string;
            watchTime: number | null;
        })[];
    } & {
        id: string;
        expiresAt: Date | null;
        userId: string;
        status: import("@prisma/client").$Enums.EnrollmentStatus;
        completedAt: Date | null;
        progress: number;
        paymentMethod: string | null;
        courseId: string;
        paymentAmount: import("@prisma/client/runtime/library").Decimal | null;
        enrolledAt: Date;
        lastAccessedAt: Date | null;
    }>;
    updateProgress(userId: string, courseId: string): Promise<{
        id: string;
        expiresAt: Date | null;
        userId: string;
        status: import("@prisma/client").$Enums.EnrollmentStatus;
        completedAt: Date | null;
        progress: number;
        paymentMethod: string | null;
        courseId: string;
        paymentAmount: import("@prisma/client/runtime/library").Decimal | null;
        enrolledAt: Date;
        lastAccessedAt: Date | null;
    }>;
    dropCourse(userId: string, courseId: string): Promise<{
        id: string;
        expiresAt: Date | null;
        userId: string;
        status: import("@prisma/client").$Enums.EnrollmentStatus;
        completedAt: Date | null;
        progress: number;
        paymentMethod: string | null;
        courseId: string;
        paymentAmount: import("@prisma/client/runtime/library").Decimal | null;
        enrolledAt: Date;
        lastAccessedAt: Date | null;
    }>;
    getCourseEnrollments(courseId: string, instructorId?: string): Promise<({
        user: {
            id: string;
            email: string;
            username: string;
            firstName: string;
            lastName: string;
            avatar: string;
        };
    } & {
        id: string;
        expiresAt: Date | null;
        userId: string;
        status: import("@prisma/client").$Enums.EnrollmentStatus;
        completedAt: Date | null;
        progress: number;
        paymentMethod: string | null;
        courseId: string;
        paymentAmount: import("@prisma/client/runtime/library").Decimal | null;
        enrolledAt: Date;
        lastAccessedAt: Date | null;
    })[]>;
    markLessonComplete(userId: string, enrollmentId: string, lessonId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        completedAt: Date | null;
        completed: boolean;
        lessonId: string;
        enrollmentId: string;
        watchTime: number | null;
    }>;
    private updateEnrollmentProgress;
}
