import { PrismaService } from '../../prisma/prisma.service';
import { CreateWebsiteSettingInput, UpdateWebsiteSettingInput } from '../dto/website-setting.input';
export declare class WebsiteSetting {
    id: string;
    key: string;
    label: string;
    value?: string;
    description?: string;
    type: string;
    category: string;
    group?: string;
    order: number;
    options?: any;
    validation?: any;
    isActive: boolean;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string;
    updatedBy?: string;
}
export declare class WebsiteSettingResolver {
    private prisma;
    constructor(prisma: PrismaService);
    getWebsiteSettings(category?: string, group?: string, isActive?: boolean, isPublic?: boolean): Promise<WebsiteSetting[]>;
    getPublicWebsiteSettings(category?: string, group?: string, keys?: string[]): Promise<WebsiteSetting[]>;
    getWebsiteSetting(key: string): Promise<WebsiteSetting | null>;
    getWebsiteSettingsByCategory(category: string): Promise<WebsiteSetting[]>;
    getHeaderSettings(): Promise<WebsiteSetting[]>;
    getFooterSettings(): Promise<WebsiteSetting[]>;
    updateWebsiteSetting(key: string, input: UpdateWebsiteSettingInput): Promise<WebsiteSetting>;
    createWebsiteSetting(input: CreateWebsiteSettingInput): Promise<WebsiteSetting>;
    deleteWebsiteSetting(key: string): Promise<WebsiteSetting>;
}
