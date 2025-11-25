import { PrismaService } from '../prisma/prisma.service';
export interface ImportDataResult {
    success: boolean;
    totalRows: number;
    successRows: number;
    errors: Array<{
        row: number;
        error: string;
    }>;
    data?: any[];
}
export interface MappingConfig {
    modelName: string;
    fieldMappings: Record<string, string>;
    transformations?: Record<string, (value: any) => any>;
}
export declare class DataImportService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    parseExcel(buffer: Buffer): any[];
    parseJSON(jsonString: string): any[];
    parseText(text: string, delimiter?: string): any[];
    mapData(sourceData: any[], config: MappingConfig): any[];
    importToDatabase(modelName: string, data: any[], config?: MappingConfig): Promise<ImportDataResult>;
    bulkImportToDatabase(modelName: string, data: any[], config?: MappingConfig): Promise<ImportDataResult>;
    exportToExcel(modelName: string, where?: any, select?: any): Promise<Buffer>;
    validateData(data: any[], requiredFields: string[]): {
        valid: boolean;
        errors: string[];
    };
}
