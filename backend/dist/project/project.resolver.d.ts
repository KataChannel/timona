import { ProjectService } from './project.service';
import { ProjectType, ProjectMemberType, CreateProjectInput, UpdateProjectInput, AddMemberInput, UpdateMemberRoleInput } from './dto/project.dto';
export declare class ProjectResolver {
    private readonly projectService;
    constructor(projectService: ProjectService);
    getMyProjects(userId: string, includeArchived: boolean): Promise<ProjectType[]>;
    getProject(userId: string, projectId: string): Promise<ProjectType>;
    getProjectMembers(userId: string, projectId: string): Promise<ProjectMemberType[]>;
    createProject(userId: string, input: CreateProjectInput): Promise<ProjectType>;
    updateProject(userId: string, projectId: string, input: UpdateProjectInput): Promise<ProjectType>;
    deleteProject(userId: string, projectId: string): Promise<ProjectType>;
    permanentlyDeleteProject(userId: string, projectId: string): Promise<Boolean>;
    restoreProject(userId: string, projectId: string): Promise<ProjectType>;
    addMember(userId: string, projectId: string, input: AddMemberInput): Promise<ProjectMemberType>;
    removeMember(userId: string, projectId: string, memberId: string): Promise<boolean>;
    updateMemberRole(userId: string, projectId: string, input: UpdateMemberRoleInput): Promise<ProjectMemberType>;
}
