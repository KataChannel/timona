import { Page, PageBlock, PaginatedPages } from '../models/page.model';
import { CreatePageInput, UpdatePageInput, PageFiltersInput, BulkUpdateBlockOrderInput, CreatePageBlockInput, UpdatePageBlockInput } from '../inputs/page.input';
import { PaginationInput } from '../models/pagination.model';
import { PageService } from '../../services/page.service';
export declare class PageResolver {
    private readonly pageService;
    constructor(pageService: PageService);
    getPages(pagination: PaginationInput, filters?: PageFiltersInput): Promise<PaginatedPages>;
    getPageById(id: string): Promise<Page>;
    getPageBySlug(slug: string): Promise<Page | null>;
    getPublishedPages(pagination: PaginationInput): Promise<PaginatedPages>;
    getHomepage(): Promise<Page | null>;
    getReservedSlugs(): Promise<string[]>;
    getPageBySlugPattern(slugPattern: string): Promise<Page | null>;
    createPage(input: CreatePageInput, context: any): Promise<Page>;
    updatePage(id: string, input: UpdatePageInput, context: any): Promise<Page>;
    deletePage(id: string): Promise<Page>;
    duplicatePage(id: string, title?: string, slug?: string, context?: any): Promise<Page>;
    addPageBlock(pageId: string, input: CreatePageBlockInput): Promise<PageBlock>;
    updatePageBlock(id: string, input: UpdatePageBlockInput): Promise<PageBlock>;
    deletePageBlock(id: string): Promise<PageBlock>;
    updatePageBlocksOrder(pageId: string, updates: BulkUpdateBlockOrderInput[]): Promise<PageBlock[]>;
    seoKeywords(page: Page): string[] | null;
}
