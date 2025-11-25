/**
 * ============================================================================
 * UNIVERSAL DYNAMIC GRAPHQL HOOKS - ENTERPRISE LEVEL
 * ============================================================================
 * 
 * Type-safe React hooks for all Prisma models
 * Code once, use everywhere! 🚀
 * 
 * @author Senior Full-Stack Engineer
 * @version 2.0.0
 */

import { useQuery, useMutation, useApolloClient, ApolloError } from '@apollo/client';
import { useState, useCallback } from 'react';
import {
  FIND_MANY,
  FIND_UNIQUE,
  FIND_FIRST,
  FIND_MANY_PAGINATED,
  COUNT,
  AGGREGATE,
  GROUP_BY,
  CREATE_ONE,
  CREATE_MANY,
  UPDATE_ONE,
  UPDATE_MANY,
  DELETE_ONE,
  DELETE_MANY,
  UPSERT,
  GET_AVAILABLE_MODELS,
  CLEAR_CACHE,
} from '../graphql/dynamic/operations';

// ========================================
// TYPE DEFINITIONS
// ========================================

export interface QueryOptions {
  where?: any;
  orderBy?: any;
  skip?: number;
  take?: number;
  select?: any;
  include?: any;
  distinct?: any;
}

export interface PaginatedOptions extends Omit<QueryOptions, 'skip' | 'take'> {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
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

export interface MutationResult {
  success: boolean;
  count?: number;
  error?: string;
}

// ========================================
// QUERY HOOKS
// ========================================

/**
 * Universal Find Many Hook
 * Usage: useFindMany<Task>('task', { where: { status: 'ACTIVE' } })
 */
export function useFindMany<T = any>(
  model: string,
  options?: QueryOptions,
  config?: { skip?: boolean; fetchPolicy?: any; requireAuth?: boolean }
) {
  // Auto-skip if auth is required but token not available
  const hasToken = typeof window !== 'undefined' ? !!localStorage.getItem('accessToken') : false;
  const shouldSkip = config?.skip || (config?.requireAuth !== false && !hasToken);

  const { data, loading, error, refetch } = useQuery(FIND_MANY, {
    variables: {
      modelName: model,
      input: options || {},
    },
    skip: shouldSkip,
    fetchPolicy: config?.fetchPolicy || 'cache-and-network',
  });

  return {
    data: data?.findMany as T[] | undefined,
    loading,
    error,
    refetch,
  };
}

/**
 * Universal Find Unique Hook
 * Usage: useFindUnique<User>('user', { id: '123' })
 */
export function useFindUnique<T = any>(
  model: string,
  where: any,
  options?: Omit<QueryOptions, 'where'>,
  config?: { skip?: boolean; requireAuth?: boolean }
) {
  // Auto-skip if auth is required but token not available
  const hasToken = typeof window !== 'undefined' ? !!localStorage.getItem('accessToken') : false;
  
  // Extract ID from where parameter
  const id = typeof where === 'string' ? where : where?.id;
  
  // Log warning if ID is missing (helps debugging)
  if (!id && !config?.skip && process.env.NODE_ENV === 'development') {
    console.warn(
      `[useFindUnique] Missing ID for model "${model}". ` +
      `Query will be skipped. Please provide where: { id: "..." } or where: "id-string"`
    );
  }
  
  // Skip if no ID provided or if auth required but no token
  const shouldSkip = config?.skip || !id || (config?.requireAuth !== false && !hasToken);

  const { data, loading, error, refetch } = useQuery(FIND_UNIQUE, {
    variables: {
      modelName: model,
      input: {
        id: id || '',  // Provide empty string instead of undefined to avoid GraphQL error
        select: options?.select,
        include: options?.include,
      },
    },
    skip: shouldSkip,
  });

  return {
    data: data?.findById as T | undefined,
    loading,
    error,
    refetch,
  };
}

/**
 * Universal Find First Hook
 * Usage: useFindFirst<Post>('post', { where: { published: true } })
 */
export function useFindFirst<T = any>(
  model: string,
  options?: QueryOptions,
  config?: { skip?: boolean; requireAuth?: boolean }
) {
  // Auto-skip if auth is required but token not available
  const hasToken = typeof window !== 'undefined' ? !!localStorage.getItem('accessToken') : false;
  const shouldSkip = config?.skip || (config?.requireAuth !== false && !hasToken);

  const { data, loading, error, refetch } = useQuery(FIND_FIRST, {
    variables: {
      modelName: model,
      input: {
        ...options,
        take: 1,
      },
    },
    skip: shouldSkip,
  });

  return {
    data: (data?.findMany?.[0]) as T | undefined,
    loading,
    error,
    refetch,
  };
}

/**
 * Universal Paginated Query Hook
 * Usage: useFindManyPaginated<Task>('task', { page: 1, limit: 10, where: {...} })
 */
export function useFindManyPaginated<T = any>(
  model: string,
  options?: PaginatedOptions,
  config?: { skip?: boolean; requireAuth?: boolean }
) {
  const [page, setPage] = useState(options?.page || 1);
  const [limit, setLimit] = useState(options?.limit || 10);

  // Auto-skip if auth is required but token not available
  const hasToken = typeof window !== 'undefined' ? !!localStorage.getItem('accessToken') : false;
  const shouldSkip = config?.skip || (config?.requireAuth !== false && !hasToken);

  const { data, loading, error, refetch } = useQuery(FIND_MANY_PAGINATED, {
    variables: {
      modelName: model,
      input: {
        page,
        limit,
        where: options?.where,
        orderBy: options?.orderBy,
        select: options?.select,
        include: options?.include,
      },
    },
    skip: shouldSkip,
    fetchPolicy: 'cache-and-network',
  });

  const result = data?.findManyPaginated as PaginatedResult<T> | undefined;

  const goToPage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const nextPage = useCallback(() => {
    if (result?.meta.hasNextPage) {
      setPage(p => p + 1);
    }
  }, [result]);

  const prevPage = useCallback(() => {
    if (result?.meta.hasPrevPage) {
      setPage(p => p - 1);
    }
  }, [result]);

  const changeLimit = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page
  }, []);

  return {
    data: result?.data,
    meta: result?.meta,
    loading,
    error,
    refetch,
    page,
    limit,
    goToPage,
    nextPage,
    prevPage,
    changeLimit,
  };
}

