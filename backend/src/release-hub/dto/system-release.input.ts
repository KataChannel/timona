import { InputType, Field } from '@nestjs/graphql';
import { ReleaseType, ReleaseStatus } from '@prisma/client';

@InputType()
export class CreateSystemReleaseInput {
  @Field()
  version: string;

  @Field({ nullable: true })
  versionNumber?: string;

  @Field(() => ReleaseType)
  releaseType: ReleaseType;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  summary?: string;

  @Field(() => [String], { nullable: true })
  features?: string[];

  @Field(() => [String], { nullable: true })
  improvements?: string[];

  @Field(() => [String], { nullable: true })
  bugfixes?: string[];

  @Field(() => [String], { nullable: true })
  breakingChanges?: string[];

  @Field({ nullable: true })
  releaseNotes?: string;

  @Field({ nullable: true })
  upgradeGuide?: string;

  @Field(() => [String], { nullable: true })
  deprecations?: string[];

  @Field({ nullable: true })
  deploymentDate?: Date;

  @Field({ nullable: true })
  releaseDate?: Date;

  @Field({ nullable: true })
  thumbnailUrl?: string;

  @Field({ nullable: true })
  videoUrl?: string;

  @Field(() => [String], { nullable: true })
  screenshotUrls?: string[];

  @Field({ nullable: true })
  slug?: string;

  @Field({ nullable: true })
  metaTitle?: string;

  @Field({ nullable: true })
  metaDescription?: string;

  @Field(() => [String], { nullable: true })
  keywords?: string[];
}

@InputType()
export class UpdateSystemReleaseInput {
  @Field({ nullable: true })
  version?: string;

  @Field({ nullable: true })
  versionNumber?: string;

  @Field(() => ReleaseType, { nullable: true })
  releaseType?: ReleaseType;

  @Field(() => ReleaseStatus, { nullable: true })
  status?: ReleaseStatus;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  summary?: string;

  @Field(() => [String], { nullable: true })
  features?: string[];

  @Field(() => [String], { nullable: true })
  improvements?: string[];

  @Field(() => [String], { nullable: true })
  bugfixes?: string[];

  @Field(() => [String], { nullable: true })
  breakingChanges?: string[];

  @Field({ nullable: true })
  releaseNotes?: string;

  @Field({ nullable: true })
  upgradeGuide?: string;

  @Field(() => [String], { nullable: true })
  deprecations?: string[];

  @Field({ nullable: true })
  deploymentDate?: Date;

  @Field({ nullable: true })
  releaseDate?: Date;

  @Field({ nullable: true })
  thumbnailUrl?: string;

  @Field({ nullable: true })
  videoUrl?: string;

  @Field(() => [String], { nullable: true })
  screenshotUrls?: string[];

  @Field({ nullable: true })
  slug?: string;

  @Field({ nullable: true })
  metaTitle?: string;

  @Field({ nullable: true })
  metaDescription?: string;

  @Field(() => [String], { nullable: true })
  keywords?: string[];
}

@InputType()
export class SystemReleaseWhereInput {
  @Field(() => ReleaseStatus, { nullable: true })
  status?: ReleaseStatus;

  @Field(() => ReleaseType, { nullable: true })
  releaseType?: ReleaseType;

  @Field({ nullable: true })
  search?: string;
}
