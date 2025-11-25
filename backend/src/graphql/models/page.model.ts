import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';

// Define enums directly for GraphQL
export enum PageStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

// BlockType enum - Using string values for GraphQL/Prisma compatibility
// Mapping: Frontend numeric (0-26) <-> Backend string ('TEXT', 'IMAGE', etc.)
export enum BlockType {
  // Content Blocks
  TEXT = 'TEXT',
  RICH_TEXT = 'RICH_TEXT', // BlockNote-style editor with Tiptap
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  CAROUSEL = 'CAROUSEL',
  HERO = 'HERO',
  BUTTON = 'BUTTON',
  DIVIDER = 'DIVIDER',
  SPACER = 'SPACER',
  TEAM = 'TEAM',
  STATS = 'STATS',
  CONTACT_INFO = 'CONTACT_INFO',
  GALLERY = 'GALLERY',
  CARD = 'CARD',
  TESTIMONIAL = 'TESTIMONIAL',
  FAQ = 'FAQ',
  CONTACT_FORM = 'CONTACT_FORM',
  COMPLETED_TASKS = 'COMPLETED_TASKS',
  SEARCH = 'SEARCH',
  BOOKMARK = 'BOOKMARK',
  
  // Container/Layout Blocks
  CONTAINER = 'CONTAINER',
  SECTION = 'SECTION',
  GRID = 'GRID',
  FLEX_ROW = 'FLEX_ROW',
  FLEX_COLUMN = 'FLEX_COLUMN',
  COLUMN = 'COLUMN',
  ROW = 'ROW',
  
  // Dynamic Block
  DYNAMIC = 'DYNAMIC',
  
  // E-commerce Blocks (Data-driven)
  PRODUCT_LIST = 'PRODUCT_LIST',
  PRODUCT_DETAIL = 'PRODUCT_DETAIL',
  PRODUCT_CAROUSEL = 'PRODUCT_CAROUSEL',
  
  // Blog Blocks
  BLOG_CAROUSEL = 'BLOG_CAROUSEL',
}

// Register enums for GraphQL
registerEnumType(PageStatus, {
  name: 'PageStatus',
  description: 'The status of a page',
});

registerEnumType(BlockType, {
  name: 'BlockType',
  description: 'The type of a page block',
});

@ObjectType()
export class PageBlock {
  @Field(() => ID)
  id: string;

  @Field(() => BlockType)
  type: BlockType;

  @Field(() => GraphQLJSONObject)
  content: any;

  @Field(() => GraphQLJSONObject, { nullable: true })
  style?: any;

  @Field(() => Int)
  order: number;

  @Field(() => Boolean)
  isVisible: boolean;

  @Field(() => String)
  pageId: string;

  // Nested blocks support
  @Field(() => String, { nullable: true })
  parentId?: string;

  @Field(() => [PageBlock], { nullable: true })
  children?: PageBlock[];

  @Field(() => Int, { defaultValue: 0 })
  depth: number;

  // Dynamic configuration
  @Field(() => GraphQLJSONObject, { nullable: true })
  config?: any;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class Page {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  title: string;

  @Field(() => String)
  slug: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  content?: any;

  @Field(() => PageStatus)
  status: PageStatus;

  @Field(() => String, { nullable: true })
  seoTitle?: string;

  @Field(() => String, { nullable: true })
  seoDescription?: string;

  @Field(() => [String], { nullable: true })
  seoKeywords?: string[];

  @Field(() => String, { nullable: true })
  ogImage?: string;

  @Field(() => Boolean, { defaultValue: false })
  isHomepage: boolean;

  // 🆕 Dynamic Page Template Support
  @Field(() => Boolean, { defaultValue: false })
  isDynamic: boolean;

  @Field(() => GraphQLJSONObject, { nullable: true })
  dynamicConfig?: any;

  @Field(() => [PageBlock])
  blocks: PageBlock[];

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  publishedAt?: Date;

  @Field(() => String)
  createdBy: string;

  @Field(() => String, { nullable: true })
  updatedBy?: string;
}

@ObjectType()
export class PagePaginationInfo {
  @Field(() => Int)
  currentPage: number;

  @Field(() => Int)
  totalPages: number;

  @Field(() => Int)
  totalItems: number;

  @Field(() => Boolean)
  hasNextPage: boolean;

  @Field(() => Boolean)
  hasPreviousPage: boolean;
}

@ObjectType()
export class PaginatedPages {
  @Field(() => [Page])
  items: Page[];

  @Field(() => PagePaginationInfo)
  pagination: PagePaginationInfo;
}