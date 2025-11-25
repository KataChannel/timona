import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class CourseCategory {
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

  @Field(() => ID, { nullable: true })
  parentId?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  // Relations (lazy loaded)
  // parent?: CourseCategory;
  // children?: CourseCategory[];
  // courses?: Course[];
}
