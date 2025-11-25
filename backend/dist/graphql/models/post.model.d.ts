import { PostStatus } from '@prisma/client';
import { Tag } from './tag.model';
export declare class Post {
    id: string;
    title: string;
    content: string;
    excerpt?: string;
    slug: string;
    featuredImage?: string;
    status: PostStatus;
    publishedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    authorId: string;
    author: any;
    comments?: any[];
    tags?: Tag[];
    likesCount?: number;
    commentsCount?: number;
}
