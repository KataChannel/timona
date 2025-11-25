import { Injectable, CanActivate, ExecutionContext, BadRequestException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { parse, validate } from 'graphql';
import { depthLimit } from 'graphql-depth-limit';

@Injectable()
export class GraphQLComplexityGuard implements CanActivate {
  private readonly maxDepth: number;

  constructor(maxDepth: number = 10) {
    this.maxDepth = maxDepth;
  }

  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext();
    const query = req.body?.query;

    if (!query) {
      return true; // No query to validate
    }

    try {
      const document = parse(query);
      const schema = ctx.getInfo().schema;
      
      // Validate query depth
      const depthRule = depthLimit(this.maxDepth);
      const errors = validate(schema, document, [depthRule]);
      
      if (errors.length > 0) {
        throw new BadRequestException(
          `Query depth validation failed: ${errors.map(e => e.message).join(', ')}`
        );
      }

      return true;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      // Log parsing errors but don't block request for now during development
      console.error('GraphQL depth validation error:', error);
      return true;
    }
  }
}