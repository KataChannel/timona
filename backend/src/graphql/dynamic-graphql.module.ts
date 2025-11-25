import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DynamicCRUDService } from '../services/dynamic-crud.service';
import { DynamicResolverService, UniversalDynamicResolver } from './resolvers/dynamic.resolver';
import { PrismaService } from '../prisma/prisma.service';
import { setupCommonInputTypes } from './inputs/dynamic.inputs';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    PrismaService,
    DynamicCRUDService,
    DynamicResolverService,
    UniversalDynamicResolver
  ],
  exports: [
    DynamicCRUDService,
    DynamicResolverService,
    UniversalDynamicResolver
  ]
})
export class DynamicGraphQLModule {
  constructor() {
    // Setup common input types when module is initialized
    setupCommonInputTypes();
  }

  // Static method to register resolvers for specific models
  static forModels(models: Array<{
    name: string;
    modelClass: any;
    options?: {
      enableAuth?: boolean;
      enableBulkOps?: boolean;
      enablePagination?: boolean;
      customResolvers?: any[];
    };
  }>) {
    return {
      module: DynamicGraphQLModule,
      providers: [
        PrismaService,
        DynamicCRUDService,
        DynamicResolverService,
        UniversalDynamicResolver,
        // Register dynamic resolvers for each model
        ...models.map(({ name, modelClass, options }) => ({
          provide: `DYNAMIC_RESOLVER_${name.toUpperCase()}`,
          useFactory: (prismaService: PrismaService) => {
            const resolverService = new DynamicResolverService(new DynamicCRUDService(prismaService));
            return resolverService.registerResolver(name, modelClass, options);
          },
          inject: [PrismaService],
        }))
      ],
      exports: [
        DynamicCRUDService,
        DynamicResolverService,
        UniversalDynamicResolver
      ]
    };
  }
}
