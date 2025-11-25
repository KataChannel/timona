import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { create, insert, search, remove, update, save, load, Orama, SearchParams, Results } from '@orama/orama';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs/promises';
import * as path from 'path';

// Schema definitions for different entity types
const TASK_SCHEMA = {
  id: 'string',
  title: 'string',
  description: 'string',
  status: 'string',
  priority: 'string',
  tags: 'string[]',
  authorId: 'string',
  assigneeId: 'string',
  projectId: 'string',
  teamId: 'string',
  createdAt: 'number',
  updatedAt: 'number',
  dueDate: 'number',
} as const;

const USER_SCHEMA = {
  id: 'string',
  email: 'string',
  name: 'string',
  role: 'string',
  department: 'string',
  skills: 'string[]',
  createdAt: 'number',
} as const;

const PROJECT_SCHEMA = {
  id: 'string',
  name: 'string',
  description: 'string',
  status: 'string',
  ownerId: 'string',
  createdAt: 'number',
  updatedAt: 'number',
} as const;

const AFFILIATE_CAMPAIGN_SCHEMA = {
  id: 'string',
  name: 'string',
  description: 'string',
  status: 'string',
  commissionType: 'string',
  commissionValue: 'number',
  startDate: 'number',
  endDate: 'number',
  createdAt: 'number',
} as const;

const AFFILIATE_LINK_SCHEMA = {
  id: 'string',
  campaignId: 'string',
  userId: 'string',
  code: 'string',
  url: 'string',
  clicks: 'number',
  conversions: 'number',
  createdAt: 'number',
} as const;

export interface OramaSearchQuery {
  term?: string;
  where?: Record<string, any>;
  facets?: Record<string, any>;
  sortBy?: {
    property: string;
    order: 'ASC' | 'DESC';
  };
  limit?: number;
  offset?: number;
}

export interface OramaSearchResult<T = any> {
  hits: Array<{
    id: string;
    score: number;
    document: T;
  }>;
  count: number;
  elapsed: {
    formatted: string;
  };
  facets?: Record<string, any>;
}

@Injectable()
export class OramaService implements OnModuleInit {
  private readonly logger = new Logger(OramaService.name);
  private readonly persistPath: string;
  
