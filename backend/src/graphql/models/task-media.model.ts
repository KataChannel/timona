import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { User } from './user.model';
import { MediaType } from '@prisma/client';

registerEnumType(MediaType, {
  name: 'MediaType',
  description: 'The type of media file',
});

@ObjectType()
export class TaskMedia {
  @Field(() => ID)
  id: string;

  @Field()
  filename: string;

  @Field()
  url: string;

  @Field(() => MediaType)
  type: MediaType;

  @Field()
  size: number;

  @Field()
  mimeType: string;

  @Field({ nullable: true })
  caption?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field()
  taskId: string;

  @Field(() => User)
  uploader: User;

  @Field()
  uploadedBy: string;
}
