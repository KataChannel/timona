'use client';

import { useQuery, useMutation, ApolloError } from '@apollo/client';
import { useCallback, useMemo } from 'react';
import {
  DYNAMIC_FIND_MANY,
  DYNAMIC_FIND_UNIQUE,
  DYNAMIC_FIND_FIRST,
  DYNAMIC_CREATE,
  DYNAMIC_CREATE_MANY,
  DYNAMIC_UPDATE,
  DYNAMIC_UPDATE_MANY,
  DYNAMIC_UPSERT,
  DYNAMIC_DELETE,
  DYNAMIC_DELETE_MANY,
  DYNAMIC_COUNT,
  DYNAMIC_AGGREGATE,
  DYNAMIC_GROUP_BY,
  LIST_AVAILABLE_MODELS,
} from './universal-dynamic-queries';

import type {
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
  DynamicQueryOptions,
  DynamicMutationOptions,
  DynamicQueryResult,
  CreateManyResult,
  UpdateManyResult,
  DeleteManyResult,
  CountResult,
  AggregateResult,
  GroupByResult,
  ModelName,
} from './universal-dynamic-types';

// ==================== FIND HOOKS ====================

/**
 * useDynamicFindMany - Find multiple records with pagination
 * 
 * @example
 * const { data, loading, error } = useDynamicFindMany({
 *   model: 'user',
 *   where: { isActive: true },
 *   select: { id: true, email: true, name: true },
 *   pagination: { page: 1, limit: 20 }
 * });
 */
export function useDynamicFindMany<T = any>(
  input: FindManyInput,
  options?: DynamicQueryOptions
) {
  return useQuery<{ dynamicFindMany: DynamicQueryResult<T[]> }>(
    DYNAMIC_FIND_MANY,
    {
      variables: { input },
      ...options,
    }
  );
}

/**
 * useDynamicFindUnique - Find single unique record
 * 
 * @example
 * const { data, loading } = useDynamicFindUnique({
 *   model: 'user',
 *   where: { id: 'user-uuid' },
 *   include: { posts: true }
 * });
 */
export function useDynamicFindUnique<T = any>(
  input: FindUniqueInput,
  options?: DynamicQueryOptions
) {
  return useQuery<{ dynamicFindUnique: T }>(
    DYNAMIC_FIND_UNIQUE,
    {
      variables: { input },
      ...options,
    }
  );
}

/**
 * useDynamicFindFirst - Find first matching record
 * 
 * @example
 * const { data } = useDynamicFindFirst({
 *   model: 'post',
 *   where: { published: true },
 *   orderBy: { createdAt: 'desc' }
 * });
 */
export function useDynamicFindFirst<T = any>(
  input: FindManyInput,
  options?: DynamicQueryOptions
) {
  return useQuery<{ dynamicFindFirst: T }>(
    DYNAMIC_FIND_FIRST,
    {
      variables: { input },
      ...options,
    }
  );
}

// ==================== CREATE HOOKS ====================

/**
 * useDynamicCreate - Create single record
 * 
 * @example
 * const [createUser, { data, loading }] = useDynamicCreate();
 * 
 * await createUser({
 *   variables: {
 *     input: {
 *       model: 'user',
 *       data: { email: 'new@example.com', name: 'New User' }
 *     }
 *   }
 * });
 */
export function useDynamicCreate<T = any>(options?: DynamicMutationOptions) {
  return useMutation<
    { dynamicCreate: T },
    { input: CreateInput }
  >(DYNAMIC_CREATE, options);
}

/**
 * useDynamicCreateMany - Bulk create records
 * 
 * @example
 * const [createMany] = useDynamicCreateMany();
 * 
 * await createMany({
 *   variables: {
 *     input: {
 *       model: 'task',
 *       data: [
 *         { title: 'Task 1', status: 'TODO' },
 *         { title: 'Task 2', status: 'TODO' }
 *       ]
 *     }
 *   }
 * });
 */
export function useDynamicCreateMany(options?: DynamicMutationOptions) {
  return useMutation<
    { dynamicCreateMany: CreateManyResult },
    { input: CreateManyInput }
  >(DYNAMIC_CREATE_MANY, options);
}

// ==================== UPDATE HOOKS ====================

/**
 * useDynamicUpdate - Update single record
 * 
 * @example
 * const [updateUser] = useDynamicUpdate();
 * 
 * await updateUser({
 *   variables: {
 *     input: {
 *       model: 'user',
 *       where: { id: 'user-uuid' },
 *       data: { name: 'Updated Name' }
 *     }
 *   }
 * });
 */
