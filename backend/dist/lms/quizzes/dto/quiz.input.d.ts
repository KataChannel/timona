import { QuestionType } from '@prisma/client';
export declare class CreateAnswerInput {
    text: string;
    isCorrect: boolean;
    order: number;
}
export declare class CreateQuestionInput {
    type: QuestionType;
    question: string;
    points: number;
    order: number;
    explanation?: string;
    answers: CreateAnswerInput[];
}
export declare class CreateQuizInput {
    title: string;
    description?: string;
    lessonId: string;
    passingScore: number;
    timeLimit?: number;
    questions: CreateQuestionInput[];
}
export declare class UpdateQuizInput {
    title?: string;
    description?: string;
    passingScore?: number;
    timeLimit?: number;
}
export declare class QuizAnswerInput {
    questionId: string;
    selectedAnswerIds: string[];
}
export declare class SubmitQuizInput {
    quizId: string;
    enrollmentId: string;
    answers: QuizAnswerInput[];
    timeSpent?: number;
}
