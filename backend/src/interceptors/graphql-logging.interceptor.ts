import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class GraphQLLoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const gqlContext = GqlExecutionContext.create(context);
    const info = gqlContext.getInfo();
    const args = gqlContext.getArgs();
    const ctx = gqlContext.getContext();
    
    // Check if we have valid GraphQL info and operation
    if (!info || !info.operation) {
      return next.handle();
    }
    
    const operationName = info.operation.name?.value || 'Unknown';
    const fieldName = info.fieldName || 'Unknown';
    const operation = info.operation.operation || 'unknown';
    const query = info.source?.body || 'N/A';
    const userId = ctx.req?.user?.id;
    const userEmail = ctx.req?.user?.email;
    
    const startTime = Date.now();
    
    // Log the start of the operation
    this.logger.debug(`${operation.toUpperCase()} ${operationName}.${fieldName} started`, 'GraphQL', {
      operationName,
      fieldName,
      operation,
      userId,
      userEmail,
      variables: args,
    });

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime;
          
          // Log successful operation
          this.logger.logGraphQLOperation(
            `${operationName}.${fieldName}`,
            query,
            args,
            duration,
            userId
          );
          
          // Log performance warning for slow operations
          if (duration > 1000) {
            this.logger.logPerformance(
              `GraphQL ${operation.toUpperCase()} ${operationName}.${fieldName}`,
              duration,
              {
                operationName,
                fieldName,
                userId,
                slow: true,
              }
            );
          }
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          
          // Log GraphQL errors
          this.logger.error(
            `GraphQL Error in ${operation.toUpperCase()} ${operationName}.${fieldName}`,
            error.stack,
            'GraphQL',
            {
              operationName,
              fieldName,
              operation,
              userId,
              userEmail,
              duration,
              variables: args,
              errorMessage: error.message,
              errorCode: error.extensions?.code,
            }
          );
        },
      })
    );
  }
}
