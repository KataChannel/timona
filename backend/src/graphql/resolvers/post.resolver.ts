import { Resolver, Query, Mutation, Args, Context, Subscription, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Post } from '../models/post.model';
import { User } from '../models/user.model';
import { Comment } from '../models/comment.model';
import { PaginatedPosts } from '../models/paginated-posts.model';
import { CreatePostInput, UpdatePostInput, PostFiltersInput } from '../inputs/post.input';
import { PaginationInput } from '../models/pagination.model';
import { PostService } from '../../services/post.service';
import { UserService } from '../../services/user.service';
import { CommentService } from '../../services/comment.service';
import { PubSubService } from '../../services/pubsub.service';
import { $Enums } from '@prisma/client';

@Resolver(() => Post)
export class PostResolver {
  constructor(
    private readonly postService: PostService,
    private readonly userService: UserService,
    private readonly commentService: CommentService,
    private readonly pubSubService: PubSubService,
  ) {}

  // Queries
  @Query(() => PaginatedPosts, { name: 'getPosts' })
  async getPosts(
    @Args('pagination', { defaultValue: { page: 1, limit: 10 } }) pagination: PaginationInput,
    @Args('filters', { nullable: true }) filters?: PostFiltersInput,
  ): Promise<PaginatedPosts> {
    return this.postService.findMany(pagination, filters);
  }

  @Query(() => Post, { name: 'getPostById' })
  async getPostById(@Args('id') id: string): Promise<Post> {
    return this.postService.findById(id);
  }

  @Query(() => Post, { name: 'getPostBySlug' })
  async getPostBySlug(@Args('slug') slug: string): Promise<Post> {
    return this.postService.findBySlug(slug);
  }

  @Query(() => [Post], { name: 'getMyPosts' })
  @UseGuards(JwtAuthGuard)
  async getMyPosts(@Context() context: any): Promise<Post[]> {
    const userId = context.req.user.id;
    return this.postService.findByAuthor(userId);
  }

  // Mutations
  @Mutation(() => Post, { name: 'createPost' })
  @UseGuards(JwtAuthGuard)
  async createPost(
    @Args('input') input: CreatePostInput,
    @Context() context: any,
  ): Promise<Post> {
    const authorId = context.req.user.id;
    const post = await this.postService.create({ ...input, authorId });
    
        // Publish event for real-time subscriptions
    this.pubSubService.publishPostCreated(post);
    
    return post;
  }

  @Mutation(() => Post, { name: 'updatePost' })
  @UseGuards(JwtAuthGuard)
  async updatePost(
    @Args('id') id: string,
    @Args('input') input: UpdatePostInput,
    @Context() context: any,
  ): Promise<Post> {
    const currentUser = context.req.user;
    const post = await this.postService.findById(id);
    
    // Only author or admin can update post
    if (post.authorId !== currentUser.id && currentUser.roleType !== $Enums.UserRoleType.ADMIN) {
      throw new Error('Unauthorized');
    }
    
    const updatedPost = await this.postService.update(id, input);
    
    // Publish post updated event
    this.pubSubService.publishPostUpdated(updatedPost);
    
    return updatedPost;
  }

  @Mutation(() => Boolean, { name: 'deletePost' })
  @UseGuards(JwtAuthGuard)
  async deletePost(
    @Args('id') id: string,
    @Context() context: any,
  ): Promise<boolean> {
    const currentUser = context.req.user;
    const post = await this.postService.findById(id);
    
    // Only author or admin can delete post
    if (post.authorId !== currentUser.id && currentUser.roleType !== $Enums.UserRoleType.ADMIN) {
      throw new Error('Unauthorized');
    }
    
    await this.postService.delete(id);
    
    // Publish post deleted event
    this.pubSubService.publishPostDeleted(id);
    
    return true;
  }

  @Mutation(() => Post, { name: 'publishPost' })
  @UseGuards(JwtAuthGuard)
  async publishPost(
    @Args('id') id: string,
    @Context() context: any,
  ): Promise<Post> {
    const currentUser = context.req.user;
    const post = await this.postService.findById(id);
    
    // Only author or admin can publish post
    if (post.authorId !== currentUser.id && currentUser.roleType !== $Enums.UserRoleType.ADMIN) {
      throw new Error('Unauthorized');
    }
    
    return this.postService.publish(id);
  }

  // Field Resolvers
  @ResolveField(() => User)
  async author(@Parent() post: Post): Promise<User> {
    return this.userService.findById(post.authorId);
  }

  @ResolveField(() => [Comment])
  async comments(@Parent() post: Post): Promise<Comment[]> {
    return this.commentService.findByPost(post.id);
  }

  @ResolveField(() => Number)
  async likesCount(@Parent() post: Post): Promise<number> {
    return this.postService.getLikesCount(post.id);
  }

  @ResolveField(() => Number)
  async commentsCount(@Parent() post: Post): Promise<number> {
    return this.commentService.getCommentsCount(post.id);
  }

  // Subscriptions
  @Subscription(() => Post, { name: 'postCreated', nullable: true })
  postCreated() {
    return this.pubSubService.getPostCreatedIterator();
  }

  @Subscription(() => Post, { name: 'postUpdated', nullable: true })
  postUpdated() {
    return this.pubSubService.getPostUpdatedIterator();
  }
}
