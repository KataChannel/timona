import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { Quiz, QuizAttempt } from './entities/quiz.entity';
import { CreateQuizInput, UpdateQuizInput, SubmitQuizInput } from './dto/quiz.input';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../auth/current-user.decorator';
import { UserRoleType } from '@prisma/client';

@Resolver(() => Quiz)
@UseGuards(JwtAuthGuard)
export class QuizzesResolver {
  constructor(private readonly quizzesService: QuizzesService) {}

  // ✅ FIXED: Chuyển từ @Roles(ADMIN) sang JwtAuthGuard
  // Service layer sẽ kiểm tra ownership của course/lesson
  @Mutation(() => Quiz)
  async createQuiz(
    @CurrentUser('id') userId: string,
    @Args('input') createQuizInput: CreateQuizInput,
  ): Promise<Quiz> {
    return this.quizzesService.createQuiz(userId, createQuizInput);
  }

  @Query(() => Quiz)
  async quiz(
    @CurrentUser('id') userId: string,
    @Args('id') id: string,
  ): Promise<Quiz> {
    return this.quizzesService.getQuiz(id, userId);
  }

  @Query(() => [Quiz])
  async quizzesByLesson(
    @Args('lessonId') lessonId: string,
  ): Promise<Quiz[]> {
    return this.quizzesService.getQuizzesByLesson(lessonId);
  }

  @Mutation(() => Quiz)
  async updateQuiz(
    @CurrentUser('id') userId: string,
    @Args('id') id: string,
    @Args('input') updateQuizInput: UpdateQuizInput,
  ): Promise<Quiz> {
    return this.quizzesService.updateQuiz(userId, id, updateQuizInput);
  }

  @Mutation(() => Boolean)
  async deleteQuiz(
    @CurrentUser('id') userId: string,
    @Args('id') id: string,
  ): Promise<boolean> {
    return this.quizzesService.deleteQuiz(userId, id);
  }

  @Mutation(() => QuizAttempt)
  async submitQuiz(
    @CurrentUser('id') userId: string,
    @Args('input') submitQuizInput: SubmitQuizInput,
  ): Promise<QuizAttempt> {
    return this.quizzesService.submitQuiz(userId, submitQuizInput) as any;
  }

  @Query(() => [QuizAttempt])
  async quizAttempts(
    @CurrentUser('id') userId: string,
    @Args('quizId') quizId: string,
  ): Promise<QuizAttempt[]> {
    return this.quizzesService.getQuizAttempts(userId, quizId) as any;
  }

  @Query(() => QuizAttempt)
  async quizAttempt(
    @CurrentUser('id') userId: string,
    @Args('id') id: string,
  ): Promise<QuizAttempt> {
    return this.quizzesService.getQuizAttempt(userId, id) as any;
  }
}
