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
exports.ProjectService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ProjectService = class ProjectService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createProject(ownerId, input) {
        console.log('📝 CreateProject called with:', { ownerId, input });
        if (!input.name || input.name.trim() === '') {
            console.error('❌ Validation failed: name is empty');
            throw new common_1.BadRequestException('Project name is required');
        }
        const project = await this.prisma.project.create({
            data: {
                name: input.name.trim(),
                description: input.description || null,
                avatar: input.avatar || null,
                ownerId,
                members: {
                    create: {
                        userId: ownerId,
                        role: 'owner',
                    },
                },
            },
            include: {
                owner: true,
                members: {
                    include: {
                        user: true,
                    },
                },
            },
        });
        console.log('✅ Project created:', project.id);
        return project;
    }
    async getMyProjects(userId, includeArchived = false) {
        return this.prisma.project.findMany({
            where: {
                members: {
                    some: {
                        userId,
                    },
                },
                isArchived: includeArchived ? undefined : false,
            },
            include: {
                owner: true,
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                                avatar: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        tasks: true,
                        chatMessages: true,
                    },
                },
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });
    }
    async getProjectById(projectId, userId) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
            include: {
                owner: true,
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                                avatar: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        tasks: true,
                        chatMessages: true,
                    },
                },
            },
        });
        if (!project) {
            throw new common_1.NotFoundException(`Project with ID ${projectId} not found`);
        }
        const isMember = project.members.some((m) => m.userId === userId);
        if (!isMember) {
            throw new common_1.ForbiddenException('You are not a member of this project');
        }
        return project;
    }
    async updateProject(projectId, userId, input) {
        await this.checkAdminPermission(projectId, userId);
        return this.prisma.project.update({
            where: { id: projectId },
            data: input,
            include: {
                owner: true,
                members: {
                    include: {
                        user: true,
                    },
                },
            },
        });
    }
    async deleteProject(projectId, userId) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (!project) {
            throw new common_1.NotFoundException(`Project with ID ${projectId} not found`);
        }
        if (project.ownerId !== userId) {
            throw new common_1.ForbiddenException('Only project owner can delete the project');
        }
        return this.prisma.project.update({
            where: { id: projectId },
            data: { isArchived: true },
        });
    }
    async permanentlyDeleteProject(projectId, userId) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
            include: {
                _count: {
                    select: {
                        tasks: true,
                        chatMessages: true,
                        members: true,
                    },
                },
            },
        });
        if (!project) {
            throw new common_1.NotFoundException(`Project with ID ${projectId} not found`);
        }
        if (project.ownerId !== userId) {
            throw new common_1.ForbiddenException('Only project owner can permanently delete the project');
        }
        await this.prisma.project.delete({
            where: { id: projectId },
        });
        return {
            success: true,
            message: `Project "${project.name}" and all related data (${project._count.tasks} tasks, ${project._count.chatMessages} messages, ${project._count.members} members) permanently deleted`,
        };
    }
    async restoreProject(projectId, userId) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (!project) {
            throw new common_1.NotFoundException(`Project with ID ${projectId} not found`);
        }
        if (project.ownerId !== userId) {
            throw new common_1.ForbiddenException('Only project owner can restore the project');
        }
        if (!project.isArchived) {
            throw new common_1.BadRequestException('Project is not archived');
        }
        return this.prisma.project.update({
            where: { id: projectId },
            data: { isArchived: false },
        });
    }
    async addMember(projectId, currentUserId, input) {
        console.log('📝 AddMember called with:', { projectId, currentUserId, input });
        if (!input || !input.userId) {
            throw new common_1.BadRequestException('userId is required in input');
        }
        await this.checkAdminPermission(projectId, currentUserId);
        const existingMember = await this.prisma.projectMember.findUnique({
            where: {
                projectId_userId: {
                    projectId,
                    userId: input.userId,
                },
            },
        });
        if (existingMember) {
            throw new common_1.ForbiddenException('User is already a member of this project');
        }
        return this.prisma.projectMember.create({
            data: {
                projectId,
                userId: input.userId,
                role: input.role || 'member',
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        avatar: true,
                    },
                },
            },
        });
    }
    async removeMember(projectId, currentUserId, memberUserId) {
        await this.checkAdminPermission(projectId, currentUserId);
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (project.ownerId === memberUserId) {
            throw new common_1.ForbiddenException('Cannot remove project owner');
        }
        await this.prisma.projectMember.delete({
            where: {
                projectId_userId: {
                    projectId,
                    userId: memberUserId,
                },
            },
        });
    }
    async updateMemberRole(projectId, currentUserId, memberUserId, newRole) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (!project) {
            throw new common_1.NotFoundException(`Project with ID ${projectId} not found`);
        }
        if (project.ownerId !== currentUserId) {
            throw new common_1.ForbiddenException('Only project owner can update member roles');
        }
        return this.prisma.projectMember.update({
            where: {
                projectId_userId: {
                    projectId,
                    userId: memberUserId,
                },
            },
            data: { role: newRole },
            include: {
                user: true,
            },
        });
    }
    async getProjectMembers(projectId, userId) {
        await this.getProjectById(projectId, userId);
        return this.prisma.projectMember.findMany({
            where: { projectId },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        avatar: true,
                    },
                },
            },
            orderBy: {
                joinedAt: 'asc',
            },
        });
    }
    async checkAdminPermission(projectId, userId) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        if (project.ownerId === userId) {
            return;
        }
        const member = await this.prisma.projectMember.findUnique({
            where: {
                projectId_userId: {
                    projectId,
                    userId,
                },
            },
            include: {
                project: true,
            },
        });
        if (!member) {
            throw new common_1.ForbiddenException('You are not a member of this project');
        }
        if (member.role !== 'owner' && member.role !== 'admin') {
            throw new common_1.ForbiddenException('Only project owners or admins can perform this action');
        }
    }
    async isMember(projectId, userId) {
        const member = await this.prisma.projectMember.findUnique({
            where: {
                projectId_userId: {
                    projectId,
                    userId,
                },
            },
        });
        return !!member;
    }
};
exports.ProjectService = ProjectService;
exports.ProjectService = ProjectService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProjectService);
//# sourceMappingURL=project.service.js.map