import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
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
export declare class OramaService implements OnModuleInit {
    private configService;
    private prisma;
    private readonly logger;
    private readonly persistPath;
    private taskIndex;
    private userIndex;
    private projectIndex;
    private affiliateCampaignIndex;
    private affiliateLinkIndex;
    constructor(configService: ConfigService, prisma: PrismaService);
    onModuleInit(): Promise<void>;
    private initializeIndexes;
    private loadOrCreateIndex;
    private persistIndex;
    indexTask(task: any): Promise<void>;
    updateTask(id: string, task: Partial<any>): Promise<void>;
    removeTask(id: string): Promise<void>;
    searchTasks(query: OramaSearchQuery): Promise<OramaSearchResult>;
    indexUser(user: any): Promise<void>;
    searchUsers(query: OramaSearchQuery): Promise<OramaSearchResult>;
    indexProject(project: any): Promise<void>;
    searchProjects(query: OramaSearchQuery): Promise<OramaSearchResult>;
    indexAffiliateCampaign(campaign: any): Promise<void>;
    searchAffiliateCampaigns(query: OramaSearchQuery): Promise<OramaSearchResult>;
    indexAffiliateLink(link: any): Promise<void>;
    searchAffiliateLinks(query: OramaSearchQuery): Promise<OramaSearchResult>;
    searchAll(query: OramaSearchQuery): Promise<{
        tasks: OramaSearchResult;
        users: OramaSearchResult;
        projects: OramaSearchResult;
        affiliateCampaigns: OramaSearchResult;
        affiliateLinks: OramaSearchResult;
    }>;
    bulkIndexTasks(tasks: any[]): Promise<void>;
    bulkIndexUsers(users: any[]): Promise<void>;
    bulkIndexProjects(projects: any[]): Promise<void>;
    bulkIndexAffiliateCampaigns(campaigns: any[]): Promise<void>;
    bulkIndexAffiliateLinks(links: any[]): Promise<void>;
    reindexAll(): Promise<void>;
    healthCheck(): Promise<{
        status: string;
        indexes: string[];
    }>;
}
