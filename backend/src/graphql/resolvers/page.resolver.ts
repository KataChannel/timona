import { Resolver, Query, Mutation, Args, Context, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Page, PageBlock, PaginatedPages } from '../models/page.model';
import { 
  CreatePageInput, 
  UpdatePageInput, 
  PageFiltersInput,
  BulkUpdateBlockOrderInput,
  CreatePageBlockInput,
  UpdatePageBlockInput
} from '../inputs/page.input';
import { PaginationInput } from '../models/pagination.model';
import { PageService } from '../../services/page.service';

@Resolver(() => Page)
export class PageResolver {
  constructor(private readonly pageService: PageService) {}

  // Queries
  @Query(() => PaginatedPages, { name: 'getPages' })
  @UseGuards(JwtAuthGuard)
  async getPages(
    @Args('pagination', { defaultValue: { page: 1, limit: 10 } }) pagination: PaginationInput,
    @Args('filters', { nullable: true }) filters?: PageFiltersInput,
  ): Promise<PaginatedPages> {
    return this.pageService.findMany(pagination, filters);
  }

  @Query(() => Page, { name: 'getPageById' })
  @UseGuards(JwtAuthGuard)
  async getPageById(@Args('id') id: string): Promise<Page> {
    return this.pageService.findById(id);
  }

  @Query(() => Page, { name: 'getPageBySlug', nullable: true })
  async getPageBySlug(@Args('slug') slug: string): Promise<Page | null> {
    console.log(`Fetching page with slug: ${slug}`);
    
    return this.pageService.findBySlug(slug);
  }

  @Query(() => PaginatedPages, { name: 'getPublishedPages' })
  async getPublishedPages(
    @Args('pagination', { defaultValue: { page: 1, limit: 10 } }) pagination: PaginationInput,
  ): Promise<PaginatedPages> {
    return this.pageService.findPublished(pagination);
  }

  @Query(() => Page, { name: 'getHomepage', nullable: true })
  async getHomepage(): Promise<Page | null> {
    return this.pageService.findHomepage();
  }

  // Get list of reserved slugs
  @Query(() => [String], { name: 'getReservedSlugs' })
  async getReservedSlugs(): Promise<string[]> {
    return this.pageService.getReservedSlugs();
  }

  // 🆕 Query to find dynamic page template by slug pattern
  @Query(() => Page, { name: 'getPageBySlugPattern', nullable: true })
  async getPageBySlugPattern(@Args('slugPattern') slugPattern: string): Promise<Page | null> {
    return this.pageService.findBySlugPattern(slugPattern);
  }

  // Mutations
  @Mutation(() => Page, { name: 'createPage' })
  @UseGuards(JwtAuthGuard)
  async createPage(
    @Args('input') input: CreatePageInput,
    @Context() context: any
  ): Promise<Page> {
    const userId = context.req.user.id;
    return this.pageService.create(input, userId);
  }

  @Mutation(() => Page, { name: 'updatePage' })
  @UseGuards(JwtAuthGuard)
  async updatePage(
    @Args('id') id: string,
    @Args('input') input: UpdatePageInput,
    @Context() context: any
  ): Promise<Page> {
    const userId = context.req.user.id;
    return this.pageService.update(id, input, userId);
  }

  @Mutation(() => Page, { name: 'deletePage' })
  @UseGuards(JwtAuthGuard)
  async deletePage(@Args('id') id: string): Promise<Page> {
    return this.pageService.delete(id);
  }

  @Mutation(() => Page, { name: 'duplicatePage' })
  @UseGuards(JwtAuthGuard)
  async duplicatePage(
    @Args('id') id: string,
    @Args('title', { nullable: true }) title?: string,
    @Args('slug', { nullable: true }) slug?: string,
    @Context() context?: any
  ): Promise<Page> {
    const userId = context.req.user.id;
    return this.pageService.duplicate(id, userId, title, slug);
  }

  // Block operations
  @Mutation(() => PageBlock, { name: 'addPageBlock' })
  @UseGuards(JwtAuthGuard)
  async addPageBlock(
    @Args('pageId') pageId: string,
    @Args('input') input: CreatePageBlockInput
  ): Promise<PageBlock> {
    return this.pageService.addBlock(pageId, input);
  }

  @Mutation(() => PageBlock, { name: 'updatePageBlock' })
  @UseGuards(JwtAuthGuard)
  async updatePageBlock(
    @Args('id') id: string,
    @Args('input') input: UpdatePageBlockInput
  ): Promise<PageBlock> {
    return this.pageService.updateBlock(id, input);
  }

  @Mutation(() => PageBlock, { name: 'deletePageBlock' })
  @UseGuards(JwtAuthGuard)
  async deletePageBlock(@Args('id') id: string): Promise<PageBlock> {
    return this.pageService.deleteBlock(id);
  }

    @Mutation(() => [PageBlock], { name: 'updatePageBlocksOrder' })
  @UseGuards(JwtAuthGuard)
  async updatePageBlocksOrder(
    @Args('pageId') pageId: string,
    @Args('updates', { type: () => [BulkUpdateBlockOrderInput] }) 
    updates: BulkUpdateBlockOrderInput[]
  ): Promise<PageBlock[]> {
    return this.pageService.updateBlocksOrder(pageId, updates);
  }

  // Field Resolvers
  @ResolveField(() => [String], { nullable: true })
  seoKeywords(@Parent() page: Page): string[] | null {
    // Transform Json field to array
    if (!page.seoKeywords) {
      return null;
    }

    // If it's already an array, return it
    if (Array.isArray(page.seoKeywords)) {
      return page.seoKeywords;
    }

    // If it's a string, try to parse it as JSON
    if (typeof page.seoKeywords === 'string') {
      try {
        const parsed = JSON.parse(page.seoKeywords);
        return Array.isArray(parsed) ? parsed : [page.seoKeywords];
      } catch {
        // If JSON parse fails, treat as single keyword
        return [page.seoKeywords];
      }
    }

    // If it's an object (from Prisma Json type), check if it has array properties
    if (typeof page.seoKeywords === 'object') {
      // Check if it's array-like
      if ('length' in page.seoKeywords) {
        return Object.values(page.seoKeywords).filter(v => typeof v === 'string') as string[];
      }
      // Try to extract values
      return Object.values(page.seoKeywords).filter(v => typeof v === 'string') as string[];
    }

    return null;
  }
}
