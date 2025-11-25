import { Post } from './post.model';
export declare class Tag {
    id: string;
    name: string;
    slug: string;
    description?: string;
    color?: string;
    createdAt: Date;
    updatedAt: Date;
    posts?: Post[];
    postsCount?: number;
}
