/**
 * Simple GraphQL Client Hook for Demo
 */

'use client';

import { useState, useCallback } from 'react';

// Mock GraphQL client for demo purposes
export interface MockGraphQLClient {
  query: (query: string, variables?: any) => Promise<any>;
}

// Mock data for demo
const MOCK_PRODUCTS = [
  {
    id: '1',
    name: 'MacBook Pro M3',
    price: 1999,
    image: '/images/products/macbook-pro.jpg',
    description: 'Powerful laptop for professionals',
    category: { name: 'Electronics' },
  },
  {
    id: '2', 
    name: 'iPhone 15 Pro',
    price: 1099,
    image: '/images/products/iphone-15.jpg',
    description: 'Latest smartphone technology',
    category: { name: 'Electronics' },
  },
  {
    id: '3',
    name: 'AirPods Pro',
    price: 249,
    image: '/images/products/airpods-pro.jpg',
    description: 'Premium wireless earbuds',
    category: { name: 'Audio' },
  },
];

const MOCK_TASKS = [
  {
    id: '1',
    title: 'Setup Dynamic Template System',
    description: 'Implement template engine with database integration',
    status: 'completed',
    priority: 'high',
    dueDate: '2025-10-15',
    assignee: { name: 'John Doe', avatar: '/avatars/john.jpg' },
  },
  {
    id: '2',
    title: 'Create Product Templates',
    description: 'Design responsive product grid templates',
    status: 'in_progress', 
    priority: 'medium',
    dueDate: '2025-10-20',
    assignee: { name: 'Jane Smith', avatar: '/avatars/jane.jpg' },
  },
  {
    id: '3',
    title: 'Test Template Performance',
    description: 'Performance testing for template compilation',
    status: 'todo',
    priority: 'low',
    dueDate: '2025-10-25',
    assignee: { name: 'Bob Wilson', avatar: '/avatars/bob.jpg' },
  },
];

const MOCK_CATEGORIES = [
  {
    id: '1',
    name: 'Electronics',
    description: 'Latest electronic devices and gadgets',
    image: '/images/categories/electronics.jpg',
    productCount: 150,
  },
  {
    id: '2',
    name: 'Audio',
    description: 'High-quality audio equipment',
    image: '/images/categories/audio.jpg', 
    productCount: 75,
  },
  {
    id: '3',
    name: 'Computers',
    description: 'Desktop and laptop computers',
    image: '/images/categories/computers.jpg',
    productCount: 45,
  },
];

export const useMockGraphQL = (): MockGraphQLClient => {
  const query = useCallback(async (queryString: string, variables: any = {}) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Parse query to determine what data to return
    if (queryString.includes('products')) {
      let products = [...MOCK_PRODUCTS];
      
      // Apply filters if provided
      if (variables.category) {
        products = products.filter(p => 
          p.category.name.toLowerCase().includes(variables.category.toLowerCase())
        );
      }
      
      if (variables.limit) {
        products = products.slice(0, variables.limit);
      }

      return { data: { products } };
    }
    
    if (queryString.includes('tasks')) {
      let tasks = [...MOCK_TASKS];
      
      if (variables.status) {
        tasks = tasks.filter(t => t.status === variables.status);
      }
      
      if (variables.assignee) {
        tasks = tasks.filter(t => 
          t.assignee.name.toLowerCase().includes(variables.assignee.toLowerCase())
        );
      }

      return { data: { tasks } };
    }
    
    if (queryString.includes('categories')) {
      return { data: { categories: MOCK_CATEGORIES } };
    }

    // Default empty response
    return { data: {} };
  }, []);

  return { query };
};

// Template data fetcher hook
export const useTemplateData = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const graphQL = useMockGraphQL();

  const fetchData = useCallback(async (dataSource: any) => {
    if (!dataSource) return;

    setLoading(true);
    setError(null);

    try {
      const result = await graphQL.query(dataSource.query, dataSource.variables);
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [graphQL]);

  return {
    data,
    loading,
    error,
    fetchData,
  };
};

// Quick data helpers
export const getProductsData = async () => {
  const client = { query: async () => ({ data: { products: MOCK_PRODUCTS } }) };
  return client.query();
};

export const getTasksData = async () => {
  const client = { query: async () => ({ data: { tasks: MOCK_TASKS } }) };
  return client.query();
};

export const getCategoriesData = async () => {
  const client = { query: async () => ({ data: { categories: MOCK_CATEGORIES } }) };
  return client.query();
};