import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { Enrollment } from './entities/enrollment.entity';
import { LessonProgress } from './entities/lesson-progress.entity';
import { EnrollCourseInput } from './dto/enroll-course.input';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';

@Resolver(() => Enrollment)
export class EnrollmentsResolver {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Mutation(() => Enrollment, { name: 'enrollCourse' })
  @UseGuards(JwtAuthGuard)
  enrollCourse(
    @CurrentUser() user: any,
    @Args('enrollCourseInput') enrollCourseInput: EnrollCourseInput,
  ) {
    return this.enrollmentsService.enroll(user.id, enrollCourseInput.courseId);
  }

  @Query(() => [Enrollment], { name: 'myEnrollments' })
  @UseGuards(JwtAuthGuard)
  getMyEnrollments(@CurrentUser() user: any) {
    return this.enrollmentsService.getMyEnrollments(user.id);
  }

  @Query(() => Enrollment, { name: 'enrollment', nullable: true })
  @UseGuards(JwtAuthGuard)
  getEnrollment(
    @CurrentUser() user: any,
    @Args('courseId', { type: () => ID }) courseId: string,
  ) {
    return this.enrollmentsService.getEnrollment(user.id, courseId);
  }

  @Mutation(() => Enrollment, { name: 'dropCourse' })
  @UseGuards(JwtAuthGuard)
  dropCourse(
    @CurrentUser() user: any,
    @Args('courseId', { type: () => ID }) courseId: string,
  ) {
    return this.enrollmentsService.dropCourse(user.id, courseId);
  }

  @Query(() => [Enrollment], { name: 'courseEnrollments' })
  @UseGuards(JwtAuthGuard)
  getCourseEnrollments(
    @CurrentUser() user: any,
    @Args('courseId', { type: () => ID }) courseId: string,
  ) {
    return this.enrollmentsService.getCourseEnrollments(courseId, user.id);
  }

  @Mutation(() => LessonProgress, { name: 'markLessonComplete' })
  @UseGuards(JwtAuthGuard)
  markLessonComplete(
    @CurrentUser() user: any,
    @Args('enrollmentId', { type: () => ID }) enrollmentId: string,
    @Args('lessonId', { type: () => ID }) lessonId: string,
  ) {
    return this.enrollmentsService.markLessonComplete(user.id, enrollmentId, lessonId);
  }
}
