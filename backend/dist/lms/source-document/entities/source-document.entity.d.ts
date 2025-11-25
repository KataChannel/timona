import { SourceDocumentType, SourceDocumentStatus } from '@prisma/client';
import { User } from '../../../graphql/models/user.model';
export declare class SourceDocumentCategory {
    id: string;
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    color?: string;
    parentId?: string;
    parent?: SourceDocumentCategory;
    children?: SourceDocumentCategory[];
    sourceDocuments?: SourceDocument[];
    createdAt: Date;
    updatedAt: Date;
}
export declare class SourceDocument {
    id: string;
    title: string;
    description?: string;
    type: SourceDocumentType;
    status: SourceDocumentStatus;
    url?: string;
    content?: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    duration?: number;
    thumbnailUrl?: string;
    categoryId?: string;
    tags: string[];
    aiSummary?: string;
    aiKeywords: string[];
    aiTopics: string[];
    aiAnalyzedAt?: Date;
    isAiAnalyzed: boolean;
    metadata?: any;
    userId: string;
    category?: SourceDocumentCategory;
    user?: User;
    viewCount: number;
    downloadCount: number;
    usageCount: number;
    createdAt: Date;
    updatedAt: Date;
    publishedAt?: Date;
}
export declare class CourseSourceDocument {
    id: string;
    courseId: string;
    documentId: string;
    order?: number;
    isRequired: boolean;
    description?: string;
    addedBy?: string;
    addedAt: Date;
    document: SourceDocument;
}
