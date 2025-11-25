import { SourceDocumentCategoryService } from './source-document-category.service';
import { CreateSourceDocumentCategoryInput, UpdateSourceDocumentCategoryInput } from './dto/source-document.dto';
export declare class SourceDocumentCategoryResolver {
    private readonly categoryService;
    constructor(categoryService: SourceDocumentCategoryService);
    createSourceDocumentCategory(input: CreateSourceDocumentCategoryInput): Promise<{
        parent: {
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
        children: {
            id: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            description: string | null;
            parentId: string | null;
            slug: string;
            color: string | null;
            icon: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        description: string | null;
        parentId: string | null;
        slug: string;
        color: string | null;
        icon: string | null;
    }>;
    sourceDocumentCategories(): Promise<({
        _count: {
            sourceDocuments: number;
        };
        parent: {
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
        children: {
            id: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            description: string | null;
            parentId: string | null;
            slug: string;
            color: string | null;
            icon: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        description: string | null;
        parentId: string | null;
        slug: string;
        color: string | null;
        icon: string | null;
    })[]>;
    sourceDocumentCategory(id: string): Promise<{
        sourceDocuments: {
            type: import("@prisma/client").$Enums.SourceDocumentType;
            id: string;
            createdAt: Date;
            userId: string;
            updatedAt: Date;
            tags: string[];
            description: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
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
        }[];
        _count: {
            sourceDocuments: number;
        };
        parent: {
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
        children: {
            id: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            description: string | null;
            parentId: string | null;
            slug: string;
            color: string | null;
            icon: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        description: string | null;
        parentId: string | null;
        slug: string;
        color: string | null;
        icon: string | null;
    }>;
    updateSourceDocumentCategory(id: string, input: UpdateSourceDocumentCategoryInput): Promise<{
        parent: {
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
        children: {
            id: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            description: string | null;
            parentId: string | null;
            slug: string;
            color: string | null;
            icon: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        description: string | null;
        parentId: string | null;
        slug: string;
        color: string | null;
        icon: string | null;
    }>;
    deleteSourceDocumentCategory(id: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        description: string | null;
        parentId: string | null;
        slug: string;
        color: string | null;
        icon: string | null;
    }>;
    sourceDocumentCategoryTree(): Promise<({
        _count: {
            sourceDocuments: number;
        };
        children: ({
            _count: {
                sourceDocuments: number;
            };
            children: {
                id: string;
                createdAt: Date;
                name: string;
                updatedAt: Date;
                description: string | null;
                parentId: string | null;
                slug: string;
                color: string | null;
                icon: string | null;
            }[];
        } & {
            id: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            description: string | null;
            parentId: string | null;
            slug: string;
            color: string | null;
            icon: string | null;
        })[];
    } & {
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        description: string | null;
        parentId: string | null;
        slug: string;
        color: string | null;
        icon: string | null;
    })[]>;
}
