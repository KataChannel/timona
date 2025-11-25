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
exports.CustomTemplateService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CustomTemplateService = class CustomTemplateService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getUserTemplates(userId, filters) {
        const where = { userId };
        if (filters?.archived !== undefined) {
            where.isArchived = filters.archived;
        }
        if (filters?.category) {
            where.category = filters.category;
        }
        return this.prisma.customTemplate.findMany({
            where,
            include: { user: true },
            orderBy: { updatedAt: 'desc' },
        });
    }
    async getTemplate(id, userId) {
        const template = await this.prisma.customTemplate.findUnique({
            where: { id },
            include: { user: true },
        });
        if (!template) {
            throw new common_1.NotFoundException(`Template with ID "${id}" not found`);
        }
        if (template.userId !== userId) {
            const isShared = await this.prisma.templateShare.findUnique({
                where: {
                    templateId_sharedWith: {
                        templateId: id,
                        sharedWith: userId,
                    },
                },
            });
            if (!template.isPublic && !isShared) {
                throw new common_1.ForbiddenException('You do not have access to this template');
            }
        }
        return template;
    }
    async getPublicTemplates(category) {
        const where = { isPublic: true, isArchived: false };
        if (category) {
            where.category = category;
        }
        return this.prisma.customTemplate.findMany({
            where,
            include: { user: true },
            orderBy: { usageCount: 'desc' },
        });
    }
    async getSharedTemplates(userId) {
        const shares = await this.prisma.templateShare.findMany({
            where: { sharedWith: userId },
            include: {
                template: { include: { user: true } },
            },
        });
        return shares.map(s => s.template);
    }
    async createTemplate(userId, input) {
        const existing = await this.prisma.customTemplate.findUnique({
            where: {
                userId_name: {
                    userId,
                    name: input.name,
                },
            },
        });
        if (existing) {
            throw new common_1.ConflictException(`Template with name "${input.name}" already exists for this user`);
        }
        return this.prisma.customTemplate.create({
            data: {
                name: input.name,
                description: input.description,
                category: input.category,
                blocks: input.blocks,
                thumbnail: input.thumbnail,
                userId,
            },
            include: { user: true },
        });
    }
    async updateTemplate(userId, input) {
        const template = await this.prisma.customTemplate.findUnique({
            where: { id: input.id },
        });
        if (!template) {
            throw new common_1.NotFoundException(`Template with ID "${input.id}" not found`);
        }
        if (template.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to update this template');
        }
        if (input.name && input.name !== template.name) {
            const existing = await this.prisma.customTemplate.findUnique({
                where: {
                    userId_name: {
                        userId,
                        name: input.name,
                    },
                },
            });
            if (existing) {
                throw new common_1.ConflictException(`Template with name "${input.name}" already exists for this user`);
            }
        }
        return this.prisma.customTemplate.update({
            where: { id: input.id },
            data: {
                name: input.name,
                description: input.description,
                category: input.category,
                blocks: input.blocks,
                thumbnail: input.thumbnail,
                updatedAt: new Date(),
            },
            include: { user: true },
        });
    }
    async deleteTemplate(id, userId) {
        const template = await this.prisma.customTemplate.findUnique({
            where: { id },
        });
        if (!template) {
            throw new common_1.NotFoundException(`Template with ID "${id}" not found`);
        }
        if (template.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to delete this template');
        }
        await this.prisma.templateShare.deleteMany({
            where: { templateId: id },
        });
        await this.prisma.customTemplate.delete({
            where: { id },
        });
        return true;
    }
    async duplicateTemplate(templateId, userId, newName) {
        const template = await this.prisma.customTemplate.findUnique({
            where: { id: templateId },
        });
        if (!template) {
            throw new common_1.NotFoundException(`Template with ID "${templateId}" not found`);
        }
        if (template.userId !== userId) {
            const isShared = await this.prisma.templateShare.findUnique({
                where: {
                    templateId_sharedWith: {
                        templateId: templateId,
                        sharedWith: userId,
                    },
                },
            });
            if (!template.isPublic && !isShared) {
                throw new common_1.ForbiddenException('You do not have access to this template');
            }
        }
        const baseName = newName || `${template.name} (Copy)`;
        let finalName = baseName;
        let counter = 1;
        while (await this.prisma.customTemplate.findUnique({
            where: {
                userId_name: {
                    userId,
                    name: finalName,
                },
            },
        })) {
            finalName = `${baseName} ${counter++}`;
        }
        return this.prisma.customTemplate.create({
            data: {
                name: finalName,
                description: template.description,
                category: template.category,
                blocks: template.blocks,
                thumbnail: template.thumbnail,
                userId,
            },
            include: { user: true },
        });
    }
    async shareTemplate(templateId, userId, shareWithUserIds) {
        const template = await this.prisma.customTemplate.findUnique({
            where: { id: templateId },
        });
        if (!template) {
            throw new common_1.NotFoundException(`Template with ID "${templateId}" not found`);
        }
        if (template.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to share this template');
        }
        const shares = await Promise.all(shareWithUserIds.map(shareWithUserId => this.prisma.templateShare.upsert({
            where: {
                templateId_sharedWith: {
                    templateId,
                    sharedWith: shareWithUserId,
                },
            },
            update: {},
            create: {
                templateId,
                sharedWith: shareWithUserId,
            },
            include: {
                user: true,
                template: { include: { user: true } },
            },
        })));
        return shares;
    }
    async unshareTemplate(templateId, userId, unshareFromUserId) {
        const template = await this.prisma.customTemplate.findUnique({
            where: { id: templateId },
        });
        if (!template) {
            throw new common_1.NotFoundException(`Template with ID "${templateId}" not found`);
        }
        if (template.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to unshare this template');
        }
        await this.prisma.templateShare.delete({
            where: {
                templateId_sharedWith: {
                    templateId,
                    sharedWith: unshareFromUserId,
                },
            },
        });
        return true;
    }
    async updatePublicity(templateId, userId, isPublic) {
        const template = await this.prisma.customTemplate.findUnique({
            where: { id: templateId },
        });
        if (!template) {
            throw new common_1.NotFoundException(`Template with ID "${templateId}" not found`);
        }
        if (template.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to update this template publicity');
        }
        return this.prisma.customTemplate.update({
            where: { id: templateId },
            data: { isPublic },
            include: { user: true },
        });
    }
    async incrementUsage(templateId) {
        return this.prisma.customTemplate.update({
            where: { id: templateId },
            data: {
                usageCount: {
                    increment: 1,
                },
            },
            include: { user: true },
        });
    }
};
exports.CustomTemplateService = CustomTemplateService;
exports.CustomTemplateService = CustomTemplateService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CustomTemplateService);
//# sourceMappingURL=custom-template.service.js.map