import { CustomScalar } from '@nestjs/graphql';
import { ValueNode } from 'graphql';
export interface FileUpload {
    filename: string;
    mimetype: string;
    encoding: string;
    createReadStream: () => NodeJS.ReadableStream;
}
export declare class UploadScalar implements CustomScalar<any, any> {
    description: string;
    parseValue(value: any): any;
    serialize(value: any): any;
    parseLiteral(ast: ValueNode): string;
}
export declare class Upload {
    filename: string;
    mimetype: string;
    encoding: string;
}
