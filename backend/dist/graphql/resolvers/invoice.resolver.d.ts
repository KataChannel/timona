import { InvoiceService } from '../../services/invoice.service';
import { InvoiceImportService } from '../../services/invoice-import.service';
import { ExtListhoadon, ExtDetailhoadon, InvoiceSearchResult, DatabaseSyncResult, InvoiceStats } from '../models/invoice.model';
import { CreateInvoiceInput, CreateInvoiceDetailInput, InvoiceSearchInput, BulkInvoiceInput } from '../inputs/invoice.input';
export declare class InvoiceResolver {
    private readonly invoiceService;
    private readonly invoiceImportService;
    private readonly logger;
    constructor(invoiceService: InvoiceService, invoiceImportService: InvoiceImportService);
    createInvoice(input: CreateInvoiceInput): Promise<ExtListhoadon>;
    createInvoiceDetails(invoiceId: string, details: CreateInvoiceDetailInput[]): Promise<ExtDetailhoadon[]>;
    getInvoice(id: string): Promise<ExtListhoadon>;
    searchInvoices(input: InvoiceSearchInput): Promise<InvoiceSearchResult>;
    invoiceExists(idServer: string, nbmst: string, khmshdon: string, shdon: string): Promise<boolean>;
    bulkCreateInvoices(input: BulkInvoiceInput): Promise<DatabaseSyncResult>;
    getInvoiceStats(): Promise<InvoiceStats>;
    updateInvoice(id: string, input: CreateInvoiceInput): Promise<ExtListhoadon>;
    deleteInvoice(id: string): Promise<boolean>;
}
