import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { Logger } from '@nestjs/common';
import { GraphQLJSONObject } from 'graphql-type-json';
import { DynamicQueryGeneratorService } from '../services/dynamic-query-generator.service';
import {
  UniversalQueryInput,
  FindManyInput,
  FindUniqueInput,
  CreateInput,
  CreateManyInput,
  UpdateInput,
  UpdateManyInput,
  UpsertInput,
  DeleteInput,
  DeleteManyInput,
  CountInput,
  AggregateInput,
  GroupByInput,
} from '../inputs/universal-query.input';

/**
 * Universal Dynamic Query Resolver
 * Provides dynamic GraphQL queries and mutations for all Prisma models
 */
@Resolver()
export class UniversalQueryResolver {
  private readonly logger = new Logger(UniversalQueryResolver.name);

  constructor(
    private readonly dynamicQueryService: DynamicQueryGeneratorService,
  ) {}

  /**
   * Universal Query - Execute any Prisma operation dynamically
   */
  @Query(() => GraphQLJSONObject, {
    name: 'universalQuery',
    description: 'Execute any Prisma query operation dynamically',
  })
  async universalQuery(
    @Args('input') input: UniversalQueryInput,
  ): Promise<any> {
    this.logger.log(
      `Universal Query: ${input.model}.${input.operation}`,
    );

    const { model, operation } = input;

    switch (operation) {
      case 'findMany':
        return this.dynamicQueryService.findMany(model, {
          where: input.where,
          select: input.select,
          include: input.include,
          orderBy: input.orderBy,
          skip: input.skip,
          take: input.take,
          distinct: input.distinct,
        });

      case 'findUnique':
        return this.dynamicQueryService.findUnique(model, input.where, {
          select: input.select,
          include: input.include,
        });

      case 'findFirst':
        return this.dynamicQueryService.findFirst(model, {
          where: input.where,
          select: input.select,
          include: input.include,
          orderBy: input.orderBy,
        });

      case 'count':
        return this.dynamicQueryService.count(model, {
          where: input.where,
        });

      case 'aggregate':
        return this.dynamicQueryService.aggregate(model, input as any);

      case 'groupBy':
        // groupBy requires 'by' parameter from input
        if (!(input as any).by) {
          throw new Error('groupBy operation requires "by" parameter');
        }
        return this.dynamicQueryService.groupBy(model, input as any);

      default:
        throw new Error(`Unsupported query operation: ${operation}`);
    }
  }

  /**
   * Universal Mutation - Execute any Prisma mutation dynamically
   */
  @Mutation(() => GraphQLJSONObject, {
    name: 'universalMutation',
    description: 'Execute any Prisma mutation operation dynamically',
  })
  async universalMutation(
    @Args('input') input: UniversalQueryInput,
  ): Promise<any> {
    this.logger.log(
      `Universal Mutation: ${input.model}.${input.operation}`,
    );

    const { model, operation } = input;

    switch (operation) {
      case 'create':
        return this.dynamicQueryService.create(model, input.data, {
          select: input.select,
          include: input.include,
        });

      case 'createMany':
        return this.dynamicQueryService.createMany(
          model,
          input.data as Array<Record<string, any>>,
          false
        );

      case 'update':
        return this.dynamicQueryService.update(model, input.where, input.data, {
          select: input.select,
          include: input.include,
        });

      case 'updateMany':
        return this.dynamicQueryService.updateMany(model, input.where, input.data);

      case 'upsert':
        return this.dynamicQueryService.upsert(
          model,
          input.where,
          input.data, // create
          input.data, // update
          {
            select: input.select,
            include: input.include,
          }
        );

      case 'delete':
        return this.dynamicQueryService.delete(model, input.where, {
          select: input.select,
          include: input.include,
        });

      case 'deleteMany':
        return this.dynamicQueryService.deleteMany(model, input.where);

      default:
        throw new Error(`Unsupported mutation operation: ${operation}`);
    }
  }

  // ==================== FIND QUERIES ====================

