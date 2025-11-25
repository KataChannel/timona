import { Scalar, CustomScalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';
import GraphQLUpload from 'graphql-upload/GraphQLUpload.mjs';

@Scalar('Upload')
export class UploadScalar implements CustomScalar<any, any> {
  description = 'Upload scalar type';

  parseValue(value: any) {
    return GraphQLUpload.parseValue(value);
  }

  serialize(value: any) {
    return GraphQLUpload.serialize(value);
  }

  parseLiteral(ast: ValueNode) {
    return GraphQLUpload.parseLiteral(ast, {});
  }
}

export interface FileUpload {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream: () => NodeJS.ReadableStream;
}
