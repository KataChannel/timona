import { PrismaService } from '../prisma/prisma.service';
interface ImportInvoiceData {
    shdon?: string;
    khhdon?: string;
    khmshdon?: string;
    tdlap?: Date;
    nbmst?: string;
    nbten?: string;
    nbdchi?: string;
    nbstkhoan?: string;
    nmmst?: string;
    nmten?: string;
    nmdchi?: string;
    nmstkhoan?: string;
    tgtcthue?: number;
    tgtthue?: number;
    tgtttbso?: number;
    tgtttbchu?: string;
    tthai?: string;
    htttoan?: string;
    details?: ImportInvoiceDetail[];
}
interface ImportInvoiceDetail {
    stt?: number;
    ten?: string;
    dvtinh?: string;
    sluong?: number;
    dgia?: number;
    thtcthue?: number;
    tsuat?: number;
    tthue?: number;
    thtien?: number;
}
export interface ImportResult {
    success: boolean;
    totalRows: number;
    successCount: number;
    errorCount: number;
    errors: Array<{
        row: number;
        error: string;
        data?: any;
    }>;
    invoiceIds: string[];
    message: string;
    statistics: {
        totalInvoices: number;
        totalDetails: number;
        invoicesCreated: number;
        detailsCreated: number;
        duplicatesSkipped: number;
        validationErrors: number;
    };
    invoicesCreated: Array<{
        id: string;
        shdon: string;
        khhdon: string;
        nbten: string;
        nmten: string;
        tgtttbso: number;
        detailsCount: number;
        status: 'created' | 'duplicate' | 'error';
    }>;
}
export declare class InvoiceImportService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    generateImportTemplate(): Promise<any>;
    parseImportFile(buffer: any): Promise<ImportInvoiceData[]>;
    importInvoices(data: ImportInvoiceData[]): Promise<ImportResult>;
    importFromExcel(buffer: any): Promise<ImportResult>;
    private getCellValue;
    private parseNumberValue;
    private parseDateValue;
}
export {};
