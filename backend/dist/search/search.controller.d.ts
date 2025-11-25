import { SearchService, SearchQuery } from './search.service';
export declare class SearchController {
    private searchService;
    constructor(searchService: SearchService);
    searchTasks(query?: string, status?: string, priority?: string, assignee?: string, author?: string, tags?: string, page?: string, size?: string, sort?: string, sortOrder?: 'asc' | 'desc', req?: any): Promise<{
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
    advancedSearchTasks(filters: {
        text?: string;
        status?: string[];
        priority?: string[];
        assignees?: string[];
        authors?: string[];
        tags?: string[];
        projects?: string[];
        dateCreated?: {
            start: string;
            end: string;
        };
        dateDue?: {
            start: string;
            end: string;
        };
        dateCompleted?: {
            start: string;
            end: string;
        };
        hasAttachments?: boolean;
        hasComments?: boolean;
        isOverdue?: boolean;
    }, page?: string, size?: string, req?: any): Promise<{
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
    getSearchSuggestions(query: string, type?: 'tasks' | 'users' | 'projects'): Promise<{
        suggestions: {
            text: string;
            score: number;
            type: "completion";
        }[];
        recent: any[];
    }>;
    getFacetedSearch(facets?: string, query?: string, filters?: Record<string, string>, req?: any): Promise<{
        facets: {};
        total: number;
    }>;
    saveSearch(body: {
        name: string;
        query: SearchQuery;
        isPublic?: boolean;
    }, req?: any): Promise<import("./search.service").SavedSearch>;
    getSavedSearches(req?: any): Promise<import("./search.service").SavedSearch[]>;
    executeSavedSearch(searchId: string, page?: string, size?: string, req?: any): Promise<void>;
    getSearchAnalytics(startDate?: string, endDate?: string, req?: any): Promise<{
        global: any;
        user: {
            searchCount: number;
            avgResultsCount: number;
            topQueries: any[];
            recentSearches: any[];
        };
    }>;
    reindexTasks(req?: any): Promise<void>;
    fuzzySearch(query: string, req?: any): Promise<{
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
}
