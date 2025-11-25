"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizzesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let QuizzesService = class QuizzesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createQuiz(userId, createQuizInput) {
        const lesson = await this.prisma.lesson.findUnique({
            where: { id: createQuizInput.lessonId },
            include: { courseModule: { include: { course: true } } },
        });
        if (!lesson) {
            throw new common_1.NotFoundException('Lesson not found');
        }
        if (lesson.courseModule.course.instructorId !== userId) {
            throw new common_1.ForbiddenException('Only the course instructor can create quizzes');
        }
        const quiz = await this.prisma.quiz.create({
            data: {
                title: createQuizInput.title,
                description: createQuizInput.description,
                lessonId: createQuizInput.lessonId,
                passingScore: createQuizInput.passingScore,
                timeLimit: createQuizInput.timeLimit,
                questions: {
                    create: createQuizInput.questions.map((question) => ({
                        type: question.type,
                        question: question.question,
                        points: question.points,
                        order: question.order,
                        explanation: question.explanation,
                        answers: {
                            create: question.answers.map((answer) => ({
                                text: answer.text,
                                isCorrect: answer.isCorrect,
                                order: answer.order,
                            })),
                        },
                    })),
                },
            },
            include: {
                questions: {
                    include: { answers: true },
                    orderBy: { order: 'asc' },
                },
            },
        });
        return quiz;
    }
    async getQuiz(quizId, userId) {
        const quiz = await this.prisma.quiz.findUnique({
            where: { id: quizId },
            include: {
                lesson: {
                    include: {
                        courseModule: {
                            include: { course: true },
                        },
                    },
                },
                questions: {
                    include: { answers: true },
                    orderBy: { order: 'asc' },
                },
            },
        });
        if (!quiz) {
            throw new common_1.NotFoundException('Quiz not found');
        }
        const enrollment = await this.prisma.enrollment.findFirst({
            where: {
                userId,
                courseId: quiz.lesson.courseModule.course.id,
            },
        });
        if (!enrollment && quiz.lesson.courseModule.course.instructorId !== userId) {
            throw new common_1.ForbiddenException('You must be enrolled in this course to view the quiz');
        }
        if (quiz.lesson.courseModule.course.instructorId !== userId) {
            quiz.questions.forEach((question) => {
                question.answers.forEach((answer) => {
                    delete answer.isCorrect;
                });
            });
        }
        return quiz;
    }
    async getQuizzesByLesson(lessonId) {
        return this.prisma.quiz.findMany({
            where: { lessonId },
            include: {
                questions: {
                    include: { answers: true },
                    orderBy: { order: 'asc' },
                },
            },
        });
    }
    async updateQuiz(userId, quizId, updateQuizInput) {
        const quiz = await this.prisma.quiz.findUnique({
            where: { id: quizId },
            include: {
                lesson: {
                    include: {
                        courseModule: {
                            include: { course: true },
                        },
                    },
                },
            },
        });
        if (!quiz) {
            throw new common_1.NotFoundException('Quiz not found');
        }
        if (quiz.lesson.courseModule.course.instructorId !== userId) {
            throw new common_1.ForbiddenException('Only the course instructor can update quizzes');
        }
        return this.prisma.quiz.update({
            where: { id: quizId },
            data: updateQuizInput,
            include: {
                questions: {
                    include: { answers: true },
                    orderBy: { order: 'asc' },
                },
            },
        });
    }
    async deleteQuiz(userId, quizId) {
        const quiz = await this.prisma.quiz.findUnique({
            where: { id: quizId },
            include: {
                lesson: {
                    include: {
                        courseModule: {
                            include: { course: true },
                        },
                    },
                },
            },
        });
        if (!quiz) {
            throw new common_1.NotFoundException('Quiz not found');
        }
        if (quiz.lesson.courseModule.course.instructorId !== userId) {
            throw new common_1.ForbiddenException('Only the course instructor can delete quizzes');
        }
        await this.prisma.quiz.delete({
            where: { id: quizId },
        });
        return true;
    }
    async submitQuiz(userId, submitQuizInput) {
        console.log('submitQuizInput:', JSON.stringify(submitQuizInput, null, 2));
        const { quizId, enrollmentId, answers, timeSpent } = submitQuizInput;
        console.log('Destructured - quizId:', quizId, 'enrollmentId:', enrollmentId, 'answers:', answers, 'timeSpent:', timeSpent);
        if (!answers || !Array.isArray(answers)) {
            throw new common_1.BadRequestException('Answers are required and must be an array');
        }
        const enrollment = await this.prisma.enrollment.findUnique({
            where: { id: enrollmentId },
            include: { course: true },
        });
        if (!enrollment || enrollment.userId !== userId) {
            throw new common_1.ForbiddenException('Invalid enrollment');
        }
        const quiz = await this.prisma.quiz.findUnique({
            where: { id: quizId },
            include: {
                questions: {
                    include: { answers: true },
                    orderBy: { order: 'asc' },
                },
                lesson: true,
            },
        });
        if (!quiz) {
            throw new common_1.NotFoundException('Quiz not found');
        }
        if (quiz.lesson.moduleId !== enrollment.course.id) {
            const lesson = await this.prisma.lesson.findUnique({
                where: { id: quiz.lessonId },
                include: { courseModule: true },
            });
            if (lesson.courseModule.courseId !== enrollment.courseId) {
                throw new common_1.BadRequestException('Quiz does not belong to this course');
            }
        }
        let totalPoints = 0;
        let earnedPoints = 0;
        const answerMap = {};
        answers.forEach((answer) => {
            answerMap[answer.questionId] = answer.selectedAnswerIds;
        });
        quiz.questions.forEach((question) => {
            totalPoints += question.points;
            const userAnswers = answerMap[question.id] || [];
            const correctAnswers = question.answers
                .filter((ans) => ans.isCorrect)
                .map((ans) => ans.id);
            const isCorrect = userAnswers.length === correctAnswers.length &&
                userAnswers.every((ans) => correctAnswers.includes(ans)) &&
                correctAnswers.every((ans) => userAnswers.includes(ans));
            if (isCorrect) {
                earnedPoints += question.points;
            }
        });
        const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
        const passed = score >= quiz.passingScore;
        const attempt = await this.prisma.quizAttempt.create({
            data: {
                quizId,
                userId,
                enrollmentId,
                score,
                passed,
                answers: JSON.stringify(answerMap),
                timeSpent,
                completedAt: new Date(),
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
        });
        await this.updateEnrollmentProgress(enrollmentId);
        return attempt;
    }
    async updateEnrollmentProgress(enrollmentId) {
        const enrollment = await this.prisma.enrollment.findUnique({
            where: { id: enrollmentId },
            include: {
                course: {
                    include: {
                        modules: {
                            include: {
                                lessons: true,
                            },
                        },
                    },
                },
                lessonProgress: true,
            },
        });
        if (!enrollment)
            return;
        const totalLessons = enrollment.course.modules.reduce((acc, module) => acc + module.lessons.length, 0);
        if (totalLessons === 0)
            return;
        const completedLessons = enrollment.lessonProgress.filter(p => p.completed).length;
        const progress = (completedLessons / totalLessons) * 100;
        await this.prisma.enrollment.update({
            where: { id: enrollmentId },
            data: {
                progress,
                status: progress === 100 ? client_1.EnrollmentStatus.COMPLETED : client_1.EnrollmentStatus.ACTIVE,
                completedAt: progress === 100 ? new Date() : null,
                lastAccessedAt: new Date(),
            },
        });
    }
    async getQuizAttempts(userId, quizId) {
        return this.prisma.quizAttempt.findMany({
            where: {
                userId,
                quizId,
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
    }
    async getQuizAttempt(userId, attemptId) {
        const attempt = await this.prisma.quizAttempt.findUnique({
            where: { id: attemptId },
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
        });
        if (!attempt) {
            throw new common_1.NotFoundException('Quiz attempt not found');
        }
        if (attempt.userId !== userId) {
            throw new common_1.ForbiddenException('You can only view your own quiz attempts');
        }
        return attempt;
    }
};
exports.QuizzesService = QuizzesService;
exports.QuizzesService = QuizzesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], QuizzesService);
//# sourceMappingURL=quizzes.service.js.map