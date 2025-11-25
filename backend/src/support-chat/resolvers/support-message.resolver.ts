import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { SupportMessageService } from '../services/support-message.service';
import { SupportMessage } from '../entities/support-conversation.entity';
import { CreateSupportMessageInput, MarkMessagesAsReadInput } from '../dto/support-message.input';

@Resolver(() => SupportMessage)
export class SupportMessageResolver {
  constructor(private messageService: SupportMessageService) {}

  @Query(() => [SupportMessage], { name: 'supportMessages' })
  async supportMessages(
    @Args('conversationId', { type: () => String }) conversationId: string,
  ) {
    return this.messageService.findByConversation(conversationId);
  }

  @Mutation(() => SupportMessage)
  async sendSupportMessage(
    @Args('input', { type: () => CreateSupportMessageInput }) input: CreateSupportMessageInput,
  ) {
    return this.messageService.createMessage(input);
  }

  @Mutation(() => Int)
  async markMessagesAsRead(
    @Args('conversationId', { type: () => String }) conversationId: string,
    @Args('userId', { type: () => String }) userId: string,
  ) {
    const result = await this.messageService.markConversationMessagesAsRead(conversationId, userId);
    return result.count;
  }
}
