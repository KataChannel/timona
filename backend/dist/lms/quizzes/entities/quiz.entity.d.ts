import { QuestionType } from '@prisma/client';
export declare class Answer {
    id: string;
    questionId: string;
    text: string;
    isCorrect: boolean;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare class Question {
    id: string;
    quizId: string;
    type: QuestionType;
    question: string;
    points: number;
    order: number;
    explanation?: string;
    answers: Answer[];
    createdAt: Date;
    updatedAt: Date;
}
export declare class Quiz {
    id: string;
    title: string;
    description?: string;
    lessonId: string;
    passingScore: number;
    timeLimit?: number;
    questions: Question[];
    createdAt: Date;
    updatedAt: Date;
}
export declare class QuizAttempt {
    id: string;
    quizId: string;
    userId: string;
    enrollmentId: string;
    score?: number;
    passed: boolean;
    answers?: string;
    timeSpent?: number;
    quiz: Quiz;
    startedAt: Date;
    completedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
