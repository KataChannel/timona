import { PrismaService } from '../../prisma/prisma.service';
import { CreateQuizInput, UpdateQuizInput, SubmitQuizInput } from './dto/quiz.input';
export declare class QuizzesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createQuiz(userId: string, createQuizInput: CreateQuizInput): Promise<{
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
    }>;
    getQuiz(quizId: string, userId: string): Promise<{
        lesson: {
            courseModule: {
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
                order: number;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                title: string;
                isPublished: boolean;
                courseId: string;
            };
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
        };
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
    }>;
    getQuizzesByLesson(lessonId: string): Promise<({
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
    })[]>;
    updateQuiz(userId: string, quizId: string, updateQuizInput: UpdateQuizInput): Promise<{
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
    }>;
    deleteQuiz(userId: string, quizId: string): Promise<boolean>;
    submitQuiz(userId: string, submitQuizInput: SubmitQuizInput): Promise<{
        quiz: {
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
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        updatedAt: Date;
        completedAt: Date | null;
        score: number | null;
        startedAt: Date;
        answers: import("@prisma/client/runtime/library").JsonValue | null;
        quizId: string;
        enrollmentId: string;
        passed: boolean;
        timeSpent: number | null;
        attemptNumber: number;
    }>;
    private updateEnrollmentProgress;
    getQuizAttempts(userId: string, quizId: string): Promise<({
        quiz: {
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
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        updatedAt: Date;
        completedAt: Date | null;
        score: number | null;
        startedAt: Date;
        answers: import("@prisma/client/runtime/library").JsonValue | null;
        quizId: string;
        enrollmentId: string;
        passed: boolean;
        timeSpent: number | null;
        attemptNumber: number;
    })[]>;
    getQuizAttempt(userId: string, attemptId: string): Promise<{
        quiz: {
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
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        updatedAt: Date;
        completedAt: Date | null;
        score: number | null;
        startedAt: Date;
        answers: import("@prisma/client/runtime/library").JsonValue | null;
        quizId: string;
        enrollmentId: string;
        passed: boolean;
        timeSpent: number | null;
        attemptNumber: number;
    }>;
}
