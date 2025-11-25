import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from '../../../graphql/models/user.model';
import { Course } from '../../courses/entities/course.entity';
import { Lesson } from '../../courses/entities/lesson.entity';

@ObjectType()
export class DiscussionReply {
  @Field(() => ID)
  id: string;

  @Field()
  content: string;

  @Field(() => User)
  user: User;

  @Field({ nullable: true })
  parentId?: string;

  @Field(() => [DiscussionReply], { nullable: true })
  children?: DiscussionReply[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class Discussion {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  content: string;

  @Field()
  isPinned: boolean;

  @Field(() => User)
  user: User;

  @Field(() => Course, { nullable: true })
  course?: Course;

  @Field(() => Lesson, { nullable: true })
  lesson?: Lesson;

  @Field(() => [DiscussionReply])
  replies: DiscussionReply[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
