import { PageStatus, BlockType } from '../models/page.model';
export declare class CreatePageBlockInput {
    type: BlockType;
    content?: any;
    style?: any;
    order?: number;
    isVisible?: boolean;
    parentId?: string;
    depth?: number;
    config?: any;
    children?: CreatePageBlockInput[];
}
export declare class UpdatePageBlockInput {
    id?: string;
    type?: BlockType;
    content?: any;
    style?: any;
    order?: number;
    isVisible?: boolean;
    parentId?: string;
    depth?: number;
    config?: any;
    children?: UpdatePageBlockInput[];
}
export declare class CreatePageInput {
    title: string;
    slug: string;
    description?: string;
    content?: any;
    status: PageStatus;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string[];
    ogImage?: string;
    isHomepage?: boolean;
    isDynamic?: boolean;
    dynamicConfig?: any;
    blocks?: CreatePageBlockInput[];
}
export declare class UpdatePageInput {
    title?: string;
    slug?: string;
    description?: string;
    content?: any;
    status?: PageStatus;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string[];
    ogImage?: string;
    isHomepage?: boolean;
    isDynamic?: boolean;
    dynamicConfig?: any;
    blocks?: UpdatePageBlockInput[];
}
export declare class PageFiltersInput {
    search?: string;
    title?: string;
    slug?: string;
    status?: PageStatus;
    createdBy?: string;
}
export declare class BulkUpdateBlockOrderInput {
    id: string;
    order: number;
}
