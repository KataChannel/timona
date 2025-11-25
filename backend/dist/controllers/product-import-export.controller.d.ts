import { Response } from 'express';
import { ProductImportExportService } from '../services/product-import-export.service';
export declare class ProductImportExportController {
    private readonly importExportService;
    private readonly logger;
    constructor(importExportService: ProductImportExportService);
    downloadTemplate(res: Response): Promise<void>;
    importFile(file: Express.Multer.File, user: any): Promise<import("../services/product-import-export.service").ProductImportResult | {
        success: boolean;
        message: string;
        totalRows?: undefined;
        successCount?: undefined;
        errorCount?: undefined;
        errors?: undefined;
        productIds?: undefined;
        statistics?: undefined;
    } | {
        success: boolean;
        totalRows: number;
        successCount: number;
        errorCount: number;
        errors: {
            row: number;
            error: any;
        }[];
        productIds: any[];
        message: string;
        statistics: {
            totalProducts: number;
            productsCreated: number;
            productsUpdated: number;
            duplicatesSkipped: number;
            validationErrors: number;
        };
    }>;
    exportProducts(res: Response, categoryId?: string, status?: string): Promise<void>;
}
