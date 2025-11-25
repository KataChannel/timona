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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchController = void 0;
const common_1 = require("@nestjs/common");
const search_service_1 = require("./search.service");
let SearchController = class SearchController {
    constructor(searchService) {
        this.searchService = searchService;
    }
    async searchTasks(query, status, priority, assignee, author, tags, page, size, sort, sortOrder, req) {
        const userId = req?.user?.id || 'anonymous';
        const searchQuery = {
            q: query,
            filters: {
                ...(status && { status: status.split(',') }),
                ...(priority && { priority: priority.split(',') }),
                ...(assignee && { assigneeId: assignee.split(',') }),
                ...(author && { authorId: author.split(',') }),
                ...(tags && { tags: tags.split(',') })
            },
            pagination: {
                page: parseInt(page || '1'),
                size: parseInt(size || '20')
            },
            ...(sort && {
                sort: {
                    field: sort,
                    direction: sortOrder || 'desc'
                }
            }),
            facets: ['status', 'priority', 'assigneeId', 'authorId', 'tags'],
            highlight: !!query
        };
        return this.searchService.searchTasks(searchQuery, userId);
    }
    async advancedSearchTasks(filters, page, size, req) {
        const userId = req?.user?.id || 'anonymous';
        const processedFilters = {
            ...filters,
            ...(filters.dateCreated && {
                dateCreated: {
                    start: new Date(filters.dateCreated.start),
                    end: new Date(filters.dateCreated.end)
                }
            }),
            ...(filters.dateDue && {
                dateDue: {
                    start: new Date(filters.dateDue.start),
                    end: new Date(filters.dateDue.end)
                }
            }),
            ...(filters.dateCompleted && {
                dateCompleted: {
                    start: new Date(filters.dateCompleted.start),
                    end: new Date(filters.dateCompleted.end)
                }
            })
        };
        const pagination = {
            page: parseInt(page || '1'),
            size: parseInt(size || '20')
        };
        return this.searchService.advancedSearch(processedFilters, userId, pagination);
    }
    async getSearchSuggestions(query, type) {
        return this.searchService.getSearchSuggestions(query, type || 'tasks');
    }
    async getFacetedSearch(facets, query, filters, req) {
        const userId = req?.user?.id || 'anonymous';
        const options = {
            facets: facets ? facets.split(',') : ['status', 'priority', 'assigneeId', 'tags'],
            query,
            filters: filters ? Object.entries(filters).reduce((acc, [key, value]) => {
                if (key !== 'facets' && key !== 'q') {
                    acc[key] = value.split(',');
                }
                return acc;
            }, {}) : undefined
        };
        return this.searchService.getFacetedSearch(options, userId);
    }
    async saveSearch(body, req) {
        const userId = req?.user?.id || 'anonymous';
        return this.searchService.saveSearch(body.name, body.query, userId, body.isPublic || false);
    }
    async getSavedSearches(req) {
        const userId = req?.user?.id || 'anonymous';
        return this.searchService.getSavedSearches(userId);
    }
    async executeSavedSearch(searchId, page, size, req) {
        const userId = req?.user?.id || 'anonymous';
        const pagination = page || size ? {
            page: parseInt(page || '1'),
            size: parseInt(size || '20')
        } : undefined;
        return this.searchService.executeSavedSearch(searchId, userId, pagination);
    }
    async getSearchAnalytics(startDate, endDate, req) {
        const userId = req?.user?.id || 'anonymous';
        const dateRange = {
            start: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            end: endDate ? new Date(endDate) : new Date()
        };
        return this.searchService.getSearchAnalytics(userId, dateRange);
    }
    async reindexTasks(req) {
        return this.searchService.reindexAllTasks();
    }
    async fuzzySearch(query, req) {
        const userId = req?.user?.id || 'anonymous';
        return this.searchService.fuzzySearch(query, userId);
    }
};
exports.SearchController = SearchController;
__decorate([
    (0, common_1.Get)('tasks'),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('priority')),
    __param(3, (0, common_1.Query)('assignee')),
    __param(4, (0, common_1.Query)('author')),
    __param(5, (0, common_1.Query)('tags')),
    __param(6, (0, common_1.Query)('page')),
    __param(7, (0, common_1.Query)('size')),
    __param(8, (0, common_1.Query)('sort')),
    __param(9, (0, common_1.Query)('sortOrder')),
    __param(10, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "searchTasks", null);
__decorate([
    (0, common_1.Post)('tasks/advanced'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('size')),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "advancedSearchTasks", null);
__decorate([
    (0, common_1.Get)('suggestions'),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "getSearchSuggestions", null);
__decorate([
    (0, common_1.Get)('facets'),
    __param(0, (0, common_1.Query)('facets')),
    __param(1, (0, common_1.Query)('q')),
    __param(2, (0, common_1.Query)()),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "getFacetedSearch", null);
__decorate([
    (0, common_1.Post)('save'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "saveSearch", null);
__decorate([
    (0, common_1.Get)('saved'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "getSavedSearches", null);
__decorate([
    (0, common_1.Get)('saved/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('size')),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "executeSavedSearch", null);
__decorate([
    (0, common_1.Get)('analytics'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "getSearchAnalytics", null);
__decorate([
    (0, common_1.Post)('reindex'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "reindexTasks", null);
__decorate([
    (0, common_1.Get)('fuzzy'),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "fuzzySearch", null);
exports.SearchController = SearchController = __decorate([
    (0, common_1.Controller)('search'),
    __metadata("design:paramtypes", [search_service_1.SearchService])
], SearchController);
//# sourceMappingURL=search.controller.js.map