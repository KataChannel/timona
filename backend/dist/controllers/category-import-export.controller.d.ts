import { Response } from 'express';
import { CategoryImportExportService } from '../services/category-import-export.service';
export declare class CategoryImportExportController {
    private readonly importExportService;
    private readonly logger;
    constructor(importExportService: CategoryImportExportService);
    downloadTemplate(res: Response): Promise<void>;
    importFile(file: Express.Multer.File, user: any): Promise<import("../services/category-import-export.service").CategoryImportResult | {
        success: boolean;
        message: string;
        totalRows?: undefined;
        successCount?: undefined;
        errorCount?: undefined;
        errors?: undefined;
        categoryIds?: undefined;
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
        categoryIds: any[];
        message: string;
        statistics: {
            totalCategories: number;
            categoriesCreated: number;
            categoriesUpdated: number;
            duplicatesSkipped: number;
            validationErrors: number;
        };
    }>;
    exportCategories(res: Response): Promise<void>;
}
