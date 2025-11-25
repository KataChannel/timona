import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { AICourseGeneratorService } from './ai-course-generator.service';
import { Course } from './entities/course.entity';
import { CourseAnalysisResult } from './entities/course-analysis-result.entity';
import { PaginatedCourses } from './entities/paginated-courses.entity';
import { CreateCourseInput } from './dto/create-course.input';
import { UpdateCourseInput } from './dto/update-course.input';
import { CourseFiltersInput } from './dto/course-filters.input';
import { GenerateCourseFromDocumentsInput } from './dto/generate-course-from-documents.input';
import { AnalyzeDocumentsForCourseInput } from './dto/analyze-documents-for-course.input';
import { CreateModuleInput, UpdateModuleInput, ReorderModulesInput } from './dto/module.input';
import { CreateLessonInput, UpdateLessonInput, ReorderLessonsInput } from './dto/lesson.input';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRoleType } from '@prisma/client';
import { CourseModule } from './entities/course-module.entity';
import { Lesson } from './entities/lesson.entity';
import GraphQLJSON from 'graphql-type-json';

@Resolver(() => Course)
export class CoursesResolver {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly aiCourseGeneratorService: AICourseGeneratorService,
  ) {}

  @Mutation(() => Course, { name: 'createCourse' })
  @UseGuards(JwtAuthGuard)
  createCourse(
    @CurrentUser() user: any,
    @Args('createCourseInput') createCourseInput: CreateCourseInput,
  ) {
    return this.coursesService.create(user.id, createCourseInput);
  }

  @Query(() => PaginatedCourses, { name: 'courses' })
  findAll(@Args('filters', { nullable: true }) filters?: CourseFiltersInput) {
    return this.coursesService.findAll(filters || new CourseFiltersInput());
  }

  @Query(() => Course, { name: 'course' })
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.coursesService.findOne(id);
  }

  @Query(() => Course, { name: 'courseBySlug' })
  findBySlug(@Args('slug') slug: string) {
    return this.coursesService.findBySlug(slug);
  }

  @Query(() => [Course], { name: 'myCourses' })
  @UseGuards(JwtAuthGuard)
  getMyCourses(@CurrentUser() user: any) {
    return this.coursesService.getMyCourses(user.id);
  }

  @Mutation(() => Course, { name: 'updateCourse' })
  @UseGuards(JwtAuthGuard)
  updateCourse(
    @CurrentUser() user: any,
    @Args('updateCourseInput') updateCourseInput: UpdateCourseInput,
  ) {
    return this.coursesService.update(updateCourseInput.id, user.id, updateCourseInput);
  }

  @Mutation(() => Course, { name: 'publishCourse' })
  @UseGuards(JwtAuthGuard)
  publishCourse(
    @CurrentUser() user: any,
    @Args('id', { type: () => ID }) id: string,
  ) {
    return this.coursesService.publish(id, user.id);
  }

  @Mutation(() => Course, { name: 'archiveCourse' })
  @UseGuards(JwtAuthGuard)
  archiveCourse(
    @CurrentUser() user: any,
    @Args('id', { type: () => ID }) id: string,
  ) {
    return this.coursesService.archive(id, user.id);
  }

  @Mutation(() => Boolean, { name: 'deleteCourse' })
  @UseGuards(JwtAuthGuard)
  async removeCourse(
    @CurrentUser() user: any,
    @Args('id', { type: () => ID }) id: string,
  ) {
    const result = await this.coursesService.remove(id, user.id);
    return result.success;
  }

  // ==================== APPROVAL WORKFLOW ====================

  @Mutation(() => Course, { name: 'requestCourseApproval' })
  @UseGuards(JwtAuthGuard)
  requestCourseApproval(
    @CurrentUser() user: any,
    @Args('courseId', { type: () => ID }) courseId: string,
  ) {
    return this.coursesService.requestApproval(courseId, user.id);
  }

  @Mutation(() => Course, { name: 'approveCourse' })
  @UseGuards(JwtAuthGuard)
  approveCourse(
    @CurrentUser() user: any,
    @Args('courseId', { type: () => ID }) courseId: string,
  ) {
    return this.coursesService.approveCourse(courseId, user.id);
  }

  @Mutation(() => Course, { name: 'rejectCourse' })
  @UseGuards(JwtAuthGuard)
  rejectCourse(
    @CurrentUser() user: any,
    @Args('courseId', { type: () => ID }) courseId: string,
    @Args('reason', { type: () => String }) reason: string,
  ) {
    return this.coursesService.rejectCourse(courseId, user.id, reason);
  }

  // ==================== MODULE MUTATIONS ====================
  // ✅ FIXED: Chuyển từ @Roles(ADMIN) sang JwtAuthGuard để instructor có thể tạo module
  // Service layer sẽ kiểm tra ownership của course

  @Mutation(() => CourseModule, { name: 'createModule' })
  @UseGuards(JwtAuthGuard)
  createModule(
    @CurrentUser() user: any,
    @Args('input') input: CreateModuleInput,
  ) {
    return this.coursesService.createModule(user.id, input);
  }

  @Mutation(() => CourseModule, { name: 'updateModule' })
  @UseGuards(JwtAuthGuard)
  updateModule(
    @CurrentUser() user: any,
    @Args('input') input: UpdateModuleInput,
  ) {
    return this.coursesService.updateModule(user.id, input);
  }

  @Mutation(() => Boolean, { name: 'deleteModule' })
  @UseGuards(JwtAuthGuard)
  async deleteModule(
    @CurrentUser() user: any,
    @Args('id', { type: () => ID }) id: string,
  ) {
    const result = await this.coursesService.deleteModule(user.id, id);
    return result.success;
  }

  @Mutation(() => [CourseModule], { name: 'reorderModules' })
  @UseGuards(JwtAuthGuard)
  reorderModules(
    @CurrentUser() user: any,
    @Args('input') input: ReorderModulesInput,
  ) {
    return this.coursesService.reorderModules(user.id, input);
  }

  // ==================== LESSON MUTATIONS ====================
  // ✅ FIXED: Chuyển từ @Roles(ADMIN) sang JwtAuthGuard để instructor có thể tạo lesson

  @Mutation(() => Lesson, { name: 'createLesson' })
  @UseGuards(JwtAuthGuard)
  createLesson(
    @CurrentUser() user: any,
    @Args('input') input: CreateLessonInput,
  ) {
    return this.coursesService.createLesson(user.id, input);
  }

  @Mutation(() => Lesson, { name: 'updateLesson' })
  @UseGuards(JwtAuthGuard)
  updateLesson(
    @CurrentUser() user: any,
    @Args('input') input: UpdateLessonInput,
  ) {
    return this.coursesService.updateLesson(user.id, input);
  }

  @Mutation(() => Boolean, { name: 'deleteLesson' })
  @UseGuards(JwtAuthGuard)
  async deleteLesson(
    @CurrentUser() user: any,
    @Args('id', { type: () => ID }) id: string,
  ) {
    const result = await this.coursesService.deleteLesson(user.id, id);
    return result.success;
  }

  @Mutation(() => [Lesson], { name: 'reorderLessons' })
  @UseGuards(JwtAuthGuard)
  reorderLessons(
    @CurrentUser() user: any,
    @Args('input') input: ReorderLessonsInput,
  ) {
    return this.coursesService.reorderLessons(user.id, input);
  }

  // ==================== AI COURSE GENERATOR ====================

  @Query(() => CourseAnalysisResult, { name: 'analyzeDocumentsForCourse' })
  @UseGuards(JwtAuthGuard)
  async analyzeDocumentsForCourse(
    @CurrentUser() user: any,
    @Args('input') input: AnalyzeDocumentsForCourseInput,
  ) {
    console.log('📥 Analyze documents request from user:', user.id);
    console.log('📚 Documents:', input.documentIds);
    
    return this.aiCourseGeneratorService.analyzeDocumentsForCourse({
      documentIds: input.documentIds,
      additionalContext: input.additionalContext,
    });
  }

  @Mutation(() => Course, { name: 'generateCourseFromPrompt' })
  @UseGuards(JwtAuthGuard)
  async generateCourseFromPrompt(
    @CurrentUser() user: any,
    @Args('prompt') prompt: string,
    @Args('categoryId', { nullable: true }) categoryId?: string,
  ) {
    return this.aiCourseGeneratorService.generateCourseFromPrompt({
      prompt,
      categoryId,
      instructorId: user.id,
    });
  }

  @Mutation(() => Course, { name: 'generateCourseFromDocuments' })
  @UseGuards(JwtAuthGuard)
  async generateCourseFromDocuments(
    @CurrentUser() user: any,
    @Args('input') input: GenerateCourseFromDocumentsInput,
  ) {
    console.log('📥 Resolver received input:', JSON.stringify(input, null, 2));
    console.log('👤 User ID:', user.id);
    
    return this.aiCourseGeneratorService.generateCourseFromDocuments({
      documentIds: input.documentIds || [],
      categoryId: input.categoryId,
      additionalPrompt: input.additionalPrompt,
      instructorId: user.id,
    });
  }

  @Query(() => [String], { name: 'sampleCoursePrompts' })
  getSampleCoursePrompts() {
    return this.aiCourseGeneratorService.getSamplePrompts();
  }

  @Query(() => GraphQLJSON, { name: 'coursePromptTemplates' })
  getCoursePromptTemplates() {
    return this.aiCourseGeneratorService.getPromptTemplates();
  }
}
