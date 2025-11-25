export interface DynamicFieldConfig {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'date' | 'id' | 'json' | 'array' | 'object';
    required?: boolean;
    description?: string;
    defaultValue?: any;
    validation?: any;
}
export declare class DynamicCreateInput {
    data: Record<string, any>;
    select?: Record<string, any>;
    include?: Record<string, any>;
}
export declare class DynamicUpdateInput {
    id: string;
    data: Record<string, any>;
    select?: Record<string, any>;
    include?: Record<string, any>;
}
export declare class DynamicFilterInput {
    where?: Record<string, any>;
    orderBy?: Record<string, any>;
    skip?: number;
    take?: number;
    select?: Record<string, any>;
    include?: Record<string, any>;
}
export declare class DynamicBulkCreateInput {
    data: Record<string, any>[];
    skipDuplicates?: boolean;
    select?: Record<string, any>;
    include?: Record<string, any>;
}
export declare class DynamicBulkUpdateInput {
    where: Record<string, any>;
    data: Record<string, any>;
    select?: Record<string, any>;
    include?: Record<string, any>;
}
export declare class DynamicBulkDeleteInput {
    where: Record<string, any>;
    select?: Record<string, any>;
    include?: Record<string, any>;
}
export declare class DynamicUpsertInput {
    where: Record<string, any>;
    create: Record<string, any>;
    update: Record<string, any>;
    select?: Record<string, any>;
    include?: Record<string, any>;
}
export declare class PaginationInput {
    skip?: number;
    take?: number;
}
export declare class SortInput {
    field: string;
    direction?: 'asc' | 'desc';
}
export declare class FilterOperatorsInput {
    equals?: any;
    in?: any[];
    notIn?: any[];
    lt?: any;
    lte?: any;
    gt?: any;
    gte?: any;
    contains?: string;
    startsWith?: string;
    endsWith?: string;
    not?: any;
}
export declare function createDynamicInputs<TModel>(modelName: string, fields: DynamicFieldConfig[]): {
    CreateInput: {
        new (): {
            data: Record<string, any>;
            select?: Record<string, any>;
            include?: Record<string, any>;
        };
    };
    UpdateInput: {
        new (): {
            id: string;
            data: Record<string, any>;
            select?: Record<string, any>;
            include?: Record<string, any>;
        };
    };
    FilterInput: {
        new (): {
            where?: Record<string, any>;
            orderBy?: Record<string, any>;
            skip?: number;
            take?: number;
            select?: Record<string, any>;
            include?: Record<string, any>;
        };
    };
    BulkCreateInput: {
        new (): {
            data: Record<string, any>[];
            skipDuplicates?: boolean;
            select?: Record<string, any>;
            include?: Record<string, any>;
        };
    };
    BulkUpdateInput: {
        new (): {
            where: Record<string, any>;
            data: Record<string, any>;
            select?: Record<string, any>;
            include?: Record<string, any>;
        };
    };
    BulkDeleteInput: {
        new (): {
            where: Record<string, any>;
            select?: Record<string, any>;
            include?: Record<string, any>;
        };
    };
    UpsertInput: {
        new (): {
            where: Record<string, any>;
            create: Record<string, any>;
            update: Record<string, any>;
            select?: Record<string, any>;
            include?: Record<string, any>;
        };
    };
};
export declare class DynamicInputTypesManager {
    private static inputTypes;
    static registerInputTypes<TModel>(modelName: string, fields: DynamicFieldConfig[]): {
        CreateInput: {
            new (): {
                data: Record<string, any>;
                select?: Record<string, any>;
                include?: Record<string, any>;
            };
        };
        UpdateInput: {
            new (): {
                id: string;
                data: Record<string, any>;
                select?: Record<string, any>;
                include?: Record<string, any>;
            };
        };
        FilterInput: {
            new (): {
                where?: Record<string, any>;
                orderBy?: Record<string, any>;
                skip?: number;
                take?: number;
                select?: Record<string, any>;
                include?: Record<string, any>;
            };
        };
        BulkCreateInput: {
            new (): {
                data: Record<string, any>[];
                skipDuplicates?: boolean;
                select?: Record<string, any>;
                include?: Record<string, any>;
            };
        };
        BulkUpdateInput: {
            new (): {
                where: Record<string, any>;
                data: Record<string, any>;
                select?: Record<string, any>;
                include?: Record<string, any>;
            };
        };
        BulkDeleteInput: {
            new (): {
                where: Record<string, any>;
                select?: Record<string, any>;
                include?: Record<string, any>;
            };
        };
        UpsertInput: {
            new (): {
                where: Record<string, any>;
                create: Record<string, any>;
                update: Record<string, any>;
                select?: Record<string, any>;
                include?: Record<string, any>;
            };
        };
    };
    static getInputTypes(modelName: string): any;
    static getAllInputTypes(): [string, any][];
    static hasInputTypes(modelName: string): boolean;
}
export declare const CommonFieldConfigs: {
    id: {
        name: string;
        type: "id";
        required: boolean;
    };
    createdAt: {
        name: string;
        type: "date";
        required: boolean;
    };
    updatedAt: {
        name: string;
        type: "date";
        required: boolean;
    };
    userId: {
        name: string;
        type: "id";
        required: boolean;
    };
    createdBy: {
        name: string;
        type: "id";
        required: boolean;
    };
    updatedBy: {
        name: string;
        type: "id";
        required: boolean;
    };
};
export declare class FieldConfigGenerator {
    static generateFromModel(modelSchema: any): DynamicFieldConfig[];
    private static mapPrismaTypeToGraphQL;
    static generateBasicCRUDFields(additionalFields?: Partial<DynamicFieldConfig>[]): DynamicFieldConfig[];
}
export declare function setupCommonInputTypes(): void;
