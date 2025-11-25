import { PrismaService } from '../prisma/prisma.service';
export interface CategoryImportResult {
    success: boolean;
    totalRows: number;
    successCount: number;
    errorCount: number;
    errors: Array<{
        row: number;
        error: string;
        data?: any;
    }>;
    categoryIds: string[];
    message: string;
    statistics: {
        totalCategories: number;
        categoriesCreated: number;
        categoriesUpdated: number;
        duplicatesSkipped: number;
        validationErrors: number;
    };
}
export declare class CategoryImportExportService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    generateImportTemplate(): Promise<any>;
    importFromExcel(buffer: any, userId: string): Promise<CategoryImportResult>;
    private processCategory;
    exportToExcel(): Promise<any>;
    private getCellValue;
    private parseBooleanValue;
    private generateSlug;
}
