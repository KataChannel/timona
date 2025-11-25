import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';

export enum FileUploadType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT',
}

registerEnumType(FileUploadType, {
  name: 'FileUploadType',
  description: 'Types of files that can be uploaded',
});

@ObjectType()
export class FileUploadResult {
  @Field(() => String)
  id: string;

  @Field(() => String)
  url: string;

  @Field(() => String)
  filename: string;

  @Field(() => String)
  mimetype: string;

  @Field(() => Int)
  size: number;

  @Field(() => String)
  bucket: string;
}
