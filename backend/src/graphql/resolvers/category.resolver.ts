import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CategoryService } from '../../services/category.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CategoryType, PaginatedCategories } from '../types/category.type';
import {
  CreateCategoryInput,
  UpdateCategoryInput,
  GetCategoriesInput,
} from '../inputs/category.input';

@Resolver(() => CategoryType)
export class CategoryResolver {
  constructor(private categoryService: CategoryService) {}

  // Queries
  @Query(() => PaginatedCategories, { name: 'categories' })
  async getCategories(@Args('input', { nullable: true }) input?: GetCategoriesInput) {
    return this.categoryService.getCategories(input);
  }

  @Query(() => [CategoryType], { name: 'categoryTree' })
  async getCategoryTree() {
    return this.categoryService.getCategoryTree();
  }

  @Query(() => CategoryType, { name: 'category' })
  async getCategory(@Args('id', { type: () => ID }) id: string) {
    return this.categoryService.getCategoryById(id);
  }

  @Query(() => CategoryType, { name: 'categoryBySlug' })
  async getCategoryBySlug(@Args('slug') slug: string) {
    return this.categoryService.getCategoryBySlug(slug);
  }

  // Mutations
  @Mutation(() => CategoryType, { name: 'createCategory' })
  @UseGuards(JwtAuthGuard)
  async createCategory(@Args('input') input: CreateCategoryInput) {
    return this.categoryService.createCategory(input);
  }

  @Mutation(() => CategoryType, { name: 'updateCategory' })
  @UseGuards(JwtAuthGuard)
  async updateCategory(@Args('input') input: UpdateCategoryInput) {
    return this.categoryService.updateCategory(input);
  }

  @Mutation(() => CategoryType, { name: 'deleteCategory' })
  @UseGuards(JwtAuthGuard)
  async deleteCategory(
    @Args('id', { type: () => ID }) id: string,
    @Args('deleteProducts', { type: () => Boolean, defaultValue: false }) deleteProducts: boolean,
  ) {
    return this.categoryService.deleteCategory(id, deleteProducts);
  }

  // Field Resolvers
  @ResolveField(() => Int)
  async productCount(@Parent() category: CategoryType) {
    return this.categoryService.getProductCount(category.id);
  }
}
