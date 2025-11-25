export declare enum BlogStatus {
    DRAFT = "DRAFT",
    PUBLISHED = "PUBLISHED",
    ARCHIVED = "ARCHIVED"
}
export declare enum BlogSortBy {
    LATEST = "LATEST",
    OLDEST = "OLDEST",
    POPULAR = "POPULAR",
    FEATURED = "FEATURED"
}
export declare class BlogAuthorType {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
}
export declare class BlogTagType {
    id: string;
    name: string;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class BlogCategoryType {
    id: string;
    name: string;
    slug: string;
    description?: string;
    thumbnail?: string;
    order: number;
    isActive: boolean;
    postCount: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare class BlogType {
    id: string;
    title: string;
    slug: string;
    content: string;
    shortDescription?: string;
    excerpt?: string;
    author: BlogAuthorType;
    featuredImage?: string;
    thumbnailUrl?: string;
    bannerUrl?: string;
    images?: string[];
    status: string;
    visibility: string;
    viewCount: number;
    publishedAt?: Date;
    updatedAt: Date;
    category?: BlogCategoryType;
    tags?: BlogTagType[];
    isFeatured: boolean;
    isPinned: boolean;
    isPublished: boolean;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
    canonicalUrl?: string;
    commentsEnabled: boolean;
    readingTime?: number;
    createdAt: Date;
}
export declare class PaginatedBlogs {
    items: BlogType[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasMore: boolean;
}
