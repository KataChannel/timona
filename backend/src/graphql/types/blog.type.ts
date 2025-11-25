import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';
import { CategoryType } from './category.type';

// Enums
export enum BlogStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum BlogSortBy {
  LATEST = 'LATEST',
  OLDEST = 'OLDEST',
  POPULAR = 'POPULAR',
  FEATURED = 'FEATURED',
}

registerEnumType(BlogStatus, {
  name: 'BlogStatus',
  description: 'Trạng thái bài viết',
});

registerEnumType(BlogSortBy, {
  name: 'BlogSortBy',
  description: 'Sắp xếp bài viết',
});

// BlogAuthor Type
@ObjectType()
export class BlogAuthorType {
  @Field(() => ID)
  id: string;

  @Field()
  username: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  email: string;
}

// BlogTag Type
@ObjectType()
export class BlogTagType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  slug: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

// BlogCategory Type (reuse from category if exists, or create a new one)
@ObjectType()
export class BlogCategoryType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  slug: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  thumbnail?: string;

  @Field(() => Int, { defaultValue: 0 })
  order: number;

  @Field({ defaultValue: true })
  isActive: boolean;

  @Field(() => Int)
  postCount: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

// Blog Type
@ObjectType()
export class BlogType {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  slug: string;

  @Field()
  content: string;

  @Field({ nullable: true })
  shortDescription?: string;

  @Field({ nullable: true })
  excerpt?: string;

  @Field(() => BlogAuthorType)
  author: BlogAuthorType;

  // Image fields - mapped from featuredImage in database
  @Field({ nullable: true })
  featuredImage?: string;

  @Field({ nullable: true })
  thumbnailUrl?: string;

  @Field({ nullable: true })
  bannerUrl?: string;

  @Field(() => [String], { nullable: true })
  images?: string[];

  // Status fields
  @Field({ defaultValue: 'DRAFT' })
  status: string;

  @Field({ defaultValue: 'PUBLIC' })
  visibility: string;

  @Field(() => Int, { defaultValue: 0 })
  viewCount: number;

  @Field({ nullable: true })
  publishedAt?: Date;

  @Field()
  updatedAt: Date;

  @Field({ nullable: true })
  category?: BlogCategoryType;

  @Field(() => [BlogTagType], { nullable: true })
  tags?: BlogTagType[];

  @Field({ defaultValue: false })
  isFeatured: boolean;

  @Field({ defaultValue: false })
  isPinned: boolean;

  @Field({ defaultValue: false })
  isPublished: boolean;

  @Field({ nullable: true })
  metaTitle?: string;

  @Field({ nullable: true })
  metaDescription?: string;

  @Field(() => [String], { nullable: true })
  metaKeywords?: string[];

  @Field({ nullable: true })
  canonicalUrl?: string;

  @Field({ defaultValue: true })
  commentsEnabled: boolean;

  @Field(() => Int, { nullable: true })
  readingTime?: number;

  @Field()
  createdAt: Date;
}

// Paginated Blogs Response
@ObjectType()
export class PaginatedBlogs {
  @Field(() => [BlogType])
  items: BlogType[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  pageSize: number;

  @Field(() => Int)
  totalPages: number;

  @Field()
  hasMore: boolean;
}
