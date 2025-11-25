import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { DiscussionsService } from './discussions.service';
import { Discussion, DiscussionReply } from './entities/discussion.entity';
import { CreateDiscussionInput, CreateReplyInput, UpdateDiscussionInput } from './dto/discussion.input';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';

@Resolver(() => Discussion)
export class DiscussionsResolver {
  constructor(private readonly discussionsService: DiscussionsService) {}

  @Mutation(() => Discussion, { name: 'createDiscussion' })
  @UseGuards(JwtAuthGuard)
  createDiscussion(
    @CurrentUser() user: any,
    @Args('input') input: CreateDiscussionInput,
  ) {
    return this.discussionsService.createDiscussion(user.id, input);
  }

  @Query(() => [Discussion], { name: 'courseDiscussions' })
  getCourseDiscussions(
    @Args('courseId', { type: () => ID }) courseId: string,
    @Args('lessonId', { type: () => ID, nullable: true }) lessonId?: string,
  ) {
    return this.discussionsService.getCourseDiscussions(courseId, lessonId);
  }

  @Query(() => Discussion, { name: 'discussion' })
  getDiscussion(@Args('id', { type: () => ID }) id: string) {
    return this.discussionsService.getDiscussion(id);
  }

  @Mutation(() => DiscussionReply, { name: 'createReply' })
  @UseGuards(JwtAuthGuard)
  createReply(
    @CurrentUser() user: any,
    @Args('input') input: CreateReplyInput,
  ) {
    return this.discussionsService.createReply(user.id, input);
  }

  @Mutation(() => Discussion, { name: 'updateDiscussion' })
  @UseGuards(JwtAuthGuard)
  updateDiscussion(
    @CurrentUser() user: any,
    @Args('input') input: UpdateDiscussionInput,
  ) {
    return this.discussionsService.updateDiscussion(user.id, input);
  }

  @Mutation(() => Boolean, { name: 'deleteDiscussion' })
  @UseGuards(JwtAuthGuard)
  deleteDiscussion(
    @CurrentUser() user: any,
    @Args('id', { type: () => ID }) id: string,
  ) {
    return this.discussionsService.deleteDiscussion(user.id, id);
  }

  @Mutation(() => Discussion, { name: 'toggleDiscussionPin' })
  @UseGuards(JwtAuthGuard)
  togglePin(
    @CurrentUser() user: any,
    @Args('id', { type: () => ID }) id: string,
  ) {
    return this.discussionsService.togglePin(user.id, id);
  }
}
