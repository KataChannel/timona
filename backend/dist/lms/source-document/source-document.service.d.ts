import { PrismaService } from '../../prisma/prisma.service';
import { GeminiService } from '../../ai/gemini.service';
import { CreateSourceDocumentInput, UpdateSourceDocumentInput, SourceDocumentFilterInput, LinkDocumentToCourseInput, UpdateCourseDocumentLinkInput } from './dto/source-document.dto';
import { Prisma } from '@prisma/client';
export declare class SourceDocumentService {
    private prisma;
    private geminiService;
    constructor(prisma: PrismaService, geminiService: GeminiService);
    private transformDocument;
    create(userId: string, input: CreateSourceDocumentInput): Promise<any>;
    findAll(filter?: SourceDocumentFilterInput, page?: number, limit?: number): Promise<{
        items: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<any>;
    update(id: string, input: UpdateSourceDocumentInput): Promise<any>;
    delete(id: string): Promise<{
        type: import("@prisma/client").$Enums.SourceDocumentType;
        id: string;
        createdAt: Date;
        userId: string;
        updatedAt: Date;
        tags: string[];
        description: string | null;
        metadata: Prisma.JsonValue | null;
        title: string;
        content: string | null;
        status: import("@prisma/client").$Enums.SourceDocumentStatus;
        publishedAt: Date | null;
        url: string | null;
        mimeType: string | null;
        usageCount: number;
        categoryId: string | null;
        viewCount: number;
        fileName: string | null;
        fileSize: bigint | null;
        duration: number | null;
        thumbnailUrl: string | null;
        downloadCount: number;
        aiSummary: string | null;
        aiKeywords: string[];
        aiTopics: string[];
        aiAnalyzedAt: Date | null;
        isAiAnalyzed: boolean;
    }>;
    linkToCourse(userId: string, input: LinkDocumentToCourseInput): Promise<{
        document: {
            category: {
                id: string;
                createdAt: Date;
                name: string;
                updatedAt: Date;
                description: string | null;
                parentId: string | null;
                slug: string;
                color: string | null;
                icon: string | null;
            };
        } & {
            type: import("@prisma/client").$Enums.SourceDocumentType;
            id: string;
            createdAt: Date;
            userId: string;
            updatedAt: Date;
            tags: string[];
            description: string | null;
            metadata: Prisma.JsonValue | null;
            title: string;
            content: string | null;
            status: import("@prisma/client").$Enums.SourceDocumentStatus;
            publishedAt: Date | null;
            url: string | null;
            mimeType: string | null;
            usageCount: number;
            categoryId: string | null;
            viewCount: number;
            fileName: string | null;
            fileSize: bigint | null;
            duration: number | null;
            thumbnailUrl: string | null;
            downloadCount: number;
            aiSummary: string | null;
            aiKeywords: string[];
            aiTopics: string[];
            aiAnalyzedAt: Date | null;
            isAiAnalyzed: boolean;
        };
    } & {
        order: number | null;
        id: string;
        description: string | null;
        isRequired: boolean;
        courseId: string;
        documentId: string;
        addedBy: string | null;
        addedAt: Date;
    }>;
    unlinkFromCourse(courseId: string, documentId: string): Promise<{
        success: boolean;
    }>;
    updateCourseLink(id: string, input: UpdateCourseDocumentLinkInput): Promise<{
        document: {
            category: {
                id: string;
                createdAt: Date;
                name: string;
                updatedAt: Date;
                description: string | null;
                parentId: string | null;
                slug: string;
                color: string | null;
                icon: string | null;
            };
        } & {
            type: import("@prisma/client").$Enums.SourceDocumentType;
            id: string;
            createdAt: Date;
            userId: string;
            updatedAt: Date;
            tags: string[];
            description: string | null;
            metadata: Prisma.JsonValue | null;
            title: string;
            content: string | null;
            status: import("@prisma/client").$Enums.SourceDocumentStatus;
            publishedAt: Date | null;
            url: string | null;
            mimeType: string | null;
            usageCount: number;
            categoryId: string | null;
            viewCount: number;
            fileName: string | null;
            fileSize: bigint | null;
            duration: number | null;
            thumbnailUrl: string | null;
            downloadCount: number;
            aiSummary: string | null;
            aiKeywords: string[];
            aiTopics: string[];
            aiAnalyzedAt: Date | null;
            isAiAnalyzed: boolean;
        };
    } & {
        order: number | null;
        id: string;
        description: string | null;
        isRequired: boolean;
        courseId: string;
        documentId: string;
        addedBy: string | null;
        addedAt: Date;
    }>;
    getCourseDocuments(courseId: string): Promise<({
        document: {
            category: {
                id: string;
                createdAt: Date;
                name: string;
                updatedAt: Date;
                description: string | null;
                parentId: string | null;
                slug: string;
                color: string | null;
                icon: string | null;
            };
        } & {
            type: import("@prisma/client").$Enums.SourceDocumentType;
            id: string;
            createdAt: Date;
            userId: string;
            updatedAt: Date;
            tags: string[];
            description: string | null;
            metadata: Prisma.JsonValue | null;
            title: string;
            content: string | null;
            status: import("@prisma/client").$Enums.SourceDocumentStatus;
            publishedAt: Date | null;
            url: string | null;
            mimeType: string | null;
            usageCount: number;
            categoryId: string | null;
            viewCount: number;
            fileName: string | null;
            fileSize: bigint | null;
            duration: number | null;
            thumbnailUrl: string | null;
            downloadCount: number;
            aiSummary: string | null;
            aiKeywords: string[];
            aiTopics: string[];
            aiAnalyzedAt: Date | null;
            isAiAnalyzed: boolean;
        };
    } & {
        order: number | null;
        id: string;
        description: string | null;
        isRequired: boolean;
        courseId: string;
        documentId: string;
        addedBy: string | null;
        addedAt: Date;
    })[]>;
    incrementDownloadCount(id: string): Promise<any>;
    getStats(userId?: string): Promise<{
        total: number;
        byType: (Prisma.PickEnumerable<Prisma.SourceDocumentGroupByOutputType, "type"[]> & {
            _count: number;
        })[];
        byStatus: (Prisma.PickEnumerable<Prisma.SourceDocumentGroupByOutputType, "status"[]> & {
            _count: number;
        })[];
        recentlyAdded: {
            type: import("@prisma/client").$Enums.SourceDocumentType;
            id: string;
            createdAt: Date;
            title: string;
            status: import("@prisma/client").$Enums.SourceDocumentStatus;
        }[];
    }>;
    analyzeDocument(id: string): Promise<any>;
    bulkAnalyze(userId?: string): Promise<{
        analyzed: number;
        failed: number;
    }>;
}
