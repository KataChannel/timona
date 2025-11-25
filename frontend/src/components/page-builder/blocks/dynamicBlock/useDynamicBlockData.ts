/**
 * Custom Hook: useDynamicBlockData
 * Handles data fetching from different sources
 */

import { useEffect } from 'react';
import { DynamicBlockConfig } from '@/types/page-builder';

interface UseDynamicBlockDataParams {
  config: DynamicBlockConfig;
  onDataLoaded: (data: any) => void;
  onLoading: (loading: boolean) => void;
  onError: (error: string | null) => void;
}

export function useDynamicBlockData({
  config,
  onDataLoaded,
  onLoading,
  onError,
}: UseDynamicBlockDataParams) {
  useEffect(() => {
    if (!config?.dataSource) return;

    const fetchData = async () => {
      onLoading(true);
      onError(null);

      try {
        const dataSource = config.dataSource;
        if (!dataSource) return;

        if (dataSource.type === 'static') {
          console.log('Static data loaded:', dataSource.staticData);
        
          onDataLoaded(dataSource.staticData);
        } else if (dataSource.type === 'api') {
          const data = await fetchFromAPI(dataSource);
          onDataLoaded(data);
        } else if (dataSource.type === 'graphql') {
          const data = await fetchFromGraphQL(dataSource);
          onDataLoaded(data);
        }
      } catch (err) {
        onError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        onLoading(false);
      }
    };

    fetchData();
  }, [config, onDataLoaded, onLoading, onError]);
}

/**
 * Fetch from REST API
 */
async function fetchFromAPI(dataSource: any) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (dataSource.token) {
    headers['Authorization'] = `Bearer ${dataSource.token}`;
  }

  const method = dataSource.method || 'POST';
  const body = method === 'POST' ? JSON.stringify(dataSource.variables || {}) : undefined;

  const response = await fetch(dataSource.endpoint || '', {
    method,
    headers,
    body,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Fetch from GraphQL endpoint
 */
async function fetchFromGraphQL(dataSource: any) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (dataSource.token) {
    headers['Authorization'] = `Bearer ${dataSource.token}`;
  }

  const response = await fetch(dataSource.endpoint || '/graphql', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query: dataSource.query,
      variables: dataSource.variables,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const result = await response.json();
  
  if (result.errors) {
    throw new Error(result.errors[0]?.message || 'GraphQL Error');
  }

  return result.data;
}

/**
 * Test API/GraphQL connection
 */
export async function testAPIConnection(dataSource: any) {
  try {
    if (dataSource.type === 'graphql') {
      return await fetchFromGraphQL(dataSource);
    } else if (dataSource.type === 'api') {
      return await fetchFromAPI(dataSource);
    }
  } catch (err) {
    throw err;
  }
}