  // Orama database instances for different entity types
  private taskIndex: Orama<typeof TASK_SCHEMA>;
  private userIndex: Orama<typeof USER_SCHEMA>;
  private projectIndex: Orama<typeof PROJECT_SCHEMA>;
  private affiliateCampaignIndex: Orama<typeof AFFILIATE_CAMPAIGN_SCHEMA>;
  private affiliateLinkIndex: Orama<typeof AFFILIATE_LINK_SCHEMA>;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    // Set persist path for self-hosted storage
    this.persistPath = this.configService.get('ORAMA_PERSIST_PATH', './data/orama');
  }

  async onModuleInit() {
    try {
      // Ensure persist directory exists
      await fs.mkdir(this.persistPath, { recursive: true });
      
      // Initialize all indexes
      await this.initializeIndexes();
      
      this.logger.log('Orama search service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Orama service:', error);
    }
  }

  private async initializeIndexes() {
    // Try to load persisted indexes, or create new ones
    this.taskIndex = await this.loadOrCreateIndex('tasks', TASK_SCHEMA);
    this.userIndex = await this.loadOrCreateIndex('users', USER_SCHEMA);
    this.projectIndex = await this.loadOrCreateIndex('projects', PROJECT_SCHEMA);
    this.affiliateCampaignIndex = await this.loadOrCreateIndex('affiliate_campaigns', AFFILIATE_CAMPAIGN_SCHEMA);
    this.affiliateLinkIndex = await this.loadOrCreateIndex('affiliate_links', AFFILIATE_LINK_SCHEMA);
  }

  private async loadOrCreateIndex<T extends Record<string, any>>(
    indexName: string,
    schema: T,
  ): Promise<Orama<T>> {
    const indexPath = path.join(this.persistPath, `${indexName}.json`);
    
    try {
      // Try to load persisted index
      const indexData = await fs.readFile(indexPath, 'utf-8');
      const parsedData = JSON.parse(indexData);
      const db = await create({ schema });
      await load(db, parsedData);
      this.logger.log(`Loaded persisted index: ${indexName}`);
      return db;
    } catch (error) {
      // Create new index if loading fails
      this.logger.log(`Creating new index: ${indexName}`);
      return await create({ schema });
    }
  }

  private async persistIndex(indexName: string, db: Orama<any>) {
    try {
      const indexPath = path.join(this.persistPath, `${indexName}.json`);
      const data = await save(db);
      await fs.writeFile(indexPath, JSON.stringify(data), 'utf-8');
      this.logger.debug(`Persisted index: ${indexName}`);
    } catch (error) {
      this.logger.error(`Failed to persist index ${indexName}:`, error);
    }
  }

  // Task indexing methods
  async indexTask(task: any): Promise<void> {
    try {
      await insert(this.taskIndex, {
        id: task.id,
        title: task.title || '',
        description: task.description || '',
        status: task.status || '',
        priority: task.priority || '',
        tags: [], // Not in schema
        authorId: task.userId || '', // Use userId
        assigneeId: '', // Not in schema
        projectId: '', // Not in schema
        teamId: '', // Not in schema
        createdAt: task.createdAt ? new Date(task.createdAt).getTime() : Date.now(),
        updatedAt: task.updatedAt ? new Date(task.updatedAt).getTime() : Date.now(),
        dueDate: task.dueDate ? new Date(task.dueDate).getTime() : 0,
      });
      await this.persistIndex('tasks', this.taskIndex);
    } catch (error) {
      this.logger.error(`Error indexing task ${task.id}:`, error);
    }
  }

  async updateTask(id: string, task: Partial<any>): Promise<void> {
    try {
      await update(this.taskIndex, id, (doc) => ({
        ...doc,
        ...task,
        updatedAt: Date.now(),
      }));
      await this.persistIndex('tasks', this.taskIndex);
    } catch (error) {
      this.logger.error(`Error updating task ${id}:`, error);
    }
  }

  async removeTask(id: string): Promise<void> {
    try {
      await remove(this.taskIndex, id);
      await this.persistIndex('tasks', this.taskIndex);
    } catch (error) {
      this.logger.error(`Error removing task ${id}:`, error);
    }
  }

  async searchTasks(query: OramaSearchQuery): Promise<OramaSearchResult> {
    try {
      const searchParams: SearchParams<Orama<typeof TASK_SCHEMA>> = {
        term: query.term || '',
        limit: query.limit || 20,
        offset: query.offset || 0,
      };

      if (query.where) {
        searchParams.where = query.where;
      }

      if (query.facets) {
        searchParams.facets = query.facets;
      }

      if (query.sortBy) {
        searchParams.sortBy = query.sortBy;
      }

      const results = await search(this.taskIndex, searchParams);
      
      return {
        hits: results.hits.map((hit) => ({
          id: hit.id as string,
          score: hit.score,
          document: hit.document,
        })),
        count: results.count,
        elapsed: results.elapsed,
        facets: results.facets,
      };
    } catch (error) {
      this.logger.error('Error searching tasks:', error);
      return { hits: [], count: 0, elapsed: { formatted: '0ms' } };
    }
  }

  // User indexing methods
  async indexUser(user: any): Promise<void> {
    try {
      await insert(this.userIndex, {
        id: user.id,
        email: user.email || '',
        name: user.username || '', // Use username as name
        role: '', // Not directly in schema
        department: '', // Not in schema
        skills: [], // Not in schema
        createdAt: user.createdAt ? new Date(user.createdAt).getTime() : Date.now(),
      });
      await this.persistIndex('users', this.userIndex);
    } catch (error) {
      this.logger.error(`Error indexing user ${user.id}:`, error);
    }
  }

  async searchUsers(query: OramaSearchQuery): Promise<OramaSearchResult> {
    try {
      const searchParams: SearchParams<Orama<typeof USER_SCHEMA>> = {
        term: query.term || '',
        limit: query.limit || 20,
        offset: query.offset || 0,
      };

      if (query.where) {
        searchParams.where = query.where;
      }

      const results = await search(this.userIndex, searchParams);
      
      return {
        hits: results.hits.map((hit) => ({
          id: hit.id as string,
          score: hit.score,
          document: hit.document,
        })),
        count: results.count,
        elapsed: results.elapsed,
      };
    } catch (error) {
      this.logger.error('Error searching users:', error);
      return { hits: [], count: 0, elapsed: { formatted: '0ms' } };
    }
  }

  // Project indexing methods
  async indexProject(project: any): Promise<void> {
    try {
      await insert(this.projectIndex, {
        id: project.id,
        name: project.name || '',
        description: project.description || '',
        status: project.status || '',
        ownerId: project.ownerId || '',
        createdAt: project.createdAt ? new Date(project.createdAt).getTime() : Date.now(),
        updatedAt: project.updatedAt ? new Date(project.updatedAt).getTime() : Date.now(),
      });
      await this.persistIndex('projects', this.projectIndex);
    } catch (error) {
      this.logger.error(`Error indexing project ${project.id}:`, error);
    }
  }

  async searchProjects(query: OramaSearchQuery): Promise<OramaSearchResult> {
    try {
      const searchParams: SearchParams<Orama<typeof PROJECT_SCHEMA>> = {
        term: query.term || '',
        limit: query.limit || 20,
        offset: query.offset || 0,
      };

      if (query.where) {
        searchParams.where = query.where;
      }

      const results = await search(this.projectIndex, searchParams);
      
      return {
        hits: results.hits.map((hit) => ({
          id: hit.id as string,
          score: hit.score,
          document: hit.document,
        })),
        count: results.count,
        elapsed: results.elapsed,
      };
    } catch (error) {
      this.logger.error('Error searching projects:', error);
      return { hits: [], count: 0, elapsed: { formatted: '0ms' } };
    }
  }

  // Affiliate campaign indexing methods
  async indexAffiliateCampaign(campaign: any): Promise<void> {
    try {
      await insert(this.affiliateCampaignIndex, {
        id: campaign.id,
        name: campaign.name || '',
        description: campaign.description || '',
        status: campaign.status || '',
        commissionType: campaign.commissionType || '',
        commissionValue: campaign.commissionRate ? parseFloat(campaign.commissionRate.toString()) : 0, // Use commissionRate
        startDate: campaign.startDate ? new Date(campaign.startDate).getTime() : 0,
        endDate: campaign.endDate ? new Date(campaign.endDate).getTime() : 0,
        createdAt: campaign.createdAt ? new Date(campaign.createdAt).getTime() : Date.now(),
      });
      await this.persistIndex('affiliate_campaigns', this.affiliateCampaignIndex);
    } catch (error) {
      this.logger.error(`Error indexing affiliate campaign ${campaign.id}:`, error);
    }
  }

  async searchAffiliateCampaigns(query: OramaSearchQuery): Promise<OramaSearchResult> {
    try {
      const searchParams: SearchParams<Orama<typeof AFFILIATE_CAMPAIGN_SCHEMA>> = {
        term: query.term || '',
        limit: query.limit || 20,
        offset: query.offset || 0,
      };

      if (query.where) {
        searchParams.where = query.where;
      }

      const results = await search(this.affiliateCampaignIndex, searchParams);
      
      return {
        hits: results.hits.map((hit) => ({
          id: hit.id as string,
          score: hit.score,
          document: hit.document,
        })),
        count: results.count,
        elapsed: results.elapsed,
      };
    } catch (error) {
      this.logger.error('Error searching affiliate campaigns:', error);
      return { hits: [], count: 0, elapsed: { formatted: '0ms' } };
    }
  }

  // Affiliate link indexing methods
  async indexAffiliateLink(link: any): Promise<void> {
    try {
      await insert(this.affiliateLinkIndex, {
        id: link.id,
        campaignId: link.campaignId || '',
        userId: link.affiliateId || '', // Use affiliateId
        code: link.trackingCode || '', // Use trackingCode
        url: link.originalUrl || '', // Use originalUrl
        clicks: link.totalClicks || 0, // Use totalClicks
        conversions: link.totalConversions || 0, // Use totalConversions
        createdAt: link.createdAt ? new Date(link.createdAt).getTime() : Date.now(),
      });
      await this.persistIndex('affiliate_links', this.affiliateLinkIndex);
    } catch (error) {
      this.logger.error(`Error indexing affiliate link ${link.id}:`, error);
    }
  }

  async searchAffiliateLinks(query: OramaSearchQuery): Promise<OramaSearchResult> {
    try {
      const searchParams: SearchParams<Orama<typeof AFFILIATE_LINK_SCHEMA>> = {
        term: query.term || '',
        limit: query.limit || 20,
        offset: query.offset || 0,
      };

      if (query.where) {
        searchParams.where = query.where;
      }

      const results = await search(this.affiliateLinkIndex, searchParams);
      
      return {
        hits: results.hits.map((hit) => ({
          id: hit.id as string,
          score: hit.score,
          document: hit.document,
        })),
        count: results.count,
        elapsed: results.elapsed,
      };
    } catch (error) {
      this.logger.error('Error searching affiliate links:', error);
      return { hits: [], count: 0, elapsed: { formatted: '0ms' } };
    }
  }

  // Universal search across all indexes
  async searchAll(query: OramaSearchQuery): Promise<{
    tasks: OramaSearchResult;
    users: OramaSearchResult;
    projects: OramaSearchResult;
    affiliateCampaigns: OramaSearchResult;
    affiliateLinks: OramaSearchResult;
  }> {
    const [tasks, users, projects, affiliateCampaigns, affiliateLinks] = await Promise.all([
      this.searchTasks(query),
      this.searchUsers(query),
      this.searchProjects(query),
      this.searchAffiliateCampaigns(query),
      this.searchAffiliateLinks(query),
    ]);

    return {
      tasks,
      users,
      projects,
      affiliateCampaigns,
      affiliateLinks,
    };
  }

  // Bulk indexing for initial data population
  async bulkIndexTasks(tasks: any[]): Promise<void> {
    this.logger.log(`Bulk indexing ${tasks.length} tasks...`);
    for (const task of tasks) {
      await this.indexTask(task);
    }
    this.logger.log('Bulk task indexing completed');
  }

  async bulkIndexUsers(users: any[]): Promise<void> {
    this.logger.log(`Bulk indexing ${users.length} users...`);
    for (const user of users) {
      await this.indexUser(user);
    }
    this.logger.log('Bulk user indexing completed');
  }

  async bulkIndexProjects(projects: any[]): Promise<void> {
    this.logger.log(`Bulk indexing ${projects.length} projects...`);
    for (const project of projects) {
      await this.indexProject(project);
    }
    this.logger.log('Bulk project indexing completed');
  }

  async bulkIndexAffiliateCampaigns(campaigns: any[]): Promise<void> {
    this.logger.log(`Bulk indexing ${campaigns.length} affiliate campaigns...`);
    for (const campaign of campaigns) {
      await this.indexAffiliateCampaign(campaign);
    }
    this.logger.log('Bulk affiliate campaign indexing completed');
  }

  async bulkIndexAffiliateLinks(links: any[]): Promise<void> {
    this.logger.log(`Bulk indexing ${links.length} affiliate links...`);
    for (const link of links) {
      await this.indexAffiliateLink(link);
    }
    this.logger.log('Bulk affiliate link indexing completed');
  }

  // Reindex all data from database
  async reindexAll(): Promise<void> {
    this.logger.log('Starting full reindex...');
    
    try {
      // Recreate all indexes
      this.taskIndex = await create({ schema: TASK_SCHEMA });
      this.userIndex = await create({ schema: USER_SCHEMA });
      this.projectIndex = await create({ schema: PROJECT_SCHEMA });
      this.affiliateCampaignIndex = await create({ schema: AFFILIATE_CAMPAIGN_SCHEMA });
      this.affiliateLinkIndex = await create({ schema: AFFILIATE_LINK_SCHEMA });

      // Fetch and index all data (excluding projects - not in schema)
      const [tasks, users, campaigns, links] = await Promise.all([
        this.prisma.task.findMany(),
        this.prisma.user.findMany(),
        this.prisma.affCampaign.findMany(),
        this.prisma.affLink.findMany(),
      ]);

      await Promise.all([
        this.bulkIndexTasks(tasks),
        this.bulkIndexUsers(users),
        this.bulkIndexAffiliateCampaigns(campaigns),
        this.bulkIndexAffiliateLinks(links),
      ]);

      this.logger.log('Full reindex completed successfully');
    } catch (error) {
      this.logger.error('Error during reindex:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string; indexes: string[] }> {
    return {
      status: 'healthy',
      indexes: ['tasks', 'users', 'projects', 'affiliate_campaigns', 'affiliate_links'],
    };
  }
}
