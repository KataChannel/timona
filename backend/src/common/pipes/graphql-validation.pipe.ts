import { Injectable, ValidationPipe, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class GraphQLValidationPipe extends ValidationPipe {
  async transform(value: any, metadata: ArgumentMetadata) {
    // Skip transformation for file uploads
    // graphql-upload-ts sends ReadStream/Promise objects that should not be transformed
    if (value && typeof value === 'object') {
      // Check if it's a file upload (has createReadStream method or is a Promise)
      if (value.createReadStream || value instanceof Promise || value.then) {
        return value;
      }
    }
    
    // Apply normal validation for other types
    return super.transform(value, metadata);
  }
}
