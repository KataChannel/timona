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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SourceDocumentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const gemini_service_1 = require("../../ai/gemini.service");
let SourceDocumentService = class SourceDocumentService {
    constructor(prisma, geminiService) {
        this.prisma = prisma;
        this.geminiService = geminiService;
    }
    transformDocument(doc) {
        if (!doc)
            return doc;
        return {
            ...doc,
            fileSize: doc.fileSize ? Number(doc.fileSize) : null,
        };
    }
    async create(userId, input) {
        console.log('📄 Creating source document:', {
            title: input.title,
            type: input.type,
            status: input.status,
            userId,
        });
        const data = {
            title: input.title,
            type: input.type,
            status: input.status,
            userId,
            fileSize: input.fileSize ? BigInt(input.fileSize) : null,
        };
        if (input.description)
            data.description = input.description;
        if (input.url)
            data.url = input.url;
        if (input.content)
            data.content = input.content;
        if (input.fileName)
            data.fileName = input.fileName;
        if (input.mimeType)
            data.mimeType = input.mimeType;
        if (input.duration)
            data.duration = input.duration;
        if (input.thumbnailUrl)
            data.thumbnailUrl = input.thumbnailUrl;
        if (input.categoryId)
            data.categoryId = input.categoryId;
        if (input.tags?.length)
            data.tags = input.tags;
        if (input.status === 'PUBLISHED') {
            data.publishedAt = new Date();
        }
        console.log('💾 Prisma create data:', JSON.stringify(data, null, 2));
        const document = await this.prisma.sourceDocument.create({
            data,
            include: {
                category: true,
                user: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                    },
                },
            },
        });
        return this.transformDocument(document);
    }
    async findAll(filter, page = 1, limit = 20) {
        const where = {};
        if (filter) {
            if (filter.types?.length) {
                where.type = { in: filter.types };
            }
            if (filter.statuses?.length) {
                where.status = { in: filter.statuses };
            }
            if (filter.categoryId) {
                where.categoryId = filter.categoryId;
            }
            if (filter.userId) {
                where.userId = filter.userId;
            }
            if (filter.search) {
                where.OR = [
                    { title: { contains: filter.search, mode: 'insensitive' } },
                    { description: { contains: filter.search, mode: 'insensitive' } },
                    { content: { contains: filter.search, mode: 'insensitive' } },
                ];
            }
            if (filter.tags?.length) {
                where.tags = { hasSome: filter.tags };
            }
            if (filter.isAiAnalyzed !== undefined) {
                where.isAiAnalyzed = filter.isAiAnalyzed;
            }
        }
        const [items, total] = await Promise.all([
            this.prisma.sourceDocument.findMany({
                where,
                include: {
                    category: true,
                    user: {
                        select: {
                            id: true,
                            username: true,
                            firstName: true,
                            lastName: true,
                            avatar: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.sourceDocument.count({ where }),
        ]);
        return {
            items: items.map((item) => this.transformDocument(item)),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findOne(id) {
        const document = await this.prisma.sourceDocument.findUnique({
            where: { id },
            include: {
                category: true,
                user: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                    },
                },
                courses: {
                    include: {
                        course: {
                            select: {
                                id: true,
                                title: true,
                                slug: true,
                                thumbnail: true,
                            },
                        },
                    },
                },
            },
        });
        if (!document) {
            throw new common_1.NotFoundException(`Source document with ID ${id} not found`);
        }
        await this.prisma.sourceDocument.update({
            where: { id },
            data: { viewCount: { increment: 1 } },
        });
        return this.transformDocument(document);
    }
    async update(id, input) {
        const existing = await this.findOne(id);
        const data = {
            ...input,
            fileSize: input.fileSize ? BigInt(input.fileSize) : undefined,
        };
        if (input.status === 'PUBLISHED' && !existing.publishedAt) {
            data.publishedAt = new Date();
        }
        const updated = await this.prisma.sourceDocument.update({
            where: { id },
            data,
            include: {
                category: true,
                user: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                    },
                },
            },
        });
        return this.transformDocument(updated);
    }
    async delete(id) {
        await this.findOne(id);
        return this.prisma.sourceDocument.delete({
            where: { id },
        });
    }
    async linkToCourse(userId, input) {
        const existing = await this.prisma.courseSourceDocument.findUnique({
            where: {
                courseId_documentId: {
                    courseId: input.courseId,
                    documentId: input.documentId,
                },
            },
        });
        if (existing) {
            throw new Error('Document already linked to this course');
        }
        const link = await this.prisma.courseSourceDocument.create({
            data: {
                ...input,
                addedBy: userId,
            },
            include: {
                document: {
                    include: {
                        category: true,
                    },
                },
            },
        });
        await this.prisma.sourceDocument.update({
            where: { id: input.documentId },
            data: { usageCount: { increment: 1 } },
        });
        return link;
    }
    async unlinkFromCourse(courseId, documentId) {
        const link = await this.prisma.courseSourceDocument.findUnique({
            where: {
                courseId_documentId: {
                    courseId,
                    documentId,
                },
            },
        });
        if (!link) {
            throw new common_1.NotFoundException('Link not found');
        }
        await this.prisma.courseSourceDocument.delete({
            where: { id: link.id },
        });
        await this.prisma.sourceDocument.update({
            where: { id: documentId },
            data: { usageCount: { decrement: 1 } },
        });
        return { success: true };
    }
    async updateCourseLink(id, input) {
        return this.prisma.courseSourceDocument.update({
            where: { id },
            data: input,
            include: {
                document: {
                    include: {
                        category: true,
                    },
                },
            },
        });
    }
    async getCourseDocuments(courseId) {
        return this.prisma.courseSourceDocument.findMany({
            where: { courseId },
            include: {
                document: {
                    include: {
                        category: true,
                    },
                },
            },
            orderBy: { order: 'asc' },
        });
    }
    async incrementDownloadCount(id) {
        const updated = await this.prisma.sourceDocument.update({
            where: { id },
            data: { downloadCount: { increment: 1 } },
        });
        return this.transformDocument(updated);
    }
    async getStats(userId) {
        const where = userId ? { userId } : {};
        const [total, byType, byStatus, recentlyAdded] = await Promise.all([
            this.prisma.sourceDocument.count({ where }),
            this.prisma.sourceDocument.groupBy({
                by: ['type'],
                where,
                _count: true,
            }),
            this.prisma.sourceDocument.groupBy({
                by: ['status'],
                where,
                _count: true,
            }),
            this.prisma.sourceDocument.findMany({
                where,
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    title: true,
                    type: true,
                    status: true,
                    createdAt: true,
                },
            }),
        ]);
        return {
            total,
            byType,
            byStatus,
            recentlyAdded,
        };
    }
    async analyzeDocument(id) {
        const document = await this.findOne(id);
        if (!document) {
            throw new common_1.NotFoundException(`Document with ID ${id} not found`);
        }
        let contentToAnalyze = '';
        if (document.type === 'TEXT' && document.content) {
            contentToAnalyze = document.content;
        }
        else if (document.description) {
            contentToAnalyze = `${document.title}\n\n${document.description}`;
        }
        else {
            throw new Error('No content available for analysis');
        }
        const analysis = await this.geminiService.analyzeDocument(contentToAnalyze, document.type);
        const updated = await this.prisma.sourceDocument.update({
            where: { id },
            data: {
                aiSummary: analysis.summary,
                aiKeywords: analysis.keywords,
                aiTopics: analysis.topics,
                isAiAnalyzed: true,
                aiAnalyzedAt: new Date(),
            },
            include: {
                category: true,
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
        return this.transformDocument(updated);
    }
    async bulkAnalyze(userId) {
        const where = {
            isAiAnalyzed: false,
            type: 'TEXT',
            ...(userId && { userId }),
        };
        const documents = await this.prisma.sourceDocument.findMany({
            where,
            take: 10,
        });
        let analyzed = 0;
        let failed = 0;
        for (const doc of documents) {
            try {
                await this.analyzeDocument(doc.id);
                analyzed++;
            }
            catch (error) {
                console.error(`Failed to analyze document ${doc.id}:`, error);
                failed++;
            }
        }
        return { analyzed, failed };
    }
};
exports.SourceDocumentService = SourceDocumentService;
exports.SourceDocumentService = SourceDocumentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        gemini_service_1.GeminiService])
], SourceDocumentService);
//# sourceMappingURL=source-document.service.js.map