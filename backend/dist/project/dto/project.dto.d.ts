export declare class ProjectUserType {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    avatar?: string;
}
export declare class ProjectStats {
    tasks: number;
    chatMessages: number;
    members: number;
}
export declare class ProjectType {
    id: string;
    name: string;
    description?: string;
    avatar?: string;
    isArchived: boolean;
    ownerId: string;
    owner: ProjectUserType;
    members: ProjectMemberType[];
    _count?: ProjectStats;
    createdAt: Date;
    updatedAt: Date;
}
export declare class ProjectMemberType {
    id: string;
    projectId: string;
    userId: string;
    role: string;
    user: ProjectUserType;
    joinedAt: Date;
}
export declare class CreateProjectInput {
    name: string;
    description?: string;
    avatar?: string;
}
export declare class UpdateProjectInput {
    name?: string;
    description?: string;
    avatar?: string;
    isArchived?: boolean;
}
export declare class AddMemberInput {
    userId: string;
    role?: 'owner' | 'admin' | 'member';
}
export declare class UpdateMemberRoleInput {
    userId: string;
    role: 'owner' | 'admin' | 'member';
}
