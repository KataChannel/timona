import { Resolver, Query, Mutation, Args, ID, Int, Context, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { BlogService } from '../../services/blog.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import {
  BlogType,
  PaginatedBlogs,
  BlogCategoryType,
  BlogTagType,
} from '../types/blog.type';
import {
  CreateBlogInput,
  UpdateBlogInput,
  GetBlogsInput,
  CreateBlogCategoryInput,
  UpdateBlogCategoryInput,
  CreateBlogTagInput,
  UpdateBlogTagInput,
} from '../inputs/blog.input';

@Resolver(() => BlogType)
@UsePipes(new ValidationPipe({ 
  whitelist: true, 
  transform: true,
  forbidNonWhitelisted: false 
}))
export class BlogResolver {
  constructor(private blogService: BlogService) {}

  // ============================================================================
  // FIELD RESOLVERS
  // ============================================================================

  @ResolveField(() => Boolean)
  isPublished(@Parent() blog: any): boolean {
    return blog.status === 'PUBLISHED';
  }

  @ResolveField(() => String, { nullable: true })
  thumbnailUrl(@Parent() blog: any): string | null {
    // Map featuredImage to thumbnailUrl for backward compatibility
    return blog.featuredImage || blog.thumbnailUrl || null;
  }

  @ResolveField(() => String, { nullable: true })
  bannerUrl(@Parent() blog: any): string | null {
    // Use featuredImage as bannerUrl if not set
    return blog.bannerUrl || blog.featuredImage || null;
  }

  @ResolveField(() => [String], { nullable: true })
  metaKeywords(@Parent() blog: any): string[] | null {
    // Handle metaKeywords transformation from various formats
    if (!blog.metaKeywords) {
      return null;
    }

    // If already array, return as is
    if (Array.isArray(blog.metaKeywords)) {
      return blog.metaKeywords;
    }

    // If string, try to parse JSON or split by comma
    if (typeof blog.metaKeywords === 'string') {
      try {
        const parsed = JSON.parse(blog.metaKeywords);
        return Array.isArray(parsed) ? parsed : [blog.metaKeywords];
      } catch {
        return [blog.metaKeywords];
      }
    }

    // If object (Prisma sometimes returns this), convert to array
    if (typeof blog.metaKeywords === 'object') {
      // Handle array-like objects with numeric keys
      if ('length' in blog.metaKeywords) {
        return Object.values(blog.metaKeywords).filter(v => typeof v === 'string') as string[];
      }
      // Handle generic objects
      return Object.values(blog.metaKeywords).filter(v => typeof v === 'string') as string[];
    }

    return null;
  }

  // ============================================================================
  // BLOG QUERIES
  // ============================================================================

  @Query(() => PaginatedBlogs, { name: 'blogs' })
  async getBlogs(@Args('page', { type: () => Int, nullable: true }) page?: number,
                  @Args('limit', { type: () => Int, nullable: true }) limit?: number,
                  @Args('search', { nullable: true }) search?: string,
                  @Args('categoryId', { type: () => ID, nullable: true }) categoryId?: string,
                  @Args('sort', { nullable: true }) sort?: string,
                  @Args('statusFilter', { nullable: true }) statusFilter?: string) {
    return this.blogService.getBlogs({
      page,
      limit,
      search,
      categoryId,
      sort,
      statusFilter,
    });
  }

  @Query(() => BlogType, { name: 'blog' })
  async getBlog(@Args('id', { type: () => ID }) id: string) {
    return this.blogService.getBlogById(id);
  }

  @Query(() => BlogType, { name: 'blogBySlug' })
  async getBlogBySlug(@Args('slug') slug: string) {
    return this.blogService.getBlogBySlug(slug);
  }

  @Query(() => [BlogType], { name: 'featuredBlogs' })
  async getFeaturedBlogs(@Args('limit', { type: () => Int, nullable: true }) limit?: number) {
    return this.blogService.getFeaturedBlogs(limit);
  }

  @Query(() => PaginatedBlogs, { name: 'blogsByCategory' })
  async getBlogsByCategory(
    @Args('categoryId', { type: () => ID }) categoryId: string,
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ) {
    return this.blogService.getBlogsByCategory(categoryId, { page, limit });
  }

