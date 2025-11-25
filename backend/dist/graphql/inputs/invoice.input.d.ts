export declare class CreateInvoiceInput {
    idServer?: string;
    nbmst?: string;
    khmshdon?: string;
    khhdon?: string;
    shdon?: string;
    cqt?: string;
    hthdon?: string;
    htttoan?: string;
    nbdchi?: string;
    nbten?: string;
    nbstkhoan?: string;
    nbsdthoai?: string;
    nmdchi?: string;
    nmmst?: string;
    nmten?: string;
    nmstkhoan?: string;
    tdlap?: Date;
    tgtcthue?: number;
    tgtthue?: number;
    tgtttbchu?: string;
    tgtttbso?: number;
    tthai?: string;
    gchu?: string;
    ladhddt?: boolean;
    brandname?: string;
}
export declare class CreateInvoiceDetailInput {
    idhdon: string;
    dgia?: number;
    dvtinh?: string;
    sluong?: number;
    stt?: number;
    ten?: string;
    thtien?: number;
    tsuat?: number;
    tthue?: number;
}
export declare class InvoiceSearchInput {
    nbmst?: string;
    nmmst?: string;
    khmshdon?: string;
    shdon?: string;
    fromDate?: Date;
    toDate?: Date;
    tthai?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortOrder?: string;
}
export declare class BulkInvoiceInput {
    invoices: CreateInvoiceInput[];
    skipExisting?: boolean;
    includeDetails?: boolean;
    bearerToken?: string;
}
