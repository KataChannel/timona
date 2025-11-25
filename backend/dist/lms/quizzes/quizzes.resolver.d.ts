import { QuizzesService } from './quizzes.service';
import { Quiz, QuizAttempt } from './entities/quiz.entity';
import { CreateQuizInput, UpdateQuizInput, SubmitQuizInput } from './dto/quiz.input';
export declare class QuizzesResolver {
    private readonly quizzesService;
    constructor(quizzesService: QuizzesService);
    createQuiz(userId: string, createQuizInput: CreateQuizInput): Promise<Quiz>;
    quiz(userId: string, id: string): Promise<Quiz>;
    quizzesByLesson(lessonId: string): Promise<Quiz[]>;
    updateQuiz(userId: string, id: string, updateQuizInput: UpdateQuizInput): Promise<Quiz>;
    deleteQuiz(userId: string, id: string): Promise<boolean>;
    submitQuiz(userId: string, submitQuizInput: SubmitQuizInput): Promise<QuizAttempt>;
    quizAttempts(userId: string, quizId: string): Promise<QuizAttempt[]>;
    quizAttempt(userId: string, id: string): Promise<QuizAttempt>;
}
