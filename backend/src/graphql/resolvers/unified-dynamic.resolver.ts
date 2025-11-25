import { 
  Resolver, 
  Query, 
  Mutation, 
  Args, 
  Context, 
  ID,
  registerEnumType
} from '@nestjs/graphql';
import { UseGuards, Injectable } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { DynamicCRUDService } from '../../services/dynamic-crud.service';
import { GraphQLJSONObject } from 'graphql-type-json';
import {
  UnifiedCreateInput,
  UnifiedUpdateInput,
  UnifiedDeleteInput,
  UnifiedBulkCreateInput,
  UnifiedBulkUpdateInput,
  UnifiedBulkDeleteInput,
  UnifiedFindManyInput,
  UnifiedFindByIdInput,
  UnifiedPaginatedInput
} from '../inputs/unified-dynamic.inputs';

// Enum for supported models (can be extended)
export enum SupportedModel {
  User = 'user',
  Task = 'task',
  Post = 'post',
  Comment = 'comment',
  Page = 'page',
  PageBlock = 'pageBlock',
  TaskComment = 'taskComment',
  Notification = 'notification',
  AuditLog = 'auditLog',
  Role = 'role',
  Permission = 'permission'
}

registerEnumType(SupportedModel, {
  name: 'SupportedModel',
  description: 'Supported models for dynamic operations'
});

// Unified Result Types
export interface UnifiedResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface UnifiedPaginatedResult<T = any> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/**
 * Unified Dynamic GraphQL Resolver
 * Supports all CRUD operations for any model with Prisma-like syntax
 * Operations: CREATE, UPDATE, DELETE, CREATE_BULK, UPDATE_BULK, DELETE_BULK, GET_ALL, GET_PAGINATED, GET_BY_ID
 */
@Resolver()
@Injectable()
export class UnifiedDynamicResolver {
  constructor(private readonly dynamicCrud: DynamicCRUDService) {}

  // ===============================
  // QUERY OPERATIONS (Prisma-like)
  // ===============================

  /**
   * Find all records for a model (equivalent to prisma.model.findMany())
   * @param modelName - The model name (e.g., 'task', 'user', 'post')
   * @param input - Query options (where, orderBy, select, include, etc.)
   */
  @Query(() => [GraphQLJSONObject], { 
    name: 'findMany',
    description: 'Find all records for a model with Prisma-like syntax' 
  })
  @UseGuards(JwtAuthGuard)
  async findMany(
    @Args('modelName', { type: () => String }) modelName: string,
    @Args('input', { type: () => UnifiedFindManyInput, nullable: true }) 
    input?: UnifiedFindManyInput,
    @Context() context?: any
  ): Promise<any[]> {
    try {
      const userId = context?.req?.user?.id;
      return await this.dynamicCrud.findMany(modelName, input);
    } catch (error) {
      throw new Error(`Failed to find ${modelName} records: ${error.message}`);
    }
  }

  /**
   * Find records with pagination (equivalent to prisma.model.findMany() with pagination)
   * @param modelName - The model name
   * @param input - Query options with pagination
   */
  @Query(() => GraphQLJSONObject, { 
    name: 'findManyPaginated',
    description: 'Find records with pagination' 
  })
  @UseGuards(JwtAuthGuard)
  async findManyPaginated(
    @Args('modelName', { type: () => String }) modelName: string,
    @Args('input', { type: () => UnifiedPaginatedInput, nullable: true }) 
    input?: UnifiedPaginatedInput,
    @Context() context?: any
  ): Promise<UnifiedPaginatedResult> {
    try {
      const userId = context?.req?.user?.id;
      return await this.dynamicCrud.findManyPaginated(modelName, input);
    } catch (error) {
      throw new Error(`Failed to find paginated ${modelName} records: ${error.message}`);
    }
  }

  /**
   * Find unique record by ID (equivalent to prisma.model.findUnique())
   * @param modelName - The model name
   * @param input - Query options with ID
   */
  @Query(() => GraphQLJSONObject, { 
    name: 'findById',
    description: 'Find a unique record by ID' 
  })
  @UseGuards(JwtAuthGuard)
  async findById(
    @Args('modelName', { type: () => String }) modelName: string,
    @Args('input', { type: () => UnifiedFindByIdInput }) 
    input: UnifiedFindByIdInput,
    @Context() context?: any
  ): Promise<any> {
    try {
      const userId = context?.req?.user?.id;
      return await this.dynamicCrud.findById(modelName, input.id, {
        select: input.select,
        include: input.include
      });
    } catch (error) {
      throw new Error(`Failed to find ${modelName} by ID: ${error.message}`);
    }
  }

