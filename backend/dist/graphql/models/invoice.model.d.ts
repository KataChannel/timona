export declare class ExtListhoadon {
    id: string;
    idServer?: string;
    nbmst?: string;
    khmshdon?: string;
    khhdon?: string;
    shdon?: string;
    cqt?: string;
    hdon?: string;
    hthdon?: string;
    htttoan?: string;
    nbdchi?: string;
    nbten?: string;
    nbstkhoan?: string;
    nbsdthoai?: string;
    nbdctdtu?: string;
    nbfax?: string;
    nbwebsite?: string;
    nmdchi?: string;
    nmmst?: string;
    nmten?: string;
    nmstkhoan?: string;
    nmsdthoai?: string;
    nmdctdtu?: string;
    nmcmnd?: string;
    tdlap?: Date;
    tgia?: number;
    tgtcthue?: number;
    tgtthue?: number;
    tgtttbchu?: string;
    tgtttbso?: number;
    tgtphi?: number;
    tgtkcthue?: number;
    tgtkhac?: number;
    thdon?: string;
    thlap?: string;
    tlhdon?: string;
    tthai?: string;
    tttbao?: string;
    ttxly?: string;
    mhso?: string;
    ladhddt?: boolean;
    mkhang?: string;
    qrcode?: string;
    gchu?: string;
    msttcgp?: string;
    brandname?: string;
    hdTrung?: string;
    isHDTrung?: boolean;
    createdAt: Date;
    updatedAt: Date;
    details?: ExtDetailhoadon[];
}
export declare class ExtDetailhoadon {
    id: string;
    idhdon: string;
    dgia?: number;
    dvtinh?: string;
    ltsuat?: number;
    sluong?: number;
    stbchu?: string;
    stckhau?: number;
    stt?: number;
    tchat?: string;
    ten?: string;
    thtcthue?: number;
    thtien?: number;
    tlckhau?: number;
    tsuat?: number;
    tthue?: number;
    sxep?: number;
    dvtte?: string;
    tgia?: number;
    tthhdtrung?: string;
    createdAt: Date;
    updatedAt: Date;
    invoice?: ExtListhoadon;
}
export declare class InvoiceStats {
    totalInvoices: number;
    totalDetails: number;
    lastSyncDate?: Date;
    totalAmount: number;
    totalTax: number;
}
export declare class InvoiceSearchResult {
    invoices: ExtListhoadon[];
    total: number;
    page: number;
    size: number;
    totalPages: number;
}
export declare class DatabaseSyncResult {
    success: boolean;
    invoicesSaved: number;
    detailsSaved: number;
    errors: string[];
    message: string;
}
export declare class ImportError {
    row: number;
    error: string;
    data?: string;
}
export declare class ImportStatistics {
    totalInvoices: number;
    totalDetails: number;
    invoicesCreated: number;
    detailsCreated: number;
    duplicatesSkipped: number;
    validationErrors: number;
}
export declare class InvoiceCreated {
    id: string;
    shdon: string;
    khhdon: string;
    nbten: string;
    nmten: string;
    tgtttbso: number;
    detailsCount: number;
    status: string;
}
export declare class ImportResult {
    success: boolean;
    totalRows: number;
    successCount: number;
    errorCount: number;
    errors: ImportError[];
    invoiceIds: string[];
    message: string;
    statistics: ImportStatistics;
    invoicesCreated: InvoiceCreated[];
}
