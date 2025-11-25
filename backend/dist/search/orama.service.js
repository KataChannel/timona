"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var OramaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OramaService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const orama_1 = require("@orama/orama");
const prisma_service_1 = require("../prisma/prisma.service");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
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
};
const USER_SCHEMA = {
    id: 'string',
    email: 'string',
    name: 'string',
    role: 'string',
    department: 'string',
    skills: 'string[]',
    createdAt: 'number',
};
const PROJECT_SCHEMA = {
    id: 'string',
    name: 'string',
    description: 'string',
    status: 'string',
    ownerId: 'string',
    createdAt: 'number',
    updatedAt: 'number',
};
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
};
const AFFILIATE_LINK_SCHEMA = {
    id: 'string',
    campaignId: 'string',
    userId: 'string',
    code: 'string',
    url: 'string',
    clicks: 'number',
    conversions: 'number',
    createdAt: 'number',
};
let OramaService = OramaService_1 = class OramaService {
    constructor(configService, prisma) {
        this.configService = configService;
        this.prisma = prisma;
        this.logger = new common_1.Logger(OramaService_1.name);
        this.persistPath = this.configService.get('ORAMA_PERSIST_PATH', './data/orama');
    }
    async onModuleInit() {
        try {
            await fs.mkdir(this.persistPath, { recursive: true });
            await this.initializeIndexes();
            this.logger.log('Orama search service initialized successfully');
        }
        catch (error) {
            this.logger.error('Failed to initialize Orama service:', error);
        }
    }
    async initializeIndexes() {
        this.taskIndex = await this.loadOrCreateIndex('tasks', TASK_SCHEMA);
        this.userIndex = await this.loadOrCreateIndex('users', USER_SCHEMA);
        this.projectIndex = await this.loadOrCreateIndex('projects', PROJECT_SCHEMA);
        this.affiliateCampaignIndex = await this.loadOrCreateIndex('affiliate_campaigns', AFFILIATE_CAMPAIGN_SCHEMA);
        this.affiliateLinkIndex = await this.loadOrCreateIndex('affiliate_links', AFFILIATE_LINK_SCHEMA);
    }
    async loadOrCreateIndex(indexName, schema) {
        const indexPath = path.join(this.persistPath, `${indexName}.json`);
        try {
            const indexData = await fs.readFile(indexPath, 'utf-8');
            const parsedData = JSON.parse(indexData);
            const db = await (0, orama_1.create)({ schema });
            await (0, orama_1.load)(db, parsedData);
            this.logger.log(`Loaded persisted index: ${indexName}`);
            return db;
        }
        catch (error) {
            this.logger.log(`Creating new index: ${indexName}`);
            return await (0, orama_1.create)({ schema });
        }
    }
    async persistIndex(indexName, db) {
        try {
            const indexPath = path.join(this.persistPath, `${indexName}.json`);
            const data = await (0, orama_1.save)(db);
            await fs.writeFile(indexPath, JSON.stringify(data), 'utf-8');
            this.logger.debug(`Persisted index: ${indexName}`);
        }
        catch (error) {
            this.logger.error(`Failed to persist index ${indexName}:`, error);
        }
    }
    async indexTask(task) {
        try {
            await (0, orama_1.insert)(this.taskIndex, {
                id: task.id,
                title: task.title || '',
                description: task.description || '',
                status: task.status || '',
                priority: task.priority || '',
                tags: [],
                authorId: task.userId || '',
                assigneeId: '',
                projectId: '',
                teamId: '',
                createdAt: task.createdAt ? new Date(task.createdAt).getTime() : Date.now(),
                updatedAt: task.updatedAt ? new Date(task.updatedAt).getTime() : Date.now(),
                dueDate: task.dueDate ? new Date(task.dueDate).getTime() : 0,
            });
            await this.persistIndex('tasks', this.taskIndex);
        }
        catch (error) {
            this.logger.error(`Error indexing task ${task.id}:`, error);
        }
    }
    async updateTask(id, task) {
        try {
            await (0, orama_1.update)(this.taskIndex, id, (doc) => ({
                ...doc,
                ...task,
                updatedAt: Date.now(),
            }));
            await this.persistIndex('tasks', this.taskIndex);
        }
        catch (error) {
            this.logger.error(`Error updating task ${id}:`, error);
        }
    }
    async removeTask(id) {
        try {
            await (0, orama_1.remove)(this.taskIndex, id);
            await this.persistIndex('tasks', this.taskIndex);
        }
        catch (error) {
            this.logger.error(`Error removing task ${id}:`, error);
        }
    }
    async searchTasks(query) {
        try {
            const searchParams = {
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
            const results = await (0, orama_1.search)(this.taskIndex, searchParams);
            return {
                hits: results.hits.map((hit) => ({
                    id: hit.id,
                    score: hit.score,
                    document: hit.document,
                })),
                count: results.count,
                elapsed: results.elapsed,
                facets: results.facets,
            };
        }
        catch (error) {
            this.logger.error('Error searching tasks:', error);
            return { hits: [], count: 0, elapsed: { formatted: '0ms' } };
        }
    }
    async indexUser(user) {
        try {
            await (0, orama_1.insert)(this.userIndex, {
                id: user.id,
                email: user.email || '',
                name: user.username || '',
                role: '',
                department: '',
                skills: [],
                createdAt: user.createdAt ? new Date(user.createdAt).getTime() : Date.now(),
            });
            await this.persistIndex('users', this.userIndex);
        }
        catch (error) {
            this.logger.error(`Error indexing user ${user.id}:`, error);
        }
    }
    async searchUsers(query) {
        try {
            const searchParams = {
                term: query.term || '',
                limit: query.limit || 20,
                offset: query.offset || 0,
            };
            if (query.where) {
                searchParams.where = query.where;
            }
            const results = await (0, orama_1.search)(this.userIndex, searchParams);
            return {
                hits: results.hits.map((hit) => ({
                    id: hit.id,
                    score: hit.score,
                    document: hit.document,
                })),
                count: results.count,
                elapsed: results.elapsed,
            };
        }
        catch (error) {
            this.logger.error('Error searching users:', error);
            return { hits: [], count: 0, elapsed: { formatted: '0ms' } };
        }
    }
    async indexProject(project) {
        try {
            await (0, orama_1.insert)(this.projectIndex, {
                id: project.id,
                name: project.name || '',
                description: project.description || '',
                status: project.status || '',
                ownerId: project.ownerId || '',
                createdAt: project.createdAt ? new Date(project.createdAt).getTime() : Date.now(),
                updatedAt: project.updatedAt ? new Date(project.updatedAt).getTime() : Date.now(),
            });
            await this.persistIndex('projects', this.projectIndex);
        }
        catch (error) {
            this.logger.error(`Error indexing project ${project.id}:`, error);
        }
    }
    async searchProjects(query) {
        try {
            const searchParams = {
                term: query.term || '',
                limit: query.limit || 20,
                offset: query.offset || 0,
            };
            if (query.where) {
                searchParams.where = query.where;
            }
            const results = await (0, orama_1.search)(this.projectIndex, searchParams);
            return {
                hits: results.hits.map((hit) => ({
                    id: hit.id,
                    score: hit.score,
                    document: hit.document,
                })),
                count: results.count,
                elapsed: results.elapsed,
            };
        }
        catch (error) {
            this.logger.error('Error searching projects:', error);
            return { hits: [], count: 0, elapsed: { formatted: '0ms' } };
        }
    }
    async indexAffiliateCampaign(campaign) {
        try {
            await (0, orama_1.insert)(this.affiliateCampaignIndex, {
                id: campaign.id,
                name: campaign.name || '',
                description: campaign.description || '',
                status: campaign.status || '',
                commissionType: campaign.commissionType || '',
                commissionValue: campaign.commissionRate ? parseFloat(campaign.commissionRate.toString()) : 0,
                startDate: campaign.startDate ? new Date(campaign.startDate).getTime() : 0,
                endDate: campaign.endDate ? new Date(campaign.endDate).getTime() : 0,
                createdAt: campaign.createdAt ? new Date(campaign.createdAt).getTime() : Date.now(),
            });
            await this.persistIndex('affiliate_campaigns', this.affiliateCampaignIndex);
        }
        catch (error) {
            this.logger.error(`Error indexing affiliate campaign ${campaign.id}:`, error);
        }
    }
    async searchAffiliateCampaigns(query) {
        try {
            const searchParams = {
                term: query.term || '',
                limit: query.limit || 20,
                offset: query.offset || 0,
            };
            if (query.where) {
                searchParams.where = query.where;
            }
            const results = await (0, orama_1.search)(this.affiliateCampaignIndex, searchParams);
            return {
                hits: results.hits.map((hit) => ({
                    id: hit.id,
                    score: hit.score,
                    document: hit.document,
                })),
                count: results.count,
                elapsed: results.elapsed,
            };
        }
        catch (error) {
            this.logger.error('Error searching affiliate campaigns:', error);
            return { hits: [], count: 0, elapsed: { formatted: '0ms' } };
        }
    }
    async indexAffiliateLink(link) {
        try {
            await (0, orama_1.insert)(this.affiliateLinkIndex, {
                id: link.id,
                campaignId: link.campaignId || '',
                userId: link.affiliateId || '',
                code: link.trackingCode || '',
                url: link.originalUrl || '',
                clicks: link.totalClicks || 0,
                conversions: link.totalConversions || 0,
                createdAt: link.createdAt ? new Date(link.createdAt).getTime() : Date.now(),
            });
            await this.persistIndex('affiliate_links', this.affiliateLinkIndex);
        }
        catch (error) {
            this.logger.error(`Error indexing affiliate link ${link.id}:`, error);
        }
    }
    async searchAffiliateLinks(query) {
        try {
            const searchParams = {
                term: query.term || '',
                limit: query.limit || 20,
                offset: query.offset || 0,
            };
            if (query.where) {
                searchParams.where = query.where;
            }
            const results = await (0, orama_1.search)(this.affiliateLinkIndex, searchParams);
            return {
                hits: results.hits.map((hit) => ({
                    id: hit.id,
                    score: hit.score,
                    document: hit.document,
                })),
                count: results.count,
                elapsed: results.elapsed,
            };
        }
        catch (error) {
            this.logger.error('Error searching affiliate links:', error);
            return { hits: [], count: 0, elapsed: { formatted: '0ms' } };
        }
    }
    async searchAll(query) {
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
    async bulkIndexTasks(tasks) {
        this.logger.log(`Bulk indexing ${tasks.length} tasks...`);
        for (const task of tasks) {
            await this.indexTask(task);
        }
        this.logger.log('Bulk task indexing completed');
    }
    async bulkIndexUsers(users) {
        this.logger.log(`Bulk indexing ${users.length} users...`);
        for (const user of users) {
            await this.indexUser(user);
        }
        this.logger.log('Bulk user indexing completed');
    }
    async bulkIndexProjects(projects) {
        this.logger.log(`Bulk indexing ${projects.length} projects...`);
        for (const project of projects) {
            await this.indexProject(project);
        }
        this.logger.log('Bulk project indexing completed');
    }
    async bulkIndexAffiliateCampaigns(campaigns) {
        this.logger.log(`Bulk indexing ${campaigns.length} affiliate campaigns...`);
        for (const campaign of campaigns) {
            await this.indexAffiliateCampaign(campaign);
        }
        this.logger.log('Bulk affiliate campaign indexing completed');
    }
    async bulkIndexAffiliateLinks(links) {
        this.logger.log(`Bulk indexing ${links.length} affiliate links...`);
        for (const link of links) {
            await this.indexAffiliateLink(link);
        }
        this.logger.log('Bulk affiliate link indexing completed');
    }
    async reindexAll() {
        this.logger.log('Starting full reindex...');
        try {
            this.taskIndex = await (0, orama_1.create)({ schema: TASK_SCHEMA });
            this.userIndex = await (0, orama_1.create)({ schema: USER_SCHEMA });
            this.projectIndex = await (0, orama_1.create)({ schema: PROJECT_SCHEMA });
            this.affiliateCampaignIndex = await (0, orama_1.create)({ schema: AFFILIATE_CAMPAIGN_SCHEMA });
            this.affiliateLinkIndex = await (0, orama_1.create)({ schema: AFFILIATE_LINK_SCHEMA });
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
        }
        catch (error) {
            this.logger.error('Error during reindex:', error);
            throw error;
        }
    }
    async healthCheck() {
        return {
            status: 'healthy',
            indexes: ['tasks', 'users', 'projects', 'affiliate_campaigns', 'affiliate_links'],
        };
    }
};
exports.OramaService = OramaService;
exports.OramaService = OramaService = OramaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], OramaService);
//# sourceMappingURL=orama.service.js.map