export function useDynamicUpdate<T = any>(options?: DynamicMutationOptions) {
  return useMutation<
    { dynamicUpdate: T },
    { input: UpdateInput }
  >(DYNAMIC_UPDATE, options);
}

/**
 * useDynamicUpdateMany - Bulk update records
 * 
 * @example
 * const [updateMany] = useDynamicUpdateMany();
 * 
 * await updateMany({
 *   variables: {
 *     input: {
 *       model: 'task',
 *       where: { status: 'TODO' },
 *       data: { priority: 'HIGH' }
 *     }
 *   }
 * });
 */
export function useDynamicUpdateMany(options?: DynamicMutationOptions) {
  return useMutation<
    { dynamicUpdateMany: UpdateManyResult },
    { input: UpdateManyInput }
  >(DYNAMIC_UPDATE_MANY, options);
}

/**
 * useDynamicUpsert - Create or update record
 * 
 * @example
 * const [upsert] = useDynamicUpsert();
 * 
 * await upsert({
 *   variables: {
 *     input: {
 *       model: 'user',
 *       where: { email: 'user@example.com' },
 *       create: { email: 'user@example.com', name: 'New User' },
 *       update: { name: 'Updated User' }
 *     }
 *   }
 * });
 */
export function useDynamicUpsert<T = any>(options?: DynamicMutationOptions) {
  return useMutation<
    { dynamicUpsert: T },
    { input: UpsertInput }
  >(DYNAMIC_UPSERT, options);
}

// ==================== DELETE HOOKS ====================

/**
 * useDynamicDelete - Delete single record
 * 
 * @example
 * const [deleteTask] = useDynamicDelete();
 * 
 * await deleteTask({
 *   variables: {
 *     input: {
 *       model: 'task',
 *       where: { id: 'task-uuid' }
 *     }
 *   }
 * });
 */
export function useDynamicDelete<T = any>(options?: DynamicMutationOptions) {
  return useMutation<
    { dynamicDelete: T },
    { input: DeleteInput }
  >(DYNAMIC_DELETE, options);
}

/**
 * useDynamicDeleteMany - Bulk delete records
 * 
 * @example
 * const [deleteMany] = useDynamicDeleteMany();
 * 
 * await deleteMany({
 *   variables: {
 *     input: {
 *       model: 'post',
 *       where: { published: false }
 *     }
 *   }
 * });
 */
export function useDynamicDeleteMany(options?: DynamicMutationOptions) {
  return useMutation<
    { dynamicDeleteMany: DeleteManyResult },
    { input: DeleteManyInput }
  >(DYNAMIC_DELETE_MANY, options);
}

// ==================== AGGREGATION HOOKS ====================

/**
 * useDynamicCount - Count records
 * 
 * @example
 * const { data } = useDynamicCount({
 *   model: 'user',
 *   where: { isActive: true }
 * });
 */
export function useDynamicCount(
  input: CountInput,
  options?: DynamicQueryOptions
) {
  return useQuery<{ dynamicCount: CountResult }>(
    DYNAMIC_COUNT,
    {
      variables: { input },
      ...options,
    }
  );
}

/**
 * useDynamicAggregate - Aggregate computations
 * 
 * @example
 * const { data } = useDynamicAggregate({
 *   model: 'ext_listhoadon',
 *   where: { status: 'paid' },
 *   _sum: { totalAmount: true },
 *   _avg: { totalAmount: true },
 *   _count: true
 * });
 */
export function useDynamicAggregate(
  input: AggregateInput,
  options?: DynamicQueryOptions
) {
  return useQuery<{ dynamicAggregate: AggregateResult }>(
    DYNAMIC_AGGREGATE,
    {
      variables: { input },
      ...options,
    }
  );
}

/**
 * useDynamicGroupBy - Group and aggregate
 * 
 * @example
 * const { data } = useDynamicGroupBy({
 *   model: 'task',
 *   by: ['status'],
 *   _count: { _all: true },
 *   where: { userId: 'user-uuid' }
 * });
 */
export function useDynamicGroupBy(
  input: GroupByInput,
  options?: DynamicQueryOptions
) {
  return useQuery<{ dynamicGroupBy: GroupByResult[] }>(
    DYNAMIC_GROUP_BY,
    {
      variables: { input },
      ...options,
    }
  );
}

