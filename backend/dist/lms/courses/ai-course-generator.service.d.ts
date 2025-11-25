import { PrismaService } from '../../prisma/prisma.service';
interface GenerateCourseFromPromptInput {
    prompt: string;
    categoryId?: string;
    instructorId: string;
}
interface GenerateCourseFromDocumentsInput {
    documentIds: string[];
    categoryId?: string;
    additionalPrompt?: string;
    instructorId: string;
    title?: string;
    description?: string;
    level?: string;
    learningObjectives?: string[];
    whatYouWillLearn?: string[];
    requirements?: string[];
    targetAudience?: string[];
    additionalContext?: string;
}
export declare class AICourseGeneratorService {
    private prisma;
    private genAI;
    private model;
    constructor(prisma: PrismaService);
    generateCourseFromPrompt(input: GenerateCourseFromPromptInput): Promise<{
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
            password: string | null;
            id: string;
            isVerified: boolean;
            createdAt: Date;
            isActive: boolean;
            email: string | null;
            username: string;
            phone: string | null;
            firstName: string | null;
            lastName: string | null;
            avatar: string | null;
            roleType: import("@prisma/client").$Enums.UserRoleType;
            isTwoFactorEnabled: boolean;
            address: string | null;
            city: string | null;
            district: string | null;
            ward: string | null;
            failedLoginAttempts: number;
            lockedUntil: Date | null;
            lastLoginAt: Date | null;
            updatedAt: Date;
            departmentId: string | null;
        };
        modules: ({
            lessons: ({
                quizzes: ({
                    questions: ({
                        answers: {
                            order: number;
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            text: string;
                            questionId: string;
                            isCorrect: boolean;
                        }[];
                    } & {
                        question: string;
                        order: number;
                        type: import("@prisma/client").$Enums.QuestionType;
                        id: string;
                        createdAt: Date;
                        updatedAt: Date;
                        points: number;
                        explanation: string | null;
                        mediaUrl: string | null;
                        quizId: string;
                    })[];
                } & {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    description: string | null;
                    title: string;
                    isRequired: boolean;
                    lessonId: string;
                    passingScore: number;
                    timeLimit: number | null;
                    maxAttempts: number | null;
                })[];
            } & {
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
            })[];
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
    }>;
    generateCourseFromDocuments(input: GenerateCourseFromDocumentsInput): Promise<{
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
            password: string | null;
            id: string;
            isVerified: boolean;
            createdAt: Date;
            isActive: boolean;
            email: string | null;
            username: string;
            phone: string | null;
            firstName: string | null;
            lastName: string | null;
            avatar: string | null;
            roleType: import("@prisma/client").$Enums.UserRoleType;
            isTwoFactorEnabled: boolean;
            address: string | null;
            city: string | null;
            district: string | null;
            ward: string | null;
            failedLoginAttempts: number;
            lockedUntil: Date | null;
            lastLoginAt: Date | null;
            updatedAt: Date;
            departmentId: string | null;
        };
        modules: ({
            lessons: ({
                quizzes: ({
                    questions: ({
                        answers: {
                            order: number;
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            text: string;
                            questionId: string;
                            isCorrect: boolean;
                        }[];
                    } & {
                        question: string;
                        order: number;
                        type: import("@prisma/client").$Enums.QuestionType;
                        id: string;
                        createdAt: Date;
                        updatedAt: Date;
                        points: number;
                        explanation: string | null;
                        mediaUrl: string | null;
                        quizId: string;
                    })[];
                } & {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    description: string | null;
                    title: string;
                    isRequired: boolean;
                    lessonId: string;
                    passingScore: number;
                    timeLimit: number | null;
                    maxAttempts: number | null;
                })[];
            } & {
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
            })[];
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
    }>;
    private aggregateDocumentAnalysis;
    private getFrequency;
    private buildPromptFromDocuments;
    analyzeDocumentsForCourse(input: {
        documentIds: string[];
        additionalContext?: string;
    }): Promise<{
        suggestedTitle: any;
        suggestedDescription: any;
        recommendedLevel: any;
        aggregatedKeywords: string[];
        mainTopics: string[];
        learningObjectives: any;
        whatYouWillLearn: any;
        requirements: any;
        targetAudience: any;
        suggestedStructure: any;
        estimatedDuration: any;
        sourceDocumentIds: string[];
        analysisSummary: any;
    }>;
    private buildAnalysisPrompt;
    private repairIncompleteJSON;
    private generateCourseStructure;
    private createCourseFromStructure;
    getSamplePrompts(): string[];
    getPromptTemplates(): {
        title: string;
        category: string;
        prompt: string;
        tags: string[];
    }[];
    private generateSlug;
}
export {};
