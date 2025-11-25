import { PrismaService } from '../prisma/prisma.service';
export interface ProductImportResult {
    success: boolean;
    totalRows: number;
    successCount: number;
    errorCount: number;
    errors: Array<{
        row: number;
        error: string;
        data?: any;
    }>;
    productIds: string[];
    message: string;
    statistics: {
        totalProducts: number;
        productsCreated: number;
        productsUpdated: number;
        duplicatesSkipped: number;
        validationErrors: number;
    };
}
export declare class ProductImportExportService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    generateImportTemplate(): Promise<any>;
    importFromExcel(buffer: any, userId: string): Promise<ProductImportResult>;
    exportToExcel(filters?: any): Promise<any>;
    private getCellValue;
    private parseBooleanValue;
    private generateSlug;
}
