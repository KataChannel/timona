import { useState, useCallback } from 'react';

/**
 * Async Action Hook
 * 
 * Manages state for async operations:
 * - Loading state
 * - Error state
 * - Success data
 * - Automatic error handling
 * 
 * @example
 * ```tsx
 * const saveUser = useAsyncAction(async (user: User) => {
 *   const response = await api.saveUser(user);
 *   return response.data;
 * });
 * 
 * const handleSave = async () => {
 *   const result = await saveUser.execute(userData);
 *   if (result) {
 *     console.log('Saved!', result);
 *   }
 * };
 * 
 * {saveUser.loading && <Spinner />}
 * {saveUser.error && <Error message={saveUser.error} />}
 * {saveUser.data && <Success data={saveUser.data} />}
 * ```
 */

export interface UseAsyncActionReturn<T, TArgs extends any[]> {
  data: T | null;
  error: string | null;
  loading: boolean;
  
  execute: (...args: TArgs) => Promise<T | null>;
  reset: () => void;
  setData: (data: T | null) => void;
  setError: (error: string | null) => void;
}

export function useAsyncAction<T = any, TArgs extends any[] = any[]>(
  asyncFunction: (...args: TArgs) => Promise<T>,
  options?: {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    errorMessage?: string;
  }
): UseAsyncActionReturn<T, TArgs> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const execute = useCallback(
    async (...args: TArgs): Promise<T | null> => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await asyncFunction(...args);
        setData(result);
        options?.onSuccess?.(result);
        return result;
      } catch (err) {
        const errorMessage = 
          options?.errorMessage ||
          (err instanceof Error ? err.message : 'An error occurred');
        
        setError(errorMessage);
        options?.onError?.(err instanceof Error ? err : new Error(String(err)));
        return null;
      } finally {
        setLoading(false);
      }
    },
    [asyncFunction, options]
  );
  
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);
  
  return {
    data,
    error,
    loading,
    execute,
    reset,
    setData,
    setError,
  };
}

/**
 * Multiple Async Actions Hook
 * 
 * Manages multiple async operations with combined loading state
 * Useful for forms with multiple submit actions
 * 
 * @example
 * ```tsx
 * const actions = useAsyncActions({
 *   save: async (data) => api.save(data),
 *   delete: async (id) => api.delete(id),
 *   publish: async (id) => api.publish(id),
 * });
 * 
 * actions.save.execute(data);
 * actions.delete.execute(id);
 * 
 * const isAnyLoading = actions.isAnyLoading();
 * const hasAnyError = actions.hasAnyError();
 * ```
 */

export type AsyncActions<T extends Record<string, (...args: any[]) => Promise<any>>> = {
  [K in keyof T]: UseAsyncActionReturn<
    Awaited<ReturnType<T[K]>>,
    Parameters<T[K]>
  >;
} & {
  isAnyLoading: () => boolean;
  hasAnyError: () => boolean;
  resetAll: () => void;
};

export function useAsyncActions<
  T extends Record<string, (...args: any[]) => Promise<any>>
>(actions: T): AsyncActions<T> {
  const actionHooks: any = {};
  
  for (const key in actions) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    actionHooks[key] = useAsyncAction(actions[key]);
  }
  
  const isAnyLoading = useCallback(() => {
    return Object.values(actionHooks).some((action: any) => action.loading);
  }, [actionHooks]);
  
  const hasAnyError = useCallback(() => {
    return Object.values(actionHooks).some((action: any) => action.error);
  }, [actionHooks]);
  
  const resetAll = useCallback(() => {
    Object.values(actionHooks).forEach((action: any) => action.reset());
  }, [actionHooks]);
  
  return {
    ...actionHooks,
    isAnyLoading,
    hasAnyError,
    resetAll,
  };
}

/**
 * Mutation Hook (GraphQL-style)
 * 
 * Similar to Apollo's useMutation but framework-agnostic
 * Returns a tuple: [mutate, { data, loading, error }]
 * 
 * @example
 * ```tsx
 * const [createUser, { data, loading, error }] = useMutation(
 *   async (input: CreateUserInput) => {
 *     return api.createUser(input);
 *   }
 * );
 * 
 * <Button onClick={() => createUser(input)} disabled={loading}>
 *   Create User
 * </Button>
 * ```
 */

export type UseMutationResult<T, TArgs extends any[]> = [
  (...args: TArgs) => Promise<T | null>,
  {
    data: T | null;
    loading: boolean;
    error: string | null;
    reset: () => void;
  }
];

export function useMutation<T = any, TArgs extends any[] = any[]>(
  mutationFn: (...args: TArgs) => Promise<T>,
  options?: {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    errorMessage?: string;
  }
): UseMutationResult<T, TArgs> {
  const action = useAsyncAction(mutationFn, options);
  
  return [
    action.execute,
    {
      data: action.data,
      loading: action.loading,
      error: action.error,
      reset: action.reset,
    },
  ];
}
