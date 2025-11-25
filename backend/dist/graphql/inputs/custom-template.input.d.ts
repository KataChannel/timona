import { TemplateCategory } from '@prisma/client';
export declare class CreateCustomTemplateInput {
    name: string;
    description?: string;
    category: TemplateCategory;
    blocks: any;
    thumbnail?: string;
}
export declare class UpdateCustomTemplateInput {
    id: string;
    name?: string;
    description?: string;
    category?: TemplateCategory;
    blocks?: any;
    thumbnail?: string;
}
export declare class ShareTemplateInput {
    templateId: string;
    userIds: string[];
}
export declare class UpdateTemplatePublicityInput {
    templateId: string;
    isPublic: boolean;
}
