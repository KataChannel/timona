import { FilesService, UploadResult } from './files.service';
import { FileUpload } from 'graphql-upload-ts';
export declare class FilesResolver {
    private readonly filesService;
    constructor(filesService: FilesService);
    uploadCourseThumbnail(user: any, file: FileUpload, courseId?: string): Promise<UploadResult>;
    uploadLessonVideo(user: any, file: FileUpload, courseId: string): Promise<UploadResult>;
    uploadCourseMaterial(user: any, file: FileUpload, courseId: string): Promise<UploadResult>;
    deleteLMSFile(user: any, fileId: string, bucket: string): Promise<boolean>;
    getPresignedUrl(fileId: string, bucket: string, expiresIn?: number): Promise<string>;
}
