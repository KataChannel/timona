import { PrismaService } from '../prisma/prisma.service';
export interface InvoiceExportData {
    id: string;
    nbmst?: string;
    nbten?: string;
    nbdchi?: string;
    nmmst?: string;
    khhdon?: string;
    shdon?: string;
    khmshdon?: string;
    tdlap?: Date;
    thlap?: string;
    tthai?: string;
    tlhdon?: string;
    nmdchi?: string;
    nmten?: string;
    tgtcthue?: number;
    tgtthue?: number;
    tgtttbso?: number;
    details?: {
        id: string;
        stt?: number;
        ten?: string;
        dvtinh?: string;
        sluong?: number;
        dgia?: number;
        thtien?: number;
        tsuat?: number;
        tthue?: number;
        tthhdtrung?: string;
    }[];
}
export declare class InvoiceExportService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    exportInvoicesToExcel(fromDate: string, toDate: string, invoiceType?: 'banra' | 'muavao'): Promise<Buffer>;
    getInvoiceData(fromDate: string, toDate: string, invoiceType?: 'banra' | 'muavao', limit?: number): Promise<InvoiceExportData[]>;
    private setupWorksheetHeaders;
    private populateWorksheetData;
    private formatWorksheet;
    private formatDate;
}
