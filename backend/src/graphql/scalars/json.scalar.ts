import { Scalar, CustomScalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';
import { GraphQLJSON } from 'graphql-type-json';

@Scalar('JSON', () => JSON)
export class JSONScalar implements CustomScalar<any, any> {
  description = 'JSON custom scalar type';

  parseValue(value: any): any {
    return GraphQLJSON.parseValue(value);
  }

  serialize(value: any): any {
    return GraphQLJSON.serialize(value);
  }

  parseLiteral(ast: ValueNode): any {
    return GraphQLJSON.parseLiteral(ast, {});
  }
}

