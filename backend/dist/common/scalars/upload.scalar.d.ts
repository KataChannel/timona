import { CustomScalar } from '@nestjs/graphql';
import { ValueNode } from 'graphql';
export declare class UploadScalar implements CustomScalar<any, any> {
    description: string;
    parseValue(value: any): Promise<import("graphql-upload/processRequest.mjs").FileUpload>;
    serialize(value: any): never;
    parseLiteral(ast: ValueNode): Promise<import("graphql-upload/processRequest.mjs").FileUpload>;
}
export interface FileUpload {
    filename: string;
    mimetype: string;
    encoding: string;
    createReadStream: () => NodeJS.ReadableStream;
}
