import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { AIProviderType } from '../dto/ai-provider.input';
import { User } from '../../graphql/models/user.model';

@ObjectType()
export class AIProvider {
  @Field()
  id: string;

  @Field(() => AIProviderType)
  provider: AIProviderType;

  @Field()
  name: string;

  @Field()
  apiKey: string; // Sẽ được mask khi trả về client

  @Field()
  model: string;

  @Field(() => Float)
  temperature: number;

  @Field(() => Int)
  maxTokens: number;

  @Field({ nullable: true })
  systemPrompt?: string;

  @Field()
  isActive: boolean;

  @Field(() => Int)
  priority: number;

  @Field()
  isDefault: boolean;

  @Field({ nullable: true })
  description?: string;

  @Field(() => [String], { nullable: true })
  tags?: string[];

  @Field(() => Int)
  totalRequests: number;

  @Field(() => Int)
  successCount: number;

  @Field(() => Int)
  failureCount: number;

  @Field(() => Float, { nullable: true })
  avgResponseTime?: number;

  @Field({ nullable: true })
  lastUsedAt?: Date;

  @Field({ nullable: true })
  lastError?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field({ nullable: true })
  createdBy?: string;

  @Field(() => User, { nullable: true })
  creator?: User;
}

@ObjectType()
export class AIProviderTestResult {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  response?: string;

  @Field({ nullable: true })
  error?: string;

  @Field(() => Float)
  responseTime: number; // in milliseconds

  @Field(() => Int)
  tokensUsed: number;
}

@ObjectType()
export class AIProviderStats {
  @Field(() => Int)
  totalProviders: number;

  @Field(() => Int)
  activeProviders: number;

  @Field(() => Int)
  totalRequests: number;

  @Field(() => Float)
  successRate: number;

  @Field(() => Float)
  avgResponseTime: number;
}
