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
var SystemReleaseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemReleaseService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let SystemReleaseService = SystemReleaseService_1 = class SystemReleaseService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(SystemReleaseService_1.name);
    }
    async create(input, userId) {
        try {
            const slug = input.slug || this.generateSlug(input.title);
            const versionNumber = input.versionNumber || input.version.replace(/^v/, '');
            const release = await this.prisma.systemRelease.create({
                data: {
                    ...input,
                    versionNumber,
                    slug,
                    features: input.features || [],
                    improvements: input.improvements || [],
                    bugfixes: input.bugfixes || [],
                    breakingChanges: input.breakingChanges || [],
                    deprecations: input.deprecations || [],
                    screenshotUrls: input.screenshotUrls || [],
                    keywords: input.keywords || [],
                    createdById: userId,
                },
            });
            this.logger.log(`Created release: ${release.version}`);
            return release;
        }
        catch (error) {
            this.logger.error(`Error creating release: ${error.message}`);
            throw error;
        }
    }
    async findAll(where, take = 20, skip = 0) {
        const whereClause = {};
        if (where?.status) {
            whereClause.status = where.status;
        }
        if (where?.releaseType) {
            whereClause.releaseType = where.releaseType;
        }
        if (where?.search) {
            whereClause.OR = [
                { title: { contains: where.search, mode: 'insensitive' } },
                { description: { contains: where.search, mode: 'insensitive' } },
                { version: { contains: where.search, mode: 'insensitive' } },
            ];
        }
        return this.prisma.systemRelease.findMany({
            where: whereClause,
            take,
            skip,
            orderBy: { releaseDate: 'desc' },
            include: {
                changelogs: true,
                createdBy: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                    },
                },
            },
        });
    }
    async findOne(id) {
        const release = await this.prisma.systemRelease.findUnique({
            where: { id },
            include: {
                changelogs: {
                    orderBy: { createdAt: 'desc' },
                },
                createdBy: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                    },
                },
                updatedBy: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                    },
                },
            },
        });
        if (!release) {
            throw new common_1.NotFoundException(`Release with ID ${id} not found`);
        }
        await this.prisma.systemRelease.update({
            where: { id },
            data: { viewCount: { increment: 1 } },
        });
        return release;
    }
    async findByVersion(version) {
        const release = await this.prisma.systemRelease.findUnique({
            where: { version },
            include: {
                changelogs: true,
            },
        });
        if (!release) {
            throw new common_1.NotFoundException(`Release ${version} not found`);
        }
        return release;
    }
    async findBySlug(slug) {
        const release = await this.prisma.systemRelease.findUnique({
            where: { slug },
            include: {
                changelogs: true,
            },
        });
        if (!release) {
            throw new common_1.NotFoundException(`Release with slug ${slug} not found`);
        }
        await this.prisma.systemRelease.update({
            where: { id: release.id },
            data: { viewCount: { increment: 1 } },
        });
        return release;
    }
    async update(id, input, userId) {
        try {
            const release = await this.prisma.systemRelease.update({
                where: { id },
                data: {
                    ...input,
                    updatedById: userId,
                    publishedAt: input.status === 'RELEASED' ? new Date() : undefined,
                },
            });
            this.logger.log(`Updated release: ${release.version}`);
            return release;
        }
        catch (error) {
            this.logger.error(`Error updating release: ${error.message}`);
            throw error;
        }
    }
    async delete(id) {
        try {
            await this.prisma.systemRelease.delete({
                where: { id },
            });
            this.logger.log(`Deleted release: ${id}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Error deleting release: ${error.message}`);
            throw error;
        }
    }
    async publish(id) {
        const release = await this.prisma.systemRelease.update({
            where: { id },
            data: {
                status: 'RELEASED',
                publishedAt: new Date(),
                releaseDate: new Date(),
            },
        });
        this.logger.log(`Published release: ${release.version}`);
        return release;
    }
    async getLatestRelease() {
        return this.prisma.systemRelease.findFirst({
            where: { status: 'RELEASED' },
            orderBy: { releaseDate: 'desc' },
            include: {
                changelogs: true,
            },
        });
    }
    async incrementDownloadCount(id) {
        await this.prisma.systemRelease.update({
            where: { id },
            data: { downloadCount: { increment: 1 } },
        });
    }
    generateSlug(title) {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    }
};
exports.SystemReleaseService = SystemReleaseService;
exports.SystemReleaseService = SystemReleaseService = SystemReleaseService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SystemReleaseService);
//# sourceMappingURL=system-release.service.js.map