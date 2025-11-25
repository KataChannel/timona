import { PrismaService } from '../prisma/prisma.service';
import { Post } from '@prisma/client';
import { CreatePostInput, UpdatePostInput, PostFiltersInput } from '../graphql/inputs/post.input';
import { PaginationInput } from '../graphql/models/pagination.model';
import { PaginatedPosts } from '../graphql/models/paginated-posts.model';
type GraphQLPost = Post & {
    author: any;
    tags: any[];
};
export declare class PostService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private transformPost;
    findById(id: string): Promise<GraphQLPost>;
    findBySlug(slug: string): Promise<GraphQLPost>;
    findMany(pagination: PaginationInput, filters?: PostFiltersInput): Promise<PaginatedPosts>;
    findByAuthor(authorId: string): Promise<GraphQLPost[]>;
    create(input: CreatePostInput & {
        authorId: string;
    }): Promise<GraphQLPost>;
    update(id: string, input: UpdatePostInput): Promise<GraphQLPost>;
    delete(id: string): Promise<void>;
    publish(id: string): Promise<GraphQLPost>;
    getLikesCount(postId: string): Promise<number>;
    private updatePostTags;
}
export {};
