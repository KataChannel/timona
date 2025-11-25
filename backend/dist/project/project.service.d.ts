import { PrismaService } from '../prisma/prisma.service';
import { Project, ProjectMember } from '@prisma/client';
import { CreateProjectInput, UpdateProjectInput, AddMemberInput } from './dto/project.dto';
export declare class ProjectService {
    private prisma;
    constructor(prisma: PrismaService);
    createProject(ownerId: string, input: CreateProjectInput): Promise<Project>;
    getMyProjects(userId: string, includeArchived?: boolean): Promise<Project[]>;
    getProjectById(projectId: string, userId: string): Promise<Project>;
    updateProject(projectId: string, userId: string, input: UpdateProjectInput): Promise<Project>;
    deleteProject(projectId: string, userId: string): Promise<Project>;
    permanentlyDeleteProject(projectId: string, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    restoreProject(projectId: string, userId: string): Promise<Project>;
    addMember(projectId: string, currentUserId: string, input: AddMemberInput): Promise<ProjectMember>;
    removeMember(projectId: string, currentUserId: string, memberUserId: string): Promise<void>;
    updateMemberRole(projectId: string, currentUserId: string, memberUserId: string, newRole: 'owner' | 'admin' | 'member'): Promise<ProjectMember>;
    getProjectMembers(projectId: string, userId: string): Promise<ProjectMember[]>;
    private checkAdminPermission;
    isMember(projectId: string, userId: string): Promise<boolean>;
}
