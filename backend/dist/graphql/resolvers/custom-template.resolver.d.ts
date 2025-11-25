import { CustomTemplate, TemplateShare } from '../models/custom-template.model';
import { User } from '../models/user.model';
import { TemplateCategory } from '@prisma/client';
import { CreateCustomTemplateInput, UpdateCustomTemplateInput, ShareTemplateInput, UpdateTemplatePublicityInput } from '../inputs/custom-template.input';
import { CustomTemplateService } from '../../services/custom-template.service';
export declare class CustomTemplateResolver {
    private readonly customTemplateService;
    constructor(customTemplateService: CustomTemplateService);
    getMyCustomTemplates(user: User, archived?: boolean, category?: TemplateCategory): Promise<CustomTemplate[]>;
    getCustomTemplate(user: User, id: string): Promise<CustomTemplate>;
    getPublicTemplates(category?: TemplateCategory): Promise<CustomTemplate[]>;
    getSharedTemplates(user: User): Promise<CustomTemplate[]>;
    createCustomTemplate(user: User, input: CreateCustomTemplateInput): Promise<CustomTemplate>;
    updateCustomTemplate(user: User, input: UpdateCustomTemplateInput): Promise<CustomTemplate>;
    deleteCustomTemplate(user: User, id: string): Promise<boolean>;
    duplicateCustomTemplate(user: User, templateId: string, newName?: string): Promise<CustomTemplate>;
    shareTemplate(user: User, input: ShareTemplateInput): Promise<TemplateShare[]>;
    unshareTemplate(user: User, templateId: string, userId: string): Promise<boolean>;
    updateTemplatePublicity(user: User, input: UpdateTemplatePublicityInput): Promise<CustomTemplate>;
    incrementTemplateUsage(templateId: string): Promise<CustomTemplate>;
}
