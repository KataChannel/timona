import { PostStatus } from '@prisma/client';
export declare class CreatePostInput {
    title: string;
    content: string;
    excerpt?: string;
    slug: string;
    featuredImage?: string;
    status?: PostStatus;
    tags?: string[];
}
export declare class UpdatePostInput {
    title?: string;
    content?: string;
    excerpt?: string;
    slug?: string;
    featuredImage?: string;
    status?: PostStatus;
    tags?: string[];
}
export declare class PostFiltersInput {
    search?: string;
    status?: PostStatus;
    authorId?: string;
    tags?: string[];
}
