import { PrismaService } from '../prisma/prisma.service';
import { Comment } from '@prisma/client';
import { CreateCommentInput, UpdateCommentInput } from '../graphql/inputs/comment.input';
type GraphQLComment = Comment & {
    user: any;
    post: any;
    parent?: any;
    replies: any[];
};
export declare class CommentService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private transformComment;
    findById(id: string): Promise<GraphQLComment>;
    findByPost(postId: string): Promise<GraphQLComment[]>;
    findReplies(parentId: string): Promise<GraphQLComment[]>;
    create(input: CreateCommentInput & {
        userId: string;
    }): Promise<GraphQLComment>;
    update(id: string, input: UpdateCommentInput): Promise<GraphQLComment>;
    delete(id: string): Promise<void>;
    getCommentsCount(postId: string): Promise<number>;
}
export {};