// ==================== UTILITY HOOKS ====================

/**
 * useListAvailableModels - Get all available models
 * 
 * @example
 * const { data } = useListAvailableModels();
 * // data.listAvailableModels = ['user', 'post', 'task', ...]
 */
export function useListAvailableModels(options?: DynamicQueryOptions) {
  return useQuery<{ listAvailableModels: string[] }>(
    LIST_AVAILABLE_MODELS,
    options
  );
}

// ==================== COMPOSITE HOOKS ====================

/**
 * useDynamicCRUD - Get all CRUD operations for a model
 * 
 * @example
 * const crud = useDynamicCRUD('user');
 * 
 * // Use operations
 * const { data, loading } = crud.findMany({ where: { isActive: true } });
 * await crud.create({ data: { email: 'new@test.com' } });
 * await crud.update({ where: { id: 'uuid' }, data: { name: 'New Name' } });
 * await crud.delete({ where: { id: 'uuid' } });
 */
export function useDynamicCRUD<T = any>(model: ModelName) {
  const [create] = useDynamicCreate<T>();
  const [update] = useDynamicUpdate<T>();
  const [deleteRecord] = useDynamicDelete<T>();
  const [createMany] = useDynamicCreateMany();
  const [updateMany] = useDynamicUpdateMany();
  const [deleteMany] = useDynamicDeleteMany();

  return useMemo(() => ({
    model,
    
    // Query methods (need to be called with useQuery separately)
    findMany: (input: Omit<FindManyInput, 'model'>) => ({
      model,
      ...input,
    }),
    
    findUnique: (input: Omit<FindUniqueInput, 'model'>) => ({
      model,
      ...input,
    }),
    
    findFirst: (input: Omit<FindManyInput, 'model'>) => ({
      model,
      ...input,
    }),
    
    // Mutation methods
    create: (data: Record<string, any>, options?: { select?: Record<string, any>; include?: Record<string, any> }) =>
      create({
        variables: {
          input: {
            model,
            data,
            select: options?.select,
            include: options?.include,
          },
        },
      }),
    
    createMany: (data: Array<Record<string, any>>, skipDuplicates = false) =>
      createMany({
        variables: {
          input: {
            model,
            data,
            skipDuplicates,
          },
        },
      }),
    
    update: (where: Record<string, any>, data: Record<string, any>, options?: { select?: Record<string, any>; include?: Record<string, any> }) =>
      update({
        variables: {
          input: {
            model,
            where,
            data,
            select: options?.select,
            include: options?.include,
          },
        },
      }),
    
    updateMany: (where: Record<string, any>, data: Record<string, any>) =>
      updateMany({
        variables: {
          input: {
            model,
            where,
            data,
          },
        },
      }),
    
    delete: (where: Record<string, any>) =>
      deleteRecord({
        variables: {
          input: {
            model,
            where,
          },
        },
      }),
    
    deleteMany: (where: Record<string, any>) =>
      deleteMany({
        variables: {
          input: {
            model,
            where,
          },
        },
      }),
  }), [model, create, update, deleteRecord, createMany, updateMany, deleteMany]);
}

// ==================== LAZY QUERY HOOK ====================

/**
 * useLazyDynamicFindMany - Lazy load multiple records
 * 
 * @example
 * const [loadUsers, { data, loading }] = useLazyDynamicFindMany();
 * 
 * // Later...
 * loadUsers({
 *   variables: {
 *     input: {
 *       model: 'user',
 *       where: { isActive: true }
 *     }
 *   }
 * });
 */
export function useLazyDynamicFindMany<T = any>() {
  const [execute, result] = useMutation<
    { dynamicFindMany: DynamicQueryResult<T[]> },
    { input: FindManyInput }
  >(DYNAMIC_FIND_MANY);

  return [execute, result] as const;
}

// ==================== ERROR HANDLING WRAPPER ====================

/**
 * withErrorHandler - Wrap hook with error handler
 * 
 * @example
 * const { data, error } = withErrorHandler(
 *   useDynamicFindMany({ model: 'user' }),
 *   (error) => {
 *     console.error('Failed to load users:', error);
 *     toast.error('Failed to load users');
 *   }
 * );
 */
export function withErrorHandler<T>(
  hookResult: any,
  onError: (error: ApolloError) => void
) {
  const { error, ...rest } = hookResult;
  
  if (error && onError) {
    onError(error);
  }
  
  return { error, ...rest };
}
