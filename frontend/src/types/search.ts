export interface SearchQuery {
  q?: string;
  filters?: {
    status?: string[];
    priority?: string[];
    assigneeId?: string[];
    authorId?: string[];
    tags?: string[];
    dateRange?: {
      start: Date;
      end: Date;
      field: 'createdAt' | 'updatedAt' | 'dueDate';
    };
  };
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  pagination?: {
    page: number;
    size: number;
  };
  facets?: string[];
  highlight?: boolean;
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  took: number;
  facets?: Record<string, Array<{ key: string; count: number }>>;
  suggestions?: string[];
  aggregations?: Record<string, any>;
}

export interface SearchSuggestion {
  text: string;
  score: number;
  type: 'completion' | 'phrase' | 'term';
}

export interface SavedSearch {
  id: string;
  name: string;
  query: SearchQuery;
  userId: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FacetedSearchOptions {
  facets: string[];
  filters?: Record<string, string[]>;
  query?: string;
}

export interface SearchAnalytics {
  global: {
    popular_queries: Array<{ key: string; doc_count: number }>;
    query_performance: { value: number };
    zero_results: { doc_count: number };
  };
  user: {
    searchCount: number;
    avgResultsCount: number;
    topQueries: Array<{ query: string; count: number }>;
    recentSearches: Array<{
      query: string;
      timestamp: Date;
      resultsCount: number;
    }>;
  };
}