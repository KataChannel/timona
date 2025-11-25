"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SearchService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SearchService = SearchService_1 = class SearchService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(SearchService_1.name);
    }
    async searchTasks(query, userId) {
        const startTime = Date.now();
        try {
            const { q, filters, sort, pagination } = query;
            const page = pagination?.page || 1;
            const size = pagination?.size || 20;
            const skip = (page - 1) * size;
            const where = {};
            if (q) {
                where.OR = [
                    { title: { contains: q, mode: 'insensitive' } },
                    { description: { contains: q, mode: 'insensitive' } },
                ];
            }
            if (filters) {
                if (filters.status?.length)
                    where.status = { in: filters.status };
                if (filters.priority?.length)
                    where.priority = { in: filters.priority };
                if (filters.assigneeId?.length)
                    where.assigneeId = { in: filters.assigneeId };
                if (filters.authorId?.length)
                    where.authorId = { in: filters.authorId };
                if (filters.tags?.length)
                    where.tags = { hasSome: filters.tags };
                if (filters.dateRange) {
                    const { start, end, field } = filters.dateRange;
                    where[field] = { gte: start, lte: end };
                }
            }
            where.OR = [{ authorId: userId }, { assigneeId: userId }, ...(where.OR || [])];
            const orderBy = {};
            if (sort) {
                orderBy[sort.field] = sort.direction;
            }
            else {
                orderBy.updatedAt = 'desc';
            }
            const [items, total] = await Promise.all([
                this.prisma.task.findMany({ where, orderBy, skip, take: size }),
                this.prisma.task.count({ where }),
            ]);
            const took = Date.now() - startTime;
            this.logger.debug(`Search completed in ${took}ms, found ${total} results`);
            return { items, total, took };
        }
        catch (error) {
            this.logger.error('Error searching tasks:', error);
            throw error;
        }
    }
    async getFacetedSearch(options, userId) {
        const query = {
            q: options.query,
            filters: options.filters,
            facets: options.facets,
            pagination: { page: 1, size: 0 },
        };
        const result = await this.searchTasks(query, userId);
        return { facets: {}, total: result.total };
    }
    async getSearchSuggestions(query, type = 'tasks') {
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
                    suggestions: suggestions.map(s => ({ text: s.title, score: 1.0, type: 'completion' })),
                    recent: [],
                };
            }
            return { suggestions: [], recent: [] };
        }
        catch (error) {
            this.logger.error('Error getting search suggestions:', error);
            return { suggestions: [], recent: [] };
        }
    }
    async fuzzySearch(query, userId) {
        return this.searchTasks({ q: query }, userId);
    }
    async saveSearch(name, query, userId, isPublic = false) {
        return { id: `search_${Date.now()}`, name, query, userId, isPublic, createdAt: new Date(), updatedAt: new Date() };
    }
    async getSavedSearches(userId) {
        return [];
    }
    async executeSavedSearch(searchId, userId, pagination) {
        throw new Error('Saved search not found');
    }
    async advancedSearch(filters, userId, pagination) {
        const searchFilters = {};
        if (filters.status?.length)
            searchFilters.status = filters.status;
        if (filters.priority?.length)
            searchFilters.priority = filters.priority;
        if (filters.assignees?.length)
            searchFilters.assigneeId = filters.assignees;
        if (filters.authors?.length)
            searchFilters.authorId = filters.authors;
        if (filters.tags?.length)
            searchFilters.tags = filters.tags;
        if (filters.dateCreated) {
            searchFilters.dateRange = { start: filters.dateCreated.start, end: filters.dateCreated.end, field: 'createdAt' };
        }
        const query = {
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
    async getSearchAnalytics(userId, dateRange) {
        return { global: null, user: { searchCount: 0, avgResultsCount: 0, topQueries: [], recentSearches: [] } };
    }
    async indexTask(task) {
        this.logger.debug(`Task ${task.id} indexed (using PostgreSQL)`);
    }
    async removeTaskFromIndex(taskId) {
        this.logger.debug(`Task ${taskId} removed from index (using PostgreSQL)`);
    }
    async bulkIndexTasks(tasks) {
        this.logger.debug(`Bulk indexed ${tasks.length} tasks (using PostgreSQL)`);
    }
    async reindexAllTasks() {
        this.logger.log('Reindex completed (using PostgreSQL)');
    }
};
exports.SearchService = SearchService;
exports.SearchService = SearchService = SearchService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SearchService);
//# sourceMappingURL=search.service.js.map