import { ObjectType, Field, ID, registerEnumType, Int, Float } from '@nestjs/graphql';
import { SourceDocumentType, SourceDocumentStatus } from '@prisma/client';
import GraphQLJSON from 'graphql-type-json';
import { User } from '../../../graphql/models/user.model';
import { FileUploadResult } from '../../files/entities/file-upload.entity';

// Register enums for GraphQL
registerEnumType(SourceDocumentType, {
  name: 'SourceDocumentType',
  description: 'Type of source document',
});

registerEnumType(SourceDocumentStatus, {
  name: 'SourceDocumentStatus',
  description: 'Status of source document',
});

@ObjectType()
export class SourceDocumentCategory {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  slug: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  icon?: string;

  @Field({ nullable: true })
  color?: string;

  @Field(() => ID, { nullable: true })
  parentId?: string;

  @Field(() => SourceDocumentCategory, { nullable: true })
  parent?: SourceDocumentCategory;

  @Field(() => [SourceDocumentCategory], { nullable: true })
  children?: SourceDocumentCategory[];

  @Field(() => [SourceDocument], { nullable: true })
  sourceDocuments?: SourceDocument[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class SourceDocument {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => SourceDocumentType)
  type: SourceDocumentType;

  @Field(() => SourceDocumentStatus)
  status: SourceDocumentStatus;

  @Field(() => Boolean, { defaultValue: false })
  approvalRequested: boolean;

  @Field(() => Date, { nullable: true })
  approvalRequestedAt?: Date;

  @Field({ nullable: true })
  approvalRequestedBy?: string;

  @Field({ nullable: true })
  approvedBy?: string;

  @Field(() => Date, { nullable: true })
  approvedAt?: Date;

  @Field({ nullable: true })
  rejectionReason?: string;

  // File/Video/Content info
  @Field({ nullable: true })
  url?: string;

  @Field({ nullable: true })
  content?: string;

  @Field({ nullable: true })
  fileName?: string;

  @Field(() => Float, { nullable: true, description: 'File size in bytes (supports large files)' })
  fileSize?: number;

  @Field({ nullable: true })
  mimeType?: string;

  @Field(() => Int, { nullable: true })
  duration?: number;

  @Field({ nullable: true })
  thumbnailUrl?: string;

  // Organization
  @Field(() => ID, { nullable: true })
  categoryId?: string;

  @Field(() => [String])
  tags: string[];

  // AI Analysis
  @Field({ nullable: true })
  aiSummary?: string;

  @Field(() => [String])
  aiKeywords: string[];

  @Field(() => [String])
  aiTopics: string[];

  @Field({ nullable: true })
  aiAnalyzedAt?: Date;

  @Field()
  isAiAnalyzed: boolean;

  // Metadata
  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: any;

  // Owner
  @Field(() => ID)
  userId: string;

  @Field(() => SourceDocumentCategory, { nullable: true })
  category?: SourceDocumentCategory;

  @Field(() => User, { nullable: true })
  user?: User;

  // Stats
  @Field(() => Int)
  viewCount: number;

  @Field(() => Int)
  downloadCount: number;

  @Field(() => Int)
  usageCount: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field({ nullable: true })
  publishedAt?: Date;
}

@ObjectType()
export class CourseSourceDocument {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  courseId: string;

  @Field(() => ID)
  documentId: string;

  @Field(() => Int, { nullable: true })
  order?: number;

  @Field()
  isRequired: boolean;

  @Field({ nullable: true })
  description?: string;

  @Field(() => ID, { nullable: true })
  addedBy?: string;

  @Field()
  addedAt: Date;

  @Field(() => SourceDocument)
  document: SourceDocument;
}
