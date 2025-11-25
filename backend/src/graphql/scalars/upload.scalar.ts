import { Scalar, CustomScalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';

export interface FileUpload {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream: () => NodeJS.ReadableStream;
}

@Scalar('Upload', () => Upload)
export class UploadScalar implements CustomScalar<any, any> {
  description = 'Upload custom scalar type for file uploads';

  parseValue(value: any) {
    return value;
  }

  serialize(value: any) {
    return value;
  }

  parseLiteral(ast: ValueNode) {
    if (ast.kind === Kind.STRING) {
      return ast.value;
    }
    return null;
  }
}

// Export a placeholder class for GraphQL schema generation
export class Upload {
  filename: string;
  mimetype: string;
  encoding: string;
}
