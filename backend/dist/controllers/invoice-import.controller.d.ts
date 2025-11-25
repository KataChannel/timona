import { Response } from 'express';
import { InvoiceImportService } from '../services/invoice-import.service';
export declare class InvoiceImportController {
    private readonly importService;
    private readonly logger;
    constructor(importService: InvoiceImportService);
    downloadTemplate(res: Response): Promise<void>;
    uploadFile(file: Express.Multer.File): Promise<import("../services/invoice-import.service").ImportResult | {
        success: boolean;
        message: string;
        totalRows?: undefined;
        successCount?: undefined;
        errorCount?: undefined;
        errors?: undefined;
        invoiceIds?: undefined;
    } | {
        success: boolean;
        totalRows: number;
        successCount: number;
        errorCount: number;
        errors: {
            row: number;
            error: any;
        }[];
        invoiceIds: any[];
        message: string;
    }>;
    previewFile(file: Express.Multer.File): Promise<any>;
}
