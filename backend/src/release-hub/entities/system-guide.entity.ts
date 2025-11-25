import { ObjectType, Field, ID, registerEnumType, Int } from '@nestjs/graphql';

export enum GuideType {
  QUICK_START = 'QUICK_START',
  TUTORIAL = 'TUTORIAL',
  USER_GUIDE = 'USER_GUIDE',
  API_REFERENCE = 'API_REFERENCE',
  TROUBLESHOOTING = 'TROUBLESHOOTING',
  FAQ = 'FAQ',
  VIDEO_GUIDE = 'VIDEO_GUIDE',
  BEST_PRACTICES = 'BEST_PRACTICES',
}

registerEnumType(GuideType, { name: 'GuideType' });

// Guide Author type for relations
@ObjectType('GuideAuthor')
class GuideAuthor {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  name?: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  avatar?: string;
}

@ObjectType()
export class SystemGuide {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  content: string;

  @Field(() => GuideType)
  type: GuideType;

  @Field({ nullable: true })
  category?: string;

  @Field(() => [String])
  tags: string[];

  @Field({ nullable: true })
  difficulty?: string;

  @Field({ nullable: true })
  thumbnailUrl?: string;

  @Field({ nullable: true })
  videoUrl?: string;

  @Field(() => [String])
  attachmentUrls: string[];

  @Field({ nullable: true })
  icon?: string;

  @Field(() => Int)
  orderIndex: number;

  @Field(() => Int)
  order: number; // Alias for orderIndex

  @Field({ nullable: true })
  parentId?: string;

  @Field(() => SystemGuide, { nullable: true })
  parent?: SystemGuide;

  @Field(() => [SystemGuide])
  children: SystemGuide[];

  @Field(() => [String])
  relatedGuideIds: string[];

  @Field()
  slug: string;

  @Field({ nullable: true })
  metaTitle?: string;

  @Field({ nullable: true })
  metaDescription?: string;

  @Field(() => [String])
  keywords: string[];

  @Field()
  isPublished: boolean;

  @Field({ nullable: true })
  publishedAt?: Date;

  @Field(() => Int)
  viewCount: number;

  @Field(() => Int)
  helpfulCount: number;

  @Field(() => Int)
  notHelpfulCount: number;

  @Field(() => Int, { nullable: true })
  readingTime?: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field({ nullable: true })
  authorId?: string;

  @Field({ nullable: true })
  updatedById?: string;

  // Relations
  @Field(() => GuideAuthor, { nullable: true })
  author?: GuideAuthor;

  @Field(() => GuideAuthor, { nullable: true })
  updatedBy?: GuideAuthor;
}

// Alias for consistency with other entities
export { SystemGuide as SystemGuideEntity };
