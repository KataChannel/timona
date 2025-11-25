import { ValidationPipe, ArgumentMetadata } from '@nestjs/common';
export declare class GraphQLValidationPipe extends ValidationPipe {
    transform(value: any, metadata: ArgumentMetadata): Promise<any>;
}
