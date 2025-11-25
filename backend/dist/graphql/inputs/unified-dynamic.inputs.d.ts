export declare class UnifiedFindManyInput {
    where?: any;
    orderBy?: any;
    skip?: number;
    take?: number;
    select?: any;
    include?: any;
}
export declare class UnifiedPaginatedInput {
    where?: any;
    orderBy?: any;
    page: number;
    limit: number;
    select?: any;
    include?: any;
}
export declare class UnifiedFindByIdInput {
    id: string;
    select?: any;
    include?: any;
}
export declare class UnifiedCreateInput {
    data: Record<string, any>;
    select?: any;
    include?: any;
}
export declare class UnifiedUpdateInput {
    id: string;
    data: Record<string, any>;
    select?: any;
    include?: any;
}
export declare class UnifiedDeleteInput {
    id: string;
    select?: any;
    include?: any;
}
export declare class UnifiedBulkCreateInput {
    data: Record<string, any>[];
    skipDuplicates?: boolean;
    select?: any;
    include?: any;
}
export declare class UnifiedBulkUpdateInput {
    where: any;
    data: Record<string, any>;
    select?: any;
    include?: any;
}
export declare class UnifiedBulkDeleteInput {
    where: any;
    select?: any;
    include?: any;
}
export declare class UnifiedUpsertInput {
    where: any;
    create: any;
    update: any;
    select?: any;
    include?: any;
}
export declare class UnifiedAggregateInput {
    where?: any;
    groupBy?: any;
    aggregate?: any;
    having?: any;
}
export declare class StringFilter {
    equals?: string;
    in?: string[];
    notIn?: string[];
    contains?: string;
    startsWith?: string;
    endsWith?: string;
}
export declare class NumberFilter {
    equals?: number;
    in?: number[];
    notIn?: number[];
    lt?: number;
    lte?: number;
    gt?: number;
    gte?: number;
}
export declare class DateFilter {
    equals?: Date;
    in?: Date[];
    notIn?: Date[];
    lt?: Date;
    lte?: Date;
    gt?: Date;
    gte?: Date;
}
