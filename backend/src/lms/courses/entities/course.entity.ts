import { ObjectType, Field, ID, Float, Int, registerEnumType } from '@nestjs/graphql';
import { CourseLevel, CourseStatus } from '@prisma/client';
import { User } from '../../../graphql/models/user.model';
import { CourseCategory } from '../../categories/entities/course-category.entity';
import { CourseModule } from './course-module.entity';

// Register enums for GraphQL
registerEnumType(CourseLevel, {
  name: 'CourseLevel',
  description: 'Course difficulty level',
});

registerEnumType(CourseStatus, {
  name: 'CourseStatus',
  description: 'Course publication status',
});

@ObjectType()
export class Course {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  slug: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  thumbnail?: string;

  @Field({ nullable: true })
  trailer?: string;

  @Field(() => Float)
  price: number;

  @Field(() => CourseLevel)
  level: CourseLevel;

  @Field(() => CourseStatus)
  status: CourseStatus;

  @Field(() => Int, { nullable: true })
  duration?: number;

  @Field({ nullable: true })
  metaTitle?: string;

  @Field({ nullable: true })
  metaDescription?: string;

  @Field(() => [String])
  tags: string[];

  @Field(() => [String])
  whatYouWillLearn: string[];

  @Field(() => [String])
  requirements: string[];

  @Field(() => [String])
  targetAudience: string[];

  @Field(() => String, { nullable: true })
  categoryId?: string;

  @Field(() => Int, { defaultValue: 0 })
  enrollmentCount: number;

  @Field(() => Float, { defaultValue: 0 })
  avgRating: number;

  @Field(() => Int, { defaultValue: 0 })
  reviewCount: number;

  @Field(() => String)
  instructorId: string;

  @Field(() => Boolean, { defaultValue: false })
  approvalRequested: boolean;

  @Field(() => Date, { nullable: true })
  approvalRequestedAt?: Date;

  @Field({ nullable: true })
  approvedBy?: string;

  @Field(() => Date, { nullable: true })
  approvedAt?: Date;

  @Field({ nullable: true })
  rejectionReason?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field({ nullable: true })
  publishedAt?: Date;

  // Relations (will be resolved by field resolvers)
  @Field(() => User, { nullable: true })
  instructor?: User;

  @Field(() => CourseCategory, { nullable: true })
  category?: CourseCategory;

  @Field(() => [CourseModule], { nullable: true })
  modules?: CourseModule[];

  // Count fields for related entities
  @Field(() => Int, { nullable: true })
  sourceDocumentsCount?: number;
}
