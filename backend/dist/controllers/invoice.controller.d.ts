import { InvoiceService } from '../services/invoice.service';
import { CreateInvoiceInput, CreateInvoiceDetailInput, BulkInvoiceInput } from '../graphql/inputs/invoice.input';
export declare class InvoiceController {
    private readonly invoiceService;
    private readonly logger;
    constructor(invoiceService: InvoiceService);
    createInvoice(input: CreateInvoiceInput): Promise<import("../graphql/models/invoice.model").ExtListhoadon>;
    createInvoiceDetails(invoiceId: string, details: CreateInvoiceDetailInput[]): Promise<import("../graphql/models/invoice.model").ExtDetailhoadon[]>;
    getInvoice(id: string): Promise<import("../graphql/models/invoice.model").ExtListhoadon>;
    searchInvoices(query: any): Promise<import("../graphql/models/invoice.model").InvoiceSearchResult>;
    bulkCreateInvoices(input: BulkInvoiceInput): Promise<import("../graphql/models/invoice.model").DatabaseSyncResult>;
    syncInvoices(body: {
        invoiceData: any[];
        detailsData: any[];
        bearerToken?: string;
        brandname?: string;
    }): Promise<{
        metadata: {
            totalProcessed: number;
            durationMs: number;
            durationMinutes: number;
            successRate: number;
            startTime: string;
            endTime: string;
        };
        success: boolean;
        invoicesSaved: number;
        detailsSaved: number;
        errors: string[];
        message: string;
    }>;
    getStats(): Promise<import("../graphql/models/invoice.model").InvoiceStats>;
}
