import { PrismaService } from '../prisma/prisma.service';
import { CustomTemplate } from '../graphql/models/custom-template.model';
import { TemplateShare } from '../graphql/models/custom-template.model';
import { CreateCustomTemplateInput, UpdateCustomTemplateInput } from '../graphql/inputs/custom-template.input';
export declare class CustomTemplateService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getUserTemplates(userId: string, filters?: {
        archived?: boolean;
        category?: string;
    }): Promise<CustomTemplate[]>;
    getTemplate(id: string, userId: string): Promise<CustomTemplate>;
    getPublicTemplates(category?: string): Promise<CustomTemplate[]>;
    getSharedTemplates(userId: string): Promise<CustomTemplate[]>;
    createTemplate(userId: string, input: CreateCustomTemplateInput): Promise<CustomTemplate>;
    updateTemplate(userId: string, input: UpdateCustomTemplateInput): Promise<CustomTemplate>;
    deleteTemplate(id: string, userId: string): Promise<boolean>;
    duplicateTemplate(templateId: string, userId: string, newName?: string): Promise<CustomTemplate>;
    shareTemplate(templateId: string, userId: string, shareWithUserIds: string[]): Promise<TemplateShare[]>;
    unshareTemplate(templateId: string, userId: string, unshareFromUserId: string): Promise<boolean>;
    updatePublicity(templateId: string, userId: string, isPublic: boolean): Promise<CustomTemplate>;
    incrementUsage(templateId: string): Promise<CustomTemplate>;
}
