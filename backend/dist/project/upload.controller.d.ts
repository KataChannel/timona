import { ProjectMediaService } from './project-media.service';
import { PrismaService } from '../prisma/prisma.service';
interface UploadedFile {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
    size: number;
}
export declare class ProjectUploadController {
    private mediaService;
    private prisma;
    constructor(mediaService: ProjectMediaService, prisma: PrismaService);
    uploadTaskFiles(taskId: string, files: UploadedFile[], request: any): Promise<{
        success: boolean;
        files: {
            id: any;
            filename: any;
            url: any;
            size: any;
            mimeType: any;
            uploadedAt: any;
        }[];
    }>;
    uploadProjectFiles(projectId: string, files: UploadedFile[], request: any): Promise<{
        success: boolean;
        files: {
            id: any;
            filename: any;
            url: any;
            size: any;
            mimeType: any;
            uploadedAt: any;
        }[];
    }>;
    uploadChatFiles(messageId: string, files: UploadedFile[], request: any): Promise<{
        success: boolean;
        files: {
            id: any;
            filename: any;
            url: any;
            size: any;
            mimeType: any;
            uploadedAt: any;
        }[];
    }>;
}
export {};
