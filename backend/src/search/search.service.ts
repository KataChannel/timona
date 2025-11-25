import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(private prisma: PrismaService) {}

  async searchTasks(query: SearchQuery, userId: string) {
    const startTime = Date.now();
    try {
      const { q, filters, sort, pagination } = query;
      const page = pagination?.page || 1;
      const size = pagination?.size || 20;
      const skip = (page - 1) * size;
      const where: any = {};
      if (q) {
        where.OR = [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ];
      }
      if (filters) {
        if (filters.status?.length) where.status = { in: filters.status };
        if (filters.priority?.length) where.priority = { in: filters.priority };
        if (filters.assigneeId?.length) where.assigneeId = { in: filters.assigneeId };
        if (filters.authorId?.length) where.authorId = { in: filters.authorId };
        if (filters.tags?.length) where.tags = { hasSome: filters.tags };
        if (filters.dateRange) {
          const { start, end, field } = filters.dateRange;
          where[field] = { gte: start, lte: end };
        }
      }
      where.OR = [{ authorId: userId }, { assigneeId: userId }, ...(where.OR || [])];
      const orderBy: any = {};
      if (sort) {
        orderBy[sort.field] = sort.direction;
      } else {
        orderBy.updatedAt = 'desc';
      }
      const [items, total] = await Promise.all([
        this.prisma.task.findMany({ where, orderBy, skip, take: size }),
        this.prisma.task.count({ where }),
      ]);
      const took = Date.now() - startTime;
      this.logger.debug(`Search completed in ${took}ms, found ${total} results`);
      return { items, total, took };
    } catch (error) {
      this.logger.error('Error searching tasks:', error);
      throw error;
    }
  }

  async getFacetedSearch(options: FacetedSearchOptions, userId: string) {
    const query: SearchQuery = {
      q: options.query,
      filters: options.filters,
      facets: options.facets,
      pagination: { page: 1, size: 0 },
    };
    const result = await this.searchTasks(query, userId);
    return { facets: {}, total: result.total };
  }

  async getSearchSuggestions(query: string, type: 'tasks' | 'users' | 'projects' = 'tasks') {
    try {
      if (type === 'tasks') {
        const suggestions = await this.prisma.task.findMany({
          where: {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
            ],
          },
          select: { title: true },
          take: 5,
          distinct: ['title'],
        });
        return {
          suggestions: suggestions.map(s => ({ text: s.title, score: 1.0, type: 'completion' as const })),
          recent: [],
        };
      }
      return { suggestions: [], recent: [] };
    } catch (error) {
      this.logger.error('Error getting search suggestions:', error);
      return { suggestions: [], recent: [] };
    }
  }

  async fuzzySearch(query: string, userId: string) {
    return this.searchTasks({ q: query }, userId);
  }

  async saveSearch(name: string, query: SearchQuery, userId: string, isPublic: boolean = false): Promise<SavedSearch> {
    return { id: `search_${Date.now()}`, name, query, userId, isPublic, createdAt: new Date(), updatedAt: new Date() };
  }

  async getSavedSearches(userId: string): Promise<SavedSearch[]> {
    return [];
  }

  async executeSavedSearch(searchId: string, userId: string, pagination?: { page: number; size: number }) {
    throw new Error('Saved search not found');
  }

  async advancedSearch(filters: any, userId: string, pagination?: { page: number; size: number }) {
    const searchFilters: SearchQuery['filters'] = {};
    if (filters.status?.length) searchFilters.status = filters.status;
    if (filters.priority?.length) searchFilters.priority = filters.priority;
    if (filters.assignees?.length) searchFilters.assigneeId = filters.assignees;
    if (filters.authors?.length) searchFilters.authorId = filters.authors;
    if (filters.tags?.length) searchFilters.tags = filters.tags;
    if (filters.dateCreated) {
      searchFilters.dateRange = { start: filters.dateCreated.start, end: filters.dateCreated.end, field: 'createdAt' };
    }
    const query: SearchQuery = {
      q: filters.text,
      filters: searchFilters,
      pagination,
      facets: ['status', 'priority', 'assigneeId', 'authorId', 'tags'],
      highlight: !!filters.text,
    };
    const result = await this.searchTasks(query, userId);
    let filteredItems = result.items;
    if (filters.isOverdue !== undefined && filters.isOverdue) {
      const now = new Date();
      filteredItems = filteredItems.filter(task => task.dueDate && new Date(task.dueDate) < now && task.status !== 'COMPLETED');
    }
    return { ...result, items: filteredItems, total: filteredItems.length };
  }

  async getSearchAnalytics(userId: string, dateRange: { start: Date; end: Date }) {
    return { global: null, user: { searchCount: 0, avgResultsCount: 0, topQueries: [], recentSearches: [] } };
  }

  async indexTask(task: any) {
    this.logger.debug(`Task ${task.id} indexed (using PostgreSQL)`);
  }

  async removeTaskFromIndex(taskId: string) {
    this.logger.debug(`Task ${taskId} removed from index (using PostgreSQL)`);
  }

  async bulkIndexTasks(tasks: any[]) {
    this.logger.debug(`Bulk indexed ${tasks.length} tasks (using PostgreSQL)`);
  }

  async reindexAllTasks() {
    this.logger.log('Reindex completed (using PostgreSQL)');
  }
}
