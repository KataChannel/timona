import { Comment as GraphQLComment } from '../models/comment.model';
import { User } from '../models/user.model';
import { Post } from '../models/post.model';
import { CreateCommentInput, UpdateCommentInput } from '../inputs/comment.input';
import { CommentService } from '../../services/comment.service';
import { UserService } from '../../services/user.service';
import { PostService } from '../../services/post.service';
import { PubSubService } from '../../services/pubsub.service';
export declare class CommentResolver {
    private readonly commentService;
    private readonly userService;
    private readonly postService;
    private readonly pubSubService;
    constructor(commentService: CommentService, userService: UserService, postService: PostService, pubSubService: PubSubService);
    getCommentsByPost(postId: string): Promise<GraphQLComment[]>;
    getCommentById(id: string): Promise<GraphQLComment>;
    createComment(input: CreateCommentInput, context: any): Promise<GraphQLComment>;
    updateComment(id: string, input: UpdateCommentInput, context: any): Promise<GraphQLComment>;
    deleteComment(id: string, context: any): Promise<boolean>;
    user(comment: GraphQLComment): Promise<User>;
    post(comment: GraphQLComment): Promise<Post>;
    parent(comment: GraphQLComment): Promise<GraphQLComment | null>;
    replies(comment: GraphQLComment): Promise<GraphQLComment[]>;
    newComment(postId?: string): any;
}
