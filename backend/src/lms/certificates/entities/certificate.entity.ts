import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Course } from '../../courses/entities/course.entity';
import { User } from '../../../graphql/models/user.model';

@ObjectType()
export class Certificate {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  enrollmentId: string;

  @Field(() => ID)
  userId: string;

  @Field(() => ID)
  courseId: string;

  @Field()
  certificateNumber: string;

  @Field()
  courseName: string;

  @Field()
  instructorName: string;

  @Field()
  completionDate: Date;

  @Field({ nullable: true })
  grade?: string;

  @Field({ nullable: true })
  verificationUrl?: string;

  @Field()
  issueDate: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  // Relations
  @Field(() => User, { nullable: true })
  user?: User;

  @Field(() => Course, { nullable: true })
  course?: Course;
}

@ObjectType()
export class CertificateVerification {
  @Field()
  valid: boolean;

  @Field(() => Certificate)
  certificate: Certificate;
}

@ObjectType()
export class CertificateStats {
  @Field()
  total: number;

  @Field()
  thisMonth: number;

  @Field()
  thisYear: number;
}
