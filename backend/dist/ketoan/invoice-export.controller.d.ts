import type { Response } from 'express';
import { InvoiceExportService } from './invoice-export.service';
export declare class InvoiceExportController {
    private readonly invoiceExportService;
    constructor(invoiceExportService: InvoiceExportService);
    exportToExcel(fromDate: string, toDate: string, invoiceType: 'banra' | 'muavao' | undefined, res: Response): Promise<void>;
    testEndpoint(): Promise<{
        success: boolean;
        message: string;
        timestamp: string;
        service: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        timestamp: string;
        message?: undefined;
        service?: undefined;
    }>;
    previewData(fromDate: string, toDate: string, invoiceType: 'banra' | 'muavao' | undefined, limit?: string): Promise<{
        success: boolean;
        data: import("./invoice-export.service").InvoiceExportData[];
        count: number;
        dateRange: {
            fromDate: string;
            toDate: string;
        };
        invoiceType: string;
    }>;
    private isValidDate;
}
