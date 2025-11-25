import { Module, Global } from '@nestjs/common';
import { GraphQLCacheService } from '../services/graphql-cache.service';
import { CacheInvalidationService } from '../services/cache-invalidation.service';
import { GraphQLCachePlugin } from '../plugins/graphql-cache.plugin';
import { RedisModule } from '../../redis/redis.module';

@Global()
@Module({
  imports: [RedisModule],
  providers: [
    GraphQLCacheService,
    CacheInvalidationService,
    GraphQLCachePlugin,
  ],
  exports: [
    GraphQLCacheService,
    CacheInvalidationService,
    GraphQLCachePlugin,
  ],
})
export class GraphQLPerformanceModule {}