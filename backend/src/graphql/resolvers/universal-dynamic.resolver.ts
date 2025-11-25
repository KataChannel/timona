/**
 * ============================================================================
 * UNIVERSAL DYNAMIC GRAPHQL RESOLVER - ENTERPRISE LEVEL
 * ============================================================================
 * 
 * A single resolver that handles ALL models with Prisma-like syntax
 * Code once, use everywhere! 🚀
 * 
 * Supported Operations:
 * - findMany, findUnique, findFirst
 * - findManyPaginated, count, aggregate, groupBy
 * - create, createMany
 * - update, updateMany
 * - delete, deleteMany
 * - upsert
 * 
 * @author Senior Full-Stack Engineer
 * @version 2.0.0
 */

import { 
  Resolver, 
  Query, 
  Mutation, 
  Args, 
  Context,
  Int
} from '@nestjs/graphql';
import { UseGuards, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { DynamicGraphQLEngine } from '../core/dynamic-graphql.engine';
import GraphQLJSON from 'graphql-type-json';

/**
 * Universal Dynamic Resolver
 * Handles all CRUD operations for any Prisma model
 */
@Resolver()
export class UniversalDynamicResolver {
  private readonly logger = new Logger(UniversalDynamicResolver.name);

  constructor(private readonly engine: DynamicGraphQLEngine) {
    this.logger.log('🎯 Universal Dynamic Resolver ready');
  }

  // ========================================
  // QUERY OPERATIONS
  // ========================================

  /**
   * Find Many Records
   * Example: findMany(model: "task", where: { status: "ACTIVE" })
   */
  @Query(() => [GraphQLJSON], {
    name: 'findMany',
    description: 'Find many records with Prisma-like syntax',
  })
  @UseGuards(JwtAuthGuard)
  async findMany(
    @Args('model', { type: () => String }) model: string,
    @Args('where', { type: () => GraphQLJSON, nullable: true }) where?: any,
    @Args('orderBy', { type: () => GraphQLJSON, nullable: true }) orderBy?: any,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Args('select', { type: () => GraphQLJSON, nullable: true }) select?: any,
    @Args('include', { type: () => GraphQLJSON, nullable: true }) include?: any,
    @Args('distinct', { type: () => GraphQLJSON, nullable: true }) distinct?: any,
    @Context() context?: any
  ): Promise<any[]> {
    return this.engine.findMany(model, {
      where,
      orderBy,
      skip,
      take,
      select,
      include,
      distinct,
    });
  }

  /**
   * Find Unique Record
   * Example: findUnique(model: "user", where: { id: "123" })
   */
  @Query(() => GraphQLJSON, {
    name: 'findUnique',
    description: 'Find a unique record',
    nullable: true,
  })
  @UseGuards(JwtAuthGuard)
  async findUnique(
    @Args('model', { type: () => String }) model: string,
    @Args('where', { type: () => GraphQLJSON }) where: any,
    @Args('select', { type: () => GraphQLJSON, nullable: true }) select?: any,
    @Args('include', { type: () => GraphQLJSON, nullable: true }) include?: any,
    @Context() context?: any
  ): Promise<any | null> {
    return this.engine.findUnique(model, where, { select, include });
  }

  /**
   * Find First Record
   * Example: findFirst(model: "post", where: { published: true })
   */
  @Query(() => GraphQLJSON, {
    name: 'findFirst',
    description: 'Find first matching record',
    nullable: true,
  })
  @UseGuards(JwtAuthGuard)
  async findFirst(
    @Args('model', { type: () => String }) model: string,
    @Args('where', { type: () => GraphQLJSON, nullable: true }) where?: any,
    @Args('orderBy', { type: () => GraphQLJSON, nullable: true }) orderBy?: any,
    @Args('select', { type: () => GraphQLJSON, nullable: true }) select?: any,
    @Args('include', { type: () => GraphQLJSON, nullable: true }) include?: any,
    @Context() context?: any
  ): Promise<any | null> {
    return this.engine.findFirst(model, {
      where,
      orderBy,
      select,
      include,
    });
  }

  /**
   * Find with Pagination
   * Example: findManyPaginated(model: "task", page: 1, limit: 10)
   */
  @Query(() => GraphQLJSON, {
    name: 'findManyPaginated',
    description: 'Find records with pagination',
  })
  @UseGuards(JwtAuthGuard)
  async findManyPaginated(
    @Args('model', { type: () => String }) model: string,
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
    @Args('where', { type: () => GraphQLJSON, nullable: true }) where?: any,
    @Args('orderBy', { type: () => GraphQLJSON, nullable: true }) orderBy?: any,
    @Args('select', { type: () => GraphQLJSON, nullable: true }) select?: any,
    @Args('include', { type: () => GraphQLJSON, nullable: true }) include?: any,
    @Context() context?: any
  ): Promise<any> {
    return this.engine.findManyPaginated(model, page, limit, {
      where,
      orderBy,
      select,
      include,
    });
  }

  /**
   * Count Records
   * Example: count(model: "user", where: { isActive: true })
   */
  @Query(() => Int, {
    name: 'count',
    description: 'Count records matching criteria',
  })
  @UseGuards(JwtAuthGuard)
  async count(
    @Args('model', { type: () => String }) model: string,
    @Args('where', { type: () => GraphQLJSON, nullable: true }) where?: any,
    @Context() context?: any
  ): Promise<number> {
    return this.engine.count(model, where);
  }

  /**
   * Aggregate
   * Example: aggregate(model: "task", _count: true, _avg: { priority: true })
   */
  @Query(() => GraphQLJSON, {
    name: 'aggregate',
    description: 'Aggregate operations (count, sum, avg, min, max)',
  })
  @UseGuards(JwtAuthGuard)
  async aggregate(
    @Args('model', { type: () => String }) model: string,
    @Args('options', { type: () => GraphQLJSON }) options: any,
    @Context() context?: any
  ): Promise<any> {
    return this.engine.aggregate(model, options);
  }

  /**
   * Group By
   * Example: groupBy(model: "task", by: ["status"], _count: true)
   */
  @Query(() => [GraphQLJSON], {
    name: 'groupBy',
    description: 'Group records by field(s)',
  })
  @UseGuards(JwtAuthGuard)
  async groupBy(
    @Args('model', { type: () => String }) model: string,
    @Args('options', { type: () => GraphQLJSON }) options: any,
    @Context() context?: any
  ): Promise<any> {
    return this.engine.groupBy(model, options);
  }

  // ========================================
  // MUTATION OPERATIONS
  // ========================================

  /**
   * Create One Record
   * Example: createOne(model: "task", data: { title: "New Task" })
   */
  @Mutation(() => GraphQLJSON, {
    name: 'createOne',
    description: 'Create a single record',
  })
  @UseGuards(JwtAuthGuard)
  async createOne(
    @Args('model', { type: () => String }) model: string,
    @Args('data', { type: () => GraphQLJSON }) data: any,
    @Args('select', { type: () => GraphQLJSON, nullable: true }) select?: any,
    @Args('include', { type: () => GraphQLJSON, nullable: true }) include?: any,
    @Context() context?: any
  ): Promise<any> {
    return this.engine.create(model, { data, select, include });
  }

  /**
   * Create Many Records
   * Example: createMany(model: "task", data: [{ title: "Task 1" }, { title: "Task 2" }])
   */
  @Mutation(() => GraphQLJSON, {
    name: 'createMany',
    description: 'Create multiple records (bulk insert)',
  })
  @UseGuards(JwtAuthGuard)
  async createMany(
    @Args('model', { type: () => String }) model: string,
    @Args('data', { type: () => [GraphQLJSON] }) data: any[],
    @Args('skipDuplicates', { type: () => Boolean, nullable: true }) skipDuplicates?: boolean,
    @Context() context?: any
  ): Promise<any> {
    return this.engine.createMany(model, { data, skipDuplicates });
  }

  /**
   * Update One Record
   * Example: updateOne(model: "task", where: { id: "123" }, data: { status: "DONE" })
   */
  @Mutation(() => GraphQLJSON, {
    name: 'updateOne',
    description: 'Update a single record',
  })
  @UseGuards(JwtAuthGuard)
  async updateOne(
    @Args('model', { type: () => String }) model: string,
    @Args('where', { type: () => GraphQLJSON }) where: any,
    @Args('data', { type: () => GraphQLJSON }) data: any,
    @Args('select', { type: () => GraphQLJSON, nullable: true }) select?: any,
    @Args('include', { type: () => GraphQLJSON, nullable: true }) include?: any,
    @Context() context?: any
  ): Promise<any> {
    return this.engine.update(model, { where, data, select, include });
  }

  /**
   * Update Many Records
   * Example: updateMany(model: "task", where: { status: "TODO" }, data: { priority: "HIGH" })
   */
  @Mutation(() => GraphQLJSON, {
    name: 'updateMany',
    description: 'Update multiple records (bulk update)',
  })
  @UseGuards(JwtAuthGuard)
  async updateMany(
    @Args('model', { type: () => String }) model: string,
    @Args('where', { type: () => GraphQLJSON, nullable: true }) where: any,
    @Args('data', { type: () => GraphQLJSON }) data: any,
    @Context() context?: any
  ): Promise<any> {
    return this.engine.updateMany(model, { where, data });
  }

  /**
   * Delete One Record
   * Example: deleteOne(model: "task", where: { id: "123" })
   */
  @Mutation(() => GraphQLJSON, {
    name: 'deleteOne',
    description: 'Delete a single record',
  })
  @UseGuards(JwtAuthGuard)
  async deleteOne(
    @Args('model', { type: () => String }) model: string,
    @Args('where', { type: () => GraphQLJSON }) where: any,
    @Args('select', { type: () => GraphQLJSON, nullable: true }) select?: any,
    @Context() context?: any
  ): Promise<any> {
    return this.engine.delete(model, where, { select });
  }

  /**
   * Delete Many Records
   * Example: deleteMany(model: "task", where: { completed: true })
   */
  @Mutation(() => GraphQLJSON, {
    name: 'deleteMany',
    description: 'Delete multiple records (bulk delete)',
  })
  @UseGuards(JwtAuthGuard)
  async deleteMany(
    @Args('model', { type: () => String }) model: string,
    @Args('where', { type: () => GraphQLJSON, nullable: true }) where?: any,
    @Context() context?: any
  ): Promise<any> {
    return this.engine.deleteMany(model, where);
  }

  /**
   * Upsert Record (Update or Create)
   * Example: upsert(model: "user", where: { email: "..." }, create: {...}, update: {...})
   */
  @Mutation(() => GraphQLJSON, {
    name: 'upsert',
    description: 'Update existing or create new record',
  })
  @UseGuards(JwtAuthGuard)
  async upsert(
    @Args('model', { type: () => String }) model: string,
    @Args('where', { type: () => GraphQLJSON }) where: any,
    @Args('create', { type: () => GraphQLJSON }) create: any,
    @Args('update', { type: () => GraphQLJSON }) update: any,
    @Args('select', { type: () => GraphQLJSON, nullable: true }) select?: any,
    @Args('include', { type: () => GraphQLJSON, nullable: true }) include?: any,
    @Context() context?: any
  ): Promise<any> {
    return this.engine.upsert(model, { where, create, update, select, include });
  }

  // ========================================
  // UTILITY OPERATIONS
  // ========================================

  /**
   * Get Available Models
   */
  @Query(() => [String], {
    name: 'getAvailableModels',
    description: 'Get list of all available Prisma models',
  })
  async getAvailableModels(): Promise<string[]> {
    return this.engine.getAvailableModels();
  }

  /**
   * Clear Cache
   */
  @Mutation(() => Boolean, {
    name: 'clearCache',
    description: 'Clear all cached data',
  })
  @UseGuards(JwtAuthGuard)
  async clearCache(): Promise<boolean> {
    this.engine.clearAllCache();
    return true;
  }
}
