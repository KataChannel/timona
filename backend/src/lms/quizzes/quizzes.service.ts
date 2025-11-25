import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EnrollmentStatus } from '@prisma/client';
import { CreateQuizInput, UpdateQuizInput, SubmitQuizInput } from './dto/quiz.input';

@Injectable()
export class QuizzesService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a new quiz with questions and answers
  async createQuiz(userId: string, createQuizInput: CreateQuizInput) {
    // Verify the lesson exists
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: createQuizInput.lessonId },
      include: { courseModule: { include: { course: true } } },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    // Verify user is the course instructor
    if (lesson.courseModule.course.instructorId !== userId) {
      throw new ForbiddenException('Only the course instructor can create quizzes');
    }

    // Create quiz with nested questions and answers
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

  // Get quiz by ID (hide correct answers for students)
  async getQuiz(quizId: string, userId: string) {
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
      throw new NotFoundException('Quiz not found');
    }

    // Check if user is enrolled
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        userId,
        courseId: quiz.lesson.courseModule.course.id,
      },
    });

    if (!enrollment && quiz.lesson.courseModule.course.instructorId !== userId) {
      throw new ForbiddenException('You must be enrolled in this course to view the quiz');
    }

    // Hide correct answers for students (not instructors)
    if (quiz.lesson.courseModule.course.instructorId !== userId) {
      quiz.questions.forEach((question) => {
        question.answers.forEach((answer) => {
          delete (answer as any).isCorrect;
        });
      });
    }

    return quiz;
  }

  // Get quizzes by lesson ID
  async getQuizzesByLesson(lessonId: string) {
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

  // Update quiz
  async updateQuiz(userId: string, quizId: string, updateQuizInput: UpdateQuizInput) {
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
      throw new NotFoundException('Quiz not found');
    }

    // Verify user is the course instructor
    if (quiz.lesson.courseModule.course.instructorId !== userId) {
      throw new ForbiddenException('Only the course instructor can update quizzes');
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

  // Delete quiz
  async deleteQuiz(userId: string, quizId: string) {
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
      throw new NotFoundException('Quiz not found');
    }

    // Verify user is the course instructor
    if (quiz.lesson.courseModule.course.instructorId !== userId) {
      throw new ForbiddenException('Only the course instructor can delete quizzes');
    }

    await this.prisma.quiz.delete({
      where: { id: quizId },
    });

    return true;
  }

  // Submit quiz attempt with auto-grading
  async submitQuiz(userId: string, submitQuizInput: SubmitQuizInput) {
    console.log('submitQuizInput:', JSON.stringify(submitQuizInput, null, 2));
    
    const { quizId, enrollmentId, answers, timeSpent } = submitQuizInput;

    console.log('Destructured - quizId:', quizId, 'enrollmentId:', enrollmentId, 'answers:', answers, 'timeSpent:', timeSpent);

    // Validate answers
    if (!answers || !Array.isArray(answers)) {
      throw new BadRequestException('Answers are required and must be an array');
    }

    // Verify enrollment
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: { course: true },
    });

    if (!enrollment || enrollment.userId !== userId) {
      throw new ForbiddenException('Invalid enrollment');
    }

    // Get quiz with questions and answers
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
      throw new NotFoundException('Quiz not found');
    }

    // Verify quiz belongs to course
    if (quiz.lesson.moduleId !== enrollment.course.id) {
      // Need to check through module
      const lesson = await this.prisma.lesson.findUnique({
        where: { id: quiz.lessonId },
        include: { courseModule: true },
      });
      
      if (lesson.courseModule.courseId !== enrollment.courseId) {
        throw new BadRequestException('Quiz does not belong to this course');
      }
    }

    // Auto-grade the quiz
    let totalPoints = 0;
    let earnedPoints = 0;
    const answerMap: Record<string, string[]> = {};

    answers.forEach((answer) => {
      answerMap[answer.questionId] = answer.selectedAnswerIds;
    });

    quiz.questions.forEach((question) => {
      totalPoints += question.points;

      const userAnswers = answerMap[question.id] || [];
      const correctAnswers = question.answers
        .filter((ans) => ans.isCorrect)
        .map((ans) => ans.id);

      // Check if answer is correct (all correct answers selected, no wrong answers)
      const isCorrect =
        userAnswers.length === correctAnswers.length &&
        userAnswers.every((ans) => correctAnswers.includes(ans)) &&
        correctAnswers.every((ans) => userAnswers.includes(ans));

      if (isCorrect) {
        earnedPoints += question.points;
      }
    });

    // Calculate score percentage
    const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
    const passed = score >= quiz.passingScore;

    // Save quiz attempt
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

    // Update enrollment progress after quiz completion
    await this.updateEnrollmentProgress(enrollmentId);

    return attempt;
  }

  // Update enrollment progress based on completed lessons and quizzes
  private async updateEnrollmentProgress(enrollmentId: string) {
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

    if (!enrollment) return;

    // Calculate total lessons
    const totalLessons = enrollment.course.modules.reduce(
      (acc, module) => acc + module.lessons.length,
      0
    );

    if (totalLessons === 0) return;

    // Calculate completed lessons
    const completedLessons = enrollment.lessonProgress.filter(p => p.completed).length;

    const progress = (completedLessons / totalLessons) * 100;

    // Update enrollment
    await this.prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        progress,
        status: progress === 100 ? EnrollmentStatus.COMPLETED : EnrollmentStatus.ACTIVE,
        completedAt: progress === 100 ? new Date() : null,
        lastAccessedAt: new Date(),
      },
    });
  }

  // Get quiz attempts for a user
  async getQuizAttempts(userId: string, quizId: string) {
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

  // Get quiz attempt by ID with detailed results
  async getQuizAttempt(userId: string, attemptId: string) {
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
      throw new NotFoundException('Quiz attempt not found');
    }

    if (attempt.userId !== userId) {
      throw new ForbiddenException('You can only view your own quiz attempts');
    }

    return attempt;
  }
}
