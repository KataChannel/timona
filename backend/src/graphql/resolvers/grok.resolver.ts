import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { GrokService } from '../../grok/grok.service';
import { PostService } from '../../services/post.service';

@Resolver()
export class GrokResolver {
  constructor(
    private readonly grokService: GrokService,
    private readonly postService: PostService,
  ) {}

  @Mutation(() => String, { name: 'generateSummary' })
  @UseGuards(JwtAuthGuard)
  async generateSummary(
    @Args('content') content: string,
    @Args('maxLength', { defaultValue: 200 }) maxLength: number,
  ): Promise<string> {
    return this.grokService.generateSummary(content, maxLength);
  }

  @Mutation(() => String, { name: 'generatePostSummary' })
  @UseGuards(JwtAuthGuard)
  async generatePostSummary(@Args('postId') postId: string): Promise<string> {
    const post = await this.postService.findById(postId);
    return this.grokService.generatePostExcerpt(post.title, post.content);
  }

  @Mutation(() => [String], { name: 'generateTags' })
  @UseGuards(JwtAuthGuard)
  async generateTags(
    @Args('content') content: string,
    @Args('maxTags', { defaultValue: 5 }) maxTags: number,
  ): Promise<string[]> {
    return this.grokService.generateTags(content, maxTags);
  }

  @Mutation(() => String, { name: 'improveContent' })
  @UseGuards(JwtAuthGuard)
  async improveContent(
    @Args('content') content: string,
    @Args('instruction') instruction: string,
  ): Promise<string> {
    return this.grokService.improveContent(content, instruction);
  }
}
