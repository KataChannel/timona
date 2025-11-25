import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * Custom decorator to get current user from request context
 * Works with both GraphQL and REST endpoints
 * 
 * Usage:
 *   @Query(() => User)
 *   @UseGuards(JwtAuthGuard)
 *   async getMe(@CurrentUser() user: User): Promise<User> {
 *     return user;
 *   }
 * 
 *   // Get specific field
 *   async myQuery(@CurrentUser('id') userId: string): Promise<any> {
 *     return this.service.findByUserId(userId);
 *   }
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    let request;
    
    // Try GraphQL context first
    try {
      const gqlContext = GqlExecutionContext.create(context);
      request = gqlContext.getContext().req;
    } catch {
      // Fall back to HTTP context
      request = context.switchToHttp().getRequest();
    }
    
    const user = request.user;
    
    // If data parameter is provided, return specific field
    return data ? user?.[data] : user;
  },
);
