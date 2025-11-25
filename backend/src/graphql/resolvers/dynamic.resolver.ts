import { 
  Resolver, 
  Query, 
  Mutation, 
  Args, 
  Context, 
  ID,
  ResolveField,
  Parent
} from '@nestjs/graphql';
import { UseGuards, Injectable, Type, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { 
  DynamicCRUDService, 
  DynamicFilterInput, 
  BulkCreateInput, 
  BulkUpdateInput, 
  BulkDeleteInput
} from '../../services/dynamic-crud.service';
import { GraphQLScalarType } from 'graphql';
import { GraphQLJSONObject } from 'graphql-type-json';

// Custom scalars for dynamic data
const DynamicData = new GraphQLScalarType({
  name: 'DynamicData',
  description: 'Dynamic data object',
  serialize: (value) => value,
  parseValue: (value) => value,
  parseLiteral: (ast: any) => ast.value
});

// Generic pagination metadata
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

// Dynamic resolver factory
export function createDynamicResolver<TModel>(
  modelName: string,
  ModelClass: Type<TModel>,
  options: {
    enableAuth?: boolean;
    enableBulkOps?: boolean;
    enablePagination?: boolean;
    customResolvers?: any[];
  } = {}
) {
  const {
    enableAuth = true,
    enableBulkOps = true,
    enablePagination = true,
    customResolvers = []
  } = options;

  @Resolver(() => ModelClass)
  class DynamicResolver {
    constructor(public readonly dynamicCRUDService: DynamicCRUDService) {}

    // READ ALL
    @Query(() => [ModelClass], { name: `get${modelName}s` })
    @UseGuards(enableAuth ? JwtAuthGuard : () => true)
    async findAll(
      @Args('filter', { type: () => GraphQLJSONObject, nullable: true }) 
      filter?: DynamicFilterInput,
      @Context() context?: any
    ): Promise<TModel[]> {
      return await this.dynamicCRUDService.findMany<TModel>(modelName, filter);
    }

    // READ ALL WITH PAGINATION
    @Query(() => GraphQLJSONObject, { name: `get${modelName}sPaginated` })
    @UseGuards(enableAuth ? JwtAuthGuard : () => true)
    async findAllPaginated(
      @Args('filter', { type: () => GraphQLJSONObject, nullable: true }) 
      filter?: DynamicFilterInput,
      @Context() context?: any
    ): Promise<PaginatedResult<TModel>> {
      return await this.dynamicCRUDService.findManyWithMeta<TModel>(modelName, filter);
    }

    // READ BY ID
    @Query(() => ModelClass, { name: `get${modelName}ById`, nullable: true })
    @UseGuards(enableAuth ? JwtAuthGuard : () => true)
    async findById(
      @Args('id', { type: () => ID }) id: string,
      @Args('options', { type: () => GraphQLJSONObject, nullable: true }) 
      options?: { select?: any; include?: any },
      @Context() context?: any
    ): Promise<TModel | null> {
      return await this.dynamicCRUDService.findById<TModel>(modelName, id, options);
    }

    // CREATE
    @Mutation(() => ModelClass, { name: `create${modelName}` })
    @UseGuards(enableAuth ? JwtAuthGuard : () => true)
    async create(
      @Args('data', { type: () => GraphQLJSONObject }) data: any,
      @Args('options', { type: () => GraphQLJSONObject, nullable: true }) 
      options?: { select?: any; include?: any },
      @Context() context?: any
    ): Promise<TModel> {
      console.log(`📝 Dynamic create ${modelName}:`, {
        authenticated: !!context?.req?.user,
        userId: context?.req?.user?.id,
        dataKeys: Object.keys(data || {}),
        hasOwnerId: !!data?.ownerId
      });
      
      // Add user context if authenticated
      if (context?.req?.user && data) {
        data.userId = data.userId || context.req.user.id;
        data.createdBy = data.createdBy || context.req.user.id;
        
        // For Project model, map userId to ownerId
        if (modelName === 'Project' && !data.ownerId) {
          console.log(`🔄 Mapping userId to ownerId for Project:`, context.req.user.id);
          data.ownerId = context.req.user.id;
        }
      } else if (modelName === 'Project') {
        // Project requires authentication
        console.error('❌ Project creation attempted without authentication', {
          hasContext: !!context,
          hasUser: !!context?.req?.user
        });
        throw new UnauthorizedException('Authentication required to create a project');
      }
      
      console.log(`✅ After context injection, data:`, {
        name: data?.name,
        ownerId: data?.ownerId,
        userId: data?.userId
      });
      
      return await this.dynamicCRUDService.create<TModel>(modelName, data, options, context);
    }

    // CREATE BULK
    @Mutation(() => GraphQLJSONObject, { name: `create${modelName}sBulk` })
    @UseGuards(enableAuth ? JwtAuthGuard : () => true)
    async createBulk(
      @Args('input', { type: () => GraphQLJSONObject }) input: BulkCreateInput<any>,
      @Args('options', { type: () => GraphQLJSONObject, nullable: true }) 
      options?: { select?: any; include?: any },
      @Context() context?: any
    ): Promise<any> {
      // Add user context to each item if authenticated
      if (context?.req?.user && input.data) {
        input.data = input.data.map(item => ({
          ...item,
          userId: item.userId || context.req.user.id,
          createdBy: item.createdBy || context.req.user.id,
          // For Project model, also set ownerId
          ...(modelName === 'Project' && !item.ownerId ? { ownerId: context.req.user.id } : {})
        }));
      }
      return await this.dynamicCRUDService.createBulk<TModel>(modelName, input, options, context);
    }

    // UPDATE
    @Mutation(() => ModelClass, { name: `update${modelName}` })
    @UseGuards(enableAuth ? JwtAuthGuard : () => true)
    async update(
      @Args('id', { type: () => ID }) id: string,
      @Args('data', { type: () => GraphQLJSONObject }) data: any,
      @Args('options', { type: () => GraphQLJSONObject, nullable: true }) 
      options?: { select?: any; include?: any },
      @Context() context?: any
    ): Promise<TModel> {
      // Add update context
      if (context?.req?.user && data) {
        data.updatedBy = data.updatedBy || context.req.user.id;
        data.updatedAt = new Date();
      }
      return await this.dynamicCRUDService.update<TModel>(modelName, id, data, options);
    }

    // UPDATE BULK
    @Mutation(() => GraphQLJSONObject, { name: `update${modelName}sBulk` })
    @UseGuards(enableAuth ? JwtAuthGuard : () => true)
    async updateBulk(
      @Args('input', { type: () => GraphQLJSONObject }) input: BulkUpdateInput<any>,
      @Args('options', { type: () => GraphQLJSONObject, nullable: true }) 
      options?: { select?: any; include?: any },
      @Context() context?: any
    ): Promise<any> {
      // Add update context
      if (context?.req?.user && input.data) {
        input.data.updatedBy = input.data.updatedBy || context.req.user.id;
        input.data.updatedAt = new Date();
      }
      return await this.dynamicCRUDService.updateBulk<TModel>(modelName, input, options);
    }

    // DELETE
    @Mutation(() => ModelClass, { name: `delete${modelName}` })
    @UseGuards(enableAuth ? JwtAuthGuard : () => true)
    async delete(
      @Args('id', { type: () => ID }) id: string,
      @Args('options', { type: () => GraphQLJSONObject, nullable: true }) 
      options?: { select?: any; include?: any },
      @Context() context?: any
    ): Promise<TModel> {
      return await this.dynamicCRUDService.delete<TModel>(modelName, id, options);
    }

    // DELETE BULK
    @Mutation(() => GraphQLJSONObject, { name: `delete${modelName}sBulk` })
    @UseGuards(enableAuth ? JwtAuthGuard : () => true)
    async deleteBulk(
      @Args('input', { type: () => GraphQLJSONObject }) input: BulkDeleteInput,
      @Args('options', { type: () => GraphQLJSONObject, nullable: true }) 
      options?: { select?: any; include?: any },
      @Context() context?: any
    ): Promise<any> {
      return await this.dynamicCRUDService.deleteBulk<TModel>(modelName, input, options);
    }

    // UPSERT
    @Mutation(() => ModelClass, { name: `upsert${modelName}` })
    @UseGuards(enableAuth ? JwtAuthGuard : () => true)
    async upsert(
      @Args('where', { type: () => GraphQLJSONObject }) where: any,
      @Args('create', { type: () => GraphQLJSONObject }) create: any,
      @Args('update', { type: () => GraphQLJSONObject }) update: any,
      @Args('options', { type: () => GraphQLJSONObject, nullable: true }) 
      options?: { select?: any; include?: any },
      @Context() context?: any
    ): Promise<TModel> {
      // Add user context
      if (context?.req?.user) {
        create.userId = create.userId || context.req.user.id;
        create.createdBy = create.createdBy || context.req.user.id;
        update.updatedBy = update.updatedBy || context.req.user.id;
        update.updatedAt = new Date();
      }
      return await this.dynamicCRUDService.upsert<TModel>(modelName, where, create, update, options);
    }

    // COUNT
    @Query(() => Number, { name: `count${modelName}s` })
    @UseGuards(enableAuth ? JwtAuthGuard : () => true)
    async count(
      @Args('where', { type: () => GraphQLJSONObject, nullable: true }) where?: any,
      @Context() context?: any
    ): Promise<number> {
      return await this.dynamicCRUDService.count(modelName, where);
    }

    // EXISTS
    @Query(() => Boolean, { name: `${modelName.toLowerCase()}Exists` })
    @UseGuards(enableAuth ? JwtAuthGuard : () => true)
    async exists(
      @Args('where', { type: () => GraphQLJSONObject }) where: any,
      @Context() context?: any
    ): Promise<boolean> {
      return await this.dynamicCRUDService.exists(modelName, where);
    }

    // Add custom resolvers
    // ...customResolvers
  }

  return DynamicResolver;
}

// Base Dynamic Resolver Service
@Injectable()
export class DynamicResolverService {
  private resolvers: Map<string, any> = new Map();

  constructor(private readonly dynamicCRUDService: DynamicCRUDService) {}

  // Register a dynamic resolver for a model
  registerResolver<TModel>(
    modelName: string,
    ModelClass: Type<TModel>,
    options?: {
      enableAuth?: boolean;
      enableBulkOps?: boolean;
      enablePagination?: boolean;
      customResolvers?: any[];
    }
  ): Type<any> {
    const ResolverClass = createDynamicResolver(modelName, ModelClass, options);
    this.resolvers.set(modelName, ResolverClass);
    return ResolverClass;
  }

  // Get registered resolver
  getResolver(modelName: string): any {
    return this.resolvers.get(modelName);
  }

  // Get all registered resolvers
  getAllResolvers(): any[] {
    return Array.from(this.resolvers.values());
  }
}

// Universal resolver for any model (when model classes are not strictly defined)
@Resolver()
export class UniversalDynamicResolver {
  constructor(private readonly dynamicCRUDService: DynamicCRUDService) {}

  @Query(() => [GraphQLJSONObject], { name: 'dynamicFindMany' })
  @UseGuards(JwtAuthGuard)
  async dynamicFindMany(
    @Args('modelName') modelName: string,
    @Args('filter', { type: () => GraphQLJSONObject, nullable: true }) 
    filter?: DynamicFilterInput,
    @Context() context?: any
  ): Promise<any[]> {
    return await this.dynamicCRUDService.findMany(modelName, filter);
  }

  @Query(() => GraphQLJSONObject, { name: 'dynamicFindById', nullable: true })
  @UseGuards(JwtAuthGuard)
  async dynamicFindById(
    @Args('modelName') modelName: string,
    @Args('id', { type: () => ID }) id: string,
    @Args('options', { type: () => GraphQLJSONObject, nullable: true }) 
    options?: { select?: any; include?: any },
    @Context() context?: any
  ): Promise<any | null> {
    return await this.dynamicCRUDService.findById(modelName, id, options);
  }

  @Mutation(() => GraphQLJSONObject, { name: 'dynamicCreate' })
  @UseGuards(JwtAuthGuard)
  async dynamicCreate(
    @Args('modelName') modelName: string,
    @Args('data', { type: () => GraphQLJSONObject }) data: any,
    @Args('options', { type: () => GraphQLJSONObject, nullable: true }) 
    options?: { select?: any; include?: any },
    @Context() context?: any
  ): Promise<any> {
    if (context?.req?.user && data) {
      data.userId = data.userId || context.req.user.id;
      data.createdBy = data.createdBy || context.req.user.id;
    }
    return await this.dynamicCRUDService.create(modelName, data, options);
  }

  @Mutation(() => GraphQLJSONObject, { name: 'dynamicUpdate' })
  @UseGuards(JwtAuthGuard)
  async dynamicUpdate(
    @Args('modelName') modelName: string,
    @Args('id', { type: () => ID }) id: string,
    @Args('data', { type: () => GraphQLJSONObject }) data: any,
    @Args('options', { type: () => GraphQLJSONObject, nullable: true }) 
    options?: { select?: any; include?: any },
    @Context() context?: any
  ): Promise<any> {
    if (context?.req?.user && data) {
      data.updatedBy = data.updatedBy || context.req.user.id;
      data.updatedAt = new Date();
    }
    return await this.dynamicCRUDService.update(modelName, id, data, options);
  }

  @Mutation(() => GraphQLJSONObject, { name: 'dynamicDelete' })
  @UseGuards(JwtAuthGuard)
  async dynamicDelete(
    @Args('modelName') modelName: string,
    @Args('id', { type: () => ID }) id: string,
    @Args('options', { type: () => GraphQLJSONObject, nullable: true }) 
    options?: { select?: any; include?: any },
    @Context() context?: any
  ): Promise<any> {
    return await this.dynamicCRUDService.delete(modelName, id, options);
  }

  @Mutation(() => GraphQLJSONObject, { name: 'dynamicCreateBulk' })
  @UseGuards(JwtAuthGuard)
  async dynamicCreateBulk(
    @Args('modelName') modelName: string,
    @Args('input', { type: () => GraphQLJSONObject }) input: BulkCreateInput<any>,
    @Args('options', { type: () => GraphQLJSONObject, nullable: true }) 
    options?: { select?: any; include?: any },
    @Context() context?: any
  ): Promise<any> {
    if (context?.req?.user && input.data) {
      input.data = input.data.map(item => ({
        ...item,
        userId: item.userId || context.req.user.id,
        createdBy: item.createdBy || context.req.user.id
      }));
    }
    return await this.dynamicCRUDService.createBulk(modelName, input, options);
  }

  @Mutation(() => GraphQLJSONObject, { name: 'dynamicUpdateBulk' })
  @UseGuards(JwtAuthGuard)
  async dynamicUpdateBulk(
    @Args('modelName') modelName: string,
    @Args('input', { type: () => GraphQLJSONObject }) input: BulkUpdateInput<any>,
    @Args('options', { type: () => GraphQLJSONObject, nullable: true }) 
    options?: { select?: any; include?: any },
    @Context() context?: any
  ): Promise<any> {
    if (context?.req?.user && input.data) {
      input.data.updatedBy = input.data.updatedBy || context.req.user.id;
      input.data.updatedAt = new Date();
    }
    return await this.dynamicCRUDService.updateBulk(modelName, input, options);
  }

  @Mutation(() => GraphQLJSONObject, { name: 'dynamicDeleteBulk' })
  @UseGuards(JwtAuthGuard)
  async dynamicDeleteBulk(
    @Args('modelName') modelName: string,
    @Args('input', { type: () => GraphQLJSONObject }) input: BulkDeleteInput,
    @Args('options', { type: () => GraphQLJSONObject, nullable: true }) 
    options?: { select?: any; include?: any },
    @Context() context?: any
  ): Promise<any> {
    return await this.dynamicCRUDService.deleteBulk(modelName, input, options);
  }
}
