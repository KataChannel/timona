import { SourceDocumentType, SourceDocumentStatus } from '@prisma/client';
export declare class CreateSourceDocumentCategoryInput {
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    color?: string;
    parentId?: string;
}
export declare class UpdateSourceDocumentCategoryInput {
    name?: string;
    slug?: string;
    description?: string;
    icon?: string;
    color?: string;
    parentId?: string;
}
export declare class CreateSourceDocumentInput {
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
    metadata?: any;
}
export declare class UpdateSourceDocumentInput {
    title?: string;
    description?: string;
    type?: SourceDocumentType;
    status?: SourceDocumentStatus;
    url?: string;
    content?: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    duration?: number;
    thumbnailUrl?: string;
    categoryId?: string;
    tags?: string[];
    metadata?: any;
}
export declare class SourceDocumentFilterInput {
    types?: SourceDocumentType[];
    statuses?: SourceDocumentStatus[];
    categoryId?: string;
    userId?: string;
    search?: string;
    tags?: string[];
    isAiAnalyzed?: boolean;
}
export declare class LinkDocumentToCourseInput {
    courseId: string;
    documentId: string;
    order?: number;
    isRequired: boolean;
    description?: string;
}
export declare class UpdateCourseDocumentLinkInput {
    order?: number;
    isRequired?: boolean;
    description?: string;
}
