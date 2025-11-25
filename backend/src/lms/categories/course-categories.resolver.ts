import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CourseCategoriesService } from './course-categories.service';
import { CourseCategory } from './entities/course-category.entity';
import { CreateCourseCategoryInput } from './dto/create-course-category.input';
import { UpdateCourseCategoryInput } from './dto/update-course-category.input';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRoleType } from '@prisma/client';

@Resolver(() => CourseCategory)
export class CourseCategoriesResolver {
  constructor(private readonly categoriesService: CourseCategoriesService) {}

  @Mutation(() => CourseCategory, { name: 'createCourseCategory' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleType.ADMIN)
  createCategory(
    @Args('createCourseCategoryInput') createCourseCategoryInput: CreateCourseCategoryInput,
  ) {
    return this.categoriesService.create(createCourseCategoryInput);
  }

  @Query(() => [CourseCategory], { name: 'courseCategories' })
  findAllCategories() {
    return this.categoriesService.findAll();
  }

  @Query(() => [CourseCategory], { name: 'courseCategoryTree' })
  findCategoryTree() {
    return this.categoriesService.findTree();
  }

  @Query(() => CourseCategory, { name: 'courseCategory' })
  findOneCategory(@Args('id', { type: () => ID }) id: string) {
    return this.categoriesService.findOne(id);
  }

  @Mutation(() => CourseCategory, { name: 'updateCourseCategory' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleType.ADMIN)
  updateCategory(
    @Args('updateCourseCategoryInput') updateCourseCategoryInput: UpdateCourseCategoryInput,
  ) {
    return this.categoriesService.update(updateCourseCategoryInput.id, updateCourseCategoryInput);
  }

  @Mutation(() => Boolean, { name: 'deleteCourseCategory' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleType.ADMIN)
  async removeCategory(@Args('id', { type: () => ID }) id: string) {
    const result = await this.categoriesService.remove(id);
    return result.success;
  }
}
