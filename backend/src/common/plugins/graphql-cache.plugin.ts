import { Plugin } from '@nestjs/apollo';
import { Injectable } from '@nestjs/common';
import { ApolloServerPlugin, GraphQLRequestListener } from '@apollo/server';
import { GraphQLCacheService } from '../services/graphql-cache.service';

@Injectable()
@Plugin()
export class GraphQLCachePlugin implements ApolloServerPlugin {
  constructor(private readonly cacheService: GraphQLCacheService) {}

  async requestDidStart(): Promise<GraphQLRequestListener<any>> {
    const cacheService = this.cacheService; // Capture in closure
    
    return {
      async didResolveOperation(requestContext) {
        const { request } = requestContext;
        
        // Skip caching if not a query or if it shouldn't be cached
        if (!request.query || !cacheService.shouldCacheQuery(request.query)) {
          return;
        }

        // Get user context
        const userId = requestContext.contextValue?.req?.user?.id || 'anonymous';
        
        // Generate cache key
        const cacheKey = cacheService.generateCacheKey(
          request.query,
          request.variables,
          request.operationName,
          userId
        );

        // Check for cached result
        const cachedResult = await cacheService.getCachedResult(cacheKey);
        
        if (cachedResult) {
          // Return cached response
          requestContext.response.body = {
            kind: 'single',
            singleResult: cachedResult
          };
          return;
        }

        // Store original response for caching
        requestContext.request.extensions = requestContext.request.extensions || {};
        requestContext.request.extensions.cacheKey = cacheKey;
      },

      async willSendResponse(requestContext) {
        const cacheKey = requestContext.request.extensions?.cacheKey;
        
        if (!cacheKey) {
          return;
        }

        // Extract response data
        const response = requestContext.response;
        if (response.body?.kind === 'single' && response.body.singleResult) {
          const result = response.body.singleResult;
          
          // Cache successful responses
          if (result && !result.errors) {
            const ttl = cacheService.getTTLForQuery(requestContext.request.query || '');
            await cacheService.setCachedResult(cacheKey, result, ttl);
          }
        }
      },

      async didEncounterErrors(requestContext) {
        // Log GraphQL errors for monitoring
        const errors = requestContext.errors;
        if (errors && errors.length > 0) {
          console.warn('GraphQL execution errors:', {
            operationName: requestContext.request.operationName,
            errors: errors.map(e => ({
              message: e.message,
              path: e.path,
              locations: e.locations
            }))
          });
        }
      }
    };
  }
}