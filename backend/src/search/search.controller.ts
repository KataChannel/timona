import { Controller, Get, Post, Query, Body, Param, UseGuards, Request } from '@nestjs/common';
import { SearchService, FacetedSearchOptions, SearchQuery } from './search.service';

@Controller('search')
// @UseGuards(AuthGuard) // Uncomment when auth is implemented
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Get('tasks')
  async searchTasks(
    @Query('q') query?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('assignee') assignee?: string,
    @Query('author') author?: string,
    @Query('tags') tags?: string,
    @Query('page') page?: string,
    @Query('size') size?: string,
    @Query('sort') sort?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Request() req?: any
  ) {
    const userId = req?.user?.id || 'anonymous'; // Replace with proper user ID from auth

    const searchQuery: SearchQuery = {
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

  @Post('tasks/advanced')
  async advancedSearchTasks(
    @Body() filters: {
      text?: string;
      status?: string[];
      priority?: string[];
      assignees?: string[];
      authors?: string[];
      tags?: string[];
      projects?: string[];
      dateCreated?: { start: string; end: string };
      dateDue?: { start: string; end: string };
      dateCompleted?: { start: string; end: string };
      hasAttachments?: boolean;
      hasComments?: boolean;
      isOverdue?: boolean;
    },
    @Query('page') page?: string,
    @Query('size') size?: string,
    @Request() req?: any
  ) {
    const userId = req?.user?.id || 'anonymous';

    // Convert date strings to Date objects
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

  @Get('suggestions')
  async getSearchSuggestions(
    @Query('q') query: string,
    @Query('type') type?: 'tasks' | 'users' | 'projects'
  ) {
    return this.searchService.getSearchSuggestions(query, type || 'tasks');
  }

  @Get('facets')
  async getFacetedSearch(
    @Query('facets') facets?: string,
    @Query('q') query?: string,
    @Query() filters?: Record<string, string>,
    @Request() req?: any
  ) {
    const userId = req?.user?.id || 'anonymous';

    const options: FacetedSearchOptions = {
      facets: facets ? facets.split(',') : ['status', 'priority', 'assigneeId', 'tags'],
      query,
      filters: filters ? Object.entries(filters).reduce((acc, [key, value]) => {
        if (key !== 'facets' && key !== 'q') {
          acc[key] = value.split(',');
        }
        return acc;
      }, {} as Record<string, string[]>) : undefined
    };

    return this.searchService.getFacetedSearch(options, userId);
  }

  @Post('save')
  async saveSearch(
    @Body() body: {
      name: string;
      query: SearchQuery;
      isPublic?: boolean;
    },
    @Request() req?: any
  ) {
    const userId = req?.user?.id || 'anonymous';

    return this.searchService.saveSearch(
      body.name,
      body.query,
      userId,
      body.isPublic || false
    );
  }

  @Get('saved')
  async getSavedSearches(@Request() req?: any) {
    const userId = req?.user?.id || 'anonymous';
    return this.searchService.getSavedSearches(userId);
  }

  @Get('saved/:id')
  async executeSavedSearch(
    @Param('id') searchId: string,
    @Query('page') page?: string,
    @Query('size') size?: string,
    @Request() req?: any
  ) {
    const userId = req?.user?.id || 'anonymous';

    const pagination = page || size ? {
      page: parseInt(page || '1'),
      size: parseInt(size || '20')
    } : undefined;

    return this.searchService.executeSavedSearch(searchId, userId, pagination);
  }

  @Get('analytics')
  async getSearchAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Request() req?: any
  ) {
    const userId = req?.user?.id || 'anonymous';

    const dateRange = {
      start: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      end: endDate ? new Date(endDate) : new Date()
    };

    return this.searchService.getSearchAnalytics(userId, dateRange);
  }

  @Post('reindex')
  async reindexTasks(@Request() req?: any) {
    // This should be admin-only in production
    return this.searchService.reindexAllTasks();
  }

  @Get('fuzzy')
  async fuzzySearch(
    @Query('q') query: string,
    @Request() req?: any
  ) {
    const userId = req?.user?.id || 'anonymous';
    return this.searchService.fuzzySearch(query, userId);
  }
}