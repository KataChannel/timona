import { Resolver, Query, Mutation, Args, Context, Subscription, ResolveField, Parent, ID, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RateLimitGuard } from '../../common/guards/rate-limit.guard';
import { InputSanitizationInterceptor } from '../../common/interceptors/input-sanitization.interceptor';
import { Task } from '../models/task.model';
import { TaskMedia } from '../models/task-media.model';
import { TaskShare } from '../models/task-share.model';
import { TaskComment } from '../models/task-comment.model';
import { Notification } from '../models/notification.model';
import { User } from '../models/user.model';
import { TasksPaginatedResult } from '../models/paginated-result.model';
import { CreateTaskInput, UpdateTaskInput, TaskFilterInput } from '../inputs/task.input';
import { ShareTaskInput, UpdateTaskShareInput } from '../inputs/task-share.input';
import { CreateTaskCommentInput, UpdateTaskCommentInput } from '../inputs/task-comment.input';
import { UploadTaskMediaInput } from '../inputs/task-media.input';
import { TaskService } from '../../services/task.service';
import { TaskShareService } from '../../services/task-share.service';
import { TaskCommentService } from '../../services/task-comment.service';
import { TaskMediaService } from '../../services/task-media.service';
// import { NotificationService } from '../../services/notification.service'; // Moved to EcommerceModule
import { UserService } from '../../services/user.service';
import { PubSubService } from '../../services/pubsub.service';
import { TaskDataLoaderService } from '../../common/data-loaders/task-data-loader.service';
import { CacheInvalidationService } from '../../common/services/cache-invalidation.service';

@Resolver(() => Task)
export class TaskResolver {
  constructor(
    private readonly taskService: TaskService,
    private readonly taskShareService: TaskShareService,
    private readonly taskCommentService: TaskCommentService,
    private readonly taskMediaService: TaskMediaService,
    // private readonly notificationService: NotificationService, // Removed - moved to EcommerceModule
    private readonly userService: UserService,
    private readonly pubSubService: PubSubService,
    private readonly taskDataLoaderService: TaskDataLoaderService,
    private readonly cacheInvalidationService: CacheInvalidationService,
  ) {}

  // Queries
  @Query(() => [Task], { name: 'getTasks' })
  @UseGuards(JwtAuthGuard, RateLimitGuard)
  async getTasks(
    @Context() context: any,
    @Args('filters', { nullable: true }) filters?: TaskFilterInput,
  ): Promise<any[]> {
    const userId = context.req.user.id;
    return this.taskService.findByUserId(userId, filters);
  }

  @Query(() => Task, { name: 'getTaskById' })
  @UseGuards(JwtAuthGuard, RateLimitGuard)
  async getTaskById(
    @Args('id', { type: () => ID }) id: string,
    @Context() context: any,
  ): Promise<any> {
    const userId = context.req.user.id;
    return this.taskService.findById(id, userId);
  }

  @Query(() => Task, { name: 'getTask', nullable: true })
  @UseGuards(JwtAuthGuard, RateLimitGuard)
  async getTask(
    @Args('id') id: string,
    @Context() context: any,
  ): Promise<any> {
    const userId = context.req.user.id;
    return this.taskService.findById(id, userId);
  }

  @Query(() => [Task], { name: 'getSharedTasks' })
  @UseGuards(JwtAuthGuard, RateLimitGuard)
  async getSharedTasks(
    @Context() context: any,
    @Args('filters', { nullable: true }) filters?: TaskFilterInput,
  ): Promise<any[]> {
    const userId = context.req.user.id;
    return this.taskService.findSharedTasks(userId, filters);
  }