/**
 * Universal Count Hook
 * Usage: useCount('task', { status: 'ACTIVE' })
 */
export function useCount(
  model: string,
  where?: any,
  config?: { skip?: boolean }
) {
  const { data, loading, error, refetch } = useQuery(COUNT, {
    variables: { modelName: model, where },
    skip: config?.skip,
  });

  return {
    count: data?.count as number | undefined,
    loading,
    error,
    refetch,
  };
}

/**
 * Universal Aggregate Hook
 * Usage: useAggregate('invoice', { _sum: { amount: true }, _avg: { amount: true } })
 */
export function useAggregate(
  model: string,
  options: any,
  config?: { skip?: boolean }
) {
  const { data, loading, error, refetch } = useQuery(AGGREGATE, {
    variables: { model, options },
    skip: config?.skip,
  });

  return {
    data: data?.aggregate,
    loading,
    error,
    refetch,
  };
}

/**
 * Universal Group By Hook
 * Usage: useGroupBy('task', { by: ['status'], _count: true })
 */
export function useGroupBy<T = any>(
  model: string,
  options: any,
  config?: { skip?: boolean }
) {
  const { data, loading, error, refetch } = useQuery(GROUP_BY, {
    variables: { model, options },
    skip: config?.skip,
  });

  return {
    data: data?.groupBy as T[] | undefined,
    loading,
    error,
    refetch,
  };
}

// ========================================
// MUTATION HOOKS
// ========================================

/**
 * Universal Create One Hook
 * Usage: const [createTask] = useCreateOne<Task>('task')
 */
