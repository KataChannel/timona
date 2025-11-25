export declare class CreateModuleInput {
    title: string;
    description?: string;
    courseId: string;
    order?: number;
}
export declare class UpdateModuleInput {
    id: string;
    title?: string;
    description?: string;
    order?: number;
}
export declare class ReorderModulesInput {
    courseId: string;
    moduleIds: string[];
}
