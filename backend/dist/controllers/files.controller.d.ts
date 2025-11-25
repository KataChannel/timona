import { MinioService } from '../minio/minio.service';
import { ImageOptimizationService } from '../services/image-optimization.service';
import { FileService } from '../services/file.service';
interface UploadedFileResult {
    originalName: string;
    filename: string;
    url: string;
    size: number;
    originalSize: number;
    format: string;
    optimized: boolean;
    dimensions?: {
        width: number;
        height: number;
    };
}
export declare class FilesController {
    private readonly minioService;
    private readonly imageOptimizationService;
    private readonly fileService;
    private readonly logger;
    constructor(minioService: MinioService, imageOptimizationService: ImageOptimizationService, fileService: FileService);
    uploadFiles(files: Array<Express.Multer.File>, request: any): Promise<UploadedFileResult[]>;
    private uploadSingleFile;
    private getFileExtension;
    private formatBytes;
}
export {};