  /**
   * Count records (equivalent to prisma.model.count())
   * @param modelName - The model name
   * @param where - Filter conditions
   */
  @Query(() => Number, { 
    name: 'count',
    description: 'Count records matching the criteria' 
  })
  @UseGuards(JwtAuthGuard)
  async count(
    @Args('modelName', { type: () => String }) modelName: string,
    @Args('where', { type: () => GraphQLJSONObject, nullable: true }) 
    where?: any,
    @Context() context?: any
  ): Promise<number> {
    try {
      return await this.dynamicCrud.count(modelName, where);
    } catch (error) {
      throw new Error(`Failed to count ${modelName} records: ${error.message}`);
    }
  }

  // ===============================
  // MUTATION OPERATIONS (Prisma-like)
  // ===============================

  /**
   * Create a single record (equivalent to prisma.model.create())
   * @param modelName - The model name
   * @param input - Create input data
   */
  @Mutation(() => GraphQLJSONObject, { 
    name: 'createOne',
    description: 'Create a single record with Prisma-like syntax' 
  })
  @UseGuards(JwtAuthGuard)
  async createOne(
    @Args('modelName', { type: () => String }) modelName: string,
    @Args('input', { type: () => UnifiedCreateInput }) 
    input: UnifiedCreateInput,
    @Context() context?: any
  ): Promise<any> {
    try {
      // For Project model, ensure ownerId is set from context
      if (modelName === 'Project' && !input.data.ownerId && context?.req?.user?.id) {
        input.data.ownerId = context.req.user.id;
      }
      
      return await this.dynamicCrud.create(modelName, input.data, {
        select: input.select,
        include: input.include
      }, context); // Pass context as 4th parameter
    } catch (error) {
      throw new Error(`Failed to create ${modelName}: ${error.message}`);
    }
  }

  /**
   * Update a single record (equivalent to prisma.model.update())
   * @param modelName - The model name
   * @param input - Update input data
   */
  @Mutation(() => GraphQLJSONObject, { 
    name: 'updateOne',
    description: 'Update a single record by ID' 
  })
  @UseGuards(JwtAuthGuard)
  async updateOne(
    @Args('modelName', { type: () => String }) modelName: string,
    @Args('input', { type: () => UnifiedUpdateInput }) 
    input: UnifiedUpdateInput,
    @Context() context?: any
  ): Promise<any> {
    try {
      return await this.dynamicCrud.update(modelName, input.id, input.data, {
        select: input.select,
        include: input.include
      });
    } catch (error) {
      throw new Error(`Failed to update ${modelName}: ${error.message}`);
    }
  }

  /**
   * Delete a single record (equivalent to prisma.model.delete())
   * @param modelName - The model name
   * @param input - Delete input data
   */
  @Mutation(() => GraphQLJSONObject, { 
    name: 'deleteOne',
    description: 'Delete a single record by ID' 
  })
  @UseGuards(JwtAuthGuard)
  async deleteOne(
    @Args('modelName', { type: () => String }) modelName: string,
    @Args('input', { type: () => UnifiedDeleteInput }) 
    input: UnifiedDeleteInput,
    @Context() context?: any
  ): Promise<any> {
    try {
      return await this.dynamicCrud.delete(modelName, input.id, {
        select: input.select,
        include: input.include
      });
    } catch (error) {
      throw new Error(`Failed to delete ${modelName}: ${error.message}`);
    }
  }

  // ===============================
  // BULK OPERATIONS (Prisma-like)
  // ===============================

