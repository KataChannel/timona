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
    facets?: Record<string, Array<{
        key: string;
        count: number;
    }>>;
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
export declare class SearchService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    searchTasks(query: SearchQuery, userId: string): Promise<{
        items: {
            category: import("@prisma/client").$Enums.TaskCategory;
            order: number;
            id: string;
            createdAt: Date;
            userId: string;
            updatedAt: Date;
            tags: string[];
            description: string | null;
            parentId: string | null;
            priority: import("@prisma/client").$Enums.TaskPriority;
            title: string;
            status: import("@prisma/client").$Enums.TaskStatus;
            dueDate: Date | null;
            completedAt: Date | null;
            projectId: string | null;
            assignedTo: string[];
            mentions: string[];
        }[];
        total: number;
        took: number;
    }>;
    getFacetedSearch(options: FacetedSearchOptions, userId: string): Promise<{
        facets: {};
        total: number;
    }>;
    getSearchSuggestions(query: string, type?: 'tasks' | 'users' | 'projects'): Promise<{
        suggestions: {
            text: string;
            score: number;
            type: "completion";
        }[];
        recent: any[];
    }>;
    fuzzySearch(query: string, userId: string): Promise<{
        items: {
            category: import("@prisma/client").$Enums.TaskCategory;
            order: number;
            id: string;
            createdAt: Date;
            userId: string;
            updatedAt: Date;
            tags: string[];
            description: string | null;
            parentId: string | null;
            priority: import("@prisma/client").$Enums.TaskPriority;
            title: string;
            status: import("@prisma/client").$Enums.TaskStatus;
            dueDate: Date | null;
            completedAt: Date | null;
            projectId: string | null;
            assignedTo: string[];
            mentions: string[];
        }[];
        total: number;
        took: number;
    }>;
    saveSearch(name: string, query: SearchQuery, userId: string, isPublic?: boolean): Promise<SavedSearch>;
    getSavedSearches(userId: string): Promise<SavedSearch[]>;
    executeSavedSearch(searchId: string, userId: string, pagination?: {
        page: number;
        size: number;
    }): Promise<void>;
    advancedSearch(filters: any, userId: string, pagination?: {
        page: number;
        size: number;
    }): Promise<{
        items: {
            category: import("@prisma/client").$Enums.TaskCategory;
            order: number;
            id: string;
            createdAt: Date;
            userId: string;
            updatedAt: Date;
            tags: string[];
            description: string | null;
            parentId: string | null;
            priority: import("@prisma/client").$Enums.TaskPriority;
            title: string;
            status: import("@prisma/client").$Enums.TaskStatus;
            dueDate: Date | null;
            completedAt: Date | null;
            projectId: string | null;
            assignedTo: string[];
            mentions: string[];
        }[];
        total: number;
        took: number;
    }>;
    getSearchAnalytics(userId: string, dateRange: {
        start: Date;
        end: Date;
    }): Promise<{
        global: any;
        user: {
            searchCount: number;
            avgResultsCount: number;
            topQueries: any[];
            recentSearches: any[];
        };
    }>;
    indexTask(task: any): Promise<void>;
    removeTaskFromIndex(taskId: string): Promise<void>;
    bulkIndexTasks(tasks: any[]): Promise<void>;
    reindexAllTasks(): Promise<void>;
}