  /**
   * Find Many - Paginated query with filters
   */
  @Query(() => GraphQLJSONObject, {
    name: 'dynamicFindMany',
    description: 'Find many records with pagination and filters',
  })
  async dynamicFindMany(
    @Args('input') input: FindManyInput,
  ): Promise<any> {
    this.logger.log(`Dynamic Find Many: ${input.model}`);

    const params: any = {
      where: input.where,
      select: input.select,
      include: input.include,
      orderBy: input.orderBy,
    };

    if (input.pagination) {
      const { page, limit, sortBy, sortOrder } = input.pagination;
      // page is 0-indexed from frontend, so skip = page * limit
      params.skip = page * limit;
      params.take = limit;

      if (sortBy) {
        params.orderBy = { [sortBy]: sortOrder };
      }
    }

    return this.dynamicQueryService.findMany(input.model, params);
  }

  /**
   * Find Unique - Get single record by unique identifier
   */
  @Query(() => GraphQLJSONObject, {
    name: 'dynamicFindUnique',
    description: 'Find unique record by identifier',
  })
  async dynamicFindUnique(
    @Args('input') input: FindUniqueInput,
  ): Promise<any> {
    this.logger.log(`Dynamic Find Unique: ${input.model}`);
    return this.dynamicQueryService.findUnique(input.model, input);
  }

  /**
   * Find First - Get first matching record
   */
  @Query(() => GraphQLJSONObject, {
    name: 'dynamicFindFirst',
    description: 'Find first matching record',
  })
  async dynamicFindFirst(
    @Args('input') input: FindManyInput,
  ): Promise<any> {
    this.logger.log(`Dynamic Find First: ${input.model}`);
    return this.dynamicQueryService.findFirst(input.model, input);
  }

  // ==================== CREATE MUTATIONS ====================

  /**
   * Create - Create single record
   */
  @Mutation(() => GraphQLJSONObject, {
    name: 'dynamicCreate',
    description: 'Create a new record',
  })
  async dynamicCreate(
    @Args('input') input: CreateInput,
  ): Promise<any> {
    this.logger.log(`Dynamic Create: ${input.model}`);
    return this.dynamicQueryService.create(input.model, input.data, {
      select: input.select,
      include: input.include,
    });
  }

  /**
   * Create Many - Bulk create records
   */
  @Mutation(() => GraphQLJSONObject, {
    name: 'dynamicCreateMany',
    description: 'Create multiple records in bulk',
  })
  async dynamicCreateMany(
    @Args('input') input: CreateManyInput,
  ): Promise<any> {
    this.logger.log(
      `Dynamic Create Many: ${input.model} (${input.data.length} records)`,
    );
    return this.dynamicQueryService.createMany(input.model, input.data, input.skipDuplicates);
  }

  // ==================== UPDATE MUTATIONS ====================

  /**
   * Update - Update single record
   */
  @Mutation(() => GraphQLJSONObject, {
    name: 'dynamicUpdate',
    description: 'Update a single record',
  })
  async dynamicUpdate(
    @Args('input') input: UpdateInput,
  ): Promise<any> {
    this.logger.log(`Dynamic Update: ${input.model}`);
    return this.dynamicQueryService.update(input.model, input.where, input.data, {
      select: input.select,
      include: input.include,
    });
  }

  /**
   * Update Many - Bulk update records
   */
  @Mutation(() => GraphQLJSONObject, {
    name: 'dynamicUpdateMany',
    description: 'Update multiple records in bulk',
  })
  async dynamicUpdateMany(
    @Args('input') input: UpdateManyInput,
  ): Promise<any> {
    this.logger.log(`Dynamic Update Many: ${input.model}`);
    return this.dynamicQueryService.updateMany(input.model, input.where, input.data);
  }

