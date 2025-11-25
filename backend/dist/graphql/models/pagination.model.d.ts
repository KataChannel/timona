export declare class PaginationInput {
    page: number;
    limit: number;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
}
export declare class PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}
export declare function createPaginatedType<T>(classRef: any): abstract new () => {
    items: T[];
    meta: PaginationMeta;
};
