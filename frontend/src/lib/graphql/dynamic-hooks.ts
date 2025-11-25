'use client';

import { 
  useQuery, 
  useMutation, 
  QueryHookOptions, 
  MutationHookOptions,
  ApolloError 
} from '@apollo/client';
import { 
  DynamicGraphQLGenerator
} from './dynamic-queries';
import { useCallback, useMemo } from 'react';

// Core operation types
export type QueryOperationType = 'GET_ALL' | 'GET_PAGINATED' | 'GET_BY_ID';
export type MutationOperationType = 'CREATE' | 'UPDATE' | 'DELETE' | 'CREATE_BULK' | 'UPDATE_BULK' | 'DELETE_BULK';

// Types for hook options
export interface DynamicQueryOptions extends Omit<QueryHookOptions, 'query'> {
  fields?: string[];
  nestedFields?: Record<string, string[]>;
}

export interface DynamicMutationOptions extends Omit<MutationHookOptions<any, any>, 'mutation'> {
  fields?: string[];
  nestedFields?: Record<string, string[]>;
}

export interface BulkOperationResult<T = any> {
  success: boolean;
  count: number;
  data?: T[];
  errors?: Array<{
    index: number;
    error: string;
    data?: any;
  }>;
}

export interface PaginatedResult<T = any> {
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

// Unified hook for dynamic queries - supports all models including nested
export function useDynamicQuery<TData = any>(
  operationType: QueryOperationType,
  modelName: string,
  options: DynamicQueryOptions = {}
) {
  const { fields, nestedFields, ...queryOptions } = options;

  const query = useMemo(() => {
    const queries = DynamicGraphQLGenerator.generateCRUDQueries(modelName, fields);
    switch (operationType) {
      case 'GET_ALL':
        return queries[`GET_${modelName.toUpperCase()}S`];
      case 'GET_PAGINATED':
        return queries[`GET_${modelName.toUpperCase()}S_PAGINATED`];
      case 'GET_BY_ID':
        return queries[`GET_${modelName.toUpperCase()}_BY_ID`];
      default:
        throw new Error(`Unsupported operation type: ${operationType}`);
    }
  }, [operationType, modelName, fields, nestedFields]);

  return useQuery<TData>(query, queryOptions);
}

// Unified hook for dynamic mutations - supports all models including nested
export function useDynamicMutation<TData = any, TVariables = any>(
  operationType: MutationOperationType,
  modelName: string,
  options: DynamicMutationOptions = {}
) {
  const { fields, nestedFields, ...mutationOptions } = options;

  const mutation = useMemo(() => {
    const queries = DynamicGraphQLGenerator.generateCRUDQueries(modelName, fields);
    switch (operationType) {
      case 'CREATE':
        return queries[`CREATE_${modelName.toUpperCase()}`];
      case 'CREATE_BULK':
        return queries[`CREATE_${modelName.toUpperCase()}S_BULK`];
      case 'UPDATE':
        return queries[`UPDATE_${modelName.toUpperCase()}`];
      case 'UPDATE_BULK':
        return queries[`UPDATE_${modelName.toUpperCase()}S_BULK`];
      case 'DELETE':
        return queries[`DELETE_${modelName.toUpperCase()}`];
      case 'DELETE_BULK':
        return queries[`DELETE_${modelName.toUpperCase()}S_BULK`];
      default:
        throw new Error(`Unsupported operation type: ${operationType}`);
    }
  }, [operationType, modelName, fields, nestedFields]);

  return useMutation<TData, TVariables>(mutation, mutationOptions as any);
}

// Specific convenience hooks for common operations

// Specific hooks for common operations
export function useGetAll<TData = any>(
  modelName: string, 
  options: DynamicQueryOptions = {}
) {
  return useDynamicQuery<TData[]>('GET_ALL', modelName, options);
}

export function useGetPaginated<TData = any>(
  modelName: string,
  options: DynamicQueryOptions = {}
) {
  return useDynamicQuery<PaginatedResult<TData>>('GET_PAGINATED', modelName, options);
}

export function useGetById<TData = any>(
  modelName: string,
  options: DynamicQueryOptions = {}
) {
  return useDynamicQuery<TData>('GET_BY_ID', modelName, options);
}

// Note: COUNT and EXISTS operations can be implemented as custom queries if needed

export function useCreate<TData = any, TVariables = any>(
  modelName: string,
  options: DynamicMutationOptions = {}
) {
  return useDynamicMutation<TData, TVariables>('CREATE', modelName, options);
}

export function useCreateBulk<TData = any, TVariables = any>(
  modelName: string,
  options: DynamicMutationOptions = {}
) {
  return useDynamicMutation<BulkOperationResult<TData>, TVariables>('CREATE_BULK', modelName, options);
}

export function useUpdate<TData = any, TVariables = any>(
  modelName: string,
  options: DynamicMutationOptions = {}
) {
  return useDynamicMutation<TData, TVariables>('UPDATE', modelName, options);
}

export function useUpdateBulk<TData = any, TVariables = any>(
  modelName: string,
  options: DynamicMutationOptions = {}
) {
  return useDynamicMutation<BulkOperationResult<TData>, TVariables>('UPDATE_BULK', modelName, options);
}

export function useDelete<TData = any, TVariables = any>(
  modelName: string,
  options: DynamicMutationOptions = {}
) {
  return useDynamicMutation<TData, TVariables>('DELETE', modelName, options);
}

export function useDeleteBulk<TData = any, TVariables = any>(
  modelName: string,
  options: DynamicMutationOptions = {}
) {
  return useDynamicMutation<BulkOperationResult<TData>, TVariables>('DELETE_BULK', modelName, options);
}

// Note: UPSERT operation can be implemented as a custom mutation if needed

// Higher-level CRUD hook that combines all operations
export function useCRUD<TData = any>(modelName: string) {
  const getAll = useGetAll<TData>(modelName);
  const getPaginated = useGetPaginated<TData>(modelName);
  const [create] = useCreate<TData>(modelName);
  const [createBulk] = useCreateBulk<TData>(modelName);
  const [update] = useUpdate<TData>(modelName);
  const [updateBulk] = useUpdateBulk<TData>(modelName);
  const [remove] = useDelete<TData>(modelName);
  const [deleteBulk] = useDeleteBulk<TData>(modelName);

  const getById = useCallback((id: string) => {
    return useGetById<TData>(modelName, { variables: { id } });
  }, [modelName]);

  return {
    // Queries
    getAll,
    getPaginated,
    getById,
    
    // Mutations
    create,
    createBulk,
    update,
    updateBulk,
    delete: remove,
    deleteBulk
  };
}

// Utility function to create a complete model hook with all operations
export function useModel<TData = any>(
  modelName: string, 
  options: {
    fields?: string[];
    nestedFields?: Record<string, string[]>;
  } = {}
) {
  const { fields, nestedFields } = options;
  
  // Query hooks
  const useGetAll = () => useDynamicQuery<TData[]>('GET_ALL', modelName, { fields, nestedFields });
  const useGetPaginated = () => useDynamicQuery<PaginatedResult<TData>>('GET_PAGINATED', modelName, { fields, nestedFields });
  const useGetById = () => useDynamicQuery<TData>('GET_BY_ID', modelName, { fields, nestedFields });
  
  // Mutation hooks
  const useCreate = () => useDynamicMutation<TData>('CREATE', modelName, { fields, nestedFields });
  const useUpdate = () => useDynamicMutation<TData>('UPDATE', modelName, { fields, nestedFields });
  const useDelete = () => useDynamicMutation<TData>('DELETE', modelName, { fields, nestedFields });
  const useCreateBulk = () => useDynamicMutation<BulkOperationResult<TData>>('CREATE_BULK', modelName, { fields, nestedFields });
  const useUpdateBulk = () => useDynamicMutation<BulkOperationResult<TData>>('UPDATE_BULK', modelName, { fields, nestedFields });
  const useDeleteBulk = () => useDynamicMutation<BulkOperationResult<TData>>('DELETE_BULK', modelName, { fields, nestedFields });
  
  return {
    // Query hooks
    useGetAll,
    useGetPaginated,
    useGetById,
    
    // Mutation hooks
    useCreate,
    useUpdate,
    useDelete,
    useCreateBulk,
    useUpdateBulk,
    useDeleteBulk,
  };
}

// Error handling utility
export function isDynamicGraphQLError(error: any): error is ApolloError {
  return error && error.graphQLErrors && error.networkError !== undefined;
}

export function formatDynamicGraphQLError(error: ApolloError): string {
  if (error.graphQLErrors.length > 0) {
    return error.graphQLErrors.map(err => err.message).join(', ');
  }
  if (error.networkError) {
    return `Network error: ${error.networkError.message}`;
  }
  return error.message || 'Unknown GraphQL error';
}

// Usage Examples:
/*
// Basic usage for a Task model
const { useGetAll, useCreate, useUpdate, useDelete } = useModel('Task');

// With specific fields
const taskModel = useModel('Task', {
  fields: ['id', 'title', 'status', 'description', 'createdAt'],
  nestedFields: {
    author: ['id', 'email', 'name'],
    comments: ['id', 'content', 'createdAt']
  }
});

// Using the hooks in components
function TaskList() {
  const { data: tasks, loading, error } = taskModel.useGetAll();
  const [createTask] = taskModel.useCreate();
  const [updateTask] = taskModel.useUpdate();
  const [deleteTask] = taskModel.useDelete();
  
  // ... component logic
}

// Direct usage of base hooks
function TaskComponent() {
  const { data: tasks } = useDynamicQuery('GET_ALL', 'Task', {
    fields: ['id', 'title', 'status'],
    nestedFields: { author: ['id', 'email'] }
  });
  
  const [createTask] = useDynamicMutation('CREATE', 'Task');
  
  // ... component logic
}
*/
