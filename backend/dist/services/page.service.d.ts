import { PrismaService } from '../prisma/prisma.service';
import { CreatePageInput, UpdatePageInput, PageFiltersInput, BulkUpdateBlockOrderInput, CreatePageBlockInput, UpdatePageBlockInput } from '../graphql/inputs/page.input';
import { Page, PageBlock, PaginatedPages } from '../graphql/models/page.model';
import { PaginationInput } from '../graphql/models/pagination.model';
export declare class PageService {
    private readonly prisma;
    private readonly RESERVED_SLUGS;
    constructor(prisma: PrismaService);
    private convertBlocksToPrismaFormat;
    create(input: CreatePageInput, userId: string): Promise<Page>;
    findMany(pagination?: PaginationInput, filters?: PageFiltersInput): Promise<PaginatedPages>;
    findById(id: string): Promise<Page>;
    findBySlug(slug: string): Promise<Page | null>;
    update(id: string, input: UpdatePageInput, userId: string): Promise<Page>;
    delete(id: string): Promise<Page>;
    addBlock(pageId: string, input: CreatePageBlockInput): Promise<PageBlock>;
    updateBlock(id: string, input: UpdatePageBlockInput): Promise<PageBlock>;
    deleteBlock(id: string): Promise<PageBlock>;
    updateBlocksOrder(pageId: string, updates: BulkUpdateBlockOrderInput[]): Promise<PageBlock[]>;
    findPublished(pagination?: PaginationInput): Promise<PaginatedPages>;
    findHomepage(): Promise<Page | null>;
    findBySlugPattern(slugPattern: string): Promise<Page | null>;
    duplicate(id: string, userId: string, newTitle?: string, newSlug?: string): Promise<Page>;
    getReservedSlugs(): string[];
    isSlugReserved(slug: string): boolean;
}
