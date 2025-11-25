export declare class UniversalQueryInput {
    model: string;
    operation: string;
    where?: Record<string, any>;
    data?: Record<string, any>;
    select?: Record<string, any>;
    include?: Record<string, any>;
    orderBy?: Record<string, any>;
    skip?: number;
    take?: number;
    cursor?: Record<string, any>;
    distinct?: string[];
}
export declare class PaginationQueryInput {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder: string;
}
export declare class FindManyInput {
    model: string;
    where?: Record<string, any>;
    select?: Record<string, any>;
    include?: Record<string, any>;
    orderBy?: Record<string, any>;
    pagination?: PaginationQueryInput;
}
export declare class FindUniqueInput {
    model: string;
    where: Record<string, any>;
    select?: Record<string, any>;
    include?: Record<string, any>;
}
export declare class CreateInput {
    model: string;
    data: Record<string, any>;
    select?: Record<string, any>;
    include?: Record<string, any>;
}
export declare class CreateManyInput {
    model: string;
    data: Array<Record<string, any>>;
    skipDuplicates: boolean;
}
export declare class UpdateInput {
    model: string;
    where: Record<string, any>;
    data: Record<string, any>;
    select?: Record<string, any>;
    include?: Record<string, any>;
}
export declare class UpdateManyInput {
    model: string;
    where: Record<string, any>;
    data: Record<string, any>;
}
export declare class UpsertInput {
    model: string;
    where: Record<string, any>;
    create: Record<string, any>;
    update: Record<string, any>;
    select?: Record<string, any>;
    include?: Record<string, any>;
}
export declare class DeleteInput {
    model: string;
    where: Record<string, any>;
    select?: Record<string, any>;
    include?: Record<string, any>;
}
export declare class DeleteManyInput {
    model: string;
    where: Record<string, any>;
}
export declare class CountInput {
    model: string;
    where?: Record<string, any>;
}
export declare class AggregateInput {
    model: string;
    where?: Record<string, any>;
    _count?: Record<string, boolean> | boolean;
    _sum?: Record<string, boolean>;
    _avg?: Record<string, boolean>;
    _min?: Record<string, boolean>;
    _max?: Record<string, boolean>;
}
export declare class GroupByInput {
    model: string;
    by: string[];
    where?: Record<string, any>;
    having?: Record<string, any>;
    orderBy?: Record<string, any>;
    skip?: number;
    take?: number;
    _count?: Record<string, boolean> | boolean;
    _sum?: Record<string, boolean>;
    _avg?: Record<string, boolean>;
    _min?: Record<string, boolean>;
    _max?: Record<string, boolean>;
}
export declare class RawQueryInput {
    query: string;
    params?: any[];
}
