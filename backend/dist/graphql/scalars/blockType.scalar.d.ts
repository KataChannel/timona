import { ValueNode } from 'graphql';
export declare class BlockTypeScalar {
    description: string;
    serialize(value: any): string;
    parseValue(value: any): string;
    parseLiteral(valueNode: ValueNode): string;
}
