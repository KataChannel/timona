import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { ChangelogType } from '@prisma/client';
import { GraphQLJSON } from 'graphql-type-json';

registerEnumType(ChangelogType, { name: 'ChangelogType' });

@ObjectType()
export class Changelog {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field(() => ChangelogType)
  type: ChangelogType;

  @Field({ nullable: true })
  component?: string;

  @Field({ nullable: true })
  module?: string;

  @Field({ nullable: true })
  prUrl?: string;

  @Field({ nullable: true })
  issueUrl?: string;

  @Field({ nullable: true })
  commitHash?: string;

  @Field(() => [String])
  affectedFiles: string[];

  @Field(() => GraphQLJSON, { nullable: true })
  apiChanges?: any;

  @Field({ nullable: true })
  impact?: string;

  @Field({ nullable: true })
  migration?: string;

  @Field({ nullable: true })
  releaseId?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field({ nullable: true })
  authorId?: string;
}
