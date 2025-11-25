import { ObjectType, Field, registerEnumType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { TemplateCategory } from '@prisma/client';
import { User } from './user.model';

// Register TemplateCategory enum for GraphQL
registerEnumType(TemplateCategory, {
  name: 'TemplateCategory',
  description: 'Template category for organization',
});

/**
 * CustomTemplate GraphQL Model
 * Represents a saved page builder template for reuse
 */
@ObjectType()
export class CustomTemplate {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => TemplateCategory)
  category: TemplateCategory;

  @Field(() => GraphQLJSON)
  blocks: any;

  @Field({ nullable: true })
  thumbnail?: string;

  @Field()
  userId: string;

  @Field(() => User)
  user: User;

  @Field()
  isPublic: boolean;

  @Field()
  isArchived: boolean;

  @Field()
  usageCount: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

/**
 * TemplateShare GraphQL Model
 * Represents sharing of a template between users
 */
@ObjectType()
export class TemplateShare {
  @Field()
  id: string;

  @Field()
  templateId: string;

  @Field(() => CustomTemplate)
  template: CustomTemplate;

  @Field()
  sharedWith: string;

  @Field(() => User)
  user: User;

  @Field()
  createdAt: Date;
}