  /**
   * Create multiple records (equivalent to prisma.model.createMany())
   * @param modelName - The model name
   * @param input - Bulk create input data
   */
  @Mutation(() => GraphQLJSONObject, { 
    name: 'createMany',
    description: 'Create multiple records in a single operation' 
  })
  @UseGuards(JwtAuthGuard)
  async createMany(
    @Args('modelName', { type: () => String }) modelName: string,
    @Args('input', { type: () => UnifiedBulkCreateInput }) 
    input: UnifiedBulkCreateInput,
    @Context() context?: any
  ): Promise<any> {
    try {
      // Ensure all Project items have ownerId from context
      if (modelName === 'Project' && context?.req?.user?.id) {
        input.data = input.data.map(item => ({
          ...item,
          ownerId: item.ownerId || context.req.user.id
        }));
      }
      
      return await this.dynamicCrud.bulkCreate(modelName, input.data, {
        skipDuplicates: input.skipDuplicates,
        select: input.select,
        include: input.include
      }, context); // Pass context as 4th parameter
    } catch (error) {
      throw new Error(`Failed to bulk create ${modelName}: ${error.message}`);
    }
  }

  /**
   * Update multiple records (equivalent to prisma.model.updateMany())
   * @param modelName - The model name
   * @param input - Bulk update input data
   */
  @Mutation(() => GraphQLJSONObject, { 
    name: 'updateMany',
    description: 'Update multiple records matching criteria' 
  })
  @UseGuards(JwtAuthGuard)
  async updateMany(
    @Args('modelName', { type: () => String }) modelName: string,
    @Args('input', { type: () => UnifiedBulkUpdateInput }) 
    input: UnifiedBulkUpdateInput,
    @Context() context?: any
  ): Promise<any> {
    try {
      return await this.dynamicCrud.bulkUpdate(modelName, input.where, input.data, {
        select: input.select,
        include: input.include
      });
    } catch (error) {
      throw new Error(`Failed to bulk update ${modelName}: ${error.message}`);
    }
  }

  /**
   * Delete multiple records (equivalent to prisma.model.deleteMany())
   * @param modelName - The model name
   * @param input - Bulk delete input data
   */
  @Mutation(() => GraphQLJSONObject, { 
    name: 'deleteMany',
    description: 'Delete multiple records matching criteria' 
  })
  @UseGuards(JwtAuthGuard)
  async deleteMany(
    @Args('modelName', { type: () => String }) modelName: string,
    @Args('input', { type: () => UnifiedBulkDeleteInput }) 
    input: UnifiedBulkDeleteInput,
    @Context() context?: any
  ): Promise<any> {
    try {
      return await this.dynamicCrud.bulkDelete(modelName, input.where, {
        select: input.select,
        include: input.include
      });
    } catch (error) {
      throw new Error(`Failed to bulk delete ${modelName}: ${error.message}`);
    }
  }

  // ===============================
  // UTILITY OPERATIONS
  // ===============================

  /**
   * Check if record exists (equivalent to prisma.model.findFirst() !== null)
   */
  @Query(() => Boolean, { 
    name: 'exists',
    description: 'Check if a record exists matching the criteria' 
  })
  @UseGuards(JwtAuthGuard)
  async exists(
    @Args('modelName', { type: () => String }) modelName: string,
    @Args('where', { type: () => GraphQLJSONObject }) where: any,
    @Context() context?: any
  ): Promise<boolean> {
    try {
      return await this.dynamicCrud.exists(modelName, where);
    } catch (error) {
      throw new Error(`Failed to check if ${modelName} exists: ${error.message}`);
    }
  }

  /**
   * Upsert operation (equivalent to prisma.model.upsert())
   */
  @Mutation(() => GraphQLJSONObject, { 
    name: 'upsert',
    description: 'Create or update a record based on criteria' 
  })
  @UseGuards(JwtAuthGuard)
  async upsert(
    @Args('modelName', { type: () => String }) modelName: string,
    @Args('where', { type: () => GraphQLJSONObject }) where: any,
    @Args('create', { type: () => GraphQLJSONObject }) create: any,
    @Args('update', { type: () => GraphQLJSONObject }) update: any,
    @Args('select', { type: () => GraphQLJSONObject, nullable: true }) select?: any,
    @Args('include', { type: () => GraphQLJSONObject, nullable: true }) include?: any,
    @Context() context?: any
  ): Promise<any> {
    try {
      return await this.dynamicCrud.upsert(modelName, where, create, update, {
        select,
        include
      });
    } catch (error) {
      throw new Error(`Failed to upsert ${modelName}: ${error.message}`);
    }
  }
}