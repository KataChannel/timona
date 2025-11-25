import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';
import { ReleaseType, ReleaseStatus } from '@prisma/client';

// Register enums for GraphQL
registerEnumType(ReleaseType, { name: 'ReleaseType' });
registerEnumType(ReleaseStatus, { name: 'ReleaseStatus' });

@ObjectType()
export class SystemRelease {
  @Field(() => ID)
  id: string;

  @Field()
  version: string;

  @Field()
  versionNumber: string;

  @Field(() => ReleaseType)
  releaseType: ReleaseType;

  @Field(() => ReleaseStatus)
  status: ReleaseStatus;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  summary?: string;

  @Field(() => [String])
  features: string[];

  @Field(() => [String])
  improvements: string[];

  @Field(() => [String])
  bugfixes: string[];

  @Field(() => [String])
  breakingChanges: string[];

  @Field({ nullable: true })
  releaseNotes?: string;

  @Field({ nullable: true })
  upgradeGuide?: string;

  @Field(() => [String])
  deprecations: string[];

  @Field({ nullable: true })
  deploymentDate?: Date;

  @Field({ nullable: true })
  releaseDate?: Date;

  @Field({ nullable: true })
  thumbnailUrl?: string;

  @Field({ nullable: true })
  videoUrl?: string;

  @Field(() => [String])
  screenshotUrls: string[];

  @Field()
  slug: string;

  @Field({ nullable: true })
  metaTitle?: string;

  @Field({ nullable: true })
  metaDescription?: string;

  @Field(() => [String])
  keywords: string[];

  @Field(() => Int)
  viewCount: number;

  @Field(() => Int)
  downloadCount: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field({ nullable: true })
  publishedAt?: Date;

  @Field({ nullable: true })
  createdById?: string;

  @Field({ nullable: true })
  updatedById?: string;
}
