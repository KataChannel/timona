import { PostStatus, PostVisibility } from '@prisma/client';
export declare class CreateBlogInput {
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    author?: string;
    featuredImage?: string;
    images?: string[];
    categoryId?: string;
    tagIds?: string[];
    status?: PostStatus;
    visibility?: PostVisibility;
    isFeatured?: boolean;
    isPinned?: boolean;
    publishedAt?: Date;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
    canonicalUrl?: string;
    commentsEnabled?: boolean;
    readingTime?: number;
}
export declare class UpdateBlogInput {
    id: string;
    title?: string;
    slug?: string;
    content?: string;
    excerpt?: string;
    author?: string;
    featuredImage?: string;
    images?: string[];
    categoryId?: string;
    tagIds?: string[];
    status?: PostStatus;
    visibility?: PostVisibility;
    isFeatured?: boolean;
    isPinned?: boolean;
    publishedAt?: Date;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
    canonicalUrl?: string;
    commentsEnabled?: boolean;
    readingTime?: number;
}
export declare class GetBlogsInput {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    sort?: string;
}
export declare class CreateBlogCategoryInput {
    name: string;
    slug?: string;
    description?: string;
    thumbnail?: string;
    order?: number;
    isActive?: boolean;
}
export declare class UpdateBlogCategoryInput {
    name?: string;
    slug?: string;
    description?: string;
    thumbnail?: string;
    order?: number;
    isActive?: boolean;
}
export declare class CreateBlogTagInput {
    name: string;
    slug?: string;
}
export declare class UpdateBlogTagInput {
    id: string;
    name?: string;
    slug?: string;
}
