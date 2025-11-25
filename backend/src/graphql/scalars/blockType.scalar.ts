import { Scalar } from '@nestjs/graphql';
import { ValueNode } from 'graphql';
import { BLOCK_TYPE_NUMERIC_TO_STRING, BLOCK_TYPE_STRING_TO_NUMERIC } from '../../utils/blockTypeConverter';

/**
 * Custom GraphQL Scalar for BlockType
 * Automatically converts between:
 * - Frontend: numeric values (0, 1, 2, ... 26)
 * - Backend/Database: string values ('TEXT', 'IMAGE', ..., 'PRODUCT_DETAIL')
 * - GraphQL: string enum names for readability
 */
@Scalar('BlockType', () => String)
export class BlockTypeScalar {
  description = 'Block type enum - handles conversion between numeric (frontend) and string (backend) values';

  /**
   * Serialize: Backend value -> GraphQL/Client value
   * When returning data from resolver to client
   */
  serialize(value: any): string {
    // If already a string (from database), return as-is
    if (typeof value === 'string') {
      return value;
    }
    
    // If numeric (shouldn't happen from DB, but handle it)
    if (typeof value === 'number') {
      return BLOCK_TYPE_NUMERIC_TO_STRING[value] || 'UNKNOWN';
    }
    
    return String(value);
  }

  /**
   * parseValue: Client input -> Backend value
   * When receiving input from client
   */
  parseValue(value: any): string {
    // If numeric from frontend, convert to string
    if (typeof value === 'number') {
      const stringValue = BLOCK_TYPE_NUMERIC_TO_STRING[value];
      if (!stringValue) {
        throw new Error(`Invalid BlockType numeric value: ${value}`);
      }
      return stringValue;
    }
    
    // If already a string, validate it's a known type
    if (typeof value === 'string') {
      if (!BLOCK_TYPE_STRING_TO_NUMERIC[value.toUpperCase()]) {
        throw new Error(`Invalid BlockType string value: ${value}`);
      }
      return value.toUpperCase();
    }
    
    throw new Error(`BlockType must be a number or string, received ${typeof value}`);
  }

  /**
   * parseLiteral: AST node -> Backend value
   * When parsing literals in GraphQL queries
   */
  parseLiteral(valueNode: ValueNode): string {
    if (valueNode.kind === 'IntValue') {
      const numValue = parseInt(valueNode.value, 10);
      const stringValue = BLOCK_TYPE_NUMERIC_TO_STRING[numValue];
      if (!stringValue) {
        throw new Error(`Invalid BlockType numeric value: ${numValue}`);
      }
      return stringValue;
    }
    
    if (valueNode.kind === 'StringValue') {
      const upperValue = valueNode.value.toUpperCase();
      if (!BLOCK_TYPE_STRING_TO_NUMERIC[upperValue]) {
        throw new Error(`Invalid BlockType string value: ${valueNode.value}`);
      }
      return upperValue;
    }
    
    throw new Error(`BlockType must be a number or string literal`);
  }
}
