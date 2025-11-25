/**
 * ============================================================================
 * DYNAMIC GRAPHQL MODULE - ENTERPRISE LEVEL
 * ============================================================================
 * 
 * Central module that provides universal GraphQL operations for all models
 * 
 * @author Senior Backend Engineer
 * @version 2.0.0
 */

import { Module, Global } from '@nestjs/common';
import { DynamicGraphQLEngine } from './core/dynamic-graphql.engine';
import { UniversalDynamicResolver } from './resolvers/universal-dynamic.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Global()
@Module({
  imports: [PrismaModule, AuthModule],
  providers: [
    DynamicGraphQLEngine,
    UniversalDynamicResolver,
  ],
  exports: [
    DynamicGraphQLEngine,
    UniversalDynamicResolver,
  ],
})
export class DynamicGraphQLModule {}
