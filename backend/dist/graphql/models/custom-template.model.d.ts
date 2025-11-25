import { TemplateCategory } from '@prisma/client';
import { User } from './user.model';
export declare class CustomTemplate {
    id: string;
    name: string;
    description?: string;
    category: TemplateCategory;
    blocks: any;
    thumbnail?: string;
    userId: string;
    user: User;
    isPublic: boolean;
    isArchived: boolean;
    usageCount: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare class TemplateShare {
    id: string;
    templateId: string;
    template: CustomTemplate;
    sharedWith: string;
    user: User;
    createdAt: Date;
}
