import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class PlatformBreakdown {
  @Field()
  platform: string;

  @Field(() => Int)
  count: number;
}

@ObjectType()
export class AgentPerformance {
  @Field()
  agentId: string;

  @Field()
  agentName: string;

  @Field(() => Int)
  conversationsHandled: number;

  @Field(() => Int)
  averageResponseTime: number;

  @Field()
  satisfactionScore: number;
}

@ObjectType()
export class SupportAnalytics {
  @Field(() => Int)
  totalConversations: number;

  @Field(() => Int)
  activeConversations: number;

  @Field(() => Int)
  waitingConversations: number;

  @Field(() => Int)
  closedConversations: number;

  @Field(() => Int)
  averageResponseTime: number;

  @Field(() => Int)
  averageResolutionTime: number;

  @Field()
  customerSatisfactionScore: number;

  @Field(() => Int)
  totalMessages: number;

  @Field(() => Int)
  aiGeneratedMessages: number;

  @Field(() => [PlatformBreakdown])
  platformBreakdown: PlatformBreakdown[];

  @Field(() => [AgentPerformance])
  agentPerformance: AgentPerformance[];
}
