import { ApolloServerPlugin, GraphQLRequestListener } from '@apollo/server';
import { GraphQLCacheService } from '../services/graphql-cache.service';
export declare class GraphQLCachePlugin implements ApolloServerPlugin {
    private readonly cacheService;
    constructor(cacheService: GraphQLCacheService);
    requestDidStart(): Promise<GraphQLRequestListener<any>>;
}
