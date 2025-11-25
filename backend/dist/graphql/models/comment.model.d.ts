import { User } from './user.model';
export declare class Comment {
    id: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    postId: string;
    userId: string;
    parentId?: string;
    post: any;
    user: User;
    parent?: Comment;
    replies: Comment[];
}
