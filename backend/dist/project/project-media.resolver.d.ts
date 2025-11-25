import { ProjectMediaService } from './project-media.service';
export declare class ProjectMediaResolver {
    private readonly projectMediaService;
    constructor(projectMediaService: ProjectMediaService);
    uploadProjectFile(projectId: string, filename: string, mimetype: string, size: number, url: string, caption: string, userId: string): Promise<any>;
    uploadTaskFile(taskId: string, filename: string, mimetype: string, size: number, url: string, caption: string, userId: string): Promise<any>;
    uploadChatFile(messageId: string, filename: string, mimetype: string, size: number, url: string, caption: string, userId: string): Promise<any>;
    getTaskFiles(taskId: string): Promise<any[]>;
    getProjectFiles(projectId: string): Promise<any[]>;
    deleteProjectFile(fileId: string, type: 'task' | 'project' | 'chat', userId: string): Promise<boolean>;
    private streamToBuffer;
}
