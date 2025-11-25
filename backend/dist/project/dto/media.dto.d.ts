import { MediaType } from '@prisma/client';
export declare class MediaUploaderType {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    avatar?: string;
}
export declare class ProjectMediaType {
    id: string;
    type: MediaType;
    url: string;
    filename: string;
    size: number;
    mimeType: string;
    caption?: string;
    projectId: string;
    uploadedBy: string;
    createdAt: Date;
    updatedAt: Date;
    uploader?: MediaUploaderType;
}
export declare class ChatMediaType {
    id: string;
    type: MediaType;
    url: string;
    filename: string;
    size: number;
    mimeType: string;
    caption?: string;
    messageId: string;
    uploadedBy: string;
    createdAt: Date;
    updatedAt: Date;
    uploader?: MediaUploaderType;
}
export declare class UploadFileInput {
    projectId?: string;
    taskId?: string;
    messageId?: string;
    caption?: string;
}
export declare class DeleteFileInput {
    fileId: string;
    type: 'task' | 'project' | 'chat';
}
