import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { SupportConversationService } from '../services/support-conversation.service';
import { SupportConversation } from '../entities/support-conversation.entity';
import { 
  CreateSupportConversationInput, 
  SupportConversationWhereInput 
} from '../dto/support-conversation.input';

@Resolver(() => SupportConversation)
export class SupportConversationResolver {
  constructor(private conversationService: SupportConversationService) {}

  @Query(() => [SupportConversation], { name: 'supportConversations' })
  async supportConversations(
    @Args('where', { type: () => SupportConversationWhereInput, nullable: true }) 
    where?: SupportConversationWhereInput,
    @Args('take', { type: () => Int, nullable: true }) 
    take?: number,
  ) {
    return this.conversationService.findAll({ where, take });
  }

  @Query(() => SupportConversation, { name: 'supportConversation' })
  async supportConversation(
    @Args('id', { type: () => String }) 
    id: string,
  ) {
    return this.conversationService.findOne(id);
  }

  @Mutation(() => SupportConversation)
  async createSupportConversation(
    @Args('input', { type: () => CreateSupportConversationInput }) 
    input: CreateSupportConversationInput,
  ) {
    return this.conversationService.createConversation(input);
  }

  @Mutation(() => SupportConversation)
  async assignConversationToAgent(
    @Args('conversationId', { type: () => String }) 
    conversationId: string,
    @Args('agentId', { type: () => String }) 
    agentId: string,
  ) {
    return this.conversationService.assignToAgent(conversationId, agentId);
  }
}
