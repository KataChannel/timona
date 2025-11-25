import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SourceDocumentCategoryService } from './source-document-category.service';
import { SourceDocumentCategory } from './entities/source-document.entity';
import {
  CreateSourceDocumentCategoryInput,
  UpdateSourceDocumentCategoryInput,
} from './dto/source-document.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Resolver(() => SourceDocumentCategory)
export class SourceDocumentCategoryResolver {
  constructor(
    private readonly categoryService: SourceDocumentCategoryService,
  ) {}

  @Mutation(() => SourceDocumentCategory)
  @UseGuards(JwtAuthGuard)
  async createSourceDocumentCategory(
    @Args('input') input: CreateSourceDocumentCategoryInput,
  ) {
    return this.categoryService.create(input);
  }

  @Query(() => [SourceDocumentCategory])
  async sourceDocumentCategories() {
    return this.categoryService.findAll();
  }

  @Query(() => SourceDocumentCategory)
  async sourceDocumentCategory(@Args('id', { type: () => ID }) id: string) {
    return this.categoryService.findOne(id);
  }

  @Mutation(() => SourceDocumentCategory)
  @UseGuards(JwtAuthGuard)
  async updateSourceDocumentCategory(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateSourceDocumentCategoryInput,
  ) {
    return this.categoryService.update(id, input);
  }

  @Mutation(() => SourceDocumentCategory)
  @UseGuards(JwtAuthGuard)
  async deleteSourceDocumentCategory(@Args('id', { type: () => ID }) id: string) {
    return this.categoryService.delete(id);
  }

  @Query(() => [SourceDocumentCategory])
  async sourceDocumentCategoryTree() {
    return this.categoryService.getTree();
  }
}