export function useCreateOne<T = any>(model: string, config?: { refetchQueries?: any[] }) {
  const [mutate, { data, loading, error }] = useMutation(CREATE_ONE, {
    refetchQueries: config?.refetchQueries,
  });

  const create = useCallback(
    async (input: {
      data: any;
      select?: any;
      include?: any;
    }) => {
      const result = await mutate({
        variables: {
          modelName: model,
          input: {
            data: input.data,
            select: input.select,
            include: input.include,
          },
        },
      });
      return result.data?.createOne as T;
    },
    [mutate, model]
  );

  return [create, { data: data?.createOne as T | undefined, loading, error }] as const;
}

/**
 * Universal Create Many Hook
 * Usage: const [createManyTasks] = useCreateMany('task')
 */
export function useCreateMany(model: string, config?: { refetchQueries?: any[] }) {
  const [mutate, { data, loading, error }] = useMutation(CREATE_MANY, {
    refetchQueries: config?.refetchQueries,
  });

  const createMany = useCallback(
    async (input: {
      data: any[];
      skipDuplicates?: boolean;
    }) => {
      const result = await mutate({
        variables: {
          model,
          ...input,
        },
      });
      return result.data?.createMany as MutationResult;
    },
    [mutate, model]
  );

  return [createMany, { data: data?.createMany, loading, error }] as const;
}

/**
 * Universal Update One Hook
 * Usage: const [updateTask] = useUpdateOne<Task>('task')
 */
export function useUpdateOne<T = any>(model: string, config?: { refetchQueries?: any[] }) {
  const [mutate, { data, loading, error }] = useMutation(UPDATE_ONE, {
    refetchQueries: config?.refetchQueries,
  });

  const update = useCallback(
    async (input: {
      where: any;
      data: any;
      select?: any;
      include?: any;
    }) => {
      // Extract ID from where clause
      const id = typeof input.where === 'string' ? input.where : input.where?.id;
      
      // Validate ID is provided
      if (!id) {
        throw new Error('ID is required for update operation. Please provide where: { id: "..." } or where: "id-string"');
      }

      const result = await mutate({
        variables: {
          modelName: model,
          input: {
            id,
            data: input.data,
            select: input.select,
            include: input.include,
          },
        },
      });
      return result.data?.updateOne as T;
    },
    [mutate, model]
  );

  return [update, { data: data?.updateOne as T | undefined, loading, error }] as const;
}

/**
 * Universal Update Many Hook
 * Usage: const [updateManyTasks] = useUpdateMany('task')
 */
export function useUpdateMany(model: string, config?: { refetchQueries?: any[] }) {
  const [mutate, { data, loading, error }] = useMutation(UPDATE_MANY, {
    refetchQueries: config?.refetchQueries,
  });

  const updateMany = useCallback(
    async (input: {
      where?: any;
      data: any;
    }) => {
      const result = await mutate({
        variables: {
          model,
          ...input,
        },
      });
      return result.data?.updateMany as MutationResult;
    },
    [mutate, model]
  );

  return [updateMany, { data: data?.updateMany, loading, error }] as const;
}

/**
 * Universal Delete One Hook
 * Usage: const [deleteTask] = useDeleteOne('task')
 */
export function useDeleteOne<T = any>(model: string, config?: { refetchQueries?: any[] }) {
  const [mutate, { data, loading, error }] = useMutation(DELETE_ONE, {
    refetchQueries: config?.refetchQueries,
  });

  const deleteOne = useCallback(
    async (input: {
      where: any;
      select?: any;
    }) => {
      // Extract ID from where clause
      const id = typeof input.where === 'string' ? input.where : input.where?.id;
      
      // Validate ID is provided
      if (!id) {
        throw new Error('ID is required for delete operation. Please provide where: { id: "..." } or where: "id-string"');
      }

      const result = await mutate({
        variables: {
          modelName: model,
          input: {
            id,
            select: input.select,
          },
        },
      });
      return result.data?.deleteOne as T;
    },
    [mutate, model]
  );

  return [deleteOne, { data: data?.deleteOne as T | undefined, loading, error }] as const;
}

/**
 * Universal Delete Many Hook
 * Usage: const [deleteManyTasks] = useDeleteMany('task')
 */
