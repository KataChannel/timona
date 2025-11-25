"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const quizzes_service_1 = require("./quizzes.service");
const prisma_service_1 = require("../../prisma/prisma.service");
const common_1 = require("@nestjs/common");
var QuestionType;
(function (QuestionType) {
    QuestionType["MULTIPLE_CHOICE"] = "MULTIPLE_CHOICE";
    QuestionType["TRUE_FALSE"] = "TRUE_FALSE";
    QuestionType["SHORT_ANSWER"] = "SHORT_ANSWER";
})(QuestionType || (QuestionType = {}));
describe('QuizzesService', () => {
    let service;
    let prismaService;
    const mockPrismaService = {
        quiz: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        lesson: {
            findUnique: jest.fn(),
        },
        enrollment: {
            findUnique: jest.fn(),
            findFirst: jest.fn(),
        },
        quizAttempt: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
        },
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                quizzes_service_1.QuizzesService,
                {
                    provide: prisma_service_1.PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();
        service = module.get(quizzes_service_1.QuizzesService);
        prismaService = module.get(prisma_service_1.PrismaService);
        jest.clearAllMocks();
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('createQuiz', () => {
        it('should create a quiz with nested questions and answers', async () => {
            const userId = 'instructor-1';
            const createQuizInput = {
                title: 'JavaScript Basics Quiz',
                description: 'Test your JavaScript knowledge',
                lessonId: 'lesson-1',
                passingScore: 70,
                timeLimit: 30,
                questions: [
                    {
                        type: QuestionType.MULTIPLE_CHOICE,
                        question: 'What is a closure?',
                        points: 10,
                        order: 0,
                        explanation: 'A closure is a function with access to its outer scope',
                        answers: [
                            { text: 'A function inside another function', isCorrect: true, order: 0 },
                            { text: 'A loop', isCorrect: false, order: 1 },
                            { text: 'A variable', isCorrect: false, order: 2 },
                        ],
                    },
                ],
            };
            const mockLesson = {
                id: 'lesson-1',
                courseModule: {
                    course: {
                        instructorId: userId,
                    },
                },
            };
            const mockQuiz = {
                id: 'quiz-1',
                title: createQuizInput.title,
                description: createQuizInput.description,
                lessonId: createQuizInput.lessonId,
                passingScore: createQuizInput.passingScore,
                timeLimit: createQuizInput.timeLimit,
                questions: [
                    {
                        id: 'question-1',
                        type: QuestionType.MULTIPLE_CHOICE,
                        question: 'What is a closure?',
                        points: 10,
                        order: 0,
                        answers: [
                            { id: 'answer-1', text: 'A function inside another function', isCorrect: true, order: 0 },
                            { id: 'answer-2', text: 'A loop', isCorrect: false, order: 1 },
                            { id: 'answer-3', text: 'A variable', isCorrect: false, order: 2 },
                        ],
                    },
                ],
            };
            mockPrismaService.lesson.findUnique.mockResolvedValue(mockLesson);
            mockPrismaService.quiz.create.mockResolvedValue(mockQuiz);
            const result = await service.createQuiz(userId, createQuizInput);
            expect(result).toEqual(mockQuiz);
            expect(mockPrismaService.quiz.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    title: createQuizInput.title,
                    lessonId: createQuizInput.lessonId,
                    passingScore: createQuizInput.passingScore,
                    questions: expect.objectContaining({
                        create: expect.arrayContaining([
                            expect.objectContaining({
                                question: 'What is a closure?',
                                points: 10,
                            }),
                        ]),
                    }),
                }),
                include: {
                    questions: {
                        include: { answers: true },
                        orderBy: { order: 'asc' },
                    },
                },
            });
        });
        it('should throw NotFoundException if lesson not found', async () => {
            mockPrismaService.lesson.findUnique.mockResolvedValue(null);
            await expect(service.createQuiz('user-1', { lessonId: 'non-existent' })).rejects.toThrow(new common_1.NotFoundException('Lesson not found'));
        });
        it('should throw ForbiddenException if user is not instructor', async () => {
            const mockLesson = {
                id: 'lesson-1',
                courseModule: {
                    course: {
                        instructorId: 'different-instructor',
                    },
                },
            };
            mockPrismaService.lesson.findUnique.mockResolvedValue(mockLesson);
            await expect(service.createQuiz('user-1', { lessonId: 'lesson-1' })).rejects.toThrow(new common_1.ForbiddenException('Only the course instructor can create quizzes'));
        });
    });
    describe('getQuiz', () => {
        it('should return quiz with correct answers for instructor', async () => {
            const instructorId = 'instructor-1';
            const mockQuiz = {
                id: 'quiz-1',
                title: 'Test Quiz',
                lesson: {
                    courseModule: {
                        course: {
                            id: 'course-1',
                            instructorId,
                        },
                    },
                },
                questions: [
                    {
                        id: 'question-1',
                        question: 'What is 2+2?',
                        answers: [
                            { id: 'answer-1', text: '3', isCorrect: false },
                            { id: 'answer-2', text: '4', isCorrect: true },
                        ],
                    },
                ],
            };
            mockPrismaService.quiz.findUnique.mockResolvedValue(mockQuiz);
            const result = await service.getQuiz('quiz-1', instructorId);
            expect(result).toEqual(mockQuiz);
            expect(result.questions[0].answers[0].isCorrect).toBeDefined();
            expect(result.questions[0].answers[1].isCorrect).toBe(true);
        });
        it('should hide correct answers for enrolled students', async () => {
            const studentId = 'student-1';
            const mockQuiz = {
                id: 'quiz-1',
                title: 'Test Quiz',
                lesson: {
                    courseModule: {
                        course: {
                            id: 'course-1',
                            instructorId: 'instructor-1',
                        },
                    },
                },
                questions: [
                    {
                        id: 'question-1',
                        question: 'What is 2+2?',
                        answers: [
                            { id: 'answer-1', text: '3', isCorrect: false },
                            { id: 'answer-2', text: '4', isCorrect: true },
                        ],
                    },
                ],
            };
            const mockEnrollment = {
                id: 'enrollment-1',
                userId: studentId,
                courseId: 'course-1',
            };
            mockPrismaService.quiz.findUnique.mockResolvedValue(mockQuiz);
            mockPrismaService.enrollment.findFirst.mockResolvedValue(mockEnrollment);
            const result = await service.getQuiz('quiz-1', studentId);
            expect(result.questions[0].answers[0].isCorrect).toBeUndefined();
            expect(result.questions[0].answers[1].isCorrect).toBeUndefined();
        });
        it('should throw NotFoundException if quiz not found', async () => {
            mockPrismaService.quiz.findUnique.mockResolvedValue(null);
            await expect(service.getQuiz('non-existent', 'user-1')).rejects.toThrow(new common_1.NotFoundException('Quiz not found'));
        });
        it('should throw ForbiddenException if user is not enrolled', async () => {
            const mockQuiz = {
                id: 'quiz-1',
                lesson: {
                    courseModule: {
                        course: {
                            id: 'course-1',
                            instructorId: 'instructor-1',
                        },
                    },
                },
                questions: [],
            };
            mockPrismaService.quiz.findUnique.mockResolvedValue(mockQuiz);
            mockPrismaService.enrollment.findFirst.mockResolvedValue(null);
            await expect(service.getQuiz('quiz-1', 'student-1')).rejects.toThrow(new common_1.ForbiddenException('You must be enrolled in this course to view the quiz'));
        });
    });
    describe('getQuizzesByLesson', () => {
        it('should return all quizzes for a lesson', async () => {
            const mockQuizzes = [
                { id: 'quiz-1', title: 'Quiz 1', lessonId: 'lesson-1' },
                { id: 'quiz-2', title: 'Quiz 2', lessonId: 'lesson-1' },
            ];
            mockPrismaService.quiz.findMany.mockResolvedValue(mockQuizzes);
            const result = await service.getQuizzesByLesson('lesson-1');
            expect(result).toEqual(mockQuizzes);
            expect(mockPrismaService.quiz.findMany).toHaveBeenCalledWith({
                where: { lessonId: 'lesson-1' },
                include: {
                    questions: {
                        include: { answers: true },
                        orderBy: { order: 'asc' },
                    },
                },
            });
        });
    });
    describe('updateQuiz', () => {
        it('should update a quiz', async () => {
            const instructorId = 'instructor-1';
            const mockQuiz = {
                id: 'quiz-1',
                title: 'Old Title',
                lesson: {
                    courseModule: {
                        course: {
                            instructorId,
                        },
                    },
                },
            };
            const updateInput = {
                title: 'New Title',
                description: 'Updated description',
            };
            const updatedQuiz = {
                ...mockQuiz,
                ...updateInput,
            };
            mockPrismaService.quiz.findUnique.mockResolvedValue(mockQuiz);
            mockPrismaService.quiz.update.mockResolvedValue(updatedQuiz);
            const result = await service.updateQuiz(instructorId, 'quiz-1', updateInput);
            expect(result.title).toBe('New Title');
            expect(mockPrismaService.quiz.update).toHaveBeenCalledWith({
                where: { id: 'quiz-1' },
                data: updateInput,
                include: {
                    questions: {
                        include: { answers: true },
                        orderBy: { order: 'asc' },
                    },
                },
            });
        });
        it('should throw NotFoundException if quiz not found', async () => {
            mockPrismaService.quiz.findUnique.mockResolvedValue(null);
            await expect(service.updateQuiz('user-1', 'non-existent', {})).rejects.toThrow(new common_1.NotFoundException('Quiz not found'));
        });
        it('should throw ForbiddenException if user is not instructor', async () => {
            const mockQuiz = {
                id: 'quiz-1',
                lesson: {
                    courseModule: {
                        course: {
                            instructorId: 'different-instructor',
                        },
                    },
                },
            };
            mockPrismaService.quiz.findUnique.mockResolvedValue(mockQuiz);
            await expect(service.updateQuiz('user-1', 'quiz-1', {})).rejects.toThrow(new common_1.ForbiddenException('Only the course instructor can update quizzes'));
        });
    });
    describe('deleteQuiz', () => {
        it('should delete a quiz', async () => {
            const instructorId = 'instructor-1';
            const mockQuiz = {
                id: 'quiz-1',
                lesson: {
                    courseModule: {
                        course: {
                            instructorId,
                        },
                    },
                },
            };
            mockPrismaService.quiz.findUnique.mockResolvedValue(mockQuiz);
            mockPrismaService.quiz.delete.mockResolvedValue(mockQuiz);
            const result = await service.deleteQuiz(instructorId, 'quiz-1');
            expect(result).toBe(true);
            expect(mockPrismaService.quiz.delete).toHaveBeenCalledWith({
                where: { id: 'quiz-1' },
            });
        });
        it('should throw NotFoundException if quiz not found', async () => {
            mockPrismaService.quiz.findUnique.mockResolvedValue(null);
            await expect(service.deleteQuiz('user-1', 'non-existent')).rejects.toThrow(new common_1.NotFoundException('Quiz not found'));
        });
        it('should throw ForbiddenException if user is not instructor', async () => {
            const mockQuiz = {
                id: 'quiz-1',
                lesson: {
                    courseModule: {
                        course: {
                            instructorId: 'different-instructor',
                        },
                    },
                },
            };
            mockPrismaService.quiz.findUnique.mockResolvedValue(mockQuiz);
            await expect(service.deleteQuiz('user-1', 'quiz-1')).rejects.toThrow(new common_1.ForbiddenException('Only the course instructor can delete quizzes'));
        });
    });
    describe('submitQuiz', () => {
        it('should auto-grade quiz and create attempt', async () => {
            const userId = 'student-1';
            const submitInput = {
                quizId: 'quiz-1',
                enrollmentId: 'enrollment-1',
                answers: [
                    { questionId: 'question-1', selectedAnswerIds: ['answer-2'] },
                    { questionId: 'question-2', selectedAnswerIds: ['answer-3'] },
                ],
                timeSpent: 15,
            };
            const mockEnrollment = {
                id: 'enrollment-1',
                userId,
                courseId: 'course-1',
                course: {
                    id: 'course-1',
                },
            };
            const mockQuiz = {
                id: 'quiz-1',
                passingScore: 70,
                lessonId: 'lesson-1',
                lesson: {
                    id: 'lesson-1',
                    moduleId: 'module-1',
                },
                questions: [
                    {
                        id: 'question-1',
                        points: 10,
                        answers: [
                            { id: 'answer-1', isCorrect: false },
                            { id: 'answer-2', isCorrect: true },
                        ],
                    },
                    {
                        id: 'question-2',
                        points: 10,
                        answers: [
                            { id: 'answer-3', isCorrect: true },
                            { id: 'answer-4', isCorrect: false },
                        ],
                    },
                ],
            };
            const mockLesson = {
                id: 'lesson-1',
                courseModule: {
                    courseId: 'course-1',
                },
            };
            const mockAttempt = {
                id: 'attempt-1',
                quizId: 'quiz-1',
                userId,
                enrollmentId: 'enrollment-1',
                score: 100,
                passed: true,
                timeSpent: 15,
            };
            mockPrismaService.enrollment.findUnique.mockResolvedValue(mockEnrollment);
            mockPrismaService.quiz.findUnique.mockResolvedValue(mockQuiz);
            mockPrismaService.lesson.findUnique.mockResolvedValue(mockLesson);
            mockPrismaService.quizAttempt.create.mockResolvedValue(mockAttempt);
            const result = await service.submitQuiz(userId, submitInput);
            expect(result.score).toBe(100);
            expect(result.passed).toBe(true);
            expect(mockPrismaService.quizAttempt.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    quizId: 'quiz-1',
                    userId,
                    enrollmentId: 'enrollment-1',
                    score: 100,
                    passed: true,
                    timeSpent: 15,
                }),
            }));
        });
        it('should mark as failed if score below passing score', async () => {
            const userId = 'student-1';
            const submitInput = {
                quizId: 'quiz-1',
                enrollmentId: 'enrollment-1',
                answers: [
                    { questionId: 'question-1', selectedAnswerIds: ['answer-1'] },
                ],
                timeSpent: 10,
            };
            const mockEnrollment = {
                id: 'enrollment-1',
                userId,
                courseId: 'course-1',
                course: { id: 'course-1' },
            };
            const mockQuiz = {
                id: 'quiz-1',
                passingScore: 70,
                lessonId: 'lesson-1',
                lesson: {
                    id: 'lesson-1',
                    moduleId: 'module-1',
                },
                questions: [
                    {
                        id: 'question-1',
                        points: 10,
                        answers: [
                            { id: 'answer-1', isCorrect: false },
                            { id: 'answer-2', isCorrect: true },
                        ],
                    },
                ],
            };
            const mockLesson = {
                courseModule: { courseId: 'course-1' },
            };
            const mockAttempt = {
                id: 'attempt-1',
                score: 0,
                passed: false,
            };
            mockPrismaService.enrollment.findUnique.mockResolvedValue(mockEnrollment);
            mockPrismaService.quiz.findUnique.mockResolvedValue(mockQuiz);
            mockPrismaService.lesson.findUnique.mockResolvedValue(mockLesson);
            mockPrismaService.quizAttempt.create.mockResolvedValue(mockAttempt);
            const result = await service.submitQuiz(userId, submitInput);
            expect(result.score).toBe(0);
            expect(result.passed).toBe(false);
        });
        it('should throw ForbiddenException if enrollment invalid', async () => {
            mockPrismaService.enrollment.findUnique.mockResolvedValue(null);
            await expect(service.submitQuiz('user-1', { enrollmentId: 'invalid' })).rejects.toThrow(new common_1.ForbiddenException('Invalid enrollment'));
        });
        it('should throw NotFoundException if quiz not found', async () => {
            const mockEnrollment = {
                id: 'enrollment-1',
                userId: 'user-1',
                course: { id: 'course-1' },
            };
            mockPrismaService.enrollment.findUnique.mockResolvedValue(mockEnrollment);
            mockPrismaService.quiz.findUnique.mockResolvedValue(null);
            await expect(service.submitQuiz('user-1', { enrollmentId: 'enrollment-1', quizId: 'invalid' })).rejects.toThrow(new common_1.NotFoundException('Quiz not found'));
        });
    });
    describe('getQuizAttempts', () => {
        it('should return all attempts for a user and quiz', async () => {
            const mockAttempts = [
                { id: 'attempt-1', score: 80, passed: true },
                { id: 'attempt-2', score: 60, passed: false },
            ];
            mockPrismaService.quizAttempt.findMany.mockResolvedValue(mockAttempts);
            const result = await service.getQuizAttempts('user-1', 'quiz-1');
            expect(result).toEqual(mockAttempts);
            expect(mockPrismaService.quizAttempt.findMany).toHaveBeenCalledWith({
                where: {
                    userId: 'user-1',
                    quizId: 'quiz-1',
                },
                include: {
                    quiz: {
                        include: {
                            questions: {
                                include: { answers: true },
                                orderBy: { order: 'asc' },
                            },
                        },
                    },
                },
                orderBy: {
                    startedAt: 'desc',
                },
            });
        });
    });
    describe('getQuizAttempt', () => {
        it('should return quiz attempt with details', async () => {
            const userId = 'user-1';
            const mockAttempt = {
                id: 'attempt-1',
                userId,
                quizId: 'quiz-1',
                score: 85,
                passed: true,
            };
            mockPrismaService.quizAttempt.findUnique.mockResolvedValue(mockAttempt);
            const result = await service.getQuizAttempt(userId, 'attempt-1');
            expect(result).toEqual(mockAttempt);
        });
        it('should throw NotFoundException if attempt not found', async () => {
            mockPrismaService.quizAttempt.findUnique.mockResolvedValue(null);
            await expect(service.getQuizAttempt('user-1', 'non-existent')).rejects.toThrow(new common_1.NotFoundException('Quiz attempt not found'));
        });
        it('should throw ForbiddenException if attempt belongs to different user', async () => {
            const mockAttempt = {
                id: 'attempt-1',
                userId: 'different-user',
            };
            mockPrismaService.quizAttempt.findUnique.mockResolvedValue(mockAttempt);
            await expect(service.getQuizAttempt('user-1', 'attempt-1')).rejects.toThrow(new common_1.ForbiddenException('You can only view your own quiz attempts'));
        });
    });
});
//# sourceMappingURL=quizzes.service.spec.js.map