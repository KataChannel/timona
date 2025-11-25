import { MediaType } from '@prisma/client';
export declare class UploadTaskMediaInput {
    taskId: string;
    filename: string;
    mimeType: string;
    size: number;
    type: MediaType;
    url: string;
    caption?: string;
}