  @Query(() => [BlogType], { name: 'relatedBlogs' })
  async getRelatedBlogs(
    @Args('blogId', { type: () => ID }) blogId: string,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ) {
    return this.blogService.getRelatedBlogs(blogId, limit);
  }

  @Query(() => [BlogCategoryType], { name: 'blogCategories' })
  async getCategories() {
    return this.blogService.getCategories();
  }

  @Query(() => BlogCategoryType, { name: 'blogCategory' })
  async getCategory(@Args('id', { type: () => ID }) id: string) {
    return this.blogService.getCategoryById(id);
  }

  @Query(() => [BlogTagType], { name: 'blogTags' })
  async getTags() {
    return this.blogService.getTags();
  }

  // ============================================================================
  // BLOG MUTATIONS
  // ============================================================================

  @Mutation(() => BlogType, { name: 'createBlog' })
  @UseGuards(JwtAuthGuard)
  async createBlog(@Args('input') input: CreateBlogInput, @Context() context: any) {
    const userId = context.req?.user?.id || input.author;
    return this.blogService.createBlog(input, userId);
  }

  @Mutation(() => BlogType, { name: 'updateBlog' })
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ 
    whitelist: true, 
    transform: true,
    forbidNonWhitelisted: false,
    skipMissingProperties: false 
  }))
  async updateBlog(@Args('input') input: UpdateBlogInput) {
    // Debug log to see what we receive
    console.log('=== UpdateBlog Resolver Debug ===');
    console.log('Full input object:', JSON.stringify(input, null, 2));
    console.log('Input keys:', Object.keys(input));
    console.log('id value:', input.id);
    console.log('id type:', typeof input.id);
    console.log('================================');
    
    const { id, ...updateData } = input;
    if (!id || id.trim() === '') {
      console.error('ID validation failed:', { 
        id, 
        isEmpty: !id, 
        isTrimEmpty: id?.trim() === '',
        inputReceived: input 
      });
      throw new Error('Blog post ID is required and cannot be empty');
    }
    return this.blogService.updateBlog(id, updateData);
  }

  @Mutation(() => Boolean, { name: 'deleteBlog' })
  @UseGuards(JwtAuthGuard)
  async deleteBlog(@Args('id', { type: () => ID }) id: string) {
    return this.blogService.deleteBlog(id);
  }

  // ============================================================================
  // CATEGORY MUTATIONS
  // ============================================================================

  @Mutation(() => BlogCategoryType, { name: 'createBlogCategory' })
  @UseGuards(JwtAuthGuard)
  async createCategory(@Args('input') input: CreateBlogCategoryInput) {
    return this.blogService.createCategory(input);
  }

  @Mutation(() => BlogCategoryType, { name: 'updateBlogCategory' })
  @UseGuards(JwtAuthGuard)
  async updateCategory(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateBlogCategoryInput
  ) {
    return this.blogService.updateCategory(id, input);
  }

  @Mutation(() => Boolean, { name: 'deleteBlogCategory' })
  @UseGuards(JwtAuthGuard)
  async deleteCategory(@Args('id', { type: () => ID }) id: string) {
    return this.blogService.deleteCategory(id);
  }

  // ============================================================================
  // TAG MUTATIONS
  // ============================================================================

  @Mutation(() => BlogTagType, { name: 'createBlogTag' })
  @UseGuards(JwtAuthGuard)
  async createTag(@Args('input') input: CreateBlogTagInput) {
    return this.blogService.createTag(input);
  }

  @Mutation(() => BlogTagType, { name: 'updateBlogTag' })
  @UseGuards(JwtAuthGuard)
  async updateTag(@Args('input') input: UpdateBlogTagInput) {
    const { id, ...updateData } = input;
    return this.blogService.updateTag(id, updateData);
  }

  @Mutation(() => Boolean, { name: 'deleteBlogTag' })
  @UseGuards(JwtAuthGuard)
  async deleteTag(@Args('id', { type: () => ID }) id: string) {
    return this.blogService.deleteTag(id);
  }
}