  @Query(() => TasksPaginatedResult, { name: 'getTasksPaginated' })
  @UseGuards(JwtAuthGuard, RateLimitGuard)
  async getTasksPaginated(
    @Context() context: any,
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
    @Args('filters', { nullable: true }) filters?: TaskFilterInput,
  ): Promise<TasksPaginatedResult> {
    const userId = context.req.user.id;
    const result = await this.taskService.findPaginated(userId, page, limit, filters);
    return {
      data: result.data as unknown as Task[],
      meta: {
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
        hasNextPage: page < Math.ceil(result.total / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  // Mutations
  @Mutation(() => Task, { name: 'createTask' })
  @UseGuards(JwtAuthGuard, RateLimitGuard)
  async createTask(
    @Args('input') input: CreateTaskInput,
    @Context() context: any,
  ): Promise<any> {
    const userId = context.req.user.id; // Changed from .sub to .id
    const task = await this.taskService.create(input, userId);
    
    // Publish task created event
    console.log('Publishing taskCreated with task:', task);
    this.pubSubService.publishTaskCreated(task);
    
    // Smart cache invalidation
    await this.cacheInvalidationService.invalidateTaskCache(task.id, userId);
    
    return task;
  }

  @Mutation(() => Task, { name: 'updateTask' })
  @UseGuards(JwtAuthGuard, RateLimitGuard)
  async updateTask(
    @Args('input') input: UpdateTaskInput,
    @Context() context: any,
  ): Promise<any> {
    const userId = context.req.user.id;
    const task = await this.taskService.update(input, userId);
    
    // Publish task updated event
    console.log('Publishing taskUpdated with task:', task);
    try {
      this.pubSubService.publishTaskUpdated(task);
      console.log('Successfully published taskUpdated event');
    } catch (error) {
      console.error('Failed to publish taskUpdated event:', error);
    }
    
    // Create notification if task is completed
    // TODO: Re-implement task notifications in a separate module if needed
    // if (input.status === 'COMPLETED') {
    //   await this.notificationService.createTaskCompletedNotification(task.id, userId);
    // }
    
    // Smart cache invalidation
    await this.cacheInvalidationService.invalidateTaskCache(task.id, userId);
    
    return task;
  }

  @Mutation(() => Boolean, { name: 'deleteTask' })
  @UseGuards(JwtAuthGuard, RateLimitGuard)
  async deleteTask(
    @Args('id') id: string,
    @Context() context: any,
  ): Promise<boolean> {
    const userId = context.req.user.id;
    await this.taskService.delete(id, userId);
    
    // Publish task deleted event
    await this.pubSubService.publish('taskDeleted', { taskDeleted: { id } });
    
    // Smart cache invalidation
    await this.cacheInvalidationService.invalidateTaskCache(id, userId);
    
    return true;
  }

  @Mutation(() => TaskShare, { name: 'shareTask' })
  @UseGuards(JwtAuthGuard, RateLimitGuard)
  async shareTask(
    @Args('input') input: ShareTaskInput,
    @Context() context: any,
  ): Promise<any> {
    const userId = context.req.user.id;
    const share = await this.taskShareService.create(input, userId);
    
    // Create notification for shared user
    // TODO: Re-implement task notifications in a separate module if needed
    // await this.notificationService.createTaskAssignedNotification(
    //   input.taskId,
    //   input.sharedWithId,
    // );
    
    // Publish task shared event
    await this.pubSubService.publish('taskShared', { taskShared: share });
    
    return share;
  }

  @Mutation(() => TaskComment, { name: 'createTaskComment' })
  @UseGuards(JwtAuthGuard, RateLimitGuard)
  async createTaskComment(
    @Args('input') input: CreateTaskCommentInput,
    @Context() context: any,
  ): Promise<any> {
    const userId = context.req.user.id;
    const comment = await this.taskCommentService.create(input, userId);
    
    // Create notification for task owner and collaborators
    // TODO: Re-implement task notifications in a separate module if needed
    // await this.notificationService.createTaskCommentNotification(
    //   input.taskId,
    //   userId,
    // );
    
    // Publish comment created event
    console.log('Publishing taskCommentCreated with comment:', comment);
    try {
      this.pubSubService.publishTaskCommentCreated(comment);
      console.log('Successfully published taskCommentCreated event');
    } catch (error) {
      console.error('Failed to publish taskCommentCreated event:', error);
    }
    
    // Smart cache invalidation for comments
    await this.cacheInvalidationService.invalidateCommentCache(input.taskId, userId);
    
    return comment;
  }

  @Mutation(() => Task, { name: 'createSubtask' })
  @UseGuards(JwtAuthGuard, RateLimitGuard)
  async createSubtask(
    @Args('parentId') parentId: string,
    @Args('input') input: CreateTaskInput,
    @Context() context: any,
  ): Promise<any> {
    const userId = context.req.user.id;
    const subtask = await this.taskService.createSubtask(parentId, input, userId);
    
    // Smart cache invalidation for parent task
    await this.cacheInvalidationService.invalidateTaskCache(parentId, userId);
    await this.cacheInvalidationService.invalidateTaskCache(subtask.id, userId);
    
    return subtask;
  }

  @Mutation(() => TaskMedia, { name: 'uploadTaskMedia' })
  @UseGuards(JwtAuthGuard, RateLimitGuard)
  async uploadTaskMedia(
    @Args('input') input: UploadTaskMediaInput,
    @Context() context: any,
  ): Promise<any> {
    const userId = context.req.user.id;
    
    const mediaData = {
      type: input.type,
      url: input.url,
      filename: input.filename,
      size: input.size,
      mimeType: input.mimeType,
      caption: input.caption,
    };
    
    const media = await this.taskMediaService.create(input.taskId, userId, mediaData);
    
    // Smart cache invalidation
    await this.cacheInvalidationService.invalidateTaskCache(input.taskId, userId);
    
    return media;
  }

  @Mutation(() => Boolean, { name: 'deleteTaskMedia' })
  @UseGuards(JwtAuthGuard, RateLimitGuard)
  async deleteTaskMedia(
    @Args('mediaId') mediaId: string,
    @Context() context: any,
  ): Promise<boolean> {
    const userId = context.req.user.id;
    
    await this.taskMediaService.delete(mediaId, userId);
    
    return true;
  }

  // Subscriptions
  @Subscription(() => Task, { name: 'taskCreated', nullable: true })
  taskCreated() {
    return this.pubSubService.getTaskCreatedIterator();
  }

  @Subscription(() => Task, { name: 'taskUpdated', nullable: true })
  taskUpdated() {
    return this.pubSubService.getTaskUpdatedIterator();
  }

  @Subscription(() => TaskComment, { name: 'taskCommentCreated', nullable: true })
  taskCommentCreated() {
    return this.pubSubService.getTaskCommentCreatedIterator();
  }

  // Field Resolvers
  @ResolveField(() => User)
  async author(@Parent() task: Task): Promise<User> {
    // Use DataLoader to prevent N+1 queries
    return this.taskDataLoaderService.loadUser(task.userId);
  }

  @ResolveField(() => Number)
  async progress(
    @Parent() task: Task,
    @Context() context: any,
  ): Promise<number> {
    const userId = context.req.user.id;
    const progressData = await this.taskService.getTaskProgress(task.id, userId);
    return progressData.progressPercentage;
  }

  @ResolveField(() => [TaskMedia])
  async media(@Parent() task: Task): Promise<any[]> {
    // Use DataLoader to prevent N+1 queries
    return this.taskDataLoaderService.loadMedia(task.id);
  }

  @ResolveField(() => [TaskShare])
  async shares(@Parent() task: Task): Promise<any[]> {
    return this.taskShareService.findByTaskId(task.id);
  }

  @ResolveField(() => [TaskComment])
  async comments(@Parent() task: Task): Promise<any[]> {
    // Use DataLoader to prevent N+1 queries
    return this.taskDataLoaderService.loadComments(task.id);
  }

  @ResolveField(() => Number)
  async commentCount(@Parent() task: Task): Promise<number> {
    const counts = await this.taskDataLoaderService.loadTaskCounts(task.id);
    return counts.comments;
  }

  @ResolveField(() => Number)
  async mediaCount(@Parent() task: Task): Promise<number> {
    const counts = await this.taskDataLoaderService.loadTaskCounts(task.id);
    return counts.media;
  }

  @ResolveField(() => Number)
  async subtaskCount(@Parent() task: Task): Promise<number> {
    const counts = await this.taskDataLoaderService.loadTaskCounts(task.id);
    return counts.subtasks;
  }

  @ResolveField(() => [Task])
  async subtasks(
    @Parent() task: Task,
    @Context() context: any,
  ): Promise<any[]> {
    const userId = context.req.user.id;
    return this.taskService.findSubtasks(task.id, userId);
  }

  @ResolveField(() => Task, { nullable: true })
  async parent(
    @Parent() task: Task,
    @Context() context: any,
  ): Promise<any> {
    if (!task.parentId) return null;
    const userId = context.req.user.id;
    return this.taskService.findById(task.parentId, userId);
  }

  // TaskComment field resolvers
  @ResolveField(() => User)
  async commentAuthor(@Parent() comment: TaskComment): Promise<User> {
    // Use DataLoader to prevent N+1 queries for comment authors
    return this.taskDataLoaderService.loadUser(comment.userId);
  }

  @ResolveField(() => TaskComment, { nullable: true })
  async commentParent(@Parent() comment: TaskComment): Promise<any> {
    if (!comment.parentId) return null;
    return this.taskCommentService.findById(comment.parentId);
  }

  @ResolveField(() => [TaskComment])
  async commentReplies(@Parent() comment: TaskComment): Promise<any[]> {
    return this.taskCommentService.findReplies(comment.id);
  }

  // ==================== PROJECT TASK QUERIES (NEW) ====================

  @Query(() => [Task], { 
    name: 'projectTasks',
    description: 'Get tasks by project ID (for TaskFeed)'
  })
  @UseGuards(JwtAuthGuard)
  async getProjectTasks(
    @Args('projectId', { type: () => ID }) projectId: string,
    @Args('filters', { nullable: true }) filters: TaskFilterInput,
    @Context() context: any,
  ): Promise<any[]> {
    const userId = context.req.user.id;
    return this.taskService.findByProjectId(projectId, userId, filters);
  }

  @Mutation(() => Task, {
    name: 'createProjectTask',
    description: 'Create task in project with @mentions'
  })
  @UseGuards(JwtAuthGuard)
  async createProjectTask(
    @Args('projectId', { type: () => ID }) projectId: string,
    @Args('input') input: CreateTaskInput,
    @Context() context: any,
  ): Promise<any> {
    const userId = context.req.user.id;
    return this.taskService.createProjectTask(projectId, userId, input as any);
  }

  @Mutation(() => Task, {
    name: 'updateTaskOrder',
    description: 'Update task order for drag & drop'
  })
  @UseGuards(JwtAuthGuard)
  async updateTaskOrder(
    @Args('taskId') taskId: string,
    @Args('newOrder', { type: () => Int }) newOrder: number,
    @Context() context: any,
  ): Promise<any> {
    const userId = context.req.user.id;
    return this.taskService.updateTaskOrder(taskId, userId, newOrder);
  }

  @Mutation(() => Task, {
    name: 'assignTask',
    description: 'Assign task to users'
  })
  @UseGuards(JwtAuthGuard)
  async assignTask(
    @Args('taskId') taskId: string,
    @Args('userIds', { type: () => [ID] }) userIds: string[],
    @Context() context: any,
  ): Promise<any> {
    const userId = context.req.user.id;
    return this.taskService.assignTask(taskId, userId, userIds);
  }
}

