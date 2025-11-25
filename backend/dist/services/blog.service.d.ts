import { PrismaService } from '../prisma/prisma.service';
import { CreateBlogCategoryInput, CreateBlogTagInput } from '../graphql/inputs/blog.input';
export declare class BlogService {
    private prisma;
    constructor(prisma: PrismaService);
    getBlogs(input?: any): Promise<{
        items: {
            tags: {
                id: string;
                createdAt: Date;
                name: string;
                description: string | null;
                slug: string;
                color: string | null;
            }[];
            category: {
                order: number;
                id: string;
                createdAt: Date;
                isActive: boolean;
                name: string;
                updatedAt: Date;
                description: string | null;
                parentId: string | null;
                slug: string;
                thumbnail: string | null;
                metaTitle: string | null;
                metaDescription: string | null;
            };
            author: {
                id: string;
                email: string;
                username: string;
                firstName: string;
                lastName: string;
            };
            password: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            content: string;
            excerpt: string | null;
            slug: string;
            featuredImage: string | null;
            status: import("@prisma/client").$Enums.PostStatus;
            publishedAt: Date | null;
            authorId: string;
            images: string[];
            categoryId: string | null;
            displayOrder: number;
            isFeatured: boolean;
            metaTitle: string | null;
            metaDescription: string | null;
            metaKeywords: string[];
            viewCount: number;
            visibility: import("@prisma/client").$Enums.PostVisibility;
            isPinned: boolean;
            canonicalUrl: string | null;
            commentsEnabled: boolean;
            readingTime: number | null;
            scheduledAt: Date | null;
        }[];
        total: number;
        page: any;
        pageSize: any;
        totalPages: number;
        hasMore: boolean;
    }>;
    getBlogById(id: string): Promise<{
        tags: {
            id: string;
            createdAt: Date;
            name: string;
            description: string | null;
            slug: string;
            color: string | null;
        }[];
        category: {
            order: number;
            id: string;
            createdAt: Date;
            isActive: boolean;
            name: string;
            updatedAt: Date;
            description: string | null;
            parentId: string | null;
            slug: string;
            thumbnail: string | null;
            metaTitle: string | null;
            metaDescription: string | null;
        };
        author: {
            id: string;
            email: string;
            username: string;
            firstName: string;
            lastName: string;
        };
        password: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string;
        excerpt: string | null;
        slug: string;
        featuredImage: string | null;
        status: import("@prisma/client").$Enums.PostStatus;
        publishedAt: Date | null;
        authorId: string;
        images: string[];
        categoryId: string | null;
        displayOrder: number;
        isFeatured: boolean;
        metaTitle: string | null;
        metaDescription: string | null;
        metaKeywords: string[];
        viewCount: number;
        visibility: import("@prisma/client").$Enums.PostVisibility;
        isPinned: boolean;
        canonicalUrl: string | null;
        commentsEnabled: boolean;
        readingTime: number | null;
        scheduledAt: Date | null;
    }>;
    getBlogBySlug(slug: string): Promise<{
        tags: {
            id: string;
            createdAt: Date;
            name: string;
            description: string | null;
            slug: string;
            color: string | null;
        }[];
        category: {
            order: number;
            id: string;
            createdAt: Date;
            isActive: boolean;
            name: string;
            updatedAt: Date;
            description: string | null;
            parentId: string | null;
            slug: string;
            thumbnail: string | null;
            metaTitle: string | null;
            metaDescription: string | null;
        };
        author: {
            id: string;
            email: string;
            username: string;
            firstName: string;
            lastName: string;
        };
        password: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string;
        excerpt: string | null;
        slug: string;
        featuredImage: string | null;
        status: import("@prisma/client").$Enums.PostStatus;
        publishedAt: Date | null;
        authorId: string;
        images: string[];
        categoryId: string | null;
        displayOrder: number;
        isFeatured: boolean;
        metaTitle: string | null;
        metaDescription: string | null;
        metaKeywords: string[];
        viewCount: number;
        visibility: import("@prisma/client").$Enums.PostVisibility;
        isPinned: boolean;
        canonicalUrl: string | null;
        commentsEnabled: boolean;
        readingTime: number | null;
        scheduledAt: Date | null;
    }>;
    getFeaturedBlogs(limit?: number): Promise<({
        category: {
            order: number;
            id: string;
            createdAt: Date;
            isActive: boolean;
            name: string;
            updatedAt: Date;
            description: string | null;
            parentId: string | null;
            slug: string;
            thumbnail: string | null;
            metaTitle: string | null;
            metaDescription: string | null;
        };
        author: {
            id: string;
            email: string;
            username: string;
            firstName: string;
            lastName: string;
        };
    } & {
        password: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string;
        excerpt: string | null;
        slug: string;
        featuredImage: string | null;
        status: import("@prisma/client").$Enums.PostStatus;
        publishedAt: Date | null;
        authorId: string;
        images: string[];
        categoryId: string | null;
        displayOrder: number;
        isFeatured: boolean;
        metaTitle: string | null;
        metaDescription: string | null;
        metaKeywords: string[];
        viewCount: number;
        visibility: import("@prisma/client").$Enums.PostVisibility;
        isPinned: boolean;
        canonicalUrl: string | null;
        commentsEnabled: boolean;
        readingTime: number | null;
        scheduledAt: Date | null;
    })[]>;
    getRecentBlogs(limit?: number): Promise<({
        category: {
            order: number;
            id: string;
            createdAt: Date;
            isActive: boolean;
            name: string;
            updatedAt: Date;
            description: string | null;
            parentId: string | null;
            slug: string;
            thumbnail: string | null;
            metaTitle: string | null;
            metaDescription: string | null;
        };
        author: {
            id: string;
            email: string;
            username: string;
            firstName: string;
            lastName: string;
        };
    } & {
        password: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string;
        excerpt: string | null;
        slug: string;
        featuredImage: string | null;
        status: import("@prisma/client").$Enums.PostStatus;
        publishedAt: Date | null;
        authorId: string;
        images: string[];
        categoryId: string | null;
        displayOrder: number;
        isFeatured: boolean;
        metaTitle: string | null;
        metaDescription: string | null;
        metaKeywords: string[];
        viewCount: number;
        visibility: import("@prisma/client").$Enums.PostVisibility;
        isPinned: boolean;
        canonicalUrl: string | null;
        commentsEnabled: boolean;
        readingTime: number | null;
        scheduledAt: Date | null;
    })[]>;
    createBlog(input: any, userId: string): Promise<{
        category: {
            order: number;
            id: string;
            createdAt: Date;
            isActive: boolean;
            name: string;
            updatedAt: Date;
            description: string | null;
            parentId: string | null;
            slug: string;
            thumbnail: string | null;
            metaTitle: string | null;
            metaDescription: string | null;
        };
        tags: ({
            tag: {
                id: string;
                createdAt: Date;
                name: string;
                description: string | null;
                slug: string;
                color: string | null;
            };
        } & {
            postId: string;
            tagId: string;
        })[];
        author: {
            id: string;
            email: string;
            username: string;
            firstName: string;
            lastName: string;
        };
    } & {
        password: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string;
        excerpt: string | null;
        slug: string;
        featuredImage: string | null;
        status: import("@prisma/client").$Enums.PostStatus;
        publishedAt: Date | null;
        authorId: string;
        images: string[];
        categoryId: string | null;
        displayOrder: number;
        isFeatured: boolean;
        metaTitle: string | null;
        metaDescription: string | null;
        metaKeywords: string[];
        viewCount: number;
        visibility: import("@prisma/client").$Enums.PostVisibility;
        isPinned: boolean;
        canonicalUrl: string | null;
        commentsEnabled: boolean;
        readingTime: number | null;
        scheduledAt: Date | null;
    }>;
    updateBlog(id: string, input: any): Promise<{
        category: {
            order: number;
            id: string;
            createdAt: Date;
            isActive: boolean;
            name: string;
            updatedAt: Date;
            description: string | null;
            parentId: string | null;
            slug: string;
            thumbnail: string | null;
            metaTitle: string | null;
            metaDescription: string | null;
        };
        tags: ({
            tag: {
                id: string;
                createdAt: Date;
                name: string;
                description: string | null;
                slug: string;
                color: string | null;
            };
        } & {
            postId: string;
            tagId: string;
        })[];
        author: {
            id: string;
            email: string;
            username: string;
            firstName: string;
            lastName: string;
        };
    } & {
        password: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string;
        excerpt: string | null;
        slug: string;
        featuredImage: string | null;
        status: import("@prisma/client").$Enums.PostStatus;
        publishedAt: Date | null;
        authorId: string;
        images: string[];
        categoryId: string | null;
        displayOrder: number;
        isFeatured: boolean;
        metaTitle: string | null;
        metaDescription: string | null;
        metaKeywords: string[];
        viewCount: number;
        visibility: import("@prisma/client").$Enums.PostVisibility;
        isPinned: boolean;
        canonicalUrl: string | null;
        commentsEnabled: boolean;
        readingTime: number | null;
        scheduledAt: Date | null;
    }>;
    deleteBlog(id: string): Promise<{
        success: boolean;
    }>;
    getCategories(): Promise<{
        postCount: number;
        _count: {
            posts: number;
        };
        order: number;
        id: string;
        createdAt: Date;
        isActive: boolean;
        name: string;
        updatedAt: Date;
        description: string | null;
        parentId: string | null;
        slug: string;
        thumbnail: string | null;
        metaTitle: string | null;
        metaDescription: string | null;
    }[]>;
    getCategoryById(id: string): Promise<{
        postCount: number;
        _count: {
            posts: number;
        };
        order: number;
        id: string;
        createdAt: Date;
        isActive: boolean;
        name: string;
        updatedAt: Date;
        description: string | null;
        parentId: string | null;
        slug: string;
        thumbnail: string | null;
        metaTitle: string | null;
        metaDescription: string | null;
    }>;
    createCategory(input: CreateBlogCategoryInput): Promise<{
        order: number;
        id: string;
        createdAt: Date;
        isActive: boolean;
        name: string;
        updatedAt: Date;
        description: string | null;
        parentId: string | null;
        slug: string;
        thumbnail: string | null;
        metaTitle: string | null;
        metaDescription: string | null;
    }>;
    updateCategory(id: string, input: any): Promise<{
        order: number;
        id: string;
        createdAt: Date;
        isActive: boolean;
        name: string;
        updatedAt: Date;
        description: string | null;
        parentId: string | null;
        slug: string;
        thumbnail: string | null;
        metaTitle: string | null;
        metaDescription: string | null;
    }>;
    deleteCategory(id: string): Promise<{
        success: boolean;
    }>;
    getTags(): Promise<({
        _count: {
            posts: number;
        };
    } & {
        id: string;
        createdAt: Date;
        name: string;
        description: string | null;
        slug: string;
        color: string | null;
    })[]>;
    getTagById(id: string): Promise<{
        _count: {
            posts: number;
        };
    } & {
        id: string;
        createdAt: Date;
        name: string;
        description: string | null;
        slug: string;
        color: string | null;
    }>;
    createTag(input: CreateBlogTagInput): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        description: string | null;
        slug: string;
        color: string | null;
    }>;
    updateTag(id: string, input: any): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        description: string | null;
        slug: string;
        color: string | null;
    }>;
    deleteTag(id: string): Promise<{
        success: boolean;
    }>;
    getBlogsByCategory(categoryId: string, input?: any): Promise<{
        items: {
            tags: {
                id: string;
                createdAt: Date;
                name: string;
                description: string | null;
                slug: string;
                color: string | null;
            }[];
            category: {
                order: number;
                id: string;
                createdAt: Date;
                isActive: boolean;
                name: string;
                updatedAt: Date;
                description: string | null;
                parentId: string | null;
                slug: string;
                thumbnail: string | null;
                metaTitle: string | null;
                metaDescription: string | null;
            };
            author: {
                id: string;
                email: string;
                username: string;
                firstName: string;
                lastName: string;
            };
            password: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            content: string;
            excerpt: string | null;
            slug: string;
            featuredImage: string | null;
            status: import("@prisma/client").$Enums.PostStatus;
            publishedAt: Date | null;
            authorId: string;
            images: string[];
            categoryId: string | null;
            displayOrder: number;
            isFeatured: boolean;
            metaTitle: string | null;
            metaDescription: string | null;
            metaKeywords: string[];
            viewCount: number;
            visibility: import("@prisma/client").$Enums.PostVisibility;
            isPinned: boolean;
            canonicalUrl: string | null;
            commentsEnabled: boolean;
            readingTime: number | null;
            scheduledAt: Date | null;
        }[];
        total: number;
        page: any;
        pageSize: any;
        totalPages: number;
        hasMore: boolean;
    }>;
    getRelatedBlogs(blogId: string, limit?: number): Promise<({
        category: {
            order: number;
            id: string;
            createdAt: Date;
            isActive: boolean;
            name: string;
            updatedAt: Date;
            description: string | null;
            parentId: string | null;
            slug: string;
            thumbnail: string | null;
            metaTitle: string | null;
            metaDescription: string | null;
        };
        tags: ({
            tag: {
                id: string;
                createdAt: Date;
                name: string;
                description: string | null;
                slug: string;
                color: string | null;
            };
        } & {
            postId: string;
            tagId: string;
        })[];
        author: {
            id: string;
            email: string;
            username: string;
            firstName: string;
            lastName: string;
        };
    } & {
        password: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string;
        excerpt: string | null;
        slug: string;
        featuredImage: string | null;
        status: import("@prisma/client").$Enums.PostStatus;
        publishedAt: Date | null;
        authorId: string;
        images: string[];
        categoryId: string | null;
        displayOrder: number;
        isFeatured: boolean;
        metaTitle: string | null;
        metaDescription: string | null;
        metaKeywords: string[];
        viewCount: number;
        visibility: import("@prisma/client").$Enums.PostVisibility;
        isPinned: boolean;
        canonicalUrl: string | null;
        commentsEnabled: boolean;
        readingTime: number | null;
        scheduledAt: Date | null;
    })[]>;
}
