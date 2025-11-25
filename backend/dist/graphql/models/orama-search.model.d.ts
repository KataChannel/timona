export declare class OramaSearchHit {
    id: string;
    score: number;
    document: any;
}
export declare class OramaElapsed {
    formatted: string;
}
export declare class OramaSearchResult {
    hits: OramaSearchHit[];
    count: number;
    elapsed: OramaElapsed;
    facets?: any;
}
export declare class UniversalSearchResult {
    tasks: OramaSearchResult;
    users: OramaSearchResult;
    projects: OramaSearchResult;
    affiliateCampaigns: OramaSearchResult;
    affiliateLinks: OramaSearchResult;
}
export declare enum OramaSortOrder {
    ASC = "ASC",
    DESC = "DESC"
}
export declare class OramaSortInput {
    property: string;
    order: OramaSortOrder;
}
export declare class OramaSearchInput {
    term?: string;
    where?: any;
    facets?: any;
    sortBy?: OramaSortInput;
    limit?: number;
    offset?: number;
}
export declare class OramaHealthCheck {
    status: string;
    indexes: string[];
}
export declare class ReindexResult {
    success: boolean;
    message: string;
    totalIndexed?: number;
}
