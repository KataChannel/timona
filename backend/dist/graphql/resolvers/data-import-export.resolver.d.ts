import { DataImportService, MappingConfig } from '../../services/data-import.service';
import { ImageUploadService, ImageEditOptions, ImageMappingConfig } from '../../services/image-upload.service';
import { SchemaInspectorService } from '../../services/schema-inspector.service';
import { FileUpload } from 'graphql-upload-ts';
export declare class DataImportExportResolver {
    private readonly dataImportService;
    private readonly schemaInspectorService;
    constructor(dataImportService: DataImportService, schemaInspectorService: SchemaInspectorService);
    importExcelData(file: FileUpload, modelName: string, mappingConfig?: MappingConfig): Promise<import("../../services/data-import.service").ImportDataResult>;
    importJSONData(jsonString: string, modelName: string, mappingConfig?: MappingConfig): Promise<import("../../services/data-import.service").ImportDataResult>;
    importTextData(text: string, modelName: string, delimiter: string, mappingConfig?: MappingConfig): Promise<import("../../services/data-import.service").ImportDataResult>;
    bulkImportData(data: any[], modelName: string, mappingConfig?: MappingConfig): Promise<import("../../services/data-import.service").ImportDataResult>;
    validateImportData(data: any[], requiredFields: string[]): Promise<{
        valid: boolean;
        errors: string[];
    }>;
    exportDataToExcel(modelName: string, where?: any, select?: any): Promise<string>;
}
export declare class ImageUploadResolver {
    private readonly imageUploadService;
    private readonly schemaInspectorService;
    constructor(imageUploadService: ImageUploadService, schemaInspectorService: SchemaInspectorService);
    uploadImage(file: FileUpload, bucket: string, editOptions?: ImageEditOptions): Promise<import("../../services/image-upload.service").ImageUploadResult>;
    uploadAndMapImage(file: FileUpload, mappingConfig: ImageMappingConfig, editOptions?: ImageEditOptions): Promise<{
        uploadResult: import("../../services/image-upload.service").ImageUploadResult;
        mappingResult: any;
    }>;
    uploadMultipleImages(files: FileUpload[], bucket: string, editOptions?: ImageEditOptions): Promise<import("../../services/image-upload.service").ImageUploadResult[]>;
    copyImageFromUrl(imageUrl: string, filename: string, bucket: string, editOptions?: ImageEditOptions): Promise<import("../../services/image-upload.service").ImageUploadResult>;
    batchUploadAndMap(items: Array<{
        file: any;
        mappingConfig: ImageMappingConfig;
        editOptions?: ImageEditOptions;
    }>): Promise<{
        uploadResult: import("../../services/image-upload.service").ImageUploadResult;
        mappingResult: any;
        error?: string;
    }[]>;
    getAllModels(): Promise<string[]>;
    getModelSchema(modelName: string): Promise<import("../../services/schema-inspector.service").ModelSchema>;
    getMappableFields(modelName: string): Promise<import("../../services/schema-inspector.service").FieldInfo[]>;
    getRequiredFields(modelName: string): Promise<string[]>;
    suggestMapping(sourceFields: string[], modelName: string): Promise<Record<string, string>>;
    validateMapping(modelName: string, mapping: Record<string, string>): Promise<{
        valid: boolean;
        errors: string[];
    }>;
}