  /**
   * Upsert - Create or update record
   */
  @Mutation(() => GraphQLJSONObject, {
    name: 'dynamicUpsert',
    description: 'Create or update a record (upsert)',
  })
  async dynamicUpsert(
    @Args('input') input: UpsertInput,
  ): Promise<any> {
    this.logger.log(`Dynamic Upsert: ${input.model}`);
    return this.dynamicQueryService.upsert(input.model, input.where, input.create, input.update, {
      select: input.select,
      include: input.include,
    });
  }

  // ==================== DELETE MUTATIONS ====================

  /**
   * Delete - Delete single record
   */
  @Mutation(() => GraphQLJSONObject, {
    name: 'dynamicDelete',
    description: 'Delete a single record',
  })
  async dynamicDelete(
    @Args('input') input: DeleteInput,
  ): Promise<any> {
    this.logger.log(`Dynamic Delete: ${input.model}`);
    return this.dynamicQueryService.delete(input.model, input.where, {
      select: input.select,
      include: input.include,
    });
  }

  /**
   * Delete Many - Bulk delete records
   */
  @Mutation(() => GraphQLJSONObject, {
    name: 'dynamicDeleteMany',
    description: 'Delete multiple records in bulk',
  })
  async dynamicDeleteMany(
    @Args('input') input: DeleteManyInput,
  ): Promise<any> {
    this.logger.log(`Dynamic Delete Many: ${input.model}`);
    return this.dynamicQueryService.deleteMany(input.model, input.where);
  }

  // ==================== AGGREGATION QUERIES ====================

  /**
   * Count - Count records matching criteria
   */
  @Query(() => GraphQLJSONObject, {
    name: 'dynamicCount',
    description: 'Count records matching criteria',
  })
  async dynamicCount(
    @Args('input') input: CountInput,
  ): Promise<any> {
    this.logger.log(`Dynamic Count: ${input.model}`);
    const count = await this.dynamicQueryService.count(input.model, input.where);
    return { data: count };
  }

  /**
   * Aggregate - Compute aggregations (sum, avg, min, max)
   */
  @Query(() => GraphQLJSONObject, {
    name: 'dynamicAggregate',
    description: 'Compute aggregations (sum, avg, min, max, count)',
  })
  async dynamicAggregate(
    @Args('input') input: AggregateInput,
  ): Promise<any> {
    this.logger.log(`Dynamic Aggregate: ${input.model}`);
    return this.dynamicQueryService.aggregate(input.model, input);
  }

  /**
   * Group By - Group and aggregate records
   */
  @Query(() => GraphQLJSONObject, {
    name: 'dynamicGroupBy',
    description: 'Group records and compute aggregations',
  })
  async dynamicGroupBy(
    @Args('input') input: GroupByInput,
  ): Promise<any> {
    this.logger.log(`Dynamic Group By: ${input.model}`);
    return this.dynamicQueryService.groupBy(input.model, input);
  }

  // ==================== UTILITY QUERIES ====================

  /**
   * List Available Models
   */
  @Query(() => [String], {
    name: 'listAvailableModels',
    description: 'Get list of all available Prisma models',
  })
  async listAvailableModels(): Promise<string[]> {
    return [
      'user',
      'post',
      'comment',
      'task',
      'tag',
      'category',
      'file',
      'userRole',
      'permission',
      'rolePermission',
      'auditLog',
      'notification',
      'affCampaign',
      'affLink',
      'affClick',
      'affConversion',
      'affPayout',
      'affCommissionRule',
      'invoice',
      'invoiceItem',
      'invoicePayment',
      'invoiceReminder',
      'oramaIndex',
      'oramaDocument',
      'savedSearch',
      'searchHistory',
      'ext_listhoadon',
      'ext_detailhoadon',
      'ext_dmhanghoa',
      'ext_dmkhachhang',
      'ext_vattukho',
      'ext_dmdonvi',
      'ext_dmsodo',
      'ext_trungtamcp',
      'ext_tieude',
      'ext_sanphamhoadon',
      'customerManagement',
      'productInventory',
      'warehouseManagement',
      'salesOrderTracking',
      'purchaseOrderManagement',
      'invoiceManagement',
      'paymentTracking',
      'analyticsReport',
    ];
  }
}