export function useDeleteMany(model: string, config?: { refetchQueries?: any[] }) {
  const [mutate, { data, loading, error }] = useMutation(DELETE_MANY, {
    refetchQueries: config?.refetchQueries,
  });

  const deleteMany = useCallback(
    async (where?: any) => {
      const result = await mutate({
        variables: {
          model,
          where,
        },
      });
      return result.data?.deleteMany as MutationResult;
    },
    [mutate, model]
  );

  return [deleteMany, { data: data?.deleteMany, loading, error }] as const;
}

/**
 * Universal Upsert Hook
 * Usage: const [upsertUser] = useUpsert<User>('user')
 */
export function useUpsert<T = any>(model: string, config?: { refetchQueries?: any[] }) {
  const [mutate, { data, loading, error }] = useMutation(UPSERT, {
    refetchQueries: config?.refetchQueries,
  });

  const upsert = useCallback(
    async (input: {
      where: any;
      create: any;
      update: any;
      select?: any;
      include?: any;
    }) => {
      const result = await mutate({
        variables: {
          model,
          ...input,
        },
      });
      return result.data?.upsert as T;
    },
    [mutate, model]
  );

  return [upsert, { data: data?.upsert as T | undefined, loading, error }] as const;
}

// ========================================
// UTILITY HOOKS
// ========================================

/**
 * Get Available Models
 */
export function useAvailableModels() {
  const { data, loading, error } = useQuery(GET_AVAILABLE_MODELS);

  return {
    models: data?.getAvailableModels as string[] | undefined,
    loading,
    error,
  };
}

/**
 * Clear Cache
 */
export function useClearCache() {
  const [mutate, { loading }] = useMutation(CLEAR_CACHE);

  const clearCache = useCallback(async () => {
    await mutate();
  }, [mutate]);

  return [clearCache, { loading }] as const;
}

// ========================================
// COMBINED HOOK FOR FULL CRUD
// ========================================

/**
 * Universal CRUD Hook - All operations in one
 * Usage: const crud = useCRUD<Task>('task')
 * Then: crud.findMany(), crud.create(), crud.update(), etc.
 */
export function useCRUD<T = any>(model: string) {
  const client = useApolloClient();
  
  const [createOne, createOneState] = useCreateOne<T>(model);
  const [createMany, createManyState] = useCreateMany(model);
  const [updateOne, updateOneState] = useUpdateOne<T>(model);
  const [updateMany, updateManyState] = useUpdateMany(model);
  const [deleteOne, deleteOneState] = useDeleteOne<T>(model);
  const [deleteMany, deleteManyState] = useDeleteMany(model);
  const [upsert, upsertState] = useUpsert<T>(model);

  // Query methods (manual fetch)
  const findMany = useCallback(
    async (options?: QueryOptions) => {
      const result = await client.query({
        query: FIND_MANY,
        variables: { model, ...options },
        fetchPolicy: 'network-only',
      });
      return result.data.findMany as T[];
    },
    [client, model]
  );

  const findUnique = useCallback(
    async (where: any, options?: Omit<QueryOptions, 'where'>) => {
      const result = await client.query({
        query: FIND_UNIQUE,
        variables: { model, where, ...options },
        fetchPolicy: 'network-only',
      });
      return result.data.findUnique as T | null;
    },
    [client, model]
  );

  const count = useCallback(
    async (where?: any) => {
      const result = await client.query({
        query: COUNT,
        variables: { model, where },
        fetchPolicy: 'network-only',
      });
      return result.data.count as number;
    },
    [client, model]
  );

  return {
    // Queries
    findMany,
    findUnique,
    count,
    
    // Mutations
    createOne,
    createMany,
    updateOne,
    updateMany,
    deleteOne,
    deleteMany,
    upsert,
    
    // States
    states: {
      createOne: createOneState,
      createMany: createManyState,
      updateOne: updateOneState,
      updateMany: updateManyState,
      deleteOne: deleteOneState,
      deleteMany: deleteManyState,
      upsert: upsertState,
    },
    
    // Loading indicators
    loading: 
      createOneState.loading ||
      createManyState.loading ||
      updateOneState.loading ||
      updateManyState.loading ||
      deleteOneState.loading ||
      deleteManyState.loading ||
      upsertState.loading,
  };
}
