import { PrismaService } from '../prisma/prisma.service';
export interface FieldInfo {
    name: string;
    type: string;
    isRequired: boolean;
    isUnique: boolean;
    isId: boolean;
    hasDefaultValue: boolean;
    relationName?: string;
    isList?: boolean;
}
export interface ModelSchema {
    name: string;
    fields: FieldInfo[];
    primaryKey?: string;
}
export declare class SchemaInspectorService {
    private prisma;
    constructor(prisma: PrismaService);
    getAllModels(): Promise<string[]>;
    getModelSchema(modelName: string): Promise<ModelSchema | null>;
    getMappableFields(modelName: string): Promise<FieldInfo[]>;
    getRequiredFields(modelName: string): Promise<string[]>;
    suggestMapping(sourceFields: string[], targetFields: FieldInfo[]): Record<string, string>;
    validateMapping(modelName: string, mapping: Record<string, string>): Promise<{
        valid: boolean;
        errors: string[];
    }>;
    private mapFieldType;
    private normalizeFieldName;
}
