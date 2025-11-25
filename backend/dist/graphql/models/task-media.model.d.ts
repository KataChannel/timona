import { User } from './user.model';
import { MediaType } from '@prisma/client';
export declare class TaskMedia {
    id: string;
    filename: string;
    url: string;
    type: MediaType;
    size: number;
    mimeType: string;
    caption?: string;
    createdAt: Date;
    updatedAt: Date;
    taskId: string;
    uploader: User;
    uploadedBy: string;
}